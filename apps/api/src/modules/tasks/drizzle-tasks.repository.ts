import type { CreateTaskInput, Task, TaskStatus } from "@repo/contracts";
import { desc, eq } from "drizzle-orm";
import type { DrizzleDatabase } from "../../infra/db/database.module.js";
import { tasksTable } from "../../infra/db/schema.js";
import type { TasksRepository } from "./tasks.repository.js";

function toTaskDto(row: typeof tasksTable.$inferSelect): Task {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    createdAt: row.createdAt.toISOString(),
  };
}

export class DrizzleTasksRepository implements TasksRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findAll(): Promise<Task[]> {
    const rows = await this.db.select().from(tasksTable).orderBy(desc(tasksTable.createdAt));
    return rows.map(toTaskDto);
  }

  async findById(id: string): Promise<Task | null> {
    const [row] = await this.db.select().from(tasksTable).where(eq(tasksTable.id, id)).limit(1);
    return row ? toTaskDto(row) : null;
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const [inserted] = await this.db
      .insert(tasksTable)
      .values({
        title: input.title,
        priority: input.priority,
        status: "todo",
      })
      .returning();
    if (!inserted) {
      throw new Error("Failed to insert task row");
    }
    return toTaskDto(inserted);
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const [updated] = await this.db
      .update(tasksTable)
      .set({ status })
      .where(eq(tasksTable.id, id))
      .returning();
    if (!updated) {
      throw new Error(`Task ${id} missing in PostgreSQL`);
    }
    return toTaskDto(updated);
  }
}
