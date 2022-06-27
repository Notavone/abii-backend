import { Injectable, Logger } from "@nestjs/common";
import { User } from "../api/users/entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { InjectConnection, InjectRepository } from "@nestjs/typeorm";
import { NotificationToken } from "./entities/notification-token.entity";
import { Connection, In, Repository } from "typeorm";
import * as webPush from "web-push";
import { PushSubscription } from "web-push";
import { NotificationDto } from "./dto/notification.dto";

@Injectable()
export class NotificationsService {
  logger = new Logger(NotificationsService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectConnection() private readonly connection: Connection,
    @InjectRepository(NotificationToken) private readonly notificationTokenRepository: Repository<NotificationToken>,
  ) {
    webPush.setVapidDetails(`mailto:${this.config.get("MAIL_USERNAME")}`,
      this.config.get("VAPID_PUBLIC_KEY"), this.config.get("VAPID_PRIVATE_KEY"));
  }

  private async sendNotification(tokens: NotificationToken[], notification: NotificationDto) {
    const payload = {
      notification: {
        title: notification.title,
        body: notification.body,
        silent: false,
        timestamp: new Date().getTime(),
        vibrate: [100, 50, 100],
        data: notification.data,
      },
    };
    this.logger.log(`Sending notification to ${tokens.length} tokens with payload: ${JSON.stringify(payload)}`);

    const promises = tokens.map((token) => webPush.sendNotification(token.pushSubscription, JSON.stringify(payload)));
    const notifications = await Promise.allSettled(promises);
    const fulfilled = notifications.filter(n => n.status === "fulfilled").length;

    this.logger.log(`Notification successfully sent to ${fulfilled} tokens`);

    return notifications;
  }


  async subscribe(user: User, pushSubscription: PushSubscription) {
    const existingToken = await this.notificationTokenRepository.findOne(user.pushNotificationSubscriptionId);
    if (existingToken) {
      existingToken.active = true;
      existingToken.pushSubscription = pushSubscription;

      const pushNotificationSubscription = await this.notificationTokenRepository.save(existingToken);
      await this.connection.manager.save(User, { ...user, pushNotificationSubscription });

      return pushNotificationSubscription;
    }
    const pushNotificationSubscription = await this.notificationTokenRepository.save({ pushSubscription });
    await this.connection.manager.save(User, { ...user, pushNotificationSubscription });

    return pushNotificationSubscription;
  }

  async unsubscribe(user: User) {
    const existingToken = await this.notificationTokenRepository.findOne(user.pushNotificationSubscriptionId);
    if (existingToken) {
      existingToken.active = false;
      return await this.notificationTokenRepository.save(existingToken);
    }
  }

  sendNotificationTo(user: User, notification: NotificationDto);
  sendNotificationTo(users: User[], notification: NotificationDto);
  sendNotificationTo(usersResolvable: User | User[], notification: NotificationDto) {
    if (!Array.isArray(usersResolvable)) usersResolvable = [usersResolvable];

    return this.notificationTokenRepository
      .find({ where: { id: In(usersResolvable.map(u => u.pushNotificationSubscriptionId)), active: true } })
      .then((tokens) => this.sendNotification(tokens, notification));
  }

  delayNotificationSending(user: User, notification: NotificationDto, condition?: () => Promise<boolean>, timeout?: number);
  delayNotificationSending(users: User[], notification: NotificationDto, condition?: () => Promise<boolean>, timeout?: number);
  delayNotificationSending(usersResolvable: User | User[], notification: NotificationDto, condition: () => Promise<boolean> = () => Promise.resolve(true), timeout: number = 60000) {
    this.logger.log(`Delaying call to notify in ${timeout}ms`);
    setTimeout(async () => {
      if (!Array.isArray(usersResolvable)) usersResolvable = [usersResolvable];
      const conditionResult = await condition();
      if (conditionResult) this.sendNotificationTo(usersResolvable, notification);
      else this.logger.log("Conditions not met to emit notification");
    }, timeout);
  }
}

