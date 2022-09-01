import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { SendIndexFilter } from "../filters/send-index.filter";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from "path";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, "../../../client"),
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SendIndexFilter,
    }
  ],
})
export class FrontModule {
}
