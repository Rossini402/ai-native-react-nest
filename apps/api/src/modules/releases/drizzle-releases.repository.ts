import { HttpStatus } from "@nestjs/common";
import type {
  CreateReleaseInput,
  ListReleasesQuery,
  ReleaseDecision,
  ReleaseRequest,
} from "@repo/contracts";
import { type SQL, and, count, desc, eq } from "drizzle-orm";
import { DomainException } from "../../common/filters/domain-exception.filter.js";
import type { DrizzleDatabase } from "../../infra/db/database.module.js";
import { releaseRequestsTable } from "../../infra/db/schema.js";
import type { ReleasesRepository } from "./releases.repository.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toReleaseRequestDto(row: typeof releaseRequestsTable.$inferSelect): ReleaseRequest {
  return {
    id: row.id,
    serviceName: row.serviceName,
    version: row.version,
    environment: row.environment,
    riskLevel: row.riskLevel,
    changelog: row.changelog,
    status: row.status,
    requestedByEmail: row.requestedByEmail,
    reviewedByEmail: row.reviewedByEmail,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
  };
}

export class DrizzleReleasesRepository implements ReleasesRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findPaginated(
    query: ListReleasesQuery,
  ): Promise<{ items: ReleaseRequest[]; total: number }> {
    const conditions: SQL[] = [];
    if (query.status) {
      conditions.push(eq(releaseRequestsTable.status, query.status));
    }
    if (query.environment) {
      conditions.push(eq(releaseRequestsTable.environment, query.environment));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      this.db
        .select()
        .from(releaseRequestsTable)
        .where(whereClause)
        .orderBy(desc(releaseRequestsTable.createdAt), desc(releaseRequestsTable.id))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      this.db.select({ total: count() }).from(releaseRequestsTable).where(whereClause),
    ]);

    return {
      items: rows.map(toReleaseRequestDto),
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  async findById(id: string): Promise<ReleaseRequest | null> {
    if (!UUID_PATTERN.test(id)) {
      return null;
    }
    const [row] = await this.db
      .select()
      .from(releaseRequestsTable)
      .where(eq(releaseRequestsTable.id, id))
      .limit(1);
    return row ? toReleaseRequestDto(row) : null;
  }

  async create(input: CreateReleaseInput, requestedByEmail: string): Promise<ReleaseRequest> {
    const [inserted] = await this.db
      .insert(releaseRequestsTable)
      .values({
        serviceName: input.serviceName,
        version: input.version,
        environment: input.environment,
        riskLevel: input.riskLevel,
        changelog: input.changelog,
        status: "pending",
        requestedByEmail,
      })
      .returning();
    if (!inserted) {
      throw new Error("Failed to insert release request row");
    }
    return toReleaseRequestDto(inserted);
  }

  async recordDecision(
    id: string,
    decision: ReleaseDecision,
    reviewedByEmail: string,
    reviewNote: string | null,
  ): Promise<ReleaseRequest> {
    if (!UUID_PATTERN.test(id)) {
      throw new DomainException(
        "RELEASE_NOT_FOUND",
        `Release request '${id}' was not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const [updated] = await this.db
      .update(releaseRequestsTable)
      .set({
        status: decision,
        reviewedByEmail,
        reviewNote,
        reviewedAt: new Date(),
      })
      .where(and(eq(releaseRequestsTable.id, id), eq(releaseRequestsTable.status, "pending")))
      .returning();

    if (!updated) {
      const existing = await this.findById(id);
      if (existing) {
        throw new DomainException(
          "RELEASE_ALREADY_DECIDED",
          `Release request '${id}' has already been ${existing.status}`,
          HttpStatus.CONFLICT,
        );
      }
      throw new DomainException(
        "RELEASE_NOT_FOUND",
        `Release request '${id}' was not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return toReleaseRequestDto(updated);
  }
}
