---
name: adversarial-review
description: >-
  Performs an independent, adversarial code review against the feature spec and
  repository architectural guardrails before merging or opening a PR. Activate this
  skill when the user asks to review changes, audit code quality, or prepare a PR.
---

# Adversarial Code Review Protocol (Writer != Reviewer)

Assume the code author (human or AI) rationalized shortcuts. Inspect `git diff` (or the target module) critically without modifying files unless asked.

## Review Checklist

1. **Spec Fidelity (`specs/`)**:
   - Does every acceptance criterion in the corresponding `specs/NNNN-*.md` have matching implementation AND automated test assertions?
   - Did the author introduce unrequested scope creep ("gold-plating")?
2. **Contract Integrity (`@repo/contracts`)**:
   - Are all request/response shapes validated via Zod in `@repo/contracts`?
   - Are there any duplicated DTO interfaces or raw `fetch` casts in `apps/web` or `apps/api`?
3. **NestJS Backend Hygiene (`@repo/api`)**:
   - Is any business logic leaking into `*.controller.ts`?
   - Are controller public methods missing explicit `@repo/contracts` return types (risking internal field leaks)?
   - Are domain errors using typed `DomainException` codes rather than generic `Error` strings?
4. **React Frontend Hygiene (`@repo/web`)**:
   - Are Loading, Empty, and recoverable Error states all handled explicitly?
   - Are components pure and under the line ceiling, without direct `fetch` calls inside JSX?
5. **Security & Edge Cases**:
   - Missing authorization/ownership checks, race conditions on double-submit, unbounded list queries, or unvalidated path/query parameters.
6. **Automated Harness Check**:
   - Execute `./scripts/verify.sh` and confirm zero warnings/failures.

## Output Format

Report findings grouped by severity:
- **P0 (Blocker)**: Spec violation, broken contract, security/auth hole, data corruption risk, or failing `./scripts/verify.sh`.
- **P1 (Should Fix)**: Layer violation, missing edge-case test, swallowed error state, or hidden coupling.
- **P2 (Nit)**: Naming clarity or minor simplification.

For every finding, cite the exact file path and line range, state why it fails under production conditions, and describe the minimal fix. If zero P0/P1 issues exist, explicitly state **Ready to Merge**.
