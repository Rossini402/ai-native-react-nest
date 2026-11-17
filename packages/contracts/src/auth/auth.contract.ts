import { z } from "zod";
import { createSuccessEnvelopeSchema } from "../common/api-envelope.js";

export const UserRoleSchema = z.enum(["admin", "member"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const AuthUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  role: UserRoleSchema,
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const LoginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or fewer"),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const AuthSessionSchema = z.object({
  accessToken: z.string().min(1),
  expiresInSeconds: z.number().int().positive(),
  user: AuthUserSchema,
});
export type AuthSession = z.infer<typeof AuthSessionSchema>;

export const AuthSessionResponseSchema = createSuccessEnvelopeSchema(AuthSessionSchema);
export type AuthSessionResponse = z.infer<typeof AuthSessionResponseSchema>;

export const MeResponseSchema = createSuccessEnvelopeSchema(AuthUserSchema);
export type MeResponse = z.infer<typeof MeResponseSchema>;
