# Spec 0003: web-core-infra

- **Status**: Implemented
- **Created**: 2026-11-18

## 1. 背景与业务目标 (Problem & Goals)

- **解决什么问题**：初始前端样板使用手写 `useEffect` 拉取数据、无类型安全路由与登录拦截、使用内联 `style={{}}` 且缺乏独立组件可视化沙箱，AI Agent 扩展复杂页面时极易产生竞态 Bug 与样式腐化。
- **核心目标**：
  1. 接入 **TanStack Query v5** 与集中式 `queryKeys` 工厂，彻底淘汰业务特性目录下的手写 `useEffect` 异步请求。
  2. 接入 **TanStack Router**（纯代码强类型路由树），落地 `/login` 登录页与 `/` 受保护工作台路由守卫，并移除后端 `TasksController` 的临时 `@Public()` 标记，打通全栈 JWT 鉴权闭环。
  3. 接入 **Tailwind CSS v4** 语义化设计变量与 `src/components/ui/` 基础原子组件（`Button`、`Input`、`Card`、`Badge`），门禁禁止内联 `style={{}}`。
  4. 接入 **Storybook 8 (`@storybook/react-vite`)**，要求所有基础原子组件与业务纯展示组件配套类型安全的 CSF3 `*.stories.tsx`（覆盖 Loading / Empty / Error / Populated 状态）。

## 2. 明确不做什么 (Non-Goals)

- 不引入重型运行时 CSS-in-JS 库或复杂动画引擎。
- 不将服务端接口数据混入全局客户端 Store（服务端状态归 TanStack Query，客户端仅持久化轻量认证会话）。

## 3. 共享契约设计 (`@repo/contracts`)

- 直接复用 Spec 0001（`TaskSchema` 等）与 Spec 0002（`LoginInputSchema`、`AuthSessionSchema`、`AuthUserSchema`），无需新增契约字段，验证契约层的前后端解耦复用能力。

## 4. 全栈分层实现方案

### 4.1 后端 (`@repo/api` - NestJS)
- 移除 `apps/api/src/modules/tasks/tasks.controller.ts` 上的临时 `@Public()` 装饰器，使 `/api/tasks` 全部端点受全局 `JwtAuthGuard` 保护。

### 4.2 前端 (`@repo/web` - React)
- **样式与原子组件（`src/styles/globals.css` & `src/components/ui/`）**：定义语义化色彩 Token；实现无副作用可组合组件 `Button`、`Input`、`Card`、`Badge` 及对应 Stories。
- **网络与缓存底座（`src/lib/`）**：`api-client.ts` 支持 Token 持久化与 `401` 自动回调清理；新增 `query-client.ts` 与 `query-keys.ts`。
- **认证切片（`src/features/auth/`）**：`auth-store.ts`（响应式会话状态）、纯展示组件 `login-form.tsx` + `login-form.stories.tsx` + `login-form.test.tsx`。
- **任务切片升级（`src/features/tasks/`）**：`use-tasks.ts` 重构为 `useQuery`/`useMutation`；`task-board.tsx` 迁移至 Tailwind + 原子组件，并新增 `task-board.stories.tsx` 覆盖四态。
- **强类型路由（`src/router.tsx`）**：基于 `createRootRouteWithContext` 构建 `/`（`beforeLoad` 鉴权拦截）与 `/login` 路由。
- **Storybook 沙箱（`.storybook/`）**：共享 Vite + Tailwind v4 管线，纳入 `tsconfig.json` 统一做编译期类型检查。

## 5. 边界条件与异常矩阵 (Edge Cases)

| 场景 | 预期行为 |
| :--- | :--- |
| 未登录直接访问 `/` | `TanStack Router` 的 `beforeLoad` 立即重定向至 `/login` |
| 本地缓存 Token 过期或后端返回 `401 UNAUTHORIZED` | `api-client` 自动清空失效会话并触发回跳 `/login` |
| Storybook 独立渲染业务组件 | 纯展示组件通过 Props 注入模拟状态，零后端与路由强耦合即可预览全部四态 |

## 6. 验收标准与验证计划 (Acceptance Criteria)

- [x] `TasksController` 移除 `@Public()`，默认强制校验 Bearer JWT
- [x] `apps/web/src/features/` 零裸 `fetch`、零裸 `useEffect`、全仓零内联 `style={{}}`（由 `check-governance.sh` 自动强制执行）
- [x] `Button`、`Badge`、`LoginForm`、`TaskBoard` 均具备完整 CSF3 `*.stories.tsx` 并纳入 `tsconfig` 类型检查范围
- [x] `login-form.test.tsx` 与 `task-board.test.tsx` 覆盖交互与状态渲染
- [x] `./scripts/verify.sh` 全绿通过
