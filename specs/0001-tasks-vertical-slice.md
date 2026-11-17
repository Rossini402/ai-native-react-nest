# Spec 0001: tasks-vertical-slice

- **Status**: Implemented
- **Created**: 2026-11-18

## 1. 背景与业务目标 (Problem & Goals)

- **解决什么问题**：为仓库提供一套端到端可参考的“黄金样板切片（Golden Vertical Slice）”，让人类开发者与 AI Agent 在后续开发新业务模块时具备明确的契约定义、分层解耦与测试范式参照。
- **核心目标**：实现轻量研发任务看板（查询任务列表、创建任务、流转任务状态 `todo -> in_progress -> done`）。

## 2. 明确不做什么 (Non-Goals)

- 不在本样板中绑定具体重型数据库驱动（通过 `TasksRepository` 抽象端口隔离，默认内置确定性内存仓储以便零外部依赖运行单测）。
- 不包含多租户鉴权与复杂富文本评论。

## 3. 共享契约设计 (`@repo/contracts`)

- **模块路径**：`packages/contracts/src/tasks/task.contract.ts`
- **核心 Schema**：
  - `TaskStatusSchema`: `z.enum(["todo", "in_progress", "done"])`
  - `TaskPrioritySchema`: `z.enum(["low", "medium", "high"])`
  - `CreateTaskInputSchema`: `{ title: string (1..120, trimmed), priority: TaskPriority }`
  - `UpdateTaskStatusInputSchema`: `{ status: TaskStatus }`
  - `TaskSchema`: `{ id, title, status, priority, createdAt }`
- **业务错误码**：`VALIDATION_ERROR` | `TASK_NOT_FOUND` | `INVALID_STATUS_TRANSITION`

## 4. 全栈分层实现方案

### 4.1 后端 (`@repo/api` - NestJS)
- **路由**：
  - `GET /api/tasks` -> 返回按创建时间倒序的任务列表信封 `ApiSuccess<Task[]>`
  - `POST /api/tasks` -> 经 `ZodValidationPipe(CreateTaskInputSchema)` 校验后创建任务
  - `PATCH /api/tasks/:id/status` -> 校验状态流转（禁止已完成 `done` 的任务直接退回 `todo`）
- **核心不变量**：状态机规则内聚于 `TasksService`，`TasksController` 保持零业务逻辑。

### 4.2 前端 (`@repo/web` - React)
- **网络层**：`src/lib/api-client.ts` 使用 `TaskSchema` 校验并解析后端响应。
- **特性切片**：
  - `src/features/tasks/use-tasks.ts`：管理加载、创建、状态变更及错误提示。
  - `src/features/tasks/task-board.tsx`：纯展示型任务列表与创建表单，完整支持 Loading / Empty / Error 三态。

## 5. 边界条件与异常矩阵 (Edge Cases)

| 场景 | 预期行为 / HTTP 状态码 | 错误码 (`ErrorCode`) |
| :--- | :--- | :--- |
| 标题为空白字符或超过 120 字符 | `400 Bad Request` | `VALIDATION_ERROR` |
| 更新不存在的任务 ID | `404 Not Found` | `TASK_NOT_FOUND` |
| 将已 `done` 的任务直接回退为 `todo` | `409 Conflict` | `INVALID_STATUS_TRANSITION` |

## 6. 验收标准与验证计划 (Acceptance Criteria)

- [x] `@repo/contracts` 包含 `task.contract.test.ts` 验证裁剪空白与越界拦截
- [x] `@repo/api` 包含 `tasks.service.test.ts` 验证创建、正常流转及 `INVALID_STATUS_TRANSITION` 拦截
- [x] `@repo/web` 包含 `task-board.test.tsx` 验证空状态、列表渲染与交互回调
- [x] `./scripts/verify.sh` 治理与架构守卫全绿通过
