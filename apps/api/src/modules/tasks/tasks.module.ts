import { Module } from "@nestjs/common";
import { APP_ENV, type AppEnv } from "../../infra/config/env.config.js";
import { DRIZZLE_DB, type DrizzleDatabase } from "../../infra/db/database.module.js";
import { DrizzleTasksRepository } from "./drizzle-tasks.repository.js";
import { TasksController } from "./tasks.controller.js";
import {
  InMemoryTasksRepository,
  TASKS_REPOSITORY,
  type TasksRepository,
} from "./tasks.repository.js";
import { TasksService } from "./tasks.service.js";

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: TASKS_REPOSITORY,
      inject: [APP_ENV, DRIZZLE_DB],
      useFactory: (env: AppEnv, db: DrizzleDatabase | null): TasksRepository => {
        if (env.STORAGE_MODE === "postgres" && db) {
          return new DrizzleTasksRepository(db);
        }
        return new InMemoryTasksRepository();
      },
    },
  ],
})
export class TasksModule {}
