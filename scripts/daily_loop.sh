#!/usr/bin/env bash
set -euo pipefail

# Marriage Protection: Check if work is allowed
if ! ./scripts/marriage_protection.sh start; then
    exit 1
fi

# Start timer and wife check-in background process
start=$(date +%s)
deadline=$((start+20*60))

# Background wife check-in every 2 hours
(sleep 7200 && ./scripts/marriage_protection.sh check-in) &
CHECKIN_PID=$!

# Trap to ensure session is logged on exit
trap 'kill $CHECKIN_PID 2>/dev/null || true; ./scripts/marriage_protection.sh stop' EXIT

python3 scripts/triage.py front-desk/intake.md front-desk/triage.md front-desk/log.jsonl
python3 scripts/verify_log.py front-desk/log.jsonl   # stop if chain broken
echo "[front-desk] log verified"

now=$(date +%s); left=$((deadline-now))
[ $left -lt 0 ] && left=0
echo "Close-out: choose ONE item to do now (<= $left sec)."

# Clean exit (trap will handle logging)
kill $CHECKIN_PID 2>/dev/null || true
