import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/jwt/jwt.guard";
import { PoliciesGuard } from "../auth/policies/policies.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { EanService } from "./ean.service";
import { Action } from "../auth/policies/action";
import { Ean } from "./entities/ean.entity";
import { Permissions } from "../auth/policies/policies.decorator";
import { CreateEanDto } from "./dto/create-ean.dto";
import { UpdateEanDto } from "./dto/update-ean.dto";

@ApiBearerAuth()
@ApiTags("users")
@UseGuards(JwtGuard, PoliciesGuard)
@Controller("ean")
export class EanController {

  constructor(
    private readonly eanService: EanService,
  ) {
  }

  @Permissions((ability) => ability.can(Action.READ, Ean))
  @Get()
  findAll() {
    return this.eanService.findAll();
  }

  @Permissions((ability) => ability.can(Action.READ, Ean))
  @Get(":id")
  findOne(@Param() id: number) {
    return this.eanService.findOne(id);
  }

  @Permissions((ability => ability.can(Action.CREATE, Ean)))
  @Post()
  create(@Body() createEanDto: CreateEanDto) {
    return this.eanService.create(createEanDto);
  }

  @Permissions((ability) => ability.can(Action.UPDATE, Ean))
  @Patch(":id")
  update(@Param() id: number, @Body() updateEanDto: UpdateEanDto) {
    return this.eanService.update(id, updateEanDto);
  }

  @Permissions((ability => ability.can(Action.DELETE, Ean)))
  @Delete(":id")
  delete(@Param() id: number) {
    return this.eanService.delete(id);
  }

}

