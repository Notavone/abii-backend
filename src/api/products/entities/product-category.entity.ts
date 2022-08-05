import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ default: "help_outline" })
  icon: string;

  @Column({ default: 999 })
  order: number;

  @Column({ default: true })
  display: boolean;

  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];
}
