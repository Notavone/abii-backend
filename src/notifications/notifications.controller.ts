import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { LoggedUser } from "../api/auth/policies/user.decorator";
import { User } from "../api/users/entities/user.entity";
import { JwtGuard } from "../api/auth/jwt/jwt.guard";
import { PoliciesGuard } from "../api/auth/policies/policies.guard";
import { Action } from "../api/auth/policies/action";
import { Permissions } from "../api/auth/policies/policies.decorator";

@Controller("notifications")
@UseGuards(JwtGuard)
export class NotificationsController {

  constructor(
    private readonly notificationsService: NotificationsService,
  ) {
  }

  @Get("subscribe")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async subscribe(@LoggedUser() user: User, @Query("token") token: string) {
    await this.notificationsService.subscribe(user, token);
    return;
  }

  @Get("test")
  @UseGuards(PoliciesGuard)
  @Permissions((ability) => ability.can(Action.MANAGE, User))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async test(@LoggedUser() user: User) {
    const notificationToken = await this.notificationsService.getMostRecentToken(user);

    await this.notificationsService.sendNotification(notificationToken.token, {
      title: "Test",
      body: "Test",
    });
    return;
  }
}
