# `@repo/api` NestJS 后端工程规范

本应用基于 NestJS + Drizzle ORM 提供确定性业务 API，遵循**显式依赖、薄接入层、纯领域服务、默认安全**原则。

## 1. 分层职责（按 `src/modules/<domain>/` 组织）

1. **Controller（薄路由层）**：
   - 仅负责路由声明、HTTP 状态码、`ZodValidationPipe` 入参校验、组装统一 `ok(...)` 信封返回。
   - **禁止**在 Controller 内编写业务分支判断、数据拼装或直接 import `*.repository`。
   - 所有公开方法**必须显式声明返回类型**（绑定 `@repo/contracts` 导出的响应类型），防止意外泄漏内部持久化字段（如 `passwordHash`）。
2. **Service（显式业务层）**：
   - 承载核心业务规则、状态流转与不变量校验。
   - 业务异常统一抛出 `DomainException(errorCode, message, statusCode)`，禁止直接抛裸 `Error`。
3. **Repository（双模数据访问端口）**：
   - 定义纯领域仓储接口与 Symbol Token，同时提供 `InMemory*Repository`（供零容器毫秒级单测使用）与 `Drizzle*Repository`（PostgreSQL 生产持久化），在 Module 中按 `APP_ENV.STORAGE_MODE` 注入。

## 2. 基础设施与安全铁律

- **默认拒绝鉴权（Secure-by-Default）**：全局已挂载 `APP_GUARD -> JwtAuthGuard`。所有新增路由默认要求合法 `Bearer` Token；仅在 `specs/` 明确声明公开访问时才允许标记 `@Public()`。
- **当前用户获取**：统一通过 `@CurrentUser() user: AuthUser` 参数装饰器获取强类型身份，禁止直接读取裸 `req.user`。
- **环境变量强校验**：所有外部配置统一在 `src/infra/config/env.config.ts` 经 Zod 校验后通过 `APP_ENV` 注入，业务模块严禁直接散落读取 `process.env.*`。
- **表结构单一事实源**：PostgreSQL 表结构统一维护在 `src/infra/db/schema.ts`（Drizzle ORM），修改表结构遵循 `.agents/skills/db-schema-change/SKILL.md`。

## 3. 禁止事项

- 禁止使用 `class-validator` / `class-transformer` 装饰器重复定义已在 `@repo/contracts` 中声明的 DTO。
- 禁止模块间循环依赖（严禁使用 `forwardRef()`）。
- 新增或修改业务规则时，必须在同目录补充 `*.service.test.ts`（Vitest）。
