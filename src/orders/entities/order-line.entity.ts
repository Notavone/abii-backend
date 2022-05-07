import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId} from "typeorm";
import { Order } from "./order.entity";
import { Product } from "../../products/entities/product.entity";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

@Entity()
export class OrderLine {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: "The id of the order line",
    example: 1,
  })
  id: number;

  @Column()
  @ApiProperty({
    description: "The quantity of this product that is ordered",
    example: 1,
  })
  quantity: number;

  @ManyToOne(() => Order, { orphanedRowAction: "delete", onDelete: "CASCADE" })
  @ApiProperty({
    description: "The order that this order line belongs to",
  })
  order: Order;

  @RelationId((orderLine: OrderLine) => orderLine.order)
  @ApiProperty({
    description: "The id of the order that this order line belongs to",
  })
  orderId: number;

  @ManyToOne(() => Product, { eager: true, cascade: true, onDelete: "SET NULL" })
  @ApiProperty({
    description: "The product that is ordered",
  })
  product?: Product;

  @RelationId((orderLine: OrderLine) => orderLine.product)
  @ApiProperty({
    description: "The id of the product that is ordered",
  })
  productId?: number;
}
