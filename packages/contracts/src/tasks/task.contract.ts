import { z } from "zod";
import { createSuccessEnvelopeSchema } from "../common/api-envelope.js";

export const TaskStatusSchema = z.enum(["todo", "in_progress", "done"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  createdAt: z.string().datetime(),
});
export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title cannot be empty")
    .max(120, "Task title must be 120 characters or fewer"),
  priority: TaskPrioritySchema.default("medium"),
});
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

export const UpdateTaskStatusInputSchema = z.object({
  status: TaskStatusSchema,
});
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusInputSchema>;

export const TaskResponseSchema = createSuccessEnvelopeSchema(TaskSchema);
export type TaskResponse = z.infer<typeof TaskResponseSchema>;

export const TaskListResponseSchema = createSuccessEnvelopeSchema(z.array(TaskSchema));
export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;
