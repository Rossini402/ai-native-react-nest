---
name: spec-driven-feature
description: >-
  Guides end-to-end full-stack feature delivery using Spec-Driven Development (SDD)
  across @repo/contracts, @repo/api (NestJS), and @repo/web (React). Activate this
  skill whenever the user asks to design, plan, or implement a new feature, endpoint,
  or cross-module change.
---

# Spec-Driven Full-Stack Feature Workflow

Follow this exact 5-step closed loop to prevent contract drift and rework.

## Step 1: Align Intent & Create the Spec

1. Clarify ambiguous business rules, permissions, and edge cases with the user before writing code.
2. Scaffold a numbered spec file using [new-spec.sh](./scripts/new-spec.sh):
   ```sh
   ./.agents/skills/spec-driven-feature/scripts/new-spec.sh <kebab-case-feature-name>
   ```
3. Fill out every section of `specs/NNNN-<feature>.md` (Goals, Non-Goals, Contract Schema, API Layer, Web Layer, Error Matrix, Acceptance Criteria).
4. **Pause for Human Gate** if the feature introduces breaking contract changes, new external dependencies, or non-obvious product trade-offs.

## Step 2: Freeze Shared Contract (`@repo/contracts`)

1. Read `packages/contracts/AGENTS.md`.
2. Define Zod schemas, error codes, and inferred types in `packages/contracts/src/<domain>/` and re-export from `packages/contracts/src/index.ts`.
3. Add boundary unit tests (`*.contract.test.ts`) covering valid inputs and invalid edge cases.

## Step 3: Implement NestJS Domain Module (`@repo/api`)

1. Read `apps/api/AGENTS.md`.
2. Implement `Repository -> Service -> Controller` under `apps/api/src/modules/<domain>/`.
3. Validate incoming payloads with `ZodValidationPipe` and explicitly type controller return values using `@repo/contracts` types.
4. Write fast unit/service tests (`*.service.test.ts`) verifying both happy paths and domain `errorCode`s.

## Step 4: Implement React Feature Slice (`@repo/web`)

1. Read `apps/web/AGENTS.md`.
2. Add typed client methods in `apps/web/src/lib/api-client.ts` bound to `@repo/contracts`.
3. Build state hook (`use-<domain>.ts`) and pure UI component(s) (`<component>.tsx`) under `apps/web/src/features/<domain>/`, covering Loading, Empty, and Error states.
4. Add component/hook tests (`*.test.tsx`).

## Step 5: Deterministic Self-Verification

1. Run the repository master gate:
   ```sh
   ./scripts/verify.sh
   ```
2. Update the spec status in `specs/NNNN-<feature>.md` from `Draft` to `Implemented` only after `./scripts/verify.sh` exits `0`.
