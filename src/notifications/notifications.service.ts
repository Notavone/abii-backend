import { Injectable } from "@nestjs/common";
import { User } from "../api/users/entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationToken } from "./entities/notification-token.entity";
import { In, Repository } from "typeorm";
import * as webPush from "web-push";
import { PushSubscription } from "web-push";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(NotificationToken) private readonly notificationTokenRepository: Repository<NotificationToken>,
  ) {
    webPush.setVapidDetails(`mailto:${this.config.get("MAIL_USERNAME")}`,
      this.config.get("VAPID_PUBLIC_KEY"), this.config.get("VAPID_PRIVATE_KEY"));
  }

  async sendNotification(tokens: NotificationToken[], notification: any, data: any) {
    const payload = {
      notification: {
        ...notification,
        vibrate: [100, 50, 100],
        data,
      },
    };

    return Promise.all(tokens
      .map(((t) => webPush.sendNotification(t.pushSubscription as PushSubscription, JSON.stringify(payload)))));
  }


  async subscribe(user: User, subscription: PushSubscription) {
    const existingToken = await this.notificationTokenRepository.findOne(user.pushNotificationSubscriptionId);
    if (existingToken) {
      existingToken.active = true;
      existingToken.pushSubscription = subscription;
      return await this.notificationTokenRepository.save(existingToken);
    }
    return await this.notificationTokenRepository.save({ user, pushSubscription: subscription });
  }

  async unsubscribe(user: User) {
    const existingToken = await this.notificationTokenRepository.findOne(user.pushNotificationSubscriptionId);
    if (existingToken) {
      existingToken.active = false;
      return await this.notificationTokenRepository.save(existingToken);
    }
  }

  sendNotificationToUser(user: User, notification: any, data?: any) {
    return this.notificationTokenRepository.findOneOrFail({ id: user.pushNotificationSubscriptionId, active: true })
      .then((tokens) => this.sendNotification([tokens], notification, data));
  }

  sendNotificationToUsers(users: User[], notification: any, data?: any) {
    return this.notificationTokenRepository
      .find({ where: { id: In(users.map(u => u.pushNotificationSubscriptionId)), active: true } })
      .then((tokens) => this.sendNotification(tokens, notification, data));
  }
}

