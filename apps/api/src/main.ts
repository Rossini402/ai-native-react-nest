import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { DomainExceptionFilter } from "./common/filters/domain-exception.filter.js";
import { StructuredLoggerInterceptor } from "./common/observability/structured-logger.interceptor.js";
import { APP_ENV, type AppEnv } from "./infra/config/env.config.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const env = app.get<AppEnv>(APP_ENV);

  app.enableCors({
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
    exposedHeaders: ["x-request-id"],
  });
  app.useGlobalInterceptors(new StructuredLoggerInterceptor());
  app.useGlobalFilters(new DomainExceptionFilter());

  await app.listen(env.PORT);
}

void bootstrap();
