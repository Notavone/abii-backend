import {Module} from '@nestjs/common';
import {OrdersService} from './orders.service';
import {OrdersController} from './orders.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Order} from "./entities/order.entity";
import {OrderLine} from "./entities/order-line.entity";
import {Client} from "../clients/entities/client.entity";
import {Product} from "../products/entities/product.entity";
import {UsersModule} from "../users/users.module";
import {ProductsModule} from "../products/products.module";
import {ClientsModule} from "../clients/clients.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Order]),
        ClientsModule,
        UsersModule,
        ProductsModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService]
})
export class OrdersModule {
}
