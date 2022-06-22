import { Module } from "@nestjs/common";
import { StockService } from "./stock.service";
import { StockController } from "./stock.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockChange } from "./entities/stock-change.entity";

@Module({
  imports: [TypeOrmModule.forFeature([StockChange])],
  providers: [StockService],
  controllers: [StockController],
})
export class StockModule {
}
