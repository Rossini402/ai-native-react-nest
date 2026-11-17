import { describe, expect, it } from "vitest";
import { parseAppEnv } from "../../infra/config/env.config.js";
import { AuthService } from "./auth.service.js";
import { JwtTokenService } from "./jwt-token.service.js";
import { PasswordHasher } from "./password-hasher.js";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  InMemoryUsersRepository,
} from "./users.repository.js";

async function createAuthHarness() {
  const env = parseAppEnv({
    NODE_ENV: "test",
    JWT_SECRET: "unit-test-secret-with-at-least-32-characters",
    JWT_EXPIRES_IN_SECONDS: "3600",
  });
  const hasher = new PasswordHasher();
  const repo = new InMemoryUsersRepository(hasher);
  await repo.seedDemoAdmin();
  const jwtService = new JwtTokenService(env);
  const authService = new AuthService(repo, hasher, jwtService);
  return { authService, jwtService };
}

describe("AuthService & JwtTokenService", () => {
  it("authenticates valid credentials and verifies issued HS256 token", async () => {
    const { authService, jwtService } = await createAuthHarness();
    const session = await authService.login({
      email: DEMO_ADMIN_EMAIL,
      password: DEMO_ADMIN_PASSWORD,
    });

    expect(session.user.email).toBe(DEMO_ADMIN_EMAIL);
    expect(session.user.role).toBe("admin");

    const verifiedUser = jwtService.verify(session.accessToken);
    expect(verifiedUser).toEqual(session.user);
  });

  it("rejects wrong password with INVALID_CREDENTIALS (401)", async () => {
    const { authService } = await createAuthHarness();
    await expect(
      authService.login({ email: DEMO_ADMIN_EMAIL, password: "WrongPassword999!" }),
    ).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
      statusCode: 401,
    });
  });

  it("rejects expired or signature-tampered tokens with UNAUTHORIZED (401)", async () => {
    const { jwtService } = await createAuthHarness();
    const { accessToken } = jwtService.sign(
      { id: "u-1", email: "member@example.com", role: "member" },
      1_000_000,
    );

    expect(() => jwtService.verify(accessToken, 1_003_601)).toThrow(/expired/);
    expect(() => jwtService.verify(`${accessToken}tampered`, 1_000_010)).toThrow(/signature/);
  });
});
