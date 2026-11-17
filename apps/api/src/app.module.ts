import { Module } from "@nestjs/common";
import { AppConfigModule } from "./infra/config/config.module.js";
import { DatabaseModule } from "./infra/db/database.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { TasksModule } from "./modules/tasks/tasks.module.js";

@Module({
  imports: [AppConfigModule, DatabaseModule, AuthModule, HealthModule, TasksModule],
})
export class AppModule {}
