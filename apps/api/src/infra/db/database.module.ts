import { Global, Inject, Injectable, Module, type OnModuleDestroy } from "@nestjs/common";
import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import { APP_ENV, type AppEnv } from "../config/env.config.js";
import * as schema from "./schema.js";

export type DrizzleDatabase = PostgresJsDatabase<typeof schema>;
export const DRIZZLE_DB = Symbol("DRIZZLE_DB");
const POSTGRES_CLIENT = Symbol("POSTGRES_CLIENT");

@Injectable()
class DatabaseLifecycle implements OnModuleDestroy {
  constructor(@Inject(POSTGRES_CLIENT) private readonly sqlClient: Sql | null) {}

  async onModuleDestroy(): Promise<void> {
    if (this.sqlClient) {
      await this.sqlClient.end({ timeout: 5 });
    }
  }
}

@Global()
@Module({
  providers: [
    {
      provide: POSTGRES_CLIENT,
      inject: [APP_ENV],
      useFactory: (env: AppEnv): Sql | null => {
        if (env.STORAGE_MODE !== "postgres" || !env.DATABASE_URL) {
          return null;
        }
        return postgres(env.DATABASE_URL, { max: 10 });
      },
    },
    {
      provide: DRIZZLE_DB,
      inject: [POSTGRES_CLIENT],
      useFactory: (client: Sql | null): DrizzleDatabase | null => {
        if (!client) return null;
        return drizzle(client, { schema });
      },
    },
    DatabaseLifecycle,
  ],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
