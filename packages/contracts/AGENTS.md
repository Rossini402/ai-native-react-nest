# `@repo/contracts` 契约层工程规范

本包是前后端之间的**唯一契约事实源（Single Source of Truth）**，仅存放运行时无关的纯数据契约、枚举、错误码与 Zod 校验规则。

## 核心约束

1. **零业务运行时依赖**：仅依赖 `zod`。严禁引入 NestJS、React、Node `fs`/`http` 或数据库 ORM 包，确保前后端构建器均可零副作用打包。
2. **Schema 先行，类型自动推导**：
   - 使用 `z.object({...})` 定义结构，再通过 `export type Foo = z.infer<typeof FooSchema>` 导出类型。
   - 禁止手写与 Zod Schema 重复的 `interface`，防止运行时校验与编译期类型漂移。
3. **统一响应信封与错误码**：
   - 成功响应与分页响应统一复用 `src/common/api-envelope.ts` 中的构造函数。
   - 业务错误码在契约层显式枚举（如 `TASK_NOT_FOUND`），方便前端做确定性分支处理而非匹配自然语言文案。
4. **破坏性变更控制**：修改已有字段名、收窄入参类型或删除响应字段时，必须同步检索 `apps/api` 与 `apps/web` 的所有消费点并跑通全仓 `pnpm typecheck`。
5. **契约必带边界单测**：每个新增领域契约需配套 `*.contract.test.ts`，覆盖合法载荷与非法边界（空串、越界数值、缺失必填项）。
