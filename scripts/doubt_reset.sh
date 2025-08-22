#!/bin/bash
# DOUBT RESET - Emergency brake for overthinking spirals

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}================================================${NC}"
echo -e "${RED}         DOUBT DETECTED - EXECUTING RESET      ${NC}"
echo -e "${RED}================================================${NC}"
echo ""

# STEP 1: Show the irreversible start
echo -e "${BLUE}STEP 1: READING START.yml${NC}"
START_TIME=$(grep "start_at_utc" START.yml | cut -d'"' -f2)
echo -e "${GREEN}Project started at: $START_TIME${NC}"
echo -e "${GREEN}This is irreversible. The beginning exists.${NC}"
echo ""

# STEP 2: Force acknowledgment
echo -e "${BLUE}STEP 2: ACKNOWLEDGE THE START${NC}"
echo -e "${YELLOW}Say out loud: 'We already started at $START_TIME'${NC}"
echo "Press Enter after you've said it out loud..."
read

# STEP 3: Add doubt line to intake
echo -e "${BLUE}STEP 3: ADDING DOUBT TO INTAKE${NC}"
DOUBT_TIME=$(date -u +%FT%TZ)
echo "Doubt hit at $DOUBT_TIME - continuing anyway" >> front-desk/intake.md
echo -e "${GREEN}✓ Added doubt to intake.md${NC}"
echo ""

# STEP 4: Triage the doubt immediately
echo -e "${BLUE}STEP 4: TRIAGING THE DOUBT${NC}"
# Get next note_id
LAST_ID=$(grep -o '"note_id":[0-9]*' front-desk/log.jsonl 2>/dev/null | tail -1 | cut -d: -f2 || echo 0)
NEXT_ID=$((LAST_ID + 1))
DATE_TODAY=$(date -u +%Y-%m-%d)

echo "$DATE_TODAY | note_id=$NEXT_ID | action: pushed-through-doubt | due: 1h | priority: urgent" >> front-desk/triage.md
echo -e "${GREEN}✓ Triaged doubt as urgent action${NC}"
echo ""

# STEP 5: Log the event
echo -e "${BLUE}STEP 5: LOGGING DOUBT CLEARANCE${NC}"
echo "{\"ts\":\"$DOUBT_TIME\",\"event\":\"doubt_cleared\",\"note_id\":$NEXT_ID,\"resumed\":true}" >> front-desk/log.jsonl
echo -e "${GREEN}✓ Logged doubt clearance${NC}"
echo ""

# Show progress to build confidence
echo -e "${BLUE}YOUR ACTUAL PROGRESS:${NC}"
TOTAL_NOTES=$(grep -c '"note_id"' front-desk/log.jsonl 2>/dev/null || echo 0)
TRIAGED_NOTES=$(grep -c '"triaged"' front-desk/log.jsonl 2>/dev/null || echo 0)
DOUBT_EVENTS=$(grep -c "doubt_cleared" front-desk/log.jsonl 2>/dev/null || echo 0)

echo "  Total notes processed: $TOTAL_NOTES"
echo "  Items triaged: $TRIAGED_NOTES"
echo "  Doubts cleared: $DOUBT_EVENTS"
echo ""

# Check doubt frequency
if [ $DOUBT_EVENTS -gt 3 ]; then
    echo -e "${YELLOW}⚠️  WARNING: High doubt frequency ($DOUBT_EVENTS times)${NC}"
    echo "  Tomorrow: Manual mode only, 15 minute max"
    echo "{\"ts\":\"$DOUBT_TIME\",\"violation\":\"excessive_doubt\",\"count\":$DOUBT_EVENTS}" >> front-desk/log.jsonl
fi

# Calculate days since start
START_DATE=$(echo $START_TIME | cut -dT -f1)
TODAY=$(date -u +%Y-%m-%d)
DAYS_ACTIVE=$(( ($(date -d "$TODAY" +%s) - $(date -d "$START_DATE" +%s)) / 86400 + 1 ))

echo -e "${GREEN}Day $DAYS_ACTIVE of 14 - $((14 - DAYS_ACTIVE)) days until gate${NC}"
echo ""

# Prescribe immediate action
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}           DOUBT CLEARED - BACK TO WORK        ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "IMMEDIATE NEXT ACTION:"
echo "1. Add ONE more line to intake.md (anything)"
echo "2. Then stop and take a break"
echo ""
echo "Ready to continue? (y/n): "
read -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Good. Opening intake.md...${NC}"
    echo ""
    echo "Add one line. Examples:"
    echo "  - That thing I'm worried about"
    echo "  - Check if X is working"
    echo "  - Reply to person about thing"
    echo ""
    echo "After adding one line, you're done for now."
else
    echo -e "${YELLOW}That's fine. Come back when ready.${NC}"
    echo "The system will wait. START.yml never moves."
fi

echo ""
echo -e "${BLUE}Remember: The only cure for doubt is doing.${NC}"