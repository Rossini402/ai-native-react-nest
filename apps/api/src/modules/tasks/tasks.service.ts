import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import type { CreateTaskInput, Task, TaskStatus } from "@repo/contracts";
import { DomainException } from "../../common/filters/domain-exception.filter.js";
import { TASKS_REPOSITORY, type TasksRepository } from "./tasks.repository.js";

@Injectable()
export class TasksService {
  constructor(@Inject(TASKS_REPOSITORY) private readonly repo: TasksRepository) {}

  async listTasks(): Promise<Task[]> {
    return this.repo.findAll();
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    return this.repo.create(input);
  }

  async transitionStatus(id: string, nextStatus: TaskStatus): Promise<Task> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new DomainException(
        "TASK_NOT_FOUND",
        `Task '${id}' was not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (existing.status === "done" && nextStatus === "todo") {
      throw new DomainException(
        "INVALID_STATUS_TRANSITION",
        "Completed tasks cannot transition directly back to 'todo'",
        HttpStatus.CONFLICT,
      );
    }

    return this.repo.updateStatus(id, nextStatus);
  }
}
