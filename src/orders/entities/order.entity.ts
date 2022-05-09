import {BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId, UpdateDateColumn} from "typeorm";
import {OrderLine} from "./order-line.entity";
import {Client} from "../../clients/entities/client.entity";
import {ApiProperty} from "@nestjs/swagger";
import {User} from "../../users/entities/user.entity";
import {Exclude} from "class-transformer";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    @ApiProperty({
        description: "The id of the order",
        example: 1,
    })
    id: number;

    @CreateDateColumn()
    @ApiProperty({
        description: "The date of the order",
        example: "2020-01-01",
    })
    createdAt: Date;

    @UpdateDateColumn()
    @ApiProperty({
        description: "The date the order was last updated",
        example: "2020-01-01",
    })
    updatedAt: Date;

    @ManyToOne(() => Client, {cascade: true, onDelete: "SET NULL"})
    @ApiProperty({
        description: "The client of the order",
        example: 1,
    })
    client?: Client;

    @Exclude()
    @RelationId((order: Order) => order.client)
    clientId?: number;

    @OneToMany(() => OrderLine, orderLine => orderLine.order, {cascade: true})
    @ApiProperty({
        description: "The order lines of the order",
        example: [1, 2],
    })
    orderLines: OrderLine[];

    @Column({default: true})
    @ApiProperty({
        description: "This order is editable (the client has not been delivered)",
        example: true,
    })
    editable: boolean;

    @Column({default: false})
    @ApiProperty({
        description: "This order has been refunded",
        example: false,
    })
    refunded: boolean;

    @ManyToOne(() => User, {nullable: true, cascade: true, onDelete: "SET NULL"})
    @ApiProperty({
        description: "The user that validated the order",
        example: 1,
    })
    seller?: User;

    @Exclude()
    @RelationId((order: Order) => order.seller)
    sellerId?: number;

    @Column({type: "decimal", precision: 10, scale: 2})
    @ApiProperty({
        description: "The total price of the order",
        example: 10,
    })
    total: number;

    @BeforeUpdate()
    @BeforeInsert()
    calculateTotal() {
        this.total = this.orderLines.reduce((total, orderLine) => {
            let client = this.client;
            let sub = client ? client.subscribedUntil > new Date(Date.now()) : false;

            let product = orderLine.product;
            if (!product) return total;

            let price = sub ? product.price_red : product.price;
            return total + price * orderLine.quantity;
        }, 0);
    }
}

