import { z } from "zod";
import { createSuccessEnvelopeSchema } from "../common/api-envelope.js";

export const StorageModeSchema = z.enum(["memory", "postgres"]);
export type StorageMode = z.infer<typeof StorageModeSchema>;

export const HealthStatusSchema = z.object({
  status: z.literal("ok"),
  storageMode: StorageModeSchema,
  timestamp: z.string().datetime(),
});
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const HealthResponseSchema = createSuccessEnvelopeSchema(HealthStatusSchema);
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
