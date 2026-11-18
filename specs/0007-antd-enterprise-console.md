# Spec 0007: antd-enterprise-console

- **Status**: Implemented
- **Created**: 2026-11-18

## 1. 背景与业务目标 (Problem & Goals)

- **解决什么问题**：作为与 `demo/release-approval`（`shadcn/ui` 现代 SaaS 轨道）配对的企业级对照分支，实战验证同一套 `@repo/contracts`、`@repo/api` 与同一份全局品牌/字体令牌 `tokens.ts` 在切换至 **`Ant Design v5` 轨道（`pnpm ui:use antd --preset=enterprise-navy`）** 后的高密度中后台表现力。
- **核心目标**：
  1. 锁定 `ACTIVE_UI_KIT = "antd"` 与默认预设 `enterprise-navy`（`6px` 紧凑圆角 + `#165dff` 政务深海蓝 + 本地 `Inter` & `JetBrains Mono` 字体），顶层挂载 `<AntdDesignSystemProvider>`。
  2. 将工作台壳层、登录页、任务台与发布审批台全面重构为 **纯正 `Ant Design v5` 企业中后台范式**（`Layout.Sider` + `Menu`、`Statistic` 统计卡片、服务端分页 `Table<ReleaseRequest>`、`Drawer` 审计详情抽屉、`Descriptions` 描述列表、`Modal` 提单弹窗）。
  3. 验证在 AntD 模式下点击切换 4 套行业预设色板，全站 AntD 组件（主按钮、菜单选中态、表格分页器、标签与输入框焦点色）同样 100% 实时联动。

## 2. 明确不做什么 (Non-Goals)

- 严禁混用 `@radix-ui/*` 原语（由 `check-governance.sh` 单轨纯净度门禁自动强制保障）。
- 后端与契约层保持与 `demo/release-approval` 100% 一致（零后端代码改动即可切换整套前端交互体系）。

## 3. 共享契约设计 (`@repo/contracts`)

- 100% 复用 Spec 0006 已冻结的 `ReleaseRequestSchema`、`CreateReleaseInputSchema`、`ReviewReleaseInputSchema` 与 `PaginatedReleasesResponseSchema`。

## 4. 全栈分层实现方案

### 4.1 后端 (`@repo/api` - NestJS)
- 零修改直接复用双模持久化与 RBAC 状态机服务。

### 4.2 前端 (`@repo/web` - React · `Ant Design v5` 轨道)
- **主题桥接（`src/design-system/antd-provider.tsx`）**：由 `pnpm ui:use antd` 生成，实时读取 `useBrandPreset()` 并经 `toAntdThemeConfig()` 注入 `<ConfigProvider>`（同时接入 `App.tsx` 与 `.storybook/preview.tsx`）。
- **企业中后台壳层（`src/components/layout/app-shell.tsx`）**：基于 AntD `Layout` + `Menu` 构建紧凑侧边导航台。
- **高密度审批大表与详情抽屉（`src/features/releases/`）**：
  - `release-create-modal.tsx`：基于 AntD `Modal`（及内嵌快捷提单面板）承接 SemVer 提单。
  - `release-detail-drawer.tsx`：基于 AntD `Drawer` + `Descriptions` 展示完整审计元数据与变更详情。
  - `release-board.tsx`：基于 AntD `Table<ReleaseRequest>`（服务端受控分页、`Segmented` 状态筛选、`Select` 环境过滤、行内 Admin 审批操作列）构建高信息密度审批大表。

## 5. 边界条件与异常矩阵 (Edge Cases)

| 场景 | 预期行为 |
| :--- | :--- |
| Vitest JSDOM 环境渲染 AntD 响应式 `Table` / `Row` | `src/test-setup.ts` 提供标准 `matchMedia` 与 `ResizeObserver` 桩，确保毫秒级零报错单测 |
| 普通 `member` 账号查看审批大表 | 操作列仅展示 `Pending Admin Approval` 标签与 `Details` 抽屉查看按钮，隐藏 `Approve` / `Reject` |

## 6. 验收标准与验证计划 (Acceptance Criteria)

- [x] `ACTIVE_UI_KIT = "antd"` 单轨门禁通过（零 `@radix-ui/*` 残留依赖）
- [x] `release-board.stories.tsx` 与 `design-system.stories.tsx` 在 Storybook 中完整受控于 `<AntdDesignSystemProvider>`
- [x] 全仓 14 个测试文件（含 AntD `Table` 渲染与 RBAC 交互断言）通过 `pnpm verify`
