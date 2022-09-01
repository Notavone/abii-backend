import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtGuard } from "../auth/jwt/jwt.guard";
import { User } from "./entities/user.entity";
import { ConfirmUserDto } from "./dto/confirm-user.dto";
import { Public } from "../auth/jwt/public.decorator";
import { PoliciesGuard } from "../auth/policies/policies.guard";
import { Permissions } from "../auth/policies/policies.decorator";
import { Action } from "../auth/policies/action";
import { AppAbility } from "../auth/policies/casl-ability.factory";
import { UserAbility } from "../auth/policies/user-ability.decorator";
import { InitUserPasswordResetDto } from "./dto/init-user-password-reset.dto";

@ApiBearerAuth()
@ApiTags("users")
@UseGuards(JwtGuard, PoliciesGuard)
@Controller("api/users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {
  }

  @Get("me")
  currentlyLoggedIn(@Req() request) {
    // todo améliorer cet appel pour que le left join soit fait avant et évite un appel non voulu au findone
    return this.usersService.findOne(request.user.id);
  }

  @Public()
  @Post("confirm")
  @HttpCode(HttpStatus.OK)
  async confirm(@Body() body: ConfirmUserDto) {
    return this.usersService.confirm(body);
  }

  @Public()
  @Post("reset")
  async initReset(@Body() body: InitUserPasswordResetDto) {
    return this.usersService.initReset(body);
  }

  @Public()
  @Put("reset")
  async finishReset(@Body() body: any) {
    return this.usersService.finishReset(body);
  }

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Permissions((ability) => ability.can(Action.READ, User))
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: number, @UserAbility() ability: AppAbility) {
    const user = await this.usersService.findOne(id);
    if (!ability.can(Action.READ, user)) throw new ForbiddenException();

    return user;
  }

  @Patch(":id")
  async update(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto, @UserAbility() ability: AppAbility) {
    const user = await this.usersService.findOne(id);
    for (const key in updateUserDto) {
      if (!ability.can(Action.UPDATE, user, key)) throw new ForbiddenException();
    }
    return this.usersService.update(user, updateUserDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: number, @UserAbility() ability: AppAbility) {
    const user = await this.usersService.findOne(id);
    if (!ability.can(Action.DELETE, user)) throw new ForbiddenException();
    return this.usersService.remove(user);
  }
}
