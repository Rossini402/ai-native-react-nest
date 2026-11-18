import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { APP_ENV, type AppEnv } from "../../infra/config/env.config.js";
import { DRIZZLE_DB, type DrizzleDatabase } from "../../infra/db/database.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { DrizzleUsersRepository } from "./drizzle-users.repository.js";
import { JwtTokenService } from "./jwt-token.service.js";
import { PasswordHasher } from "./password-hasher.js";
import {
  InMemoryUsersRepository,
  USERS_REPOSITORY,
  type UsersRepository,
} from "./users.repository.js";

@Module({
  controllers: [AuthController],
  providers: [
    PasswordHasher,
    JwtTokenService,
    AuthService,
    {
      provide: USERS_REPOSITORY,
      inject: [APP_ENV, DRIZZLE_DB, PasswordHasher],
      useFactory: async (
        env: AppEnv,
        db: DrizzleDatabase | null,
        hasher: PasswordHasher,
      ): Promise<UsersRepository> => {
        if (env.STORAGE_MODE === "postgres" && db) {
          return new DrizzleUsersRepository(db);
        }
        const memRepo = new InMemoryUsersRepository(hasher);
        await memRepo.seedDemoAdmin();
        return memRepo;
      },
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [JwtTokenService, PasswordHasher],
})
export class AuthModule {}
