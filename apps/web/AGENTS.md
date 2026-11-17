# `@repo/web` React 前端工程规范

本应用基于 **React 19 + Vite + TanStack Query/Router + Tailwind CSS v4 + Storybook 8** 构建，遵循 **Feature-Sliced** 与 **纯展示组件沙箱化** 原则。

## 1. 目录与职责边界

1. **`src/lib/`（网络与缓存底座）**：
   - `api-client.ts`：唯一后端网络出口，强制使用 `@repo/contracts` Zod Schema 解析响应。
   - `query-keys.ts`：集中维护所有 TanStack Query 缓存 Key，禁止在业务代码中散落手写字符串数组 Key。
2. **`src/components/ui/`（语义化基础原子组件）**：
   - 基于 Tailwind CSS v4 与 `src/styles/globals.css` 主题变量构建无业务耦合的原子原语（`Button`、`Input`、`Card`、`Badge` 等）。
3. **`src/features/<domain>/`（业务特性垂直切片）**：
   - **数据与状态层（`use-<domain>.ts` / `*-store.ts`）**：统一使用 `useQuery` / `useMutation` 管理服务端异步状态。
   - **纯展示组件层（`<component>.tsx`）**：仅通过显式 Props 接收数据与事件回调，不直接依赖路由或网络请求，确保可在 Storybook 与单测中零 Mock 独立渲染。
   - **组件沙箱与测试（`<component>.stories.tsx` & `<component>.test.tsx`）**：每个业务切片**必须**同时配备 CSF3 Story 与交互单元测试。
4. **`src/router.tsx`（强类型路由装配层）**：
   - 使用 `TanStack Router` 代码式路由树声明页面路径、Search 参数与 `beforeLoad` 登录守卫。

## 2. 架构红线（由 `check-governance.sh` 自动强制执行）

- **严禁裸网络与手写异步副作用**：`src/features/` 下**严禁**出现裸 `fetch(` 或手写 `useEffect(` 拉取数据（一律走 `TanStack Query`）。
- **严禁内联样式硬编码**：`src/` 下**严禁**使用 `style={{...}}`，一律使用 Tailwind 工具类与 `cn()` 组合。
- **Storybook 四态覆盖**：业务列表/表单组件的 `*.stories.tsx` 需覆盖 `Populated`（正常数据）、`Empty`（空状态）、`Loading`（加载态）与 `Error`（错误态）。
- **单文件上限**：单个 `.tsx` 组件不超过 `250` 行（全仓硬上限 `350` 行）。
