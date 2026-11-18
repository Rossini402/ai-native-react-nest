import { describe, expect, it } from "vitest";
import type { DomainException } from "../../common/filters/domain-exception.filter.js";
import { InMemoryTasksRepository } from "./tasks.repository.js";
import { TasksService } from "./tasks.service.js";

describe("TasksService", () => {
  it("creates a task in 'todo' status and transitions to 'done'", async () => {
    const service = new TasksService(new InMemoryTasksRepository());
    const created = await service.createTask({
      title: "Lock shared Zod contract",
      priority: "high",
    });

    expect(created.status).toBe("todo");
    const completed = await service.transitionStatus(created.id, "done");
    expect(completed.status).toBe("done");
  });

  it("blocks invalid transition from 'done' directly back to 'todo'", async () => {
    const service = new TasksService(new InMemoryTasksRepository());
    const created = await service.createTask({
      title: "Verify API guardrails",
      priority: "medium",
    });
    await service.transitionStatus(created.id, "done");

    await expect(service.transitionStatus(created.id, "todo")).rejects.toMatchObject({
      code: "INVALID_STATUS_TRANSITION",
      statusCode: 409,
    } satisfies Partial<DomainException>);
  });

  it("throws TASK_NOT_FOUND when updating a missing task id", async () => {
    const service = new TasksService(new InMemoryTasksRepository());

    await expect(service.transitionStatus("non-existent-id", "in_progress")).rejects.toMatchObject({
      code: "TASK_NOT_FOUND",
      statusCode: 404,
    } satisfies Partial<DomainException>);
  });
});
