import { Global, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { LocalGuard } from "./local/local.guard";
import { LocalStrategy } from "./local/local.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtGuard } from "./jwt/jwt.guard";
import { JwtStrategy } from "./jwt/jwt.strategy";
import { PoliciesGuard } from "./policies/policies.guard";
import { CaslAbilityFactory } from "./policies/casl-ability.factory";
import { NotificationsModule } from "../notifications/notifications.module";
import { MailModule } from "../../mail/mail.module";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: configService.get("JWT_EXPIRES_IN") },
      }),
    }),
    NotificationsModule,
  ],
  providers: [AuthService, LocalStrategy, LocalGuard, JwtStrategy, JwtGuard, CaslAbilityFactory, PoliciesGuard],
  controllers: [AuthController],
  exports: [AuthService, LocalStrategy, LocalGuard, JwtStrategy, JwtGuard, CaslAbilityFactory, PoliciesGuard],
})
export class AuthModule {
}
