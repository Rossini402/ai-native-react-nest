import { describe, expect, it } from "vitest";
import { CreateTaskInputSchema, UpdateTaskStatusInputSchema } from "./task.contract.js";

describe("Task Contract Schemas", () => {
  it("trims whitespace and applies default priority on CreateTaskInput", () => {
    const parsed = CreateTaskInputSchema.parse({ title: "  Freeze API contract  " });
    expect(parsed).toEqual({
      title: "Freeze API contract",
      priority: "medium",
    });
  });

  it("rejects whitespace-only or overly long task titles", () => {
    expect(CreateTaskInputSchema.safeParse({ title: "   " }).success).toBe(false);
    expect(CreateTaskInputSchema.safeParse({ title: "x".repeat(121) }).success).toBe(false);
  });

  it("rejects unknown task status transitions at schema boundary", () => {
    expect(UpdateTaskStatusInputSchema.safeParse({ status: "archived" }).success).toBe(false);
    expect(UpdateTaskStatusInputSchema.safeParse({ status: "in_progress" }).success).toBe(true);
  });
});
