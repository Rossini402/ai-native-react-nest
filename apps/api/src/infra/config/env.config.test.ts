import { describe, expect, it } from "vitest";
import { parseAppEnv } from "./env.config.js";

describe("parseAppEnv", () => {
  it("applies safe defaults in development memory mode", () => {
    const env = parseAppEnv({ NODE_ENV: "development" });
    expect(env.STORAGE_MODE).toBe("memory");
    expect(env.PORT).toBe(3001);
    expect(env.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
  });

  it("fails fast when STORAGE_MODE=postgres without DATABASE_URL", () => {
    expect(() =>
      parseAppEnv({
        NODE_ENV: "development",
        STORAGE_MODE: "postgres",
      }),
    ).toThrow(/DATABASE_URL is required/);
  });

  it("fails fast in production when JWT_SECRET is missing or uses dev fallback", () => {
    expect(() =>
      parseAppEnv({
        NODE_ENV: "production",
        STORAGE_MODE: "memory",
      }),
    ).toThrow(/JWT_SECRET/);
  });
});
