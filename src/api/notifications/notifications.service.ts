import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { User } from "../users/entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { InjectConnection, InjectRepository } from "@nestjs/typeorm";
import { NotificationToken } from "./entities/notification-token.entity";
import { Connection, In, Repository } from "typeorm";
import * as webPush from "web-push";
import { PushSubscription, WebPushError } from "web-push";
import { NotificationDto } from "./dto/notification.dto";

export interface SendReport {
  sent: number;
  failed: number;
  errors: string[];
}

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

  /**
   * Clé publique VAPID : le front s'abonne avec elle. Elle doit correspondre à la clé privée
   * qui signe les envois, sinon les services push refusent (Apple : "VapidPkHashMismatch").
   */
  getPublicKey(): string {
    return this.config.get("VAPID_PUBLIC_KEY");
  }

  private async sendNotification(tokens: NotificationToken[], notification: NotificationDto): Promise<SendReport> {
    const payload = JSON.stringify({
      notification: {
        title: notification.title,
        body: notification.body,
        silent: false,
        timestamp: new Date().getTime(),
        vibrate: [100, 50, 100],
        data: notification.data,
      },
    });
    this.logger.log(`Sending notification "${notification.title}" to ${tokens.length} tokens`);

    const results = await Promise.allSettled(tokens.map((token) => webPush.sendNotification(token.pushSubscription, payload)));

    const report: SendReport = { sent: 0, failed: 0, errors: [] };
    for (const [i, result] of results.entries()) {
      if (result.status === "fulfilled") {
        report.sent++;
        continue;
      }
      report.failed++;
      const error = result.reason as WebPushError;
      const reason = `${error?.statusCode ?? "?"} ${error?.body || error?.message || "unknown error"}`.trim();
      report.errors.push(reason);
      await this.handleSendError(tokens[i], error?.statusCode, reason);
    }

    this.logger.log(`Notification sent to ${report.sent}/${tokens.length} tokens`);
    return report;
  }

  /**
   * - 404 / 410 : abonnement expiré ou révoqué (app désinstallée, notifications coupées) -> supprimé
   * - 400 / 403 : abonnement inutilisable (ex. créé avec une autre clé VAPID) -> désactivé ;
   *   le front le recrée avec la bonne clé à la prochaine ouverture de l'app
   */
  private async handleSendError(token: NotificationToken, statusCode: number | undefined, reason: string) {
    this.logger.warn(`Push failed for token ${token.id}: ${reason}`);
    if (statusCode === 404 || statusCode === 410) {
      await this.notificationTokenRepository.remove(token);
    } else if (statusCode === 400 || statusCode === 403) {
      token.active = false;
      await this.notificationTokenRepository.save(token);
    }
  }

  /**
   * Un seul abonnement par utilisateur, et un appareil n'appartient qu'au dernier compte connecté dessus.
   */
  async subscribe(user: User, pushSubscription: PushSubscription) {
    if (!pushSubscription?.endpoint || !pushSubscription.keys?.p256dh || !pushSubscription.keys?.auth) {
      throw new BadRequestException("Invalid push subscription");
    }

    await this.connection.transaction(async (manager) => {
      const tokens = await manager.find(NotificationToken, { relations: ["user"] });
      const mine = tokens.find((t) => t.user?.id === user.id);

      // Même appareil enregistré pour un autre compte, ou abonnements orphelins (sans utilisateur) : supprimés
      const obsolete = tokens.filter((t) => t !== mine && (!t.user || t.pushSubscription?.endpoint === pushSubscription.endpoint));
      if (obsolete.length) await manager.remove(obsolete);

      const token = mine ?? manager.create(NotificationToken, { user: { id: user.id } as User });
      token.pushSubscription = pushSubscription;
      token.active = true;
      await manager.save(token);
    });

    return { subscribed: true };
  }

  async unsubscribe(user: User) {
    const existingToken = await this.findUserToken(user.id);
    if (existingToken) {
      existingToken.active = false;
      await this.notificationTokenRepository.save(existingToken);
    }
  }

  private findUserToken(userId: number) {
    return this.notificationTokenRepository.createQueryBuilder("token")
      .innerJoin("token.user", "user")
      .where("user.id = :userId", { userId })
      .getOne();
  }

  sendNotificationTo(user: User, notification: NotificationDto): Promise<SendReport>;
  sendNotificationTo(users: User[], notification: NotificationDto): Promise<SendReport>;
  async sendNotificationTo(usersResolvable: User | User[], notification: NotificationDto): Promise<SendReport> {
    const users = Array.isArray(usersResolvable) ? usersResolvable : [usersResolvable];
    if (!users.length) return { sent: 0, failed: 0, errors: [] };

    const tokens = await this.notificationTokenRepository.createQueryBuilder("token")
      .innerJoin("token.user", "user")
      .where("user.id IN (:...ids)", { ids: users.map((u) => u.id) })
      .andWhere("token.active = :active", { active: true })
      .getMany();
    return this.sendNotification(tokens, notification);
  }

  delayNotificationSending(user: User, notification: NotificationDto, condition?: () => Promise<boolean>, timeout?: number);
  delayNotificationSending(users: User[], notification: NotificationDto, condition?: () => Promise<boolean>, timeout?: number);
  delayNotificationSending(usersResolvable: User | User[], notification: NotificationDto, condition: () => Promise<boolean> = () => Promise.resolve(true), timeout: number = 60000) {
    this.logger.log(`Delaying call to notify in ${timeout}ms`);
    setTimeout(async () => {
      const users = Array.isArray(usersResolvable) ? usersResolvable : [usersResolvable];
      const conditionResult = await condition();
      if (conditionResult) await this.sendNotificationTo(users, notification);
      else this.logger.log("Conditions not met to emit notification");
    }, timeout);
  }
}
