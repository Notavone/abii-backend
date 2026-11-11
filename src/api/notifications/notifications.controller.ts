import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { LoggedUser } from "../auth/policies/user.decorator";
import { User } from "../users/entities/user.entity";
import { JwtGuard } from "../auth/jwt/jwt.guard";
import { Public } from "../auth/jwt/public.decorator";
import { PushSubscription } from "web-push";

@Controller("api/notifications")
@UseGuards(JwtGuard)
export class NotificationsController {

  constructor(
    private readonly notificationsService: NotificationsService,
  ) {
  }

  /** Clé publique VAPID utilisée par le front pour s'abonner (source unique : le .env du backend). */
  @Public()
  @Get("public-key")
  public publicKey() {
    return { publicKey: this.notificationsService.getPublicKey() };
  }

  @Post("subscribe")
  public async subscribe(@LoggedUser() user: User, @Body() pushSubscription: PushSubscription) {
    return this.notificationsService.subscribe(user, pushSubscription);
  }

  /** Envoie une notification de test à l'utilisateur connecté (sur ses propres appareils uniquement). */
  @Get("test")
  public async test(@LoggedUser() user: User) {
    return this.notificationsService.sendNotificationTo(user, {
      title: "ABII",
      body: "Les notifications fonctionnent sur cet appareil.",
      data: { test: true },
    });
  }
}
