import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from "typeorm";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Product } from "../../products/entities/product.entity";

@Entity()
export class Ean {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: "This ean internal id",
    example: 1,
  })
  id: number;

  @Column({ unique: true })
  @ApiProperty({
    description: "This ean value",
    example: "017845215478965",
  })
  value: string;

  @ManyToOne(() => Product, { cascade: true, nullable: true })
  @ApiPropertyOptional({
    description: "The product wich this ean belongs to",
  })
  product?: Product;

  @RelationId((ean: Ean) => ean.product)
  @ApiPropertyOptional({
    description: "The id of the product this ean belongs to",
    example: 1,
  })
  productId?: number;

  @Column({ default: 1 })
  @ApiProperty({
    description: "How much the stock should be incremented if this ean is scanned",
    example: 1,
  })
  quantity: number;

  @CreateDateColumn()
  @ApiProperty({
    description: "Ean creation date",
    example: "2020-01-01T00:00:00.000Z",
  })
  createdDate: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: "Ean update date",
    example: "2020-01-01T00:00:00.000Z",
  })
  updatedDate: Date;
}
