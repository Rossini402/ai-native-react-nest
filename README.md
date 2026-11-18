# ai-native-react-nest

AI-Native Full-Stack Monorepo Template（React 19 + NestJS 11 + Zod Contracts + Drizzle + Storybook 8）—— 面向 **Spec-Driven Development (SDD) + 分层上下文工程 + 确定性验证套具 (Harness)** 设计。

## 架构概览

| 层级 | 路径 | 职责与核心约束 |
| :--- | :--- | :--- |
| **L0/L1 上下文宪章** | `AGENTS.md`（及子目录 `AGENTS.md`） | 跨工具唯一事实源；`CLAUDE.md` 与 `.cursor/rules/` 均桥接至此 |
| **上游规格层** | `specs/` | 可执行特性规格书（`TEMPLATE.md` + `0001` 黄金样板） |
| **Agent 工作流与护栏** | `.agents/skills/` & `.agents/hooks.json` | 按需加载 SDD、对抗审查、前后端并行编排技能；可选高危命令拦截 Hook |
| **共享契约层** | `packages/contracts` (`@repo/contracts`) | Zod Schema + 自动推导 TS 类型 + 统一响应/错误码信封 |
| **后端应用** | `apps/api` (`@repo/api`) | NestJS 11 + Drizzle ORM 双模持久化 + 全局默认拒绝 `JwtAuthGuard` |
| **前端与设计系统** | `apps/web` (`@repo/web`) | React 19 + TanStack Query/Router + 单一事实源 Token + `shadcn/ui` / `Ant Design v5` 双轨单选底座 + Storybook 8 |
| **确定性验证门禁** | `scripts/verify.sh` | 一键串起治理检查、品牌色防泄漏、跨层引用守卫、Biome、全栈 Typecheck 与 Vitest |

## 全局设计系统与双轨组件库选型

新项目启动时，Agent 会通过 `.agents/skills/ui-architecture-selector/SKILL.md` 按目标人群与业务复杂度推荐并锁定单一 UI 轨道（共享同一份本地 `Inter` + `JetBrains Mono` 字体栈与 4 套行业色板预设）：

```sh
# 轨道 A（默认轻量内置）：现代 SaaS / AI 产品 / C 端体验 -> shadcn/ui (Radix + CVA + Lucide)
pnpm ui:use shadcn --preset=obsidian          # 曜石极简 | electric-blue | emerald-forest

# 轨道 B（按需一键切换）：ERP / 财务风控 / 重表格中后台 -> Ant Design v5 ConfigProvider
pnpm ui:use antd --preset=enterprise-navy
```

## 快速开始

```sh
# 1. 安装依赖（需 Node >= 22, pnpm >= 10）
pnpm install

# 2. 运行一键全量门禁（治理 + 架构守卫 + Lint + 类型 + 单测）
pnpm verify

# 3. 启动本地全栈联调（默认内存态零容器启动；API: :3001, Web: :5173）
#    默认开发账号: admin@example.com / AdminPassword123!
pnpm dev

# 4. 启动 Storybook 组件独立沙箱 (:6006)
pnpm storybook

# 5. （可选）切换真实 PostgreSQL 模式
docker compose up -d
cp .env.example .env   # 将 STORAGE_MODE 改为 postgres
pnpm --filter @repo/api db:push
```

## 标准 AI-Native 开发工作流

1. **新建规格书（Stage 01 — Spec）**
   ```sh
   pnpm spec:new order-checkout
   ```
   与 Agent 对齐目标、非目标、错误码矩阵与验收标准（将自动触发 `.agents/skills/spec-driven-feature` 技能）。

2. **契约先行锁定（Stage 02 — Contract Freeze）**
   先在 `packages/contracts/src/` 定义 Zod Schema 与边界单测。

3. **自治实现 / 并行编排（Stage 03 — Implementation）**
   - 单线程推进：按 `spec-driven-feature` 顺序完成 `@repo/api` 与 `@repo/web`。
   - 多 Agent 并行：激活 `parallel-fullstack` 技能，基于冻结契约让后端与前端子 Agent 在隔离作用域内零冲突并行编码。

4. **确定性自验与对抗审查（Stage 04 — Verify & Review）**
   - 执行 `./scripts/verify.sh` 确保全绿。
   - 让独立上下文 Agent 执行 `adversarial-review` 技能挑刺后，人工审查核心架构与业务取舍并合并。

## 可选：启用 Agent 命令安全拦截 Hook

在 `.agents/hooks.json` 中将 `"enabled": false` 改为 `true`，即可在 Antigravity 执行终端命令前自动拦截 `--no-verify`、`git push --force`、`git reset --hard` 等破坏性指令。
