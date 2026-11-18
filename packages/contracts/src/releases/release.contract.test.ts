import { describe, expect, it } from "vitest";
import {
  CreateReleaseInputSchema,
  ListReleasesQuerySchema,
  ReviewReleaseInputSchema,
} from "./release.contract.js";

describe("Release Approval Contract Schemas", () => {
  it("validates SemVer versions and trims CreateReleaseInput fields", () => {
    const valid = CreateReleaseInputSchema.parse({
      serviceName: "  payment-gateway  ",
      version: "v2.4.0-rc.1",
      environment: "production",
      changelog: "  Add idempotent webhook retry handler  ",
    });
    expect(valid.serviceName).toBe("payment-gateway");
    expect(valid.riskLevel).toBe("medium");

    expect(
      CreateReleaseInputSchema.safeParse({
        serviceName: "payment-gateway",
        version: "latest",
        environment: "production",
        changelog: "Invalid version tag",
      }).success,
    ).toBe(false);
  });

  it("requires non-empty reviewNote when decision is rejected, but optional on approved", () => {
    expect(ReviewReleaseInputSchema.safeParse({ decision: "approved" }).success).toBe(true);
    expect(ReviewReleaseInputSchema.safeParse({ decision: "rejected" }).success).toBe(false);
    expect(
      ReviewReleaseInputSchema.safeParse({
        decision: "rejected",
        reviewNote: "Rollback plan missing for DB migration",
      }).success,
    ).toBe(true);
  });

  it("coerces pagination and optional filter params on ListReleasesQuerySchema", () => {
    const query = ListReleasesQuerySchema.parse({
      page: "2",
      pageSize: "10",
      status: "pending",
      environment: "production",
    });
    expect(query).toEqual({
      page: 2,
      pageSize: 10,
      status: "pending",
      environment: "production",
    });
  });
});
