import { describe, expect, it } from "vitest";
import { LoginInputSchema } from "./auth.contract.js";

describe("Auth Contract Schemas", () => {
  it("normalizes email casing and whitespace on LoginInput", () => {
    const parsed = LoginInputSchema.parse({
      email: "  Admin@Example.COM ",
      password: "Password123!",
    });
    expect(parsed.email).toBe("admin@example.com");
  });

  it("rejects malformed emails and short passwords", () => {
    expect(LoginInputSchema.safeParse({ email: "not-an-email", password: "Password123!" }).success).toBe(
      false,
    );
    expect(LoginInputSchema.safeParse({ email: "user@example.com", password: "short" }).success).toBe(
      false,
    );
  });
});
