import { Body, Controller, Get, Inject, Param, Patch, Post } from "@nestjs/common";
import {
  type CreateTaskInput,
  CreateTaskInputSchema,
  type TaskListResponse,
  type TaskResponse,
  type UpdateTaskStatusInput,
  UpdateTaskStatusInputSchema,
  ok,
} from "@repo/contracts";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { TasksService } from "./tasks.service.js";

@Controller("api/tasks")
export class TasksController {
  constructor(@Inject(TasksService) private readonly tasksService: TasksService) {}

  @Get()
  async list(): Promise<TaskListResponse> {
    const items = await this.tasksService.listTasks();
    return ok(items);
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateTaskInputSchema)) input: CreateTaskInput,
  ): Promise<TaskResponse> {
    const created = await this.tasksService.createTask(input);
    return ok(created);
  }

  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateTaskStatusInputSchema)) body: UpdateTaskStatusInput,
  ): Promise<TaskResponse> {
    const updated = await this.tasksService.transitionStatus(id, body.status);
    return ok(updated);
  }
}
