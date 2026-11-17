#!/usr/bin/env sh
# Deterministic AI-Native Repository Governance & Architecture Guard.
# Zero external dependencies — runs in < 100ms in any POSIX environment or CI.
set -eu

REPO_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$REPO_ROOT"

FAILURES=0

pass() {
  printf "  [PASS] %s\n" "$1"
}

fail() {
  printf "  [FAIL] %s\n" "$1" >&2
  FAILURES=$((FAILURES + 1))
}

echo "==> [1/5] Checking Cross-Tool Single-Source-of-Truth Bridges..."
for link_pair in \
  "CLAUDE.md:AGENTS.md" \
  "packages/contracts/CLAUDE.md:AGENTS.md" \
  "apps/api/CLAUDE.md:AGENTS.md" \
  "apps/web/CLAUDE.md:AGENTS.md" \
  ".claude/skills:../.agents/skills"
do
  link_path="${link_pair%%:*}"
  expected_target="${link_pair#*:}"
  if [ ! -L "$link_path" ]; then
    fail "$link_path must be a symlink to $expected_target (do not maintain duplicate copies)"
  else
    actual_target=$(readlink "$link_path")
    if [ "$actual_target" != "$expected_target" ]; then
      fail "$link_path points to '$actual_target' instead of '$expected_target'"
    fi
  fi
done
[ "$FAILURES" -eq 0 ] && pass "All CLAUDE.md and .claude/skills bridges point to canonical AGENTS.md / .agents"

echo "==> [2/5] Checking Context Window Budget (AGENTS.md compactness)..."
ROOT_LINES=$(wc -l < AGENTS.md | tr -d ' ')
if [ "$ROOT_LINES" -gt 120 ]; then
  fail "Root AGENTS.md has $ROOT_LINES lines (max 120). Move detailed workflows into .agents/skills/."
else
  pass "Root AGENTS.md is compact ($ROOT_LINES/120 lines)"
fi

echo "==> [3/5] Checking Monorepo Architectural Boundaries..."
# Rule A: apps/web must never import apps/api or @repo/api
if [ -d "apps/web/src" ] && grep -RInE 'from[[:space:]]+["'\''](@repo/api|.*apps/api)' apps/web/src >/dev/null 2>&1; then
  grep -RInE 'from[[:space:]]+["'\''](@repo/api|.*apps/api)' apps/web/src >&2
  fail "apps/web/src illegally imports from @repo/api. Share types via @repo/contracts only."
else
  pass "apps/web -> @repo/api isolation intact"
fi

# Rule B: packages/contracts must remain pure (no apps/* or framework imports)
if [ -d "packages/contracts/src" ] && grep -RInE 'from[[:space:]]+["'\''](@repo/api|@repo/web|@nestjs/|react)' packages/contracts/src >/dev/null 2>&1; then
  grep -RInE 'from[[:space:]]+["'\''](@repo/api|@repo/web|@nestjs/|react)' packages/contracts/src >&2
  fail "packages/contracts/src must stay runtime-agnostic (zod only)."
else
  pass "packages/contracts purity intact"
fi

# Rule C: apps/web UI components (.tsx) must not call raw fetch() or ad-hoc useEffect() or inline style={{
if [ -d "apps/web/src/features" ] && grep -RInE '\bfetch[[:space:]]*\(' apps/web/src/features >/dev/null 2>&1; then
  grep -RInE '\bfetch[[:space:]]*\(' apps/web/src/features >&2
  fail "Raw fetch() found in apps/web/src/features. Route all HTTP calls through src/lib/api-client.ts."
else
  pass "apps/web feature components free of raw fetch()"
fi

if [ -d "apps/web/src/features" ] && grep -RInE '\buseEffect[[:space:]]*\(' apps/web/src/features >/dev/null 2>&1; then
  grep -RInE '\buseEffect[[:space:]]*\(' apps/web/src/features >&2
  fail "Raw useEffect() found in apps/web/src/features. Use TanStack Query or external store subscriptions."
else
  pass "apps/web feature slices free of raw useEffect()"
fi

if [ -d "apps/web/src" ] && grep -RInF 'style={{' apps/web/src >/dev/null 2>&1; then
  grep -RInF 'style={{' apps/web/src >&2
  fail "Inline style={{...}} found in apps/web/src. Use Tailwind CSS v4 classes and semantic tokens."
else
  pass "apps/web free of inline style={{}} hardcoding"
fi

