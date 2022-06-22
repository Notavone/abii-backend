import { Injectable } from "@nestjs/common";
import { QueryStockDto } from "./dto/query-stock.dto";
import { InjectConnection, InjectRepository } from "@nestjs/typeorm";
import { StockChange } from "./entities/stock-change.entity";
import { Connection, Repository } from "typeorm";

@Injectable()
export class StockService {

  constructor(
    @InjectRepository(StockChange)
    private readonly stockChangeRepository: Repository<StockChange>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
  }

  findAll(queryStockDto?: QueryStockDto) {
    const qb = this.stockChangeRepository.createQueryBuilder("stock")
      .leftJoinAndSelect("stock.product", "product")
      .leftJoinAndSelect("stock.user", "user");

    if (queryStockDto?.productId) {
      qb.andWhere("stock.productId = :productId", { productId: queryStockDto.productId });
    }

    if (queryStockDto?.userId) {
      qb.andWhere("stock.userId = :userId", { userId: queryStockDto.userId });
    }

    if (queryStockDto?.fromDate) {
      qb.andWhere("stock.createdDate >= :fromDate", { fromDate: queryStockDto.fromDate });
    }

    if (queryStockDto?.toDate) {
      qb.andWhere("stock.createdDate <= :toDate", { toDate: queryStockDto.toDate });
    }

    return qb.getMany();
  }
}
