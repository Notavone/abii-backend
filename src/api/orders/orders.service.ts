import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { InjectConnection, InjectRepository } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { Brackets, Connection, Repository } from "typeorm";
import { QueryOrderDto } from "./dto/query-order.dto";
import { OrderLine } from "./entities/order-line.entity";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { Client } from "../clients/entities/client.entity";
import { User } from "../users/entities/user.entity";
import { Product } from "../products/entities/product.entity";
import { ProductsService } from "../products/products.service";
import { NotificationsService } from "../../notifications/notifications.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class OrdersService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {
  }

  async create(createOrderDto: CreateOrderDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const client = await queryRunner.manager.findOneOrFail(Client, createOrderDto.clientId);
      let order = queryRunner.manager.create(Order, {
        client,
        orderLines: [],
      });

      for (const orderLine of createOrderDto.orderLines) {
        const product = await queryRunner.manager.findOneOrFail(Product, orderLine.productId);
        let line = queryRunner.manager.create(OrderLine, {
          product,
          quantity: orderLine.quantity,
        });
        order.orderLines.push(line);
      }

      order = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      const sellers = await this.usersService.getSellers();
      await this.notificationsService.delayNotificationSending(sellers, {
        title: "Nouvelle commande",
        body: "Ouvrez l'application pour la confirmer",
      }, async () => {
        const o = await this.orderRepository.findOneOrFail(order.id);
        return !o.refunded && o.editable;
      });

      return order;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(query?: QueryOrderDto) {
    if (query) {
      const qb = this.orderRepository.createQueryBuilder("order")
        .leftJoinAndSelect("order.client", "client")
        .leftJoinAndSelect("order.orderLines", "orderLines")
        .leftJoinAndSelect("orderLines.product", "product")
        .leftJoinAndSelect("client.user", "user");

      if (query.fromTimestamp) {
        qb.andWhere("order.createdAt >= :startDate", { startDate: new Date(+query.fromTimestamp) });
      }

      if (query.toTimestamp) {
        qb.andWhere("order.createdAt <= :endDate", { endDate: new Date(+query.toTimestamp) });
      }

      if (query.clientId) {
        qb.andWhere("order.clientId = :clientId", { clientId: query.clientId });
      }

      if (query.productId) {
        qb.andWhere("orderLines.productId = :productId", { productId: query.productId });
      }

      if (query.sellerId) {
        qb.andWhere("order.sellerId = :sellerId", { sellerId: query.sellerId });
      }

      qb.andWhere(new Brackets(qb => {
        qb.where("order.editable = 0 and order.refunded = 0");
        if (query.allowIncomplete) {
          qb.orWhere("order.editable = 1");
        }
        if (query.allowRefunded) {
          qb.orWhere("order.refunded = 1");
        }
      }));

      return qb.getMany();
    } else return this.orderRepository.find();
  }

  findOne(id: number) {
    return this.orderRepository.findOneOrFail(id, { relations: ["orderLines", "client", "orderLines.product"] });
  }

  async update(order: Order, updateOrderDto: UpdateOrderDto) {
    if (!order.editable) throw new BadRequestException("Order is not editable");

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      order.orderLines = [];
      for (const orderLine of updateOrderDto.orderLines) {
        const product = await queryRunner.manager.findOneOrFail(Product, orderLine.productId);
        let line = queryRunner.manager.create(OrderLine, {
          product,
          quantity: orderLine.quantity,
        });
        order.orderLines.push(line);
        await queryRunner.manager.save(OrderLine, line);
      }

      await queryRunner.manager.save(Order, order);
      await queryRunner.commitTransaction();
      return order;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error(e);
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async confirm(order: Order, seller: User) {
    if (!order.editable) throw new BadRequestException("Order is not editable");

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const orderLine of order.orderLines) {
        const product = await queryRunner.manager.findOneOrFail(Product, orderLine.productId);
        orderLine.product = await ProductsService.updateStock(queryRunner, product, product.stock - orderLine.quantity, seller);
      }

      order.editable = false;
      order.seller = seller;
      order.client.balance -= +order.total;
      await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();

      const user = await this.connection.manager.findOne(User, order.client.userId);
      if (user) {
        await this.notificationsService.sendNotificationTo(user, {
          title: "Commande confirmée",
          body: "Votre solde à été débité",
        });
      }

      return order;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async refund(order: Order, seller: User) {
    if (order.editable) throw new BadRequestException("Order is still editable");
    if (order.refunded) throw new BadRequestException("Order already refunded");

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      order.refunded = true;
      order.seller = seller;
      order.client.balance += +order.total;

      await queryRunner.manager.save(Client, order.client);
      await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();

      const user = await this.connection.manager.findOne(User, order.client.userId);
      if (user) {
        await this.notificationsService.sendNotificationTo(user, {
          title: "Commande remboursée",
          body: "Votre solde à été crédité",
        });
      }

      return order;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
