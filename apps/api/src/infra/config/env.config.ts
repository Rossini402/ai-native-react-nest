import { StorageModeSchema } from "@repo/contracts";
import { z } from "zod";

const DEFAULT_DEV_JWT_SECRET = "dev-only-jwt-secret-change-in-production-32chars";

export const AppEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    STORAGE_MODE: StorageModeSchema.default("memory"),
    DATABASE_URL: z.string().url().optional(),
    JWT_SECRET: z.string().min(16).optional(),
    JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().min(60).max(604800).default(28800),
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_MODE === "postgres" && !env.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "DATABASE_URL is required when STORAGE_MODE=postgres",
      });
    }
    if (env.NODE_ENV === "production") {
      if (
        !env.JWT_SECRET ||
        env.JWT_SECRET.length < 32 ||
        env.JWT_SECRET === DEFAULT_DEV_JWT_SECRET
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["JWT_SECRET"],
          message: "Production requires a custom JWT_SECRET with at least 32 characters",
        });
      }
    }
  })
  .transform((env) => ({
    ...env,
    JWT_SECRET: env.JWT_SECRET ?? DEFAULT_DEV_JWT_SECRET,
  }));

export type AppEnv = z.output<typeof AppEnvSchema>;

export const APP_ENV = Symbol("APP_ENV");

export function parseAppEnv(raw: Record<string, string | undefined> = process.env): AppEnv {
  const parsed = AppEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "env"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
