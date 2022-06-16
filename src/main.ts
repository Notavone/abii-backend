import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { name, version } from "../package.json";
import * as cookieParser from "cookie-parser";
import { EntityNotFoundFilter } from "./filters/entity-not-found.filter";
import { QueryFailedErrorFilter } from "./filters/query-failed-error.filter";
import { RequestInterceptor } from "./request.interceptor";
import * as compression from "compression";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors();
  app.use(cookieParser(), compression());
  app.setGlobalPrefix("api");

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    skipUndefinedProperties: true,
    skipNullProperties: false,
  }));

  app.useGlobalInterceptors(
    new RequestInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  app.useGlobalFilters(
    new EntityNotFoundFilter(),
    new QueryFailedErrorFilter(),
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
