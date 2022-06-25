import { Injectable } from "@nestjs/common";
import * as admin from "firebase-admin";
import { messaging } from "firebase-admin";
import { DataMessagePayload, NotificationMessagePayload } from "firebase-admin/lib/messaging/messaging-api";
import { User } from "../api/users/entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationToken } from "./entities/notification-token.entity";
import { Repository } from "typeorm";
import Messaging = messaging.Messaging;

@Injectable()
export class NotificationsService {
  private readonly messaging: Messaging;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(NotificationToken) private readonly notificationTokenRepository: Repository<NotificationToken>,
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.get("FIREBASE_PROJECT_ID"),
        clientEmail: config.get("FIREBASE_CLIENT_MAIL"),
        privateKey: config.get("FIREBASE_API_KEY").replace(/\\n/g, "\n"),
      }),
    });
    this.messaging = admin.messaging();
  }

  public async sendNotification(token: string, notification: NotificationMessagePayload, data?: DataMessagePayload) {
    await this.messaging.send({
      token,
      notification,
      data,
    });
  }

  async subscribe(user: User, token: string) {
    const existingToken = await this.notificationTokenRepository.findOne({ where: { token } });
    if (existingToken) {
      existingToken.user = user;
      await this.notificationTokenRepository.save(existingToken);
    } else {
      await this.notificationTokenRepository.save({ user, token });
    }
  }

  async unsubscribe(user: User) {
    await this.notificationTokenRepository.update({ user }, { user: null });
  }

  async getMostRecentToken(user: User) {
    return await this.notificationTokenRepository.findOneOrFail({
      where: { user },
      order: { updatedAt: "DESC" },
    });
  }
}
