#!/usr/bin/env bash
set -euo pipefail
start=$(date +%s)
deadline=$((start+20*60))

python3 scripts/triage.py front-desk/intake.md front-desk/triage.md front-desk/log.jsonl

now=$(date +%s); left=$((deadline-now))
[ $left -lt 0 ] && left=0
echo "Close-out: choose ONE item to do now (<= $left sec)."
# (Manual step is fine at first; later we can add a small selector)
