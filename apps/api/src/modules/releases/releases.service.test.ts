import type { AuthUser } from "@repo/contracts";
import { describe, expect, it } from "vitest";
import type { DomainException } from "../../common/filters/domain-exception.filter.js";
import { PasswordHasher } from "../auth/password-hasher.js";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_MEMBER_EMAIL,
  DEMO_MEMBER_PASSWORD,
  InMemoryUsersRepository,
} from "../auth/users.repository.js";
import { InMemoryReleasesRepository } from "./releases.repository.js";
import { ReleasesService } from "./releases.service.js";

const ADMIN_ACTOR: AuthUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: DEMO_ADMIN_EMAIL,
  role: "admin",
};

const MEMBER_ACTOR: AuthUser = {
  id: "00000000-0000-4000-8000-000000000002",
  email: DEMO_MEMBER_EMAIL,
  role: "member",
};

function createServiceHarness() {
  const repo = new InMemoryReleasesRepository();
  const service = new ReleasesService(repo);
  return { service, repo };
}

describe("ReleasesService", () => {
  it("creates a release request in pending status with requester email attached", async () => {
    const { service } = createServiceHarness();

    const created = await service.createRelease(
      {
        serviceName: "payments-gateway",
        version: "v2.1.0",
        environment: "production",
        riskLevel: "high",
        changelog: "Add idempotency key enforcement on settlement endpoint",
      },
      MEMBER_ACTOR,
    );

    expect(created.status).toBe("pending");
    expect(created.requestedByEmail).toBe(DEMO_MEMBER_EMAIL);
    expect(created.reviewedByEmail).toBeNull();
    expect(created.reviewNote).toBeNull();
    expect(created.reviewedAt).toBeNull();
  });

  it("supports status and environment filtering with pagination metadata", async () => {
    const { service } = createServiceHarness();

    const first = await service.createRelease(
      {
        serviceName: "auth-service",
        version: "v1.0.1",
        environment: "staging",
        riskLevel: "low",
        changelog: "Rotate signing metadata headers",
      },
      MEMBER_ACTOR,
    );
    const second = await service.createRelease(
      {
        serviceName: "orders-api",
        version: "v1.4.0",
        environment: "production",
        riskLevel: "medium",
        changelog: "Optimize batch order query index",
      },
      MEMBER_ACTOR,
    );
    const third = await service.createRelease(
      {
        serviceName: "billing-worker",
        version: "v3.0.0",
        environment: "production",
        riskLevel: "high",
        changelog: "Enable multi-currency ledger settlement",
      },
      MEMBER_ACTOR,
    );

    await service.reviewRelease(
      second.id,
      { decision: "approved", reviewNote: "Canary metrics green" },
      ADMIN_ACTOR,
    );

    const prodPage1 = await service.listReleases({
      page: 1,
      pageSize: 1,
      environment: "production",
    });
    expect(prodPage1.ok).toBe(true);
    expect(prodPage1.meta).toEqual({
      page: 1,
      pageSize: 1,
      total: 2,
      totalPages: 2,
    });
    expect(prodPage1.data.map((r) => r.id)).toEqual([third.id]);

    const approvedOnly = await service.listReleases({
      page: 1,
      pageSize: 20,
      status: "approved",
    });
    expect(approvedOnly.meta.total).toBe(1);
    expect(approvedOnly.data.map((r) => r.id)).toEqual([second.id]);

    const stagingPending = await service.listReleases({
      page: 1,
      pageSize: 20,
      status: "pending",
      environment: "staging",
    });
    expect(stagingPending.meta.total).toBe(1);
    expect(stagingPending.data.map((r) => r.id)).toEqual([first.id]);
  });

  it("allows an admin to approve a pending release request", async () => {
    const { service } = createServiceHarness();
    const created = await service.createRelease(
      {
        serviceName: "search-indexer",
        version: "v1.2.3",
        environment: "staging",
        riskLevel: "low",
        changelog: "Refresh tokenizer synonyms dictionary",
      },
      MEMBER_ACTOR,
    );

    const approved = await service.reviewRelease(created.id, { decision: "approved" }, ADMIN_ACTOR);

    expect(approved.status).toBe("approved");
    expect(approved.reviewedByEmail).toBe(DEMO_ADMIN_EMAIL);
    expect(approved.reviewNote).toBeNull();
    expect(approved.reviewedAt).toBeTruthy();
  });

  it("allows an admin to reject a pending release request with a review note", async () => {
    const { service } = createServiceHarness();
    const created = await service.createRelease(
      {
        serviceName: "checkout-api",
        version: "v4.0.0",
        environment: "production",
        riskLevel: "high",
        changelog: "Drop legacy v1 webhook payload fields",
      },
      MEMBER_ACTOR,
    );

    const rejected = await service.reviewRelease(
      created.id,
      { decision: "rejected", reviewNote: "Missing rollback plan for v1 consumers" },
      ADMIN_ACTOR,
    );

    expect(rejected.status).toBe("rejected");
    expect(rejected.reviewedByEmail).toBe(DEMO_ADMIN_EMAIL);
    expect(rejected.reviewNote).toBe("Missing rollback plan for v1 consumers");
    expect(rejected.reviewedAt).toBeTruthy();
  });

  it("throws FORBIDDEN (403) when a member attempts to review a release", async () => {
    const { service } = createServiceHarness();
    const created = await service.createRelease(
      {
        serviceName: "notifications-svc",
        version: "v1.1.0",
        environment: "staging",
        riskLevel: "low",
        changelog: "Add Slack digest batching support",
      },
      MEMBER_ACTOR,
    );

    await expect(
      service.reviewRelease(created.id, { decision: "approved" }, MEMBER_ACTOR),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      statusCode: 403,
    } satisfies Partial<DomainException>);
  });

  it("throws RELEASE_NOT_FOUND (404) when reviewing a missing release ID", async () => {
    const { service } = createServiceHarness();

    await expect(
      service.reviewRelease("non-existent-release-id", { decision: "approved" }, ADMIN_ACTOR),
    ).rejects.toMatchObject({
      code: "RELEASE_NOT_FOUND",
      statusCode: 404,
    } satisfies Partial<DomainException>);
  });

  it("throws RELEASE_ALREADY_DECIDED (409) when reviewing an already decided release", async () => {
    const { service } = createServiceHarness();
    const created = await service.createRelease(
      {
        serviceName: "ledger-core",
        version: "v2.5.0",
        environment: "production",
        riskLevel: "high",
        changelog: "Add double-entry reconciliation check",
      },
      MEMBER_ACTOR,
    );

    await service.reviewRelease(
      created.id,
      { decision: "approved", reviewNote: "Verified in staging" },
      ADMIN_ACTOR,
    );

    await expect(
      service.reviewRelease(
        created.id,
        { decision: "rejected", reviewNote: "Trying to flip decision after approval" },
        ADMIN_ACTOR,
      ),
    ).rejects.toMatchObject({
      code: "RELEASE_ALREADY_DECIDED",
      statusCode: 409,
    } satisfies Partial<DomainException>);
  });

  it("seeds both demo admin and demo member users in InMemoryUsersRepository", async () => {
    const hasher = new PasswordHasher();
    const usersRepo = new InMemoryUsersRepository(hasher);
    await usersRepo.seedDemoAdmin();

    const member = await usersRepo.findByEmail(DEMO_MEMBER_EMAIL);
    expect(member).not.toBeNull();
    expect(member?.id).toBe("00000000-0000-4000-8000-000000000002");
    expect(member?.role).toBe("member");
    expect(member ? await hasher.verify(DEMO_MEMBER_PASSWORD, member.passwordHash) : false).toBe(
      true,
    );
  });
});
