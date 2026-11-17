# Spec 0004: production-observability-and-dx

- **Status**: Implemented
- **Created**: 2026-11-18

## 1. 背景与业务目标 (Problem & Goals)

- **解决什么问题**：作为团队通用全栈母版，在前后端业务功能之外，还需补齐生产排障可观测性（请求链路追踪）、防全表扫描的统一分页契约、以及强制绑定 SDD 规范的 PR 交付模板。
- **核心目标**：
  1. **全链路 `x-request-id` 追踪与结构化日志**：前端每次请求自动生成并透传 `x-request-id`；后端校验/透传该 ID，写入单行 JSON 结构化访问日志，并在所有异常响应信封中附带 `requestId`，实现秒级根因定位（RCA）。
  2. **共享安全分页契约（`@repo/contracts`）**：内置带硬上限（`pageSize <= 100`）的 `PaginationQuerySchema` 与 `createPaginatedEnvelopeSchema`，从源头杜绝无界列表查询。
  3. **研发协作与母版封版基建**：提供强制关联 `specs/NNNN` 与 `verify.sh` 证据的 `.github/pull_request_template.md`、`.nvmrc`、`.editorconfig` 及排障技能 `incident-rca`。

## 2. 明确不做什么 (Non-Goals)

- 不引入重量级外部 APM Agent SDK（保持标准 JSON stdout + HTTP Header，天然兼容云原生日志采集与后续 OpenTelemetry 接入）。

## 3. 共享契约设计 (`@repo/contracts`)

- **常量与错误信封扩展（`api-envelope.ts`）**：
  - 导出 `REQUEST_ID_HEADER = "x-request-id"`。
  - `ApiErrorEnvelopeSchema.shape.error` 新增可选 `requestId: z.string().optional()`。
- **通用分页契约（`pagination.contract.ts`）**：
  - `PaginationQuerySchema`: `{ page: int >= 1 (default 1), pageSize: int 1..100 (default 20) }`
  - `PaginationMetaSchema`: `{ page, pageSize, total, totalPages }`
  - `createPaginatedEnvelopeSchema(itemSchema)` 与 `paginatedOk(items, page, pageSize, total)` 构造辅助函数。

## 4. 全栈分层实现方案

### 4.1 后端 (`@repo/api` - NestJS)
- **`src/common/observability/request-id.ts`**：提取并清洗客户端传入的 `x-request-id`（限制为 `[A-Za-z0-9._-]{1,64}` 防止日志注入；非法或缺失时生成 `randomUUID()`）。
- **`src/common/observability/structured-logger.interceptor.ts`**：记录 `{ timestamp, level, requestId, method, path, statusCode, durationMs, userId }` 至标准输出流（测试环境默认静默，支持注入自定义 sink 单测）。
- **`DomainExceptionFilter` 增强**：异常捕获时确保响应头写回 `x-request-id`，并将 `requestId` 填入错误信封返回前端。

### 4.2 前端 (`@repo/web` - React)
- **`src/lib/api-client.ts`**：自动生成 `x-request-id` 请求头，`ApiClientError` 保留服务端返回的 `requestId` 以便 UI 或错误上报精确关联。

## 5. 边界条件与异常矩阵 (Edge Cases)

| 场景 | 预期行为 |
| :--- | :--- |
| 客户端伪造包含换行符或超长字符串的 `x-request-id` | 服务端拒绝采用脏值，自动重新生成安全的 UUID，防止日志伪造注入 |
| 客户端请求 `pageSize=99999` | `PaginationQuerySchema` 在契约边界直接返回 `400 VALIDATION_ERROR` |
| Guard 或 Pipe 在进入 Interceptor 前提前抛错 | `DomainExceptionFilter` 兜底生成/读取 `requestId` 并写入响应头与 JSON 错误体 |

## 6. 验收标准与验证计划 (Acceptance Criteria)

- [x] `pagination.contract.test.ts` 验证默认分页参数、`pageSize > 100` 拦截及 `totalPages` 计算
- [x] `structured-logger.interceptor.test.ts` 验证 `x-request-id` 清洗防注入与结构化日志字段完整性
- [x] 提供 `.github/pull_request_template.md`、`.nvmrc`、`.editorconfig` 与 `.agents/skills/incident-rca/SKILL.md`
- [x] `./scripts/verify.sh` 全绿通过并完成母版初始 Git Commit
