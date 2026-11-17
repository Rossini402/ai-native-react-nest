import {
  type CanActivate,
  type ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtTokenService } from "../../modules/auth/jwt-token.service.js";
import { DomainException } from "../filters/domain-exception.filter.js";
import type { AuthenticatedRequest } from "./current-user.decorator.js";
import { IS_PUBLIC_KEY } from "./public.decorator.js";

export interface GuardExecutionContext {
  getHandler: ExecutionContext["getHandler"];
  getClass: ExecutionContext["getClass"];
  switchToHttp(): {
    getRequest<T = AuthenticatedRequest>(): T;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(JwtTokenService) private readonly jwtService: JwtTokenService,
  ) {}

  canActivate(context: GuardExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const rawHeader = request.headers.authorization;
    const authHeader = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new DomainException(
        "UNAUTHORIZED",
        "Missing Bearer authorization token",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      throw new DomainException(
        "UNAUTHORIZED",
        "Empty Bearer authorization token",
        HttpStatus.UNAUTHORIZED,
      );
    }

    request.user = this.jwtService.verify(token);
    return true;
  }
}
