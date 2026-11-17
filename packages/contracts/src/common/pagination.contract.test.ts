import { describe, expect, it } from "vitest";
import { PaginationQuerySchema, paginatedOk } from "./pagination.contract.js";

describe("Pagination Contract", () => {
  it("coerces string query parameters and applies safe defaults", () => {
    expect(PaginationQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 });
    expect(PaginationQuerySchema.parse({ page: "2", pageSize: "50" })).toEqual({
      page: 2,
      pageSize: 50,
    });
  });

  it("blocks unbounded pageSize (> 100) or non-positive page numbers", () => {
    expect(PaginationQuerySchema.safeParse({ page: 0 }).success).toBe(false);
    expect(PaginationQuerySchema.safeParse({ pageSize: 101 }).success).toBe(false);
  });

  it("computes totalPages deterministically in paginatedOk()", () => {
    const empty = paginatedOk([], 1, 20, 0);
    expect(empty.meta.totalPages).toBe(0);

    const nonEmpty = paginatedOk(["a", "b"], 1, 20, 41);
    expect(nonEmpty.meta.totalPages).toBe(3);
  });
});
