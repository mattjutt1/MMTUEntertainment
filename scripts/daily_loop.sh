#!/bin/bash
# DAILY 20-MINUTE LOOP - Automated routine executor

set -e

# Colors for visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN} DAILY 20-MINUTE LOOP - MODULE 1: FRONT DESK ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Calculate days since start
START_DATE=$(grep "start_at_utc" START.yml | cut -d'"' -f2 | cut -dT -f1)
TODAY=$(date -u +%Y-%m-%d)
DAYS_ACTIVE=$(( ($(date -d "$TODAY" +%s) - $(date -d "$START_DATE" +%s)) / 86400 + 1 ))

echo -e "${YELLOW}Day $DAYS_ACTIVE of 14${NC}"
echo -e "Success Gate in $((14 - DAYS_ACTIVE)) days"
echo ""

# Start timer
START_TIME=$(date +%s)
PHASE_1_END=$((START_TIME + 300))   # 5 minutes
PHASE_2_END=$((START_TIME + 720))   # 12 minutes  
PHASE_3_END=$((START_TIME + 1020))  # 17 minutes
PHASE_4_END=$((START_TIME + 1200))  # 20 minutes

# Background timer alert
(sleep 1200 && echo -e "\n\n${RED}🛑 20 MINUTES COMPLETE! STOP NOW! 🛑${NC}\n\n") &
TIMER_PID=$!

# Function to show time remaining
show_time() {
    local now=$(date +%s)
    local elapsed=$((now - START_TIME))
    local remaining=$((1200 - elapsed))
    local mins=$((remaining / 60))
    local secs=$((remaining % 60))
    printf "\r[%02d:%02d remaining] " $mins $secs
}

# PHASE 1: CAPTURE (0-5 min)
echo -e "${GREEN}=== PHASE 1: CAPTURE (00:00-05:00) ===${NC}"
echo "Add 3-5 raw notes to intake.md"
echo ""
echo "Opening intake.md for editing..."
echo "Examples to add:"
echo "  - That thing that broke yesterday"
echo "  - Email from Jim about pricing"
echo "  - Check if backup is working"
echo "  - Customer complaint on Twitter"
echo "  - New feature idea"
echo ""

# Show current intake count
CURRENT_INTAKE=$(wc -l < front-desk/intake.md 2>/dev/null || echo 0)
echo "Current intake items: $CURRENT_INTAKE"
echo ""

echo "You have 5 minutes. Add 3-5 items now."
echo "Press Enter when done adding items..."
read -t 300 || true

# PHASE 2: TRIAGE (5-12 min)
echo ""
echo -e "${GREEN}=== PHASE 2: TRIAGE (05:00-12:00) ===${NC}"
show_time
echo ""
echo "Convert at least 3 items to actions in triage.md"
echo ""

# Get next note_id
LAST_ID=$(grep -o '"note_id":[0-9]*' front-desk/log.jsonl 2>/dev/null | tail -1 | cut -d: -f2 || echo 0)
NEXT_ID=$((LAST_ID + 1))

echo "Next note_id to use: $NEXT_ID"
echo "Format: $(date -u +%Y-%m-%d) | note_id=$NEXT_ID | action: do-thing | due: 48h | priority: medium"
echo ""
echo "Opening triage.md for editing..."
echo "You have 7 minutes. Press Enter when done triaging..."
read -t 420 || true

# PHASE 3: LOG (12-17 min)
echo ""
echo -e "${GREEN}=== PHASE 3: LOG (12:00-17:00) ===${NC}"
show_time
echo ""
echo "Recording evidence in log.jsonl"
echo ""

# Count how many were triaged
TRIAGE_COUNT=$(wc -l < front-desk/triage.md 2>/dev/null || echo 0)
echo "Items in triage.md: $TRIAGE_COUNT"
echo ""

echo "Add JSON entries for each triaged item to log.jsonl"
echo 'Format: {"ts":"2025-08-23T10:00:00Z","note_id":21,"status":"triaged","action":"do-thing","priority":"medium"}'
echo ""
echo "You have 5 minutes. Press Enter when done logging..."
read -t 300 || true

# PHASE 4: COUNT (17-20 min)
echo ""
echo -e "${GREEN}=== PHASE 4: COUNT (17:00-20:00) ===${NC}"
show_time
echo ""
echo "Updating report counts..."

# Auto-calculate counts
TOTAL_NOTES=$(grep -c '"note_id"' front-desk/log.jsonl 2>/dev/null || echo 0)
TRIAGED_NOTES=$(grep -c '"status":"triaged"' front-desk/log.jsonl 2>/dev/null || echo 0)
PERCENT=$((TRIAGED_NOTES * 100 / TOTAL_NOTES))

echo "Current stats:"
echo "  Total Notes: $TOTAL_NOTES"
echo "  Triaged: $TRIAGED_NOTES"
echo "  Completion: $PERCENT%"
echo "  Days Active: $DAYS_ACTIVE"
echo ""

# Update report automatically
cat > reports/week-01.md << EOF
# Week 01 Report

Generated: $(date -u '+%Y-%m-%d %H:%M:%S') UTC

| Metric | Count |
|--------|-------|
| Total Notes | $TOTAL_NOTES |
| Triaged | $TRIAGED_NOTES |
| Completion | $PERCENT% |
| Days Active | $DAYS_ACTIVE |

## Daily Progress

| Day | Total | Triaged | Rate |
|-----|-------|---------|------|
| $DAYS_ACTIVE | $TOTAL_NOTES | $TRIAGED_NOTES | $PERCENT% |

## Status

Module 1 is $( [ $TOTAL_NOTES -ge 10 ] && [ $TRIAGED_NOTES -ge 10 ] && echo "✓ COMPLETE" || echo "IN PROGRESS" )

### Success Gate (Day 14)
- [$([ $TOTAL_NOTES -ge 10 ] && echo "✓" || echo " ")] ≥10 notes processed
- [$([ $TRIAGED_NOTES -ge 10 ] && echo "✓" || echo " ")] ≥10 items triaged  
- [✓] Reports exist

Target by Day 14: 100+ notes, 70+ triaged
EOF

echo "✓ Report updated automatically"

# Kill timer
kill $TIMER_PID 2>/dev/null || true

# Final summary
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINS=$((DURATION / 60))
SECS=$((DURATION % 60))

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN} ✅ DAILY LOOP COMPLETE IN $MINS:$SECS ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Today's Progress:"
echo "  - Total items: $TOTAL_NOTES (+$(($TOTAL_NOTES - $CURRENT_INTAKE)))"
echo "  - Triage rate: $PERCENT%"
echo "  - Days until gate: $((14 - DAYS_ACTIVE))"
echo ""

# Gate check
if [ $DAYS_ACTIVE -eq 14 ]; then
    echo -e "${YELLOW}=== DAY 14 SUCCESS GATE CHECK ===${NC}"
    if [ $TOTAL_NOTES -ge 10 ] && [ $TRIAGED_NOTES -ge 10 ]; then
        echo -e "${GREEN}✅ GATE PASSED! Module 1 Complete${NC}"
    else
        echo -e "${RED}❌ GATE FAILED - Need more items${NC}"
    fi
fi

# Commit changes
if command -v git &> /dev/null; then
    git add front-desk/* reports/week-01.md 2>/dev/null || true
    git commit -m "daily: Day $DAYS_ACTIVE loop - $TOTAL_NOTES notes, $TRIAGED_NOTES triaged" 2>/dev/null || true
    echo "✓ Changes committed"
fi

echo ""
echo "Next session: Run this script again tomorrow at the same time."