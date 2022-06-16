import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import envDevLocal from "./environment/env.local";
import envDev from "./environment/env.dev";
import env from "./environment/env";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ClientsModule } from "./clients/clients.module";
import { ProductsModule } from "./products/products.module";
import { OrdersModule } from "./orders/orders.module";
import { MailModule } from "./mail/mail.module";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from "@nestjs/serve-static";
import { EanModule } from "./ean/ean.module";
import { ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [env, envDev, envDevLocal],
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("DB_HOST"),
        port: configService.get("DB_PORT"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        subscribers: [__dirname + "/**/*.subscriber{.ts,.js}"],
        synchronize: configService.get("DB_SYNCHRONIZE"),
        logging: configService.get("DB_LOGGING"),
      }),
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    ProductsModule,
    OrdersModule,
    MailModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: __dirname + "/../../client",
      exclude: ["/api/**"],
    }),
    EanModule,
    ThrottlerModule.forRoot({
      limit: 20,
      ttl: 60
    })
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
}
