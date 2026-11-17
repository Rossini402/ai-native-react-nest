#!/usr/bin/env sh
set -eu

if [ "$#" -lt 1 ] || [ -z "$1" ]; then
  echo "Usage: $0 <kebab-case-feature-name>" >&2
  exit 1
fi

RAW_NAME="$1"
SLUG=$(printf '%s' "$RAW_NAME" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')

REPO_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../../../.." && pwd)
SPECS_DIR="$REPO_ROOT/specs"
TEMPLATE="$SPECS_DIR/TEMPLATE.md"

LAST_NUM=$(find "$SPECS_DIR" -maxdepth 1 -name '[0-9][0-9][0-9][0-9]-*.md' \
  | sed -E 's#.*/([0-9]{4})-.*#\1#' \
  | sort -n \
  | tail -n 1)

if [ -z "$LAST_NUM" ]; then
  NEXT_NUM="0001"
else
  NEXT_NUM=$(printf "%04d" $((10#$LAST_NUM + 1)))
fi

TARGET="$SPECS_DIR/${NEXT_NUM}-${SLUG}.md"
TODAY=$(date +%Y-%m-%d)

sed \
  -e "s/{{SPEC_ID}}/${NEXT_NUM}/g" \
  -e "s/{{FEATURE_NAME}}/${SLUG}/g" \
  -e "s/{{DATE}}/${TODAY}/g" \
  "$TEMPLATE" > "$TARGET"

echo "Created spec: $TARGET"
