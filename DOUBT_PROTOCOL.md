# WHEN DOUBT HITS - HARD STOP PROTOCOL

**THIS FILE IS YOUR EMERGENCY BRAKE**

## THE PROTOCOL (60 seconds total)

### STEP 1: READ (10 seconds)
```bash
cat START.yml | head -1
```
Output: `start_at_utc: "2025-08-22T19:47:00Z"`

### STEP 2: SAY OUT LOUD (5 seconds)
"We already started at 2025-08-22T19:47:00Z. The beginning exists."

### STEP 3: ADD ONE LINE (20 seconds)
```bash
echo "Doubt hit at $(date -u +%FT%TZ) - continuing anyway" >> front-desk/intake.md
```

### STEP 4: TRIAGE ONE LINE (20 seconds)
```bash
echo "$(date -u +%F) | note_id=999 | action: pushed-through-doubt | due: 1h" >> front-desk/triage.md
```

### STEP 5: LOG IT (5 seconds)
```bash
echo '{"ts":"'$(date -u +%FT%TZ)'","event":"doubt_cleared","resumed":true}' >> front-desk/log.jsonl
```

## DONE. DOUBT CLEARED.

---

## COMMON DOUBT TRIGGERS & IMMEDIATE RESPONSES

### "This system is too simple"
**Response**: Good. Simple = $0. Complex = spiral.  
**Action**: Add one line to intake.md.

### "I should redesign this"
**Response**: Rule 5 forbids redesign until Day 14.  
**Action**: Check OPERATING_RULES.md, add violation to log.

### "I'm not doing enough"
**Response**: Check log.jsonl line count. Number going up = enough.  
**Action**: `wc -l front-desk/log.jsonl`

### "This isn't real work"
**Response**: START.yml timestamp = real. Log entries = real.  
**Action**: `grep -c "triaged" front-desk/log.jsonl`

### "I should plan more"
**Response**: 70% rule. Unknown 30% goes in intake.md.  
**Action**: Write "UNKNOWN: [thing]" in intake.md.

### "The 20 minutes isn't enough"
**Response**: Timer > feelings. 20 min daily > 2 hours weekly.  
**Action**: Set timer for 20 minutes. Stop when it rings.

### "I'm behind schedule"
**Response**: Check GATE_TRACKER.md. Only Day 14 matters.  
**Action**: Do today's 20 minutes. Skip counting past.

### "Other systems are better"
**Response**: Other systems cost money. This costs $0.  
**Action**: Add "research other systems" to intake.md, continue.

## AUTOMATIC DOUBT CLEARER

Run when stuck:
```bash
./scripts/doubt_reset.sh
```

This script:
1. Shows you START.yml timestamp
2. Adds a doubt item to intake
3. Triages it immediately
4. Logs the event
5. Shows your total progress
6. Returns you to work

## THE ONLY TRUTH

When doubt hits, remember:
- START.yml exists with a timestamp
- log.jsonl has entries with timestamps  
- Numbers in log.jsonl are going up
- That's all that matters until Day 14

## DOUBT FREQUENCY TRACKER

If doubt hits >3 times in one day:
- Stop for the day
- Tomorrow: Use manual mode only
- Tomorrow: 15 minute session max

Doubt is the spiral. The protocol breaks the spiral.

---

**Bottom line**: When in doubt, add one line to intake. That's always the answer.