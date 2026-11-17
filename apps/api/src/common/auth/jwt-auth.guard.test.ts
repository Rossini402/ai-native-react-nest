import { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";
import { parseAppEnv } from "../../infra/config/env.config.js";
import { JwtTokenService } from "../../modules/auth/jwt-token.service.js";
import type { AuthenticatedRequest } from "./current-user.decorator.js";
import { type GuardExecutionContext, JwtAuthGuard } from "./jwt-auth.guard.js";

class DummyController {}
function dummyHandler(): void {}

function createMockContext(headers: Record<string, string> = {}): {
  ctx: GuardExecutionContext;
  req: AuthenticatedRequest;
} {
  const req: AuthenticatedRequest = { headers };
  const ctx: GuardExecutionContext = {
    getHandler: () => dummyHandler,
    getClass: () => DummyController,
    switchToHttp: () => ({
      getRequest: <T = AuthenticatedRequest>() => req as T,
    }),
  };
  return { ctx, req };
}

describe("JwtAuthGuard (Global Default-Deny)", () => {
  const env = parseAppEnv({
    NODE_ENV: "test",
    JWT_SECRET: "guard-test-secret-with-at-least-32-chars",
  });
  const jwtService = new JwtTokenService(env);

  it("allows @Public() routes without Authorization header", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
    const guard = new JwtAuthGuard(reflector, jwtService);

    const { ctx } = createMockContext();
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("blocks protected routes missing Bearer token with UNAUTHORIZED", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
    const guard = new JwtAuthGuard(reflector, jwtService);

    const { ctx } = createMockContext();
    expect(() => guard.canActivate(ctx)).toThrow(/Missing Bearer/);
  });

  it("attaches verified AuthUser onto request for valid Bearer token", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
    const guard = new JwtAuthGuard(reflector, jwtService);

    const { accessToken } = jwtService.sign({
      id: "user-42",
      email: "admin@example.com",
      role: "admin",
    });
    const { ctx, req } = createMockContext({ authorization: `Bearer ${accessToken}` });

    expect(guard.canActivate(ctx)).toBe(true);
    expect(req.user).toEqual({
      id: "user-42",
      email: "admin@example.com",
      role: "admin",
    });
  });
});
