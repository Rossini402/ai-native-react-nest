import { Module } from "@nestjs/common";
import { APP_ENV, type AppEnv } from "../../infra/config/env.config.js";
import { DRIZZLE_DB, type DrizzleDatabase } from "../../infra/db/database.module.js";
import { DrizzleReleasesRepository } from "./drizzle-releases.repository.js";
import { ReleasesController } from "./releases.controller.js";
import {
  InMemoryReleasesRepository,
  RELEASES_REPOSITORY,
  type ReleasesRepository,
} from "./releases.repository.js";
import { ReleasesService } from "./releases.service.js";

@Module({
  controllers: [ReleasesController],
  providers: [
    ReleasesService,
    {
      provide: RELEASES_REPOSITORY,
      inject: [APP_ENV, DRIZZLE_DB],
      useFactory: (env: AppEnv, db: DrizzleDatabase | null): ReleasesRepository => {
        if (env.STORAGE_MODE === "postgres" && db) {
          return new DrizzleReleasesRepository(db);
        }
        return new InMemoryReleasesRepository();
      },
    },
  ],
})
export class ReleasesModule {}
