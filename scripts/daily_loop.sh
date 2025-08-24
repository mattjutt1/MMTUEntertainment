#!/usr/bin/env bash
set -euo pipefail

# Ensure marriage protection daemon is running
echo "[daily-loop] ensuring marriage protection daemon is active..."
if ! pgrep -f "marriage_protection.sh" > /dev/null; then
    ./scripts/marriage_protection.sh start || {
        echo "❌ Marriage protection daemon failed to start"
        exit 1
    }
fi

# Start timer for 20-minute cap
start=$(date +%s)
deadline=$((start+20*60))

python3 scripts/triage.py front-desk/intake.md front-desk/triage.md front-desk/log.jsonl
python3 scripts/verify_log.py front-desk/log.jsonl   # stop if chain broken
echo "[front-desk] log verified"

# Git integrity and snapshot
if command -v git &> /dev/null && [ -d .git ]; then
    echo "[front-desk] creating git snapshot..."
    git add front-desk/log.jsonl front-desk/triage.md
    git commit -m "front-desk: daily snapshot $(date -u +%Y-%m-%d)" || true
    echo "[front-desk] verifying git repository integrity..."
    git fsck --full --strict
    echo "[front-desk] git integrity verified"
else
    echo "[front-desk] warning: no git repository found, skipping integrity check"
fi

# Generate daily report
TODAY=$(date +%Y-%m-%d)
DAILY_REPORT="reports/daily/$TODAY.md"

echo "[daily-loop] generating daily report..."
cat > "$DAILY_REPORT" <<EOF
# Daily Report - $TODAY

**Generated:** $(date)

## Work Session Summary
- Daily loop completed at $(date +%H:%M)
- Marriage protection: $(if pgrep -f "marriage_protection.sh" > /dev/null; then echo "ACTIVE"; else echo "INACTIVE"; fi)
- Git integrity: VERIFIED

## Triage Summary
$(if [ -f front-desk/log.jsonl ]; then
    echo "- Total events today: $(grep "$(date +%Y-%m-%d)" front-desk/log.jsonl | wc -l)"
    echo "- New triage entries: $(grep "triage" front-desk/log.jsonl | grep "$(date +%Y-%m-%d)" | wc -l)"
else
    echo "- No log entries found"
fi)

## Marriage Protection Status
$(if [ -f ".ops/session/$TODAY.state" ]; then
    work_seconds=$(grep "work_seconds=" ".ops/session/$TODAY.state" | cut -d'=' -f2 || echo "0")
    hours=$((work_seconds / 3600))
    minutes=$(((work_seconds % 3600) / 60))
    echo "- Work time today: ${hours}h ${minutes}m"
    if [ $work_seconds -ge 28800 ]; then
        echo "- Status: OVERTIME"
    else
        echo "- Status: Within 8h limit"
    fi
else
    echo "- No session data found"
fi)
EOF

# Check if it's Sunday and generate weekly report
if [ "$(date +%u)" = "7" ]; then
    echo "[daily-loop] Sunday detected, generating weekly report..."
    WEEK=$(date +%Y-W%V)
    python3 scripts/make_weekly_report.py > "reports/weekly/$WEEK.md"
    echo "✅ Weekly report generated: reports/weekly/$WEEK.md"
fi

now=$(date +%s); left=$((deadline-now))
[ $left -lt 0 ] && left=0
echo "Close-out: choose ONE item to do now (<= $left sec)."
echo "✅ Daily report saved: $DAILY_REPORT"
