import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import {
  type AuthUser,
  type CreateReleaseInput,
  type ListReleasesQuery,
  type PaginatedReleasesResponse,
  type ReleaseRequest,
  type ReviewReleaseInput,
  paginatedOk,
} from "@repo/contracts";
import { DomainException } from "../../common/filters/domain-exception.filter.js";
import { RELEASES_REPOSITORY, type ReleasesRepository } from "./releases.repository.js";

@Injectable()
export class ReleasesService {
  constructor(@Inject(RELEASES_REPOSITORY) private readonly repo: ReleasesRepository) {}

  async listReleases(query: ListReleasesQuery): Promise<PaginatedReleasesResponse> {
    const { items, total } = await this.repo.findPaginated(query);
    return paginatedOk(items, query.page, query.pageSize, total);
  }

  async createRelease(input: CreateReleaseInput, actor: AuthUser): Promise<ReleaseRequest> {
    return this.repo.create(input, actor.email);
  }

  async reviewRelease(
    id: string,
    input: ReviewReleaseInput,
    actor: AuthUser,
  ): Promise<ReleaseRequest> {
    if (actor.role !== "admin") {
      throw new DomainException(
        "FORBIDDEN",
        "Only admin users can approve or reject releases",
        HttpStatus.FORBIDDEN,
      );
    }

    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new DomainException(
        "RELEASE_NOT_FOUND",
        `Release request '${id}' was not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (existing.status !== "pending") {
      throw new DomainException(
        "RELEASE_ALREADY_DECIDED",
        `Release request '${id}' has already been ${existing.status}`,
        HttpStatus.CONFLICT,
      );
    }

    const trimmedNote = input.reviewNote?.trim();
    const reviewNote = trimmedNote ? trimmedNote : null;

    if (input.decision === "rejected" && (!reviewNote || reviewNote.length < 3)) {
      throw new DomainException(
        "VALIDATION_ERROR",
        "Rejecting a release requires a review note of at least 3 characters",
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.repo.recordDecision(id, input.decision, actor.email, reviewNote);
  }
}
