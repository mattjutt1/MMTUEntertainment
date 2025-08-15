#!/bin/bash
# Bash command allowlist security hook

COMMAND="$1"
ALLOWED_PATTERNS="^(pnpm|npx|git|node|wrangler|echo|mkdir|touch|chmod|find|rm)"

if [[ $COMMAND =~ $ALLOWED_PATTERNS ]]; then
  exit 0
else
  echo "⚠️  Command not in allowlist: $COMMAND" >&2
  echo "ℹ️  Allowed: pnpm, npx, git, node, wrangler, echo, mkdir, touch, chmod, find, rm" >&2
  exit 1
fi