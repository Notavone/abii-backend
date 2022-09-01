import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ApiModule } from "./api/api.module";
import { FrontModule } from "./front/front.module";

@Module({
  imports: [
    ApiModule,
    FrontModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
}
