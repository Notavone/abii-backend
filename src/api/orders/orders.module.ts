import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { UsersModule } from "../users/users.module";
import { ProductsModule } from "../products/products.module";
import { ClientsModule } from "../clients/clients.module";
import { NotificationsModule } from "../../notifications/notifications.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ClientsModule,
    UsersModule,
    ProductsModule,
    NotificationsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {
}
