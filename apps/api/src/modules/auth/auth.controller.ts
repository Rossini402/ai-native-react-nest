import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post } from "@nestjs/common";
import {
  type AuthSessionResponse,
  type AuthUser,
  type LoginInput,
  LoginInputSchema,
  type MeResponse,
  ok,
} from "@repo/contracts";
import { CurrentUser } from "../../common/auth/current-user.decorator.js";
import { Public } from "../../common/auth/public.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { AuthService } from "./auth.service.js";

@Controller("api/auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginInputSchema)) input: LoginInput,
  ): Promise<AuthSessionResponse> {
    const session = await this.authService.login(input);
    return ok(session);
  }

  @Get("me")
  async me(@CurrentUser() user: AuthUser): Promise<MeResponse> {
    return ok(user);
  }
}
