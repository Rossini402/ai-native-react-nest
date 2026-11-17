#!/usr/bin/env sh
# Lifecycle PreToolUse hook for Antigravity (.agents/hooks.json).
# Blocks destructive Git/filesystem commands and --no-verify bypasses.
set -eu

PAYLOAD=$(cat)

if printf '%s' "$PAYLOAD" | grep -Eq '(--no-verify|git[[:space:]]+push[[:space:]]+(-f|--force)|git[[:space:]]+reset[[:space:]]+--hard|rm[[:space:]]+-rf[[:space:]]+/($|[[:space:]"]))'; then
  printf '%s\n' '{"decision":"deny","reason":"Blocked by .agents/scripts/safety-guard.sh: destructive command or --no-verify is prohibited."}'
  exit 0
fi

printf '%s\n' '{"decision":"ask","reason":"Passed workspace destructive-command check."}'
