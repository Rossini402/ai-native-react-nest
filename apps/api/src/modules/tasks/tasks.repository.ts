import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import type { CreateTaskInput, Task, TaskStatus } from "@repo/contracts";

export const TASKS_REPOSITORY = Symbol("TASKS_REPOSITORY");

export interface TasksRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(input: CreateTaskInput): Promise<Task>;
  updateStatus(id: string, status: TaskStatus): Promise<Task>;
}

@Injectable()
export class InMemoryTasksRepository implements TasksRepository {
  private readonly items = new Map<string, Task>();

  async findAll(): Promise<Task[]> {
    return Array.from(this.items.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }

  async findById(id: string): Promise<Task | null> {
    return this.items.get(id) ?? null;
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      priority: input.priority,
      status: "todo",
      createdAt: new Date().toISOString(),
    };
    this.items.set(task.id, task);
    return task;
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const existing = this.items.get(id);
    if (!existing) {
      throw new Error(`Task ${id} missing in repository`);
    }
    const updated: Task = { ...existing, status };
    this.items.set(id, updated);
    return updated;
  }
}
