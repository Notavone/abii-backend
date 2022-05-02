import {BadRequestException, Injectable} from "@nestjs/common";
import {CreateOrderDto} from "./dto/create-order.dto";
import {InjectConnection, InjectRepository} from "@nestjs/typeorm";
import {Order} from "./entities/order.entity";
import {Brackets, Connection, Repository} from "typeorm";
import {QueryOrderDto} from "./dto/query-order.dto";
import {OrderLine} from "./entities/order-line.entity";
import {UpdateOrderDto} from "./dto/update-order.dto";
import {Client} from "../clients/entities/client.entity";
import {ClientsService} from "../clients/clients.service";
import {ProductsService} from "../products/products.service";
import {UsersService} from "../users/users.service";
import {User} from "../users/entities/user.entity";

@Injectable()
export class OrdersService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
        private readonly clientsService: ClientsService,
        private readonly productsService: ProductsService,
        private readonly usersService: UsersService,
    ) {
    }

    async create(createOrderDto: CreateOrderDto) {
        const queryRunner = this.connection.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            const client = await this.clientsService.findOne(createOrderDto.clientId)
            let order = queryRunner.manager.create(Order, {
                client,
                orderLines: []
            });

            for (const orderLine of createOrderDto.orderLines) {
                const product = await this.productsService.findOne(orderLine.productId)
                let line = queryRunner.manager.create(OrderLine, {
                    product,
                    quantity: orderLine.quantity
                });
                order.orderLines.push(line);
                await queryRunner.manager.save(OrderLine, line);
            }

            order = await queryRunner.manager.save(order);
            await queryRunner.commitTransaction();
            return order;
        } catch (e) {
            await queryRunner.rollbackTransaction();
            console.error(e);
            throw new BadRequestException(e);
        } finally {
            await queryRunner.release()
        }
    }

    findAll(query?: QueryOrderDto) {
        if (query) {
            const qb = this.orderRepository.createQueryBuilder("order")
                .leftJoinAndSelect("order.client", "client")
                .leftJoinAndSelect("order.orderLines", "orderLines")
                .leftJoinAndSelect("orderLines.product", "product");

            if (query.fromTimestamp) {
                qb.andWhere("order.createdAt >= :startDate", {startDate: new Date(+query.fromTimestamp)});
            }

            if (query.toTimestamp) {
                qb.andWhere("order.createdAt <= :endDate", {endDate: new Date(+query.toTimestamp)});
            }

            if (query.clientId) {
                qb.andWhere("order.clientId = :clientId", {clientId: query.clientId});
            }

            if (query.productId) {
                qb.andWhere("orderLines.productId = :productId", {productId: query.productId});
            }

            if (query.sellerId) {
                qb.andWhere("order.sellerId = :sellerId", {sellerId: query.sellerId});
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
        return this.orderRepository.findOneOrFail(id);
    }

    async update(order: Order, updateOrderDto: UpdateOrderDto) {
        if (!order.editable) throw new BadRequestException("Order is not editable");

        const queryRunner = this.connection.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            order.orderLines = [];
            for (const orderLine of updateOrderDto.orderLines) {
                const product = await this.productsService.findOne(orderLine.productId)
                let line = queryRunner.manager.create(OrderLine, {
                    product,
                    quantity: orderLine.quantity
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
            throw new BadRequestException(e);
        } finally {
            await queryRunner.release()
        }
    }

    async confirm(order: Order, seller: User) {
        if (!order.editable) throw new BadRequestException("Order is not editable");

        const queryRunner = this.connection.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            queryRunner.manager.merge(Order, order, {
                editable: false,
                seller,
            });
            await queryRunner.manager.save(Order, order);

            const client = await this.clientsService.findOne(order.clientId);
            client.balance -= order.total;
            await queryRunner.manager.save(Client, client);

            await queryRunner.commitTransaction();
            return order;
        } catch (e) {
            await queryRunner.rollbackTransaction();
            console.error(e);
            throw new BadRequestException(e);
        } finally {
            await queryRunner.release()
        }
    }

    async refund(order: Order, seller: User) {
        if (order.refunded) throw new BadRequestException("Order already refunded");

        const queryRunner = this.connection.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            order.refunded = true;
            order.seller = seller;
            await queryRunner.manager.save(Order, order);

            order.client.balance += order.total;
            await queryRunner.manager.save(Client, order.client);

            await queryRunner.commitTransaction();
            return order;
        } catch (e) {
            await queryRunner.rollbackTransaction();
            console.error(e);
            throw new BadRequestException(e);
        } finally {
            await queryRunner.release()
        }
    }
}
