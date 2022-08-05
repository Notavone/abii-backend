import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../auth/jwt/jwt.guard";
import { Public } from "../auth/jwt/public.decorator";
import { PoliciesGuard } from "../auth/policies/policies.guard";
import { Action } from "../auth/policies/action";
import { Product } from "./entities/product.entity";
import { Permissions } from "../auth/policies/policies.decorator";
import { UserAbility } from "../auth/policies/user-ability.decorator";
import { AppAbility } from "../auth/policies/casl-ability.factory";
import { LoggedUser } from "../auth/policies/user.decorator";
import { User } from "../users/entities/user.entity";
import { UpdateProductBulkDto } from "./dto/update-product-bulk.dto";
import { QueryProductDto } from "./dto/query-product.dto";

@ApiBearerAuth()
@ApiTags("products")
@UseGuards(JwtGuard, PoliciesGuard)
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {
  }

  @Permissions((ability) => ability.can(Action.CREATE, Product))
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Public()
  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get("/categories")
  findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Get(":id")
  async findOne(@Param("id") id: number, @UserAbility() ability: AppAbility) {
    const product = await this.productsService.findOne(id);
    if (!ability.can(Action.READ, product)) throw new ForbiddenException();
    return product;
  }

  @Permissions((ability) => ability.can(Action.UPDATE, Product))
  @Patch("bulk")
  async updateBulk(@Body() updateProductBulkDto: UpdateProductBulkDto,
                   @LoggedUser() user: User) {
    return this.productsService.updateBulk(updateProductBulkDto, user);
  }

  @Permissions((ability) => ability.can(Action.UPDATE, Product))
  @Patch(":id")
  update(@Param("id") id: number,
         @Body() updateProductDto: UpdateProductDto,
         @LoggedUser() user: User) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Permissions((ability) => ability.can(Action.DELETE, Product))
  @Delete(":id")
  remove(@Param("id") id: number) {
    return this.productsService.remove(id);
  }
}
