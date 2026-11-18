# `@repo/web` 前端与全局设计系统规范

本应用基于 **React 19 + Vite + TanStack Query/Router + Tailwind CSS v4 + Storybook 8** 构建，通过 **单一事实源设计令牌（`src/design-system/tokens.ts`）** 实现字体、品牌色与圆角风格的 100% 全局统一。

## 1. 双轨组件库选型标准（单项目锁定单轨，严禁混搭）

新项目初始化时遵循 `.agents/skills/ui-architecture-selector/SKILL.md`，按目标人群执行 `pnpm ui:use <shadcn|antd> --preset=<id>`：
- **轨道 A：`shadcn`（默认内置：`Radix UI` + `CVA` + `Lucide`）**：面向 AI 产品、现代 SaaS、开发者工具与 C 端体验（推荐预设：`obsidian` / `electric-blue` / `emerald-forest`）。
- **轨道 B：`antd`（按需一键切换：`Ant Design v5 ConfigProvider`）**：面向 ERP、财务内控、重度复杂表单与大表格后台（推荐预设：`enterprise-navy`，自动通过 `toAntdThemeConfig()` 同步同一套品牌色与字体令牌）。

## 2. 全局视觉统一铁律（由 `check-governance.sh` 强制执行）

1. **禁止硬编码品牌色号**：`src/components/` 与 `src/features/` 下**严禁**出现 `indigo-*`、`blue-*`、`violet-*`、`purple-*`、`sky-*`、`cyan-*` 等散落色板类名。主色、高亮背景、边框与圆角一律消费 `src/styles/globals.css` 中的语义变量（`var(--color-primary)`、`var(--color-accent-subtle)`、`var(--radius-control)`、`var(--radius-card)`）。
2. **双字体规范**：全局已本地打包引入 `@fontsource-variable/inter` 与 `@fontsource-variable/jetbrains-mono`；所有统计指标、版本号、ID 必须使用 `font-mono` / `tabular-nums`。
3. **空间层次与非理想态**：工作台顶部标配 `MetricCard` 概览条；空状态统一复用 `EmptyState`，加载态提供 `animate-pulse` 骨架屏；淘汰浏览器原生裸 `<select>`（使用 Radix `Select` 或 `Tabs`）。
4. **纯展示沙箱与行数上限**：`src/features/` 严禁裸 `fetch(`、手写 `useEffect(` 或内联 `style={{}}`；每个业务切片必配 `*.stories.tsx` 与 `*.test.tsx`；单个 `.tsx` 文件严格 `<= 250` 行。
