import { Controller, Get, Inject } from "@nestjs/common";
import { type HealthResponse, ok } from "@repo/contracts";
import { Public } from "../../common/auth/public.decorator.js";
import { APP_ENV, type AppEnv } from "../../infra/config/env.config.js";

@Controller("api/health")
export class HealthController {
  constructor(@Inject(APP_ENV) private readonly env: AppEnv) {}

  @Public()
  @Get()
  check(): HealthResponse {
    return ok({
      status: "ok",
      storageMode: this.env.STORAGE_MODE,
      timestamp: new Date().toISOString(),
    });
  }
}
