import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublicRoute";

/**
 * Marks a Controller or Route handler as publicly accessible without a Bearer JWT.
 * All routes without @Public() are protected by the global JwtAuthGuard by default.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
