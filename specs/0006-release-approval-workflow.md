# Spec 0006: release-approval-workflow

- **Status**: Implemented
- **Created**: 2026-11-18

## 1. 背景与业务目标 (Problem & Goals)

- **解决什么问题**：通过一套完整的生产级“研发发布审批流（Release Approval Workflow）”业务切片（`shadcn/ui` 现代 SaaS 轨道），端到端示范本模板在真实业务需求下的 **SDD 规格先行 -> 契约冻结 -> 多 Agent 前后端并行编码 -> 独立对抗审查 -> 全局品牌色令牌联动** 完整闭环。
- **核心目标**：
  1. 任意登录成员（`member` / `admin`）均可提交发布申请单（服务名、SemVer 版本号、目标环境 `staging|production`、风险等级、变更说明）。
  2. 支持按审批状态（`pending|approved|rejected`）与目标环境分页查询发布申请单（复用 `PaginationQuerySchema`）。
  3. **严格 RBAC 与状态机控制**：仅 `admin` 角色允许执行审批通过（`approved`）或驳回（`rejected`，驳回必填原因）；已决定的发布单不可重复审批或篡改状态。

## 2. 明确不做什么 (Non-Goals)

- 不对接真实 Kubernetes / CI Webhook 部署触发器（审批状态落库即为本切片边界）。
- 不做多级会签串联审批（单层 Admin 终审模型）。

## 3. 共享契约设计 (`@repo/contracts`)

- **错误码新增（`api-envelope.ts`）**：`RELEASE_NOT_FOUND`、`RELEASE_ALREADY_DECIDED`。
- **契约文件（`packages/contracts/src/releases/release.contract.ts`）**：
  - `ReleaseEnvironmentSchema`: `"staging" | "production"`
  - `ReleaseRiskLevelSchema`: `"low" | "medium" | "high"`
  - `ReleaseStatusSchema`: `"pending" | "approved" | "rejected"`
  - `CreateReleaseInputSchema`: `{ serviceName (2..60), version (SemVer regex), environment, riskLevel, changelog (5..500) }`
  - `ReviewReleaseInputSchema`: `{ decision: "approved" | "rejected", reviewNote?: string }`（当 `decision === "rejected"` 时，契约层 `.superRefine` 强制要求至少 3 个字符的 `reviewNote`）
  - `ListReleasesQuerySchema`: 继承 `PaginationQuerySchema` 并扩展可选 `status`、`environment`
  - `ReleaseRequestSchema`: `{ id, serviceName, version, environment, riskLevel, changelog, status, requestedByEmail, reviewedByEmail, reviewNote, createdAt, reviewedAt }`
  - `PaginatedReleasesResponseSchema`: `createPaginatedEnvelopeSchema(ReleaseRequestSchema)`

## 4. 全栈分层实现方案

### 4.1 后端 (`@repo/api` - NestJS)
- **测试账号扩展（`users.repository.ts`）**：除默认 `admin@example.com` 外，预置普通成员账号 `member@example.com`（密码 `MemberPassword123!`，角色 `member`）。
- **持久化层（`schema.ts` + `releases.repository.ts` + `drizzle-releases.repository.ts`）**：新增 `release_requests` 表及双模仓储实现。
- **领域服务与路由（`releases.service.ts` + `releases.controller.ts`）**：完整实现提单、分页筛选及 Admin 专属审批状态机。

### 4.2 前端 (`@repo/web` - React · `shadcn/ui` 轨道)
- **统一设计系统消费**：100% 绑定 `src/design-system/tokens.ts` 语义变量（零硬编码品牌色号），支持 4 套行业主题预设一键切换。
- **特性切片（`src/features/releases/`）**：`use-releases.ts`、`release-create-form.tsx`、`release-list-item.tsx`、`release-board.tsx`（含 Radix `Select` 环境筛选与分段状态胶囊）、`release-board.stories.tsx` 与 `release-board.test.tsx`。

## 5. 边界条件与异常矩阵 (Edge Cases)

| 场景 | 预期行为 / HTTP 状态码 | 错误码 (`ErrorCode`) |
| :--- | :--- | :--- |
| 版本号不符合 SemVer 或驳回未填原因 | `400 Bad Request` | `VALIDATION_ERROR` |
| `member` 角色调用 `/api/releases/:id/review` | `403 Forbidden` | `FORBIDDEN` |
| 审批不存在或非法格式的发布单 ID | `404 Not Found` | `RELEASE_NOT_FOUND` |
| 对已 `approved` 或已 `rejected` 的发布单再次审批 | `409 Conflict` | `RELEASE_ALREADY_DECIDED` |

## 6. 验收标准与验证计划 (Acceptance Criteria)

- [x] `@repo/contracts` `release.contract.test.ts` 覆盖 SemVer 正则、驳回必填原因与分页参数校验
- [x] `@repo/api` `releases.service.test.ts` 覆盖提单、分页过滤、非 Admin `FORBIDDEN`、重复审批 `RELEASE_ALREADY_DECIDED`
- [x] `@repo/web` `release-board.stories.tsx` 与 `release-board.test.tsx` 覆盖角色按钮显隐、驳回原因交互与四态渲染
- [x] `pnpm verify`（含零硬编码品牌色与单轨组件库门禁）全绿通过
