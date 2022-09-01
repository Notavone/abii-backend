import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../auth/jwt/jwt.guard";
import { QueryOrderDto } from "./dto/query-order.dto";
import { Permissions } from "../auth/policies/policies.decorator";
import { Action } from "../auth/policies/action";
import { Order } from "./entities/order.entity";
import { UserAbility } from "../auth/policies/user-ability.decorator";
import { AppAbility } from "../auth/policies/casl-ability.factory";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { LoggedUser } from "../auth/policies/user.decorator";
import { User } from "../users/entities/user.entity";

@ApiBearerAuth()
@ApiTags("orders")
@UseGuards(JwtGuard)
@Controller("api/orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {
  }

  @Permissions((ability) => ability.can(Action.CREATE, Order))
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  async findAll(@UserAbility() ability: AppAbility, @Query() query?: QueryOrderDto) {
    const orders = await this.ordersService.findAll(query);
    return orders.filter((order: Order) => ability.can(Action.READ, order));
  }

  @Get(":id")
  async findOne(@Param("id") id: number, @UserAbility() ability: AppAbility) {
    const order = await this.ordersService.findOne(id);
    if (!ability.can(Action.READ, order)) throw new ForbiddenException();
    return order;
  }

  @Patch(":id")
  async update(@Param("id") id: number, @Body() updateOrderDto: UpdateOrderDto, @UserAbility() ability: AppAbility) {
    const order = await this.ordersService.findOne(id);
    if (!ability.can(Action.UPDATE, order)) throw new ForbiddenException();
    return this.ordersService.update(order, updateOrderDto);
  }

  @Post(":id/confirm")
  async confirm(
    @Param("id") id: number,
    @UserAbility() ability: AppAbility,
    @LoggedUser() user: User,
  ) {
    const order = await this.ordersService.findOne(id);
    if (!ability.can(Action.UPDATE, order, "editable")) throw new ForbiddenException();
    return this.ordersService.confirm(order, user);
  }

  @Post(":id/refund")
  async refund(
    @Param("id") id: number,
    @UserAbility() ability: AppAbility,
    @LoggedUser() user: User,
  ) {
    const order = await this.ordersService.findOne(id);
    if (!ability.can(Action.UPDATE, order, "refunded")) throw new ForbiddenException();
    return this.ordersService.refund(order, user);
  }
}
