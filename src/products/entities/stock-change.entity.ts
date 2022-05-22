import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {Product} from "./product.entity";
import {User} from "../../users/entities/user.entity";
import {Expose} from "class-transformer";

@Entity()
export class StockChange {
    @PrimaryGeneratedColumn()
    @ApiProperty({
        description: "Stock change id",
        example: 1,
    })
    id: number;

    @ManyToOne(() => Product, (product) => product.stockChanges, {cascade: true, onDelete: "CASCADE"})
    @ApiProperty({
        description: "The product which stock has been updated"
    })
    product: Product;

    @RelationId((stockChange: StockChange) => stockChange.product)
    @ApiProperty({
        description: "The id of the product which stock has been updated"
    })
    productId: number;

    @ManyToOne(() => User, {cascade: true, onDelete: "SET NULL"})
    @ApiProperty({
        description: "The user who made the stock change"
    })
    user: User;

    @RelationId((stockChange: StockChange) => stockChange.user)
    @ApiProperty({
        description: "The id of the user who made the stock change"
    })
    userId: number;

    @Column()
    @ApiProperty({
        description: "The stock before the change"
    })
    previousStock: number;

    @Column()
    @ApiProperty({
        description: "The stock after the change"
    })
    newStock: number;

    @Expose()
    @ApiProperty({
        description: "The difference between the previous stock and the new stock",
    })
    get difference(): number {
        return this.newStock - this.previousStock;
    }

    @CreateDateColumn()
    @ApiProperty({
        description: "Product creation date",
        example: "2020-01-01T00:00:00.000Z",
    })
    createdAt: Date;
}
