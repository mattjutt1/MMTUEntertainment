#!/usr/bin/env bash
set -euo pipefail
cat <<'PROMPT'
Run: /session-autoboot
Then: /install-toolchain (user-local)
Then: /scaffold-site (verify dev server)
PROMPT
