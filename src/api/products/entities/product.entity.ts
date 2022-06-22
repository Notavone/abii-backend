import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {ProductType} from "../product-type";
import {StockChange} from "../../stock/entities/stock-change.entity";
import {Expose} from "class-transformer";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    @ApiProperty({
        description: "Product id",
        example: 1,
    })
    id: number;

    @Column()
    @ApiProperty({
        description: "Product name",
        example: "Product 1",
    })
    name: string;

    @Column("float")
    @ApiProperty({
        description: "Product price",
        example: 0.5,
    })
    price: number;

    @Column("float")
    @ApiProperty({
        description: "Product discounted price",
        example: 0.2,
    })
    price_red: number;

    @Column({default: false})
    @ApiProperty({
        description: "Product availability",
        example: true,
    })
    available: boolean;

    @Column({
        type: "enum",
        enum: ProductType
    })
    @ApiProperty({
        description: "Product type",
        example: ProductType.FOOD,
    })
    type: ProductType;

    @Column("text", {nullable: true})
    @ApiProperty({
        description: "Base64 encoded image",
    })
    image?: string

    @OneToMany(() => StockChange, (stockChange) => stockChange.product)
    stockChanges: StockChange[];

    @Column({nullable: true, default: false})
    @ApiProperty({
        description: "Whether this product's is regulated by stock"
    })
    useStock: boolean;

    @Column({nullable: true, default: 0})
    @ApiProperty({
        description: "The product current stock"
    })
    stock: number;

    @Column({nullable: true, default: 0})
    @ApiProperty({
        description: "At which point the user should be alerted by this product's stock"
    })
    alert: number;

    @Expose()
    @ApiProperty({
        description: "Whether this product can be sold"
    })
    get sellable() {
        if (!this.available) return false;
        return !(this.useStock && this.stock <= 0);
    };

    @CreateDateColumn()
    @ApiProperty({
        description: "Product creation date",
        example: "2020-01-01T00:00:00.000Z",
    })
    createdAt: Date;

    @UpdateDateColumn()
    @ApiProperty({
        description: "Product update date",
        example: "2020-01-01T00:00:00.000Z",
    })
    updatedAt: Date;
}
