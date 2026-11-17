# Spec 0002: backend-core-infra

- **Status**: Implemented
- **Created**: 2026-11-18

## 1. 背景与业务目标 (Problem & Goals)

- **解决什么问题**：脚手架初始状态仅包含内存态演示模块，缺乏生产级确定性业务系统必需的环境变量启动校验、PostgreSQL 持久化底座与默认安全的全局认证护栏。
- **核心目标**：
  1. 引入 **Zod 启动期环境变量强校验**（配置缺失或非法时进程立即 Fail-fast 退出）。
  2. 引入 **Drizzle ORM + PostgreSQL 双模持久化底座**（通过 `STORAGE_MODE=memory|postgres` 切换：单测与无容器环境零依赖秒级运行，联调与生产走真实 PostgreSQL）。
  3. 引入 **默认拒绝（Secure-by-Default）的全局 JWT `AuthGuard`** + `@Public()` 显式放行装饰器 + `@CurrentUser()` 强类型用户注入，并提供标准登录与会话自检端点（`/api/auth/login`、`/api/auth/me`）及健康检查端点（`/api/health`）。

## 2. 明确不做什么 (Non-Goals)

- 不在本切片实现邮件找回密码、OAuth 第三方登录或复杂 RBAC 细粒度资源策略表。
- 前端登录页路由与全局登录态拦截留待第 2 步（前端工程基建 Spec）统一接入；`TasksController` 暂保留 `@Public()` 以兼容 Spec 0001 看板演示。

## 3. 共享契约设计 (`@repo/contracts`)

- **错误码扩展（`api-envelope.ts`）**：新增 `UNAUTHORIZED`、`FORBIDDEN`、`INVALID_CREDENTIALS`。
- **认证契约（`src/auth/auth.contract.ts`）**：
  - `UserRoleSchema`: `z.enum(["admin", "member"])`
  - `AuthUserSchema`: `{ id, email, role }`
  - `LoginInputSchema`: `{ email (trimmed, lowercased), password (8..128) }`
  - `AuthSessionSchema`: `{ accessToken, expiresInSeconds, user: AuthUser }`
- **系统健康契约（`src/system/health.contract.ts`）**：
  - `HealthStatusSchema`: `{ status: "ok", storageMode: "memory" | "postgres", timestamp }`

## 4. 全栈分层实现方案

### 4.1 后端 (`@repo/api` - NestJS)
- **配置层（`src/infra/config/`）**：`parseAppEnv()` 基于 Zod 校验；当 `STORAGE_MODE=postgres` 时强制要求合法 `DATABASE_URL`；`NODE_ENV=production` 时强制要求高强度显式 `JWT_SECRET`。
- **数据库层（`src/infra/db/`）**：
  - `schema.ts`：纯 TypeScript 定义 `users` 与 `tasks` PostgreSQL 表结构（零代码生成等待）。
  - `database.module.ts`：按 `STORAGE_MODE` 按需初始化 `postgres` 连接池与 Drizzle 实例，并在模块销毁时优雅关闭连接。
  - `drizzle-tasks.repository.ts`：实现 `TasksRepository` 端口，与 `InMemoryTasksRepository` 通过工厂注入无缝切换。
- **认证与全局护栏（`src/common/auth/` & `src/modules/auth/`）**：
  - 基于 Node 原生 `node:crypto` 实现无原生编译依赖的 `PasswordHasher`（`scrypt` + `timingSafeEqual`）与 `JwtTokenService`（HS256 签名与过期校验）。
  - 全局注册 `APP_GUARD -> JwtAuthGuard`：未标记 `@Public()` 的路由一律强制校验 `Authorization: Bearer <token>`。

### 4.2 前端 (`@repo/web` - React)
- 在 `src/lib/api-client.ts` 中预置可选 Bearer Token 注入能力与 `authApi` 客户端方法，为下一步前端基建无缝衔接做好准备。

## 5. 边界条件与异常矩阵 (Edge Cases)

| 场景 | 预期行为 / HTTP 状态码 | 错误码 (`ErrorCode`) |
| :--- | :--- | :--- |
| `STORAGE_MODE=postgres` 但未配置 `DATABASE_URL` | 进程启动阶段直接抛错退出 | N/A (Startup Fail-Fast) |
| 访问未标记 `@Public()` 的接口且缺失/篡改/过期 Token | `401 Unauthorized` | `UNAUTHORIZED` |
| 登录邮箱不存在或密码不匹配（统一模糊提示防枚举） | `401 Unauthorized` | `INVALID_CREDENTIALS` |

## 6. 验收标准与验证计划 (Acceptance Criteria)

- [x] `@repo/contracts` 新增 `auth.contract.test.ts` 覆盖邮箱归一化与密码长度边界
- [x] `@repo/api` 新增 `env.config.test.ts` 验证生产环境密钥与 `DATABASE_URL` 强约束
- [x] `@repo/api` 新增 `auth.service.test.ts` 与 `jwt-auth.guard.test.ts` 验证登录、篡改/过期 Token 拦截及 `@Public()` 放行
- [x] 提供根目录 `docker-compose.yml`、`.env.example` 与 `drizzle.config.ts`
- [x] `./scripts/verify.sh` 全绿通过
