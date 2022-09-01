import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../auth/jwt/jwt.guard";
import { PoliciesGuard } from "../auth/policies/policies.guard";
import { Permissions } from "../auth/policies/policies.decorator";
import { Action } from "../auth/policies/action";
import { Client } from "./entities/client.entity";
import { UserAbility } from "../auth/policies/user-ability.decorator";
import { AppAbility } from "../auth/policies/casl-ability.factory";

@ApiBearerAuth()
@ApiTags("clients")
@UseGuards(JwtGuard, PoliciesGuard)
@Controller("api/clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {
  }

  @Permissions((ability => ability.can(Action.CREATE, Client)))
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Permissions((ability) => ability.can(Action.READ, Client))
  @Get("/unlinked")
  findUnlinked() {
    return this.clientsService.findUnlinked();
  }

  @Permissions((ability => ability.can(Action.READ, Client)))
  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: number, @UserAbility() ability: AppAbility) {
    const client = await this.clientsService.findOne(id);
    if (!ability.can(Action.READ, client)) throw new ForbiddenException();
    return client;
  }

  @Permissions((ability => ability.can(Action.UPDATE, Client)))
  @Patch(":id")
  update(@Param("id") id: number, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Permissions((ability => ability.can(Action.DELETE, Client)))
  @Delete(":id")
  remove(@Param("id") id: number) {
    return this.clientsService.remove(id);
  }
}
