import { createParamDecorator, type ExecutionContext, HttpStatus } from "@nestjs/common";
import type { AuthUser } from "@repo/contracts";
import { DomainException } from "../filters/domain-exception.filter.js";

export interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthUser;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.user) {
      throw new DomainException(
        "UNAUTHORIZED",
        "Authenticated user context is missing",
        HttpStatus.UNAUTHORIZED,
      );
    }
    return req.user;
  },
);
