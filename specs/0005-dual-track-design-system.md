# Spec 0005: dual-track-design-system

- **Status**: Implemented
- **Created**: 2026-11-18

## 1. 背景与业务目标 (Problem & Goals)

- **解决什么问题**：母版初始阶段仅提供手写基础组件，缺少统一字体打包、全局单点品牌色 Token 收口以及针对不同产品形态的组件库选型标准，导致 AI Agent 生成新页面时容易出现“色号硬编码散落、字体回退系统默认、现代 SaaS 与重企业后台设计语言错位”。
- **核心目标**：
  1. **单一事实源设计令牌（Single-Source Design Tokens）**：集中管理全局品牌主色、表面灰阶、圆角曲率与本地打包双字体（`Inter` 正文字体 + `JetBrains Mono` 等宽数字/代码字体 + 中文字体回退栈），内置 **4 套行业预设主题**（`obsidian` 曜石极简、`electric-blue` 科技电光蓝、`enterprise-navy` 企业政务蓝、`emerald-forest` 现代森系绿）。
  2. **双轨组件库选型与一键切换（`shadcn/ui` vs `Ant Design v5`）**：
     - 默认轻量内置标准 **`shadcn/ui` 底座**（`Radix UI` 无头无障碍原语 + `CVA` 变体管理 + `Lucide Icons` + 官方 `components.json`），零冗余体积服务现代 SaaS / C 端 / AI 创新产品；
     - 内置 **`Ant Design v5` 令牌映射器（`toAntdThemeConfig`）与一键切换脚本（`pnpm ui:use antd`）**，面向重表单、重数据大表的企业级内管后台一键切换并锁定单轨规范。
  3. **机械化视觉防漂移门禁**：在 `check-governance.sh` 中强制禁止业务切片硬编码品牌色号（如 `bg-indigo-600`、`text-blue-500`）且禁止同一项目混用 `shadcn` 与 `antd` 双套组件库。

## 2. 明确不做什么 (Non-Goals)

- 不在默认 `main` 分支强行预装完整的 `antd` 运行时包（保持默认包体积轻盈，仅在执行 `pnpm ui:use antd` 时按需装包并激活 `AntdThemeProvider`）。
- 不允许在同一业务项目中混搭使用两套组件库（选定单轨后全局锁定）。

## 3. 共享契约设计 (`@repo/contracts`)

- 本特性属于 `@repo/web` 设计系统与工程治理基建，不涉及前后端 HTTP 契约变更。

## 4. 全栈分层实现方案

### 4.1 设计令牌与双轨桥接层（`apps/web/src/design-system/`）
- **`tokens.ts`**：定义 `UIKitTrack`（`"shadcn" | "antd"`）、`BrandPresetId`（4 套预设）及每套预设的语义色阶、圆角与字体栈；导出 `applyBrandPreset()`（注入 `data-brand-preset`）与 `toAntdThemeConfig()`（零偏差映射至 Ant Design v5 `ConfigProvider` SeedToken）。
- **`theme-provider.tsx`**：React 顶层 `DesignSystemProvider`，支持全局挂载预设主题与实时切换预览。
- **`design-system.stories.tsx`**：Storybook 全景令牌画板，同屏验证 4 套行业色板、双字体混排与全套原语组件联动效果。

### 4.2 标准 `shadcn/ui` 原语升级（`apps/web/src/components/ui/`）
- 引入 `@fontsource-variable/inter`、`@fontsource-variable/jetbrains-mono`、`class-variance-authority`、`@radix-ui/react-slot`、`@radix-ui/react-select`、`@radix-ui/react-tabs`、`lucide-react`，并提供标准 `components.json`。
- 全套组件（`Button`、`Input`、`Select`、`Tabs`、`Badge`、`Card`、`MetricCard`、`EmptyState`、`AppShell`）100% 绑定 CSS 语义令牌（`var(--color-brand)`、`var(--radius-control)`、`var(--font-sans)`、`var(--font-mono)`），消除所有散落色值。

### 4.3 选型顾问 Skill 与一键切换器
- **`.agents/skills/ui-architecture-selector/SKILL.md`**：指导 Agent 在新项目启动阶段根据目标用户画像、数据密度与品牌定制诉求推荐 `shadcn/ui` 或 `Ant Design v5` 及对应色板预设。
- **`scripts/switch-ui-kit.mjs`（`pnpm ui:use <shadcn|antd> [--preset=<id>]`）**：一键修改全局默认主题预设，并在切换 `antd` 轨道时自动生成 `antd-provider.tsx` 桥接文件及依赖安装指引。

## 5. 边界条件与异常矩阵 (Edge Cases)

| 场景 | 预期行为 |
| :--- | :--- |
| 开发者或 Agent 在 `src/features/` 硬编码 `bg-blue-600` 等色板类名 | `check-governance.sh` 立即拦截报错，提示改用语义化品牌变量或组件 `variant` |
| 在 `ACTIVE_UI_KIT = "shadcn"` 模式下误 import `antd` | `check-governance.sh` 单轨守卫立即阻断，防止产生拼凑感“缝合怪 UI” |
| 切换任意一套 `BrandPreset` | 登录页、侧边导航高亮、主按钮、焦点光环、圆角曲率与徽章色调 100% 同步联动 |

## 6. 验收标准与验证计划 (Acceptance Criteria)

- [x] `tokens.test.ts` 验证 4 套行业预设完整性及 `toAntdThemeConfig` 令牌映射一致性
- [x] 本地打包加载 `Inter` 与 `JetBrains Mono` 字体，无任何外部字体 CDN 阻塞
- [x] `Button`、`Select`、`Tabs`、`Badge` 等组件全面采用 `shadcn/ui` (`Radix + CVA`) 标准实现且在 Storybook 可预览 4 套预设切换
- [x] `pnpm ui:use` 脚本与 `ui-architecture-selector` 技能就绪
- [x] `pnpm verify` 全量门禁与单测 100% 通过并推送更新至 `main`
