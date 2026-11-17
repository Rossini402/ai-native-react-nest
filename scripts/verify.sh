#!/usr/bin/env sh
# Unified Verification Harness — Single entry point for AI Agents & CI.
set -eu

REPO_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$REPO_ROOT"

echo "=========================================================="
echo "  AI-Native Verification Harness (SDD + Arch + Lint + Test)"
echo "=========================================================="

# Step 1: Zero-dependency governance & boundary checks (always runs)
./scripts/check-governance.sh

# Step 2: Toolchain checks (requires Node + installed workspace dependencies)
if ! command -v pnpm >/dev/null 2>&1; then
  echo ""
  echo "[WARN] 'pnpm' not found in current PATH. Governance checks passed;"
  echo "       run 'pnpm install && pnpm verify' in a Node >= 22 environment for full compile & test gates."
  exit 0
fi

if [ ! -d "node_modules" ]; then
  echo ""
  echo "[WARN] Dependencies not installed yet (node_modules missing)."
  echo "       Run 'pnpm install' once, then re-run './scripts/verify.sh' to execute Biome, TypeScript, and Vitest."
  exit 0
fi

echo ""
echo "==> [6/8] Running Node Layer Architecture Checks..."
node ./scripts/check-architecture.mjs

echo ""
echo "==> [7/8] Running Biome Format & Lint + Full-Stack Typecheck..."
pnpm lint
pnpm typecheck

echo ""
echo "==> [8/8] Running Deterministic Unit & Contract Tests (Vitest)..."
pnpm test

echo ""
echo "✅ ALL GATES GREEN — Ready for Adversarial Review / PR."
