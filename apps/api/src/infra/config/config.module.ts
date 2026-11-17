import { Global, Module } from "@nestjs/common";
import { APP_ENV, parseAppEnv } from "./env.config.js";

@Global()
@Module({
  providers: [
    {
      provide: APP_ENV,
      useFactory: () => parseAppEnv(process.env),
    },
  ],
  exports: [APP_ENV],
})
export class AppConfigModule {}
