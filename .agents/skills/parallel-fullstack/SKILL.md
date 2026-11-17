---
name: parallel-fullstack
description: >-
  Orchestrates conflict-free parallel backend (@repo/api) and frontend (@repo/web)
  development using subagents or isolated workspaces after freezing @repo/contracts.
  Activate this skill when implementing medium-to-large full-stack features in parallel.
---

# Contract-First Parallel Full-Stack Orchestration

Never run parallel frontend and backend agents before the shared contract is locked. Follow this 3-phase DAG:

## Phase 1: Sequential Anchor (Main Agent)

1. Finalize `specs/NNNN-<feature>.md`.
2. Implement and test all shared schemas, types, and error codes in `packages/contracts/`.
3. Commit or verify `packages/contracts` first so both downstream tracks share an immutable contract baseline.

## Phase 2: Parallel Execution (Isolated File Scopes)

Spawn two parallel tracks (subagents or separate Git worktrees) with **strictly disjoint write scopes**:

- **Track A — Backend Subagent (`apps/api/` ONLY)**:
  - Allowed write paths: `apps/api/src/modules/<domain>/**` and `apps/api/src/app.module.ts`.
  - Forbidden write paths: `packages/contracts/**`, `apps/web/**`.
  - Deliverable: NestJS module, `ZodValidationPipe` wiring, service unit tests passing.

- **Track B — Frontend Subagent (`apps/web/` ONLY)**:
  - Allowed write paths: `apps/web/src/features/<domain>/**`, `apps/web/src/lib/api-client.ts`, and `apps/web/src/App.tsx`.
  - Forbidden write paths: `packages/contracts/**`, `apps/api/**`.
  - Deliverable: Typed client methods, feature hook + pure UI components, UI tests passing.

## Phase 3: Integration & Adversarial Gate (Main Agent)

1. Reconcile any contract gap discovered by either subagent (if a contract change is needed, update `packages/contracts` centrally first).
2. Run `./scripts/verify.sh` end-to-end across all workspaces.
3. Run the `adversarial-review` skill checklist before presenting results to the user.
