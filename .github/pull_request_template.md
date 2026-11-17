## 1. Upstream Spec Reference

- **Spec File**: `specs/NNNN-<feature>.md`
- **Slice Scope**: `[ ] Contract` · `[ ] Backend (@repo/api)` · `[ ] Frontend (@repo/web)` · `[ ] Infra/Governance`

## 2. Summary of Changes

- 

## 3. Deterministic Verification Evidence

Paste the terminal summary of `./scripts/verify.sh` (and `pnpm storybook:build` if UI changed):

```text
# Paste output here
```

## 4. Adversarial Review Checklist

- [ ] Zero contract drift — all DTOs & error codes live in `@repo/contracts`
- [ ] Backend routes protected by global `JwtAuthGuard` unless explicitly justified with `@Public()` in Spec
- [ ] Frontend feature slice includes CSF3 `*.stories.tsx` (4 states) + `*.test.tsx`, zero raw `fetch`/`useEffect`/`style={{}}`
- [ ] Independent `adversarial-review` check completed with zero open P0/P1 findings
