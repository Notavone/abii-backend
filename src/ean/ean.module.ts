import { Module } from "@nestjs/common";
import { EanController } from "./ean.controller";
import { EanService } from "./ean.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Ean } from "./entities/ean.entity";
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Ean]),
    ProductsModule,
  ],
  controllers: [EanController],
  providers: [EanService],
  exports: [EanService],
})
export class EanModule {
}
