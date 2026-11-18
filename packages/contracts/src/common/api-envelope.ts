import { z } from "zod";

export const REQUEST_ID_HEADER = "x-request-id";

export const ErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "INVALID_CREDENTIALS",
  "TASK_NOT_FOUND",
  "INVALID_STATUS_TRANSITION",
  "RELEASE_NOT_FOUND",
  "RELEASE_ALREADY_DECIDED",
  "INTERNAL_ERROR",
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ApiErrorEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    details: z.array(z.string()).optional(),
    requestId: z.string().optional(),
  }),
});

export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;

export function createSuccessEnvelopeSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    ok: z.literal(true),
    data: dataSchema,
  });
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export function ok<T>(data: T): ApiSuccess<T> {
  return { ok: true, data };
}
