#!/bin/bash
# QUICKSTART: Exact 30-minute setup - DO NOT THINK, JUST EXECUTE

set -e

echo "================================================"
echo " 30-MINUTE QUICKSTART - NO THINKING ALLOWED"
echo "================================================"
echo ""
echo "This script will guide you through the exact first 30 minutes."
echo "Follow prompts. Don't optimize. Just do."
echo ""
read -p "Ready to start 30-minute timer? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Start when ready."
    exit 1
fi

START_TIME=$(date +%s)

# Function to show elapsed time
show_time() {
    local now=$(date +%s)
    local elapsed=$((now - START_TIME))
    local mins=$((elapsed / 60))
    local secs=$((elapsed % 60))
    printf "\r[%02d:%02d] " $mins $secs
}

# 00:00-05:00 SETUP
echo ""
echo "=== PHASE 1: SETUP (00:00-05:00) ==="
echo "Creating directory structure..."
show_time

mkdir -p front-desk scripts reports
touch front-desk/intake.md front-desk/triage.md front-desk/log.jsonl
touch reports/week-01.md

# Get UTC time
UTC_TIME=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
echo "UTC Time: $UTC_TIME"

# Create START.yml
cat > START.yml << EOF
start_at_utc: "$UTC_TIME"
scope_version: "v0.0"
constraints:
  budget_usd_per_month: 0
  operator_count: 1
  daily_time_cap_minutes: 60
module_order:
  - front-desk
  - customers
  - reliability
success_gate_day_14:
  front-desk_min_notes: 10
  customers_min_rescues: 5
  artifacts_exist: true
irreversibility: "This file defines the beginning. It never moves or is renamed."
EOF

show_time
echo "START.yml created"

# Commit if git available
if command -v git &> /dev/null; then
    git add START.yml 2>/dev/null || true
    git commit -m "chore(start): define project beginning by contract (START.yml)" 2>/dev/null || true
    echo "Committed START.yml"
fi

# 05:00-15:00 INTAKE
echo ""
echo "=== PHASE 2: INTAKE (05:00-15:00) ==="
show_time
echo "Adding 10 raw ideas to intake.md..."

cat > front-desk/intake.md << 'EOF'
Fix the broken login form
Call customer about refund
Research competitor pricing
Update SSL certificate  
Review pull requests
Set up monitoring alerts
Document the API endpoints
Schedule team meeting
Investigate slow queries
Create backup strategy
EOF

show_time
echo "✓ 10 items added to intake.md"

# 15:00-25:00 TRIAGE
echo ""
echo "=== PHASE 3: TRIAGE (15:00-25:00) ==="
show_time
echo "Triaging first 5 items..."

DATE_TODAY=$(date -u '+%Y-%m-%d')

cat > front-desk/triage.md << EOF
$DATE_TODAY | note_id=1 | action: fix-login-form | due: 48h
$DATE_TODAY | note_id=2 | action: call-customer | due: 24h
$DATE_TODAY | note_id=3 | action: check-competitor-sites | due: 7d
$DATE_TODAY | note_id=4 | action: renew-ssl-cert | due: 48h
$DATE_TODAY | note_id=5 | action: review-pr-queue | due: 24h
EOF

show_time
echo "✓ 5 items triaged"

# 25:00-30:00 LOG & REPORT
echo ""
echo "=== PHASE 4: LOG & REPORT (25:00-30:00) ==="
show_time
echo "Creating log entries..."

cat > front-desk/log.jsonl << EOF
{"ts":"${UTC_TIME}","note_id":1,"status":"triaged","action":"fix-login-form"}
{"ts":"${UTC_TIME}","note_id":2,"status":"triaged","action":"call-customer"}
{"ts":"${UTC_TIME}","note_id":3,"status":"triaged","action":"check-competitor-sites"}
{"ts":"${UTC_TIME}","note_id":4,"status":"triaged","action":"renew-ssl-cert"}
{"ts":"${UTC_TIME}","note_id":5,"status":"triaged","action":"review-pr-queue"}
EOF

show_time
echo "✓ 5 log entries created"

echo "Creating week-01 report..."

cat > reports/week-01.md << EOF
# Week 01 Report

Generated: $UTC_TIME

| Metric | Count |
|--------|-------|
| Total Notes | 10 |
| Triaged | 5 |
| Completion | 50% |

Status: Module 1 IN PROGRESS
EOF

show_time
echo "✓ Report created"

# Final commit
if command -v git &> /dev/null; then
    git add -A 2>/dev/null || true
    git commit -m "feat(front-desk): v0.0 intake→triage→log pipeline + week-01 report" 2>/dev/null || true
    echo "✓ Changes committed"
fi

# Final time
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))
TOTAL_MINS=$((TOTAL_TIME / 60))
TOTAL_SECS=$((TOTAL_TIME % 60))

echo ""
echo "================================================"
echo " ✅ COMPLETE IN $TOTAL_MINS:$TOTAL_SECS"
echo "================================================"
echo ""
echo "You have now started. Evidence exists:"
echo "- START.yml with timestamp (the beginning)"
echo "- 10 items in intake"
echo "- 5 items triaged"  
echo "- 5 log entries"
echo "- 1 report"
echo ""
echo "The starting line is visible. You can proceed."
echo ""
echo "Next: Add more items to intake.md and run scripts/triage.py"