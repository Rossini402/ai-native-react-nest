# AGENTS.md — 全局工程宪章（单一事实源）

本仓库为 **AI-Native 全栈确定性业务系统脚手架**（React + NestJS + 共享 Zod 契约 Monorepo）。
所有 AI 编码代理（Antigravity / Claude Code / Cursor / Codex）均以本文件与各子目录 `AGENTS.md` 为唯一准则。

## 1. 仓库拓扑与上下文分层

```text
.
├── specs/                 # [上游规格] 可执行 PRD+RFC 与验收标准（无 Spec 不写业务代码）
├── packages/contracts/    # [@repo/contracts] 前后端唯一共享 API 契约（Zod Schema + TS 类型）
├── apps/api/              # [@repo/api] NestJS 后端（薄 Controller + 显式 Service + 仓储接口）
├── apps/web/              # [@repo/web] React + Vite 前端（Feature-Sliced + 强类型客户端）
├── .agents/               # [Agent 资产] 按需加载的 Skills 工作流与安全 Hooks
└── scripts/               # [验证套具] 一键门禁 verify.sh 与架构边界守卫
```

进入子目录工作前，按需遵循局部规则：
- 契约变更必读：`packages/contracts/AGENTS.md`
- 后端开发必读：`apps/api/AGENTS.md`
- 前端开发必读：`apps/web/AGENTS.md`

## 2. 核心命令（Harness 闭环）

- **一键全量门禁（提交/收尾前必跑）**：`./scripts/verify.sh`（或 `pnpm verify` / `make verify`）
- **毫秒级治理与架构边界检查**：`./scripts/check-governance.sh`
- **新建特性规格书**：`pnpm spec:new <kebab-case-feature>`
- **代码格式与静态检查**：`pnpm lint`（自动修复：`pnpm lint:fix`）
- **全栈类型检查与单测**：`pnpm typecheck && pnpm test`

## 3. 研发流程铁律（Spec-Driven Development）

1. **非微调需求，Spec 先行**：跨模块特性、接口新增或状态流变更，先在 `specs/` 创建或更新规格书并确认边界，禁止直接盲写实现代码。
2. **契约先行锁定（Contract-First）**：前后端交互字段必须先在 `@repo/contracts` 定义 Zod Schema 并导出推导类型；完成契约锁定后，前后端方可并行实现。
3. **小步垂直切片**：单个变更保持高内聚（建议拆分为：`契约变更 -> 后端实现+测试 -> 前端实现+测试`），拒绝跨越全仓的黑盒巨型 Diff。
4. **自证可运行**：每次完成任务前必须运行 `./scripts/verify.sh` 直至全绿，并在交付摘要中附上实际验证结果。

## 4. 全局架构红线（由 `verify.sh` 自动强制执行）

- **严禁跨应用直接引用**：`apps/web` 严禁 import `apps/api` 任何源码；`packages/contracts` 严禁反向引用 `apps/*`。前后端仅允许通过 `@repo/contracts` 共享契约。
- **严禁逃逸静态类型**：源码中禁止使用裸 `any`、`@ts-ignore` 或未校验的 `as unknown as T` 强转。外部输入一律经 Zod 解析。
- **单文件复杂度上限**：业务源码单文件不得超过 `350` 行；超限时必须按职责拆分子模块，防止生成不可维护的“上帝文件”。
- **跨工具单一事实源**：`CLAUDE.md` 等桥接文件为指向 `AGENTS.md` 的软链接，修改规则时只改对应的 `AGENTS.md`，禁止破坏软链独立维护副本。
