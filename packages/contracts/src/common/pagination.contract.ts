import { z } from "zod";

export const MAX_PAGE_SIZE = 100;

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export function createPaginatedEnvelopeSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    ok: z.literal(true),
    data: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });
}

export interface PaginatedSuccess<T> {
  ok: true;
  data: T[];
  meta: PaginationMeta;
}

export function paginatedOk<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number,
): PaginatedSuccess<T> {
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  return {
    ok: true,
    data: items,
    meta: { page, pageSize, total, totalPages },
  };
}
