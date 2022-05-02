import { Global, Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { ConfigService } from "@nestjs/config";
import { join } from "path";

@Global()
@Module({
  imports: [MailerModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
      transport: {
        host: configService.get("MAIL_HOST"),
        port: configService.get("MAIL_PORT"),
        secure: false,
        auth: {
          user: configService.get("MAIL_USERNAME"),
          pass: configService.get("MAIL_PASSWORD"),
        },
      },
      defaults: {
        from: configService.get("MAIL_FROM"),
      },
      template: {
        dir: join(__dirname + "/templates"),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    inject: [ConfigService],
  })],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {
}
