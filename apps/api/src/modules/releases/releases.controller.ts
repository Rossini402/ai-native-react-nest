import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import {
  type AuthUser,
  type CreateReleaseInput,
  CreateReleaseInputSchema,
  type ListReleasesQuery,
  ListReleasesQuerySchema,
  type PaginatedReleasesResponse,
  type ReleaseResponse,
  type ReviewReleaseInput,
  ReviewReleaseInputSchema,
  ok,
} from "@repo/contracts";
import { CurrentUser } from "../../common/auth/current-user.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { ReleasesService } from "./releases.service.js";

@Controller("api/releases")
export class ReleasesController {
  constructor(@Inject(ReleasesService) private readonly releasesService: ReleasesService) {}

  @Get()
  async list(
    @Query(new ZodValidationPipe(ListReleasesQuerySchema)) query: ListReleasesQuery,
  ): Promise<PaginatedReleasesResponse> {
    return this.releasesService.listReleases(query);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateReleaseInputSchema)) input: CreateReleaseInput,
    @CurrentUser() user: AuthUser,
  ): Promise<ReleaseResponse> {
    const created = await this.releasesService.createRelease(input, user);
    return ok(created);
  }

  @Post(":id/review")
  @HttpCode(HttpStatus.OK)
  async review(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(ReviewReleaseInputSchema)) input: ReviewReleaseInput,
    @CurrentUser() user: AuthUser,
  ): Promise<ReleaseResponse> {
    const reviewed = await this.releasesService.reviewRelease(id, input, user);
    return ok(reviewed);
  }
}
