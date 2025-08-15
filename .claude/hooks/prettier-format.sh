#!/bin/bash
# Auto-format TypeScript/JavaScript files after edits

FILE_PATH="$1"

if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  if command -v npx >/dev/null 2>&1; then
    npx prettier --write "$FILE_PATH" 2>/dev/null || true
  fi
fi