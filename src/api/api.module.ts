import { ClassSerializerInterceptor, Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ClientsModule } from "./clients/clients.module";
import { ProductsModule } from "./products/products.module";
import { OrdersModule } from "./orders/orders.module";
import { ScheduleModule } from "@nestjs/schedule";
import { EanModule } from "./ean/ean.module";
import { ThrottlerModule } from "@nestjs/throttler";
import { StockModule } from "./stock/stock.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { AppController } from "../app.controller";
import * as path from "path";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { EntityNotFoundFilter } from "../filters/entity-not-found.filter";
import { QueryFailedErrorFilter } from "../filters/query-failed-error.filter";

@Module({

  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: [".env.local", ".env.dev", ".env"],
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
        logging: configService.get("DB_LOGGING"),
        synchronize: configService.get("DB_SYNCHRONIZE"),
        entities: [path.join(__dirname, "..", "/**/*.entity{.ts,.js}")],
        subscribers: [path.join(__dirname, "..", "/**/*.subscriber{.ts,.js}")],
        migrations: [path.join(__dirname, "..", "/migrations/*{.ts,.js}")],
        cli: {
          migrationsDir: "src/migrations",
        },
      }),
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    ProductsModule,
    OrdersModule,
    ScheduleModule.forRoot(),
    EanModule,
    ThrottlerModule.forRoot({
      limit: 20,
      ttl: 60,
    }),
    StockModule,
    NotificationsModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: EntityNotFoundFilter,
    },
    {
      provide: APP_FILTER,
      useClass: QueryFailedErrorFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        skipUndefinedProperties: true,
        skipNullProperties: false,
      }),
    },
  ],
})
export class ApiModule {

}
