import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import type { AuthSession, AuthUser, LoginInput } from "@repo/contracts";
import { DomainException } from "../../common/filters/domain-exception.filter.js";
import { JwtTokenService } from "./jwt-token.service.js";
import { PasswordHasher } from "./password-hasher.js";
import { USERS_REPOSITORY, type UsersRepository } from "./users.repository.js";

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepo: UsersRepository,
    @Inject(PasswordHasher) private readonly passwordHasher: PasswordHasher,
    @Inject(JwtTokenService) private readonly jwtTokens: JwtTokenService,
  ) {}

  async login(input: LoginInput): Promise<AuthSession> {
    const stored = await this.usersRepo.findByEmail(input.email);
    if (!stored) {
      throw this.invalidCredentials();
    }

    const passwordValid = await this.passwordHasher.verify(input.password, stored.passwordHash);
    if (!passwordValid) {
      throw this.invalidCredentials();
    }

    const user: AuthUser = {
      id: stored.id,
      email: stored.email,
      role: stored.role,
    };
    const { accessToken, expiresInSeconds } = this.jwtTokens.sign(user);
    return { accessToken, expiresInSeconds, user };
  }

  private invalidCredentials(): DomainException {
    return new DomainException(
      "INVALID_CREDENTIALS",
      "Invalid email or password",
      HttpStatus.UNAUTHORIZED,
    );
  }
}
