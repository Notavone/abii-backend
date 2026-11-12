import {Injectable} from "@nestjs/common";
import { createTransport, Transporter } from "nodemailer";
import * as Handlebars from "handlebars";
import { readFileSync } from "fs";
import { join } from "path";
import {User} from "../api/users/entities/user.entity";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class MailService {
    private readonly transporter: Transporter;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.transporter = createTransport({
            host: configService.get("MAIL_HOST"),
            port: +configService.get("MAIL_PORT"),
            secure: false,
            auth: {
                user: configService.get("MAIL_USERNAME"),
                pass: configService.get("MAIL_PASSWORD"),
            },
        });
    }

    private sendMail(options: { to: string; from?: string; subject: string; template: string; context: Record<string, unknown> }) {
        const { template, context, ...rest } = options;
        const source = readFileSync(join(__dirname, "templates", `${template}.hbs`), "utf-8");
        const html = Handlebars.compile(source, { strict: true })(context);
        return this.transporter.sendMail({ from: this.configService.get("MAIL_FROM"), ...rest, html });
    }

    private makeTo(initial: string) {
        return this.configService.get("NODEMAILER_TEST_MAIL") ?? initial;
    }

    sendConfirmation(user: User) {
        return this.sendMail({
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

    sendInitUserPasswordReset(user: User) {
        return this.sendMail({
            to: this.makeTo(user.email),
            from: "abii.iutbelfort@gmail.com",
            subject: "Réinitialisation de mot de passe",
            template: "init-reset",
            context: {
                name: user.name,
                url: `${this.configService.get("FRONT_URL")}/reset?resetKey=${encodeURIComponent(user.resetKey)}`,
            }
        });
    }

    sendFinishUserPasswordReset(user: User) {
        return this.sendMail({
            to: this.makeTo(user.email),
            from: "abii.iutbelfort@gmail.com",
            subject: "Réinitialisation de mot de passe",
            template: "finish-reset",
            context: {
                name: user.name,
            }
        });
    }
}
