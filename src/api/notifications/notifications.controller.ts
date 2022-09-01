import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { LoggedUser } from "../auth/policies/user.decorator";
import { User } from "../users/entities/user.entity";
import { JwtGuard } from "../auth/jwt/jwt.guard";
import { PoliciesGuard } from "../auth/policies/policies.guard";
import { Action } from "../auth/policies/action";
import { Permissions } from "../auth/policies/policies.decorator";
import { PushSubscription } from "web-push";

@Controller("api/notifications")
@UseGuards(JwtGuard)
export class NotificationsController {

  constructor(
    private readonly notificationsService: NotificationsService,
  ) {
  }

  @Post("subscribe")
  public async subscribe(@LoggedUser() user: User, @Body() pushSubscription: PushSubscription) {
    return this.notificationsService.subscribe(user, pushSubscription);
  }

  @Get("test")
  @UseGuards(PoliciesGuard)
  @Permissions((ability) => ability.can(Action.MANAGE, User))
  public async test(@LoggedUser() user: User) {
    return this.notificationsService.sendNotificationTo(user, {
      title: "Test",
      body: "Test",
      data: { test: "test" },
    });
  }
}
