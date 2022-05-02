import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { User } from "../users/entities/user.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
  }

  private makeTo(initial: string) {
    return this.configService.get("NODEMAILER_TEST_MAIL") ?? initial;
  }

  sendConfirmation(user: User) {
    return this.mailerService.sendMail({
      to: this.makeTo(user.email),
      from: "abii.iutbelfort@gmail.com",
      subject: "Confirmation de création de compte",
      template: "confirmation",
      context: {
        name: user.name,
        url: `${this.configService.get("FRONT_URL")}/confirm?activationKey=${encodeURIComponent(user.activationKey)}`,
      },
    });
  }
}
