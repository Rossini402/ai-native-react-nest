---
name: incident-rca
description: >-
  Guides fast root-cause analysis (RCA) using x-request-id correlation across
  @repo/web and @repo/api JSON logs, turning every bug into a permanent regression
  test. Activate this skill when debugging production/staging errors or failed requests.
---

# Incident Root-Cause Analysis & Flywheel Protocol

Never patch symptoms blindly. Trace, reproduce deterministically, fix, and lock in a regression test.

## Steps

1. **Locate Trace Context (`x-request-id`)**:
   - Extract `requestId` from the frontend `ApiClientError`, HTTP `x-request-id` header, or JSON error response (`error.requestId`).
   - Filter backend structured stdout logs by `"requestId":"<id>"` to inspect `method`, `path`, `statusCode`, `durationMs`, and `userId`.
2. **Write a Failing Reproduction Test First**:
   - Contract boundary bug -> add failing case in `packages/contracts/src/**/*.contract.test.ts`.
   - Domain/state bug -> add failing case in `apps/api/src/modules/**/*.service.test.ts`.
   - UI state/rendering bug -> add failing case in `apps/web/src/features/**/*.test.tsx` (and corresponding CSF3 Story state).
3. **Implement Minimal Root-Cause Fix**:
   - Fix the underlying invariant without introducing `any`, `@ts-ignore`, or layer shortcuts.
4. **Compound into Governance (If Systemic)**:
   - If the bug resulted from a repeatable architectural blind spot, add a deterministic rule to `scripts/check-governance.sh` or scoped `AGENTS.md` so no agent repeats it.
5. **Verify**: Run `./scripts/verify.sh` until green.
