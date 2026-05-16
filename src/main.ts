import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { name, version } from "../package.json";
import * as cookieParser from "cookie-parser";
import { RequestInterceptor } from "./request.interceptor";
import * as compression from "compression";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get("FRONT_URL"),
    credentials: true,
  });
  app.use(cookieParser(), compression());

  app.useGlobalInterceptors(
    new RequestInterceptor(),
  );

  const apiConfig = new DocumentBuilder()
    .setTitle(name)
    .setVersion(version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, apiConfig);
  SwaggerModule.setup("api/documentation", app, document);

  await app.listen(config.get("PORT"), "0.0.0.0");
}

bootstrap().then(_ => {
});