# Rule C2: Every feature slice in apps/web/src/features/<domain> must include Storybook (*.stories.tsx) & Tests (*.test.tsx)
STORY_MISSING=0
if [ -d "apps/web/src/features" ]; then
  for feature_dir in apps/web/src/features/*; do
    [ -d "$feature_dir" ] || continue
    if ! find "$feature_dir" -maxdepth 1 -name '*.stories.tsx' | grep -q .; then
      printf "    %s is missing a CSF3 Storybook file (*.stories.tsx)\n" "$feature_dir" >&2
      STORY_MISSING=1
    fi
    if ! find "$feature_dir" -maxdepth 1 -name '*.test.tsx' | grep -q .; then
      printf "    %s is missing a component test file (*.test.tsx)\n" "$feature_dir" >&2
      STORY_MISSING=1
    fi
  done
fi
if [ "$STORY_MISSING" -ne 0 ]; then
  fail "Every frontend feature slice must include both *.stories.tsx and *.test.tsx."
else
  pass "All apps/web feature slices include CSF3 Storybook stories & tests"
fi

# Rule D: apps/api NestJS controllers must delegate to Services, never Repositories directly
if [ -d "apps/api/src" ] && find apps/api/src -name '*.controller.ts' -exec grep -HnE '\.repository(\.js)?["'\'']' {} + | grep -q .; then
  find apps/api/src -name '*.controller.ts' -exec grep -HnE '\.repository(\.js)?["'\'']' {} + >&2
  fail "NestJS Controller imports Repository directly. Delegate through Service."
else
  pass "apps/api Controller -> Service -> Repository layering intact"
fi

echo "==> [4/5] Checking Type Discipline & File Size Ceiling (<= 350 lines)..."
TYPE_VIOLATIONS=0
for dir in packages/contracts/src apps/api/src apps/web/src; do
  [ -d "$dir" ] || continue
  if grep -RInE '(:[[:space:]]*any\b|<any>|as[[:space:]]+any\b|as[[:space:]]+unknown[[:space:]]+as\b|@ts-ignore)' "$dir" >/dev/null 2>&1; then
    grep -RInE '(:[[:space:]]*any\b|<any>|as[[:space:]]+any\b|as[[:space:]]+unknown[[:space:]]+as\b|@ts-ignore)' "$dir" >&2
    TYPE_VIOLATIONS=1
  fi
done

# Rule E: Business modules in apps/api/src/modules must read APP_ENV instead of raw process.env
if [ -d "apps/api/src/modules" ] && grep -RInE '\bprocess\.env\b' apps/api/src/modules >/dev/null 2>&1; then
  grep -RInE '\bprocess\.env\b' apps/api/src/modules >&2
  TYPE_VIOLATIONS=1
fi
if [ "$TYPE_VIOLATIONS" -ne 0 ]; then
  fail "Explicit 'any' or '@ts-ignore' detected in source files."
else
  pass "Zero raw 'any' or '@ts-ignore' escapes"
fi

OVERSIZED=0
for src_file in $(find packages apps -path '*/node_modules/*' -prune -o \( -name '*.ts' -o -name '*.tsx' \) -print 2>/dev/null); do
  lines=$(wc -l < "$src_file" | tr -d ' ')
  if [ "$lines" -gt 350 ]; then
    printf "    %s (%s lines > 350 ceiling)\n" "$src_file" "$lines" >&2
    OVERSIZED=1
  fi
done
if [ "$OVERSIZED" -ne 0 ]; then
  fail "One or more source files exceed the 350-line modularity ceiling."
else
  pass "All TypeScript source files within 350-line ceiling"
fi

echo "==> [5/5] Checking Spec-Driven Development Artifacts..."
SPEC_ERRORS=0
for spec_file in specs/[0-9][0-9][0-9][0-9]-*.md; do
  [ -e "$spec_file" ] || continue
  for required_heading in "## 1." "## 2." "## 3." "## 6."; do
    if ! grep -Fq "$required_heading" "$spec_file"; then
      printf "    %s missing required section '%s'\n" "$spec_file" "$required_heading" >&2
      SPEC_ERRORS=1
    fi
  done
done
if [ "$SPEC_ERRORS" -ne 0 ]; then
  fail "Malformed feature spec(s) in specs/."
else
  pass "All specs/NNNN-*.md files conform to required SDD sections"
fi

if [ "$FAILURES" -gt 0 ]; then
  printf "\nGovernance check failed with %s violation(s).\n" "$FAILURES" >&2
  exit 1
fi

printf "\nAll AI-Native governance & architectural checks passed.\n"
