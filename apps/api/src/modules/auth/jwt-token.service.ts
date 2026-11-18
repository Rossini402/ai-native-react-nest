import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { type AuthUser, AuthUserSchema } from "@repo/contracts";
import { z } from "zod";
import { DomainException } from "../../common/filters/domain-exception.filter.js";
import { APP_ENV, type AppEnv } from "../../infra/config/env.config.js";

const JwtHeaderSchema = z.object({
  alg: z.literal("HS256"),
  typ: z.literal("JWT"),
});

const JwtClaimsSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  role: AuthUserSchema.shape.role,
  iat: z.number().int(),
  exp: z.number().int(),
});

function encodeBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function decodeBase64UrlJson(segment: string): unknown {
  const decoded = Buffer.from(segment, "base64url").toString("utf8");
  return JSON.parse(decoded) as unknown;
}

@Injectable()
export class JwtTokenService {
  constructor(@Inject(APP_ENV) private readonly env: AppEnv) {}

  sign(
    user: AuthUser,
    nowEpochSeconds: number = Math.floor(Date.now() / 1000),
  ): {
    accessToken: string;
    expiresInSeconds: number;
  } {
    const expiresInSeconds = this.env.JWT_EXPIRES_IN_SECONDS;
    const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = encodeBase64Url(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        role: user.role,
        iat: nowEpochSeconds,
        exp: nowEpochSeconds + expiresInSeconds,
      }),
    );
    const signingInput = `${header}.${payload}`;
    const signature = this.computeSignature(signingInput);
    return {
      accessToken: `${signingInput}.${signature}`,
      expiresInSeconds,
    };
  }

  verify(token: string, nowEpochSeconds: number = Math.floor(Date.now() / 1000)): AuthUser {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
      throw this.unauthorized("Malformed bearer token");
    }

    const [headerSeg, payloadSeg, sigSeg] = parts;
    const expectedSig = this.computeSignature(`${headerSeg}.${payloadSeg}`);
    const sigBuf = Buffer.from(sigSeg, "utf8");
    const expectedBuf = Buffer.from(expectedSig, "utf8");

    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      throw this.unauthorized("Invalid token signature");
    }

    let rawHeader: unknown;
    let rawClaims: unknown;
    try {
      rawHeader = decodeBase64UrlJson(headerSeg);
      rawClaims = decodeBase64UrlJson(payloadSeg);
    } catch {
      throw this.unauthorized("Corrupted token payload");
    }

    if (!JwtHeaderSchema.safeParse(rawHeader).success) {
      throw this.unauthorized("Unsupported JWT header");
    }

    const claims = JwtClaimsSchema.safeParse(rawClaims);
    if (!claims.success) {
      throw this.unauthorized("Invalid JWT claims");
    }

    if (claims.data.exp <= nowEpochSeconds) {
      throw this.unauthorized("Access token has expired");
    }

    return {
      id: claims.data.sub,
      email: claims.data.email,
      role: claims.data.role,
    };
  }

  private computeSignature(signingInput: string): string {
    return createHmac("sha256", this.env.JWT_SECRET).update(signingInput).digest("base64url");
  }

  private unauthorized(message: string): DomainException {
    return new DomainException("UNAUTHORIZED", message, HttpStatus.UNAUTHORIZED);
  }
}
