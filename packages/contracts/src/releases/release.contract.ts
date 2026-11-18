import { z } from "zod";
import { createSuccessEnvelopeSchema } from "../common/api-envelope.js";
import {
  PaginationQuerySchema,
  createPaginatedEnvelopeSchema,
} from "../common/pagination.contract.js";

export const ReleaseEnvironmentSchema = z.enum(["staging", "production"]);
export type ReleaseEnvironment = z.infer<typeof ReleaseEnvironmentSchema>;

export const ReleaseRiskLevelSchema = z.enum(["low", "medium", "high"]);
export type ReleaseRiskLevel = z.infer<typeof ReleaseRiskLevelSchema>;

export const ReleaseStatusSchema = z.enum(["pending", "approved", "rejected"]);
export type ReleaseStatus = z.infer<typeof ReleaseStatusSchema>;

export const ReleaseDecisionSchema = z.enum(["approved", "rejected"]);
export type ReleaseDecision = z.infer<typeof ReleaseDecisionSchema>;

export const SemverVersionSchema = z
  .string()
  .trim()
  .regex(/^v?\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/, "Version must follow SemVer (e.g. v1.4.2)");

export const CreateReleaseInputSchema = z.object({
  serviceName: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(60, "Service name must be 60 characters or fewer"),
  version: SemverVersionSchema,
  environment: ReleaseEnvironmentSchema,
  riskLevel: ReleaseRiskLevelSchema.default("medium"),
  changelog: z
    .string()
    .trim()
    .min(5, "Changelog must be at least 5 characters")
    .max(500, "Changelog must be 500 characters or fewer"),
});
export type CreateReleaseInput = z.infer<typeof CreateReleaseInputSchema>;

export const ReviewReleaseInputSchema = z
  .object({
    decision: ReleaseDecisionSchema,
    reviewNote: z.string().trim().max(300).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.decision === "rejected" && (!val.reviewNote || val.reviewNote.length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reviewNote"],
        message: "Rejecting a release requires a review note of at least 3 characters",
      });
    }
  });
export type ReviewReleaseInput = z.infer<typeof ReviewReleaseInputSchema>;

export const ListReleasesQuerySchema = PaginationQuerySchema.extend({
  status: ReleaseStatusSchema.optional(),
  environment: ReleaseEnvironmentSchema.optional(),
});
export type ListReleasesQuery = z.infer<typeof ListReleasesQuerySchema>;

export const ReleaseRequestSchema = z.object({
  id: z.string().min(1),
  serviceName: z.string().min(2).max(60),
  version: z.string().min(1),
  environment: ReleaseEnvironmentSchema,
  riskLevel: ReleaseRiskLevelSchema,
  changelog: z.string().min(5).max(500),
  status: ReleaseStatusSchema,
  requestedByEmail: z.string().email(),
  reviewedByEmail: z.string().email().nullable(),
  reviewNote: z.string().nullable(),
  createdAt: z.string().datetime(),
  reviewedAt: z.string().datetime().nullable(),
});
export type ReleaseRequest = z.infer<typeof ReleaseRequestSchema>;

export const ReleaseResponseSchema = createSuccessEnvelopeSchema(ReleaseRequestSchema);
export type ReleaseResponse = z.infer<typeof ReleaseResponseSchema>;

export const PaginatedReleasesResponseSchema = createPaginatedEnvelopeSchema(ReleaseRequestSchema);
export type PaginatedReleasesResponse = z.infer<typeof PaginatedReleasesResponseSchema>;
