# Operating Rules - Anti-Spiral Protocol v1.0

**Enforcement Start**: 2025-08-22T19:53:00Z  
**Violation Tracking**: See `front-desk/log.jsonl` for rule_violations

## RULE 1: TIMEBOX ENFORCEMENT
**Law**: Every work session = 25 minutes exactly. Timer dictates stop, not task completion.

### Implementation:
```bash
# Start work:
echo "$(date -u +%FT%TZ) | session_start" >> front-desk/log.jsonl
sleep 1500 && echo "STOP NOW" # 25 min timer

# When timer ends:
echo "$(date -u +%FT%TZ) | session_end | incomplete_ok" >> front-desk/log.jsonl
```

### Violation = Breaking timer rule
**Penalty**: Log violation, add 3 items to intake.md before continuing
**Evidence**: Check log.jsonl timestamps (>25min gap = violation)

---

## RULE 2: 70% DECISION THRESHOLD
**Law**: Act at 70% information. Document the unknown 30% and move forward.

### Implementation:
When facing any decision:
1. List what you know (must be ≥7 items)
2. List what you don't know (must be ≤3 items)
3. Add unknowns to `front-desk/intake.md` with prefix "UNKNOWN:"
4. Make decision and log it

### Template for triage.md:
```
2025-08-22 | decision_id=X | known=70% | unknown="need-api-specs,need-budget" | action: proceed-anyway
```

### Violation = Researching beyond 70%
**Penalty**: Must make 3 immediate decisions without any research
**Evidence**: Time between intake and triage >25min = overthinking

---

## RULE 3: 2-MINUTE REVERT GUARANTEE
**Law**: Every change must be reversible in <120 seconds using only text commands.

### Implementation:
Before ANY edit:
```bash
# Create revert point
cp front-desk/intake.md front-desk/intake.md.bak
# Make your edit
# If revert needed:
mv front-desk/intake.md.bak front-desk/intake.md  # <2 seconds
```

### Compliance Check:
- Max diff size: 10 lines per edit
- No binary files
- No external dependencies
- Each log.jsonl entry = one atomic change

### Violation = Non-revertible change
**Penalty**: Delete the change entirely, start over with smaller change
**Evidence**: Diff >10 lines or requires >2min to undo

---

## RULE 4: SINGLE-FILE LOCK
**Law**: Touch only ONE file per work block. Choose at session start.

### Implementation:
```bash
# Session start - declare your file:
echo "$(date -u +%FT%TZ) | locked_file=front-desk/intake.md" >> front-desk/log.jsonl

# During session - ONLY edit that file
# Any other file edit = violation
```

### File Priority Order:
1. `intake.md` - When capturing new items (Monday/Thursday)
2. `triage.md` - When processing items (Tuesday/Friday)  
3. `log.jsonl` - When recording completions (Wednesday)
4. `week-01.md` - When reviewing metrics (Sunday only)

### Violation = Editing multiple files
**Penalty**: Revert all changes, lose the work block
**Evidence**: Git diff shows >1 file modified in 25min window

---

## RULE 5: ZERO REDESIGN BEFORE DAY 14
**Law**: No renaming, refactoring, or "improving" until 2025-09-05 (Day 14).

### Forbidden Actions (Automatic Violation):
- Renaming any file
- Creating new directories  
- Changing file formats
- Adding "better" tools
- Modifying `scripts/triage.py` beyond bugfixes
- Writing documentation about "future improvements"

### Only Allowed Metric:
**Success = Counts going up**
- Lines in intake.md
- Entries in log.jsonl  
- Triage completion %

### Violation = Any redesign attempt
**Penalty**: Delete the redesign, add 10 items to intake.md as penance
**Evidence**: Any file outside the 5 core files = violation

---

## ENFORCEMENT TRACKER

Add this line to log.jsonl for every violation:
```json
{"ts":"2025-08-22T20:00:00Z","violation":"rule_3","penalty_served":false,"session_lost":true}
```

## Daily Compliance Check (2 min):
```bash
# Count violations this week
grep "violation" front-desk/log.jsonl | wc -l

# If violations >3, you must:
# 1. Only use manual mode (no scripts) for next session
# 2. Set timer to 15 minutes instead of 25
# 3. Write "I follow the rules" 10x in intake.md
```

## Success Definition:
- Day 14: ≥100 processed items
- Day 14: ≤10 total violations
- Day 14: All 5 rules still unchanged

**These rules are immutable until 2025-09-05.**

---

Remember: The spiral happens when you think about improving the system instead of using it. These rules force usage over optimization.