import { randomUUID } from "node:crypto";
import { HttpStatus, Injectable } from "@nestjs/common";
import type {
  CreateReleaseInput,
  ListReleasesQuery,
  ReleaseDecision,
  ReleaseRequest,
} from "@repo/contracts";
import { DomainException } from "../../common/filters/domain-exception.filter.js";

export const RELEASES_REPOSITORY = Symbol("RELEASES_REPOSITORY");

export interface ReleasesRepository {
  findPaginated(query: ListReleasesQuery): Promise<{ items: ReleaseRequest[]; total: number }>;
  findById(id: string): Promise<ReleaseRequest | null>;
  create(input: CreateReleaseInput, requestedByEmail: string): Promise<ReleaseRequest>;
  recordDecision(
    id: string,
    decision: ReleaseDecision,
    reviewedByEmail: string,
    reviewNote: string | null,
  ): Promise<ReleaseRequest>;
}

@Injectable()
export class InMemoryReleasesRepository implements ReleasesRepository {
  private readonly items = new Map<string, ReleaseRequest>();

  async findPaginated(
    query: ListReleasesQuery,
  ): Promise<{ items: ReleaseRequest[]; total: number }> {
    const filtered = Array.from(this.items.values())
      .reverse()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((item) => {
        if (query.status && item.status !== query.status) {
          return false;
        }
        if (query.environment && item.environment !== query.environment) {
          return false;
        }
        return true;
      });

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const end = query.page * query.pageSize;
    const items = filtered.slice(start, end);

    return { items, total };
  }

  async findById(id: string): Promise<ReleaseRequest | null> {
    return this.items.get(id) ?? null;
  }

  async create(input: CreateReleaseInput, requestedByEmail: string): Promise<ReleaseRequest> {
    const release: ReleaseRequest = {
      id: randomUUID(),
      serviceName: input.serviceName,
      version: input.version,
      environment: input.environment,
      riskLevel: input.riskLevel,
      changelog: input.changelog,
      status: "pending",
      requestedByEmail,
      reviewedByEmail: null,
      reviewNote: null,
      createdAt: new Date().toISOString(),
      reviewedAt: null,
    };
    this.items.set(release.id, release);
    return release;
  }

  async recordDecision(
    id: string,
    decision: ReleaseDecision,
    reviewedByEmail: string,
    reviewNote: string | null,
  ): Promise<ReleaseRequest> {
    const existing = this.items.get(id);
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

    const updated: ReleaseRequest = {
      ...existing,
      status: decision,
      reviewedByEmail,
      reviewNote,
      reviewedAt: new Date().toISOString(),
    };
    this.items.set(id, updated);
    return updated;
  }
}
