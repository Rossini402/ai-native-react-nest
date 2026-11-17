---
name: db-schema-change
description: >-
  Guides safe Drizzle ORM + PostgreSQL schema changes and dual-mode repository
  updates in @repo/api. Activate this skill whenever adding tables, columns, enums,
  or indexes in apps/api/src/infra/db/schema.ts.
---

# Drizzle Database Schema Change Workflow

Keep both `Drizzle*Repository` (PostgreSQL) and `InMemory*Repository` (deterministic unit-test double) strictly aligned.

## Steps

1. **Confirm Spec First**: Ensure the schema change and migration impact are documented in `specs/NNNN-*.md`.
2. **Edit Pure TS Schema**: Update `apps/api/src/infra/db/schema.ts` (prefer additive, backward-compatible column changes; never drop production columns in the same release as code changes).
3. **Update Both Repository Adapters**:
   - Update the domain `Repository` interface (`apps/api/src/modules/<domain>/<domain>.repository.ts`).
   - Update `Drizzle<Domain>Repository` AND `InMemory<Domain>Repository` so unit tests stay 100% faithful without requiring Docker.
4. **Generate SQL Migration** (when dependencies are installed):
   ```sh
   pnpm --filter @repo/api db:generate
   ```
   Inspect the generated SQL file under `apps/api/drizzle/` to verify no unintended `DROP TABLE` / `DROP COLUMN` statements exist.
5. **Verify**: Run `./scripts/verify.sh` to confirm typecheck, governance, and unit tests pass.
