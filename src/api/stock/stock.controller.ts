import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../auth/jwt/jwt.guard";
import { PoliciesGuard } from "../auth/policies/policies.guard";
import { StockService } from "./stock.service";
import { Action } from "../auth/policies/action";
import { Product } from "../products/entities/product.entity";
import { Permissions } from "../auth/policies/policies.decorator";
import { QueryStockDto } from "./dto/query-stock.dto";

@ApiBearerAuth()
@ApiTags("stock")
@UseGuards(JwtGuard, PoliciesGuard)
@Controller("stock")
export class StockController {

  constructor(
    private readonly stockService: StockService,
  ) {
  }

  @Permissions((ability => ability.can(Action.MANAGE, Product)))
  @Get("")
  findAll(@Query() queryStockDto?: QueryStockDto) {
    return this.stockService.findAll(queryStockDto);
  }
}
