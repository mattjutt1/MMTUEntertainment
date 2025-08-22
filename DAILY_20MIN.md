# DAILY 20-MINUTE LOOP (Repeatable)

**Timer Required**: Set for 20 minutes. Stop when it rings.  
**Days Until Gate**: See START.yml date + 14 days  
**Current Module**: Front Desk (Module 1)

## MINUTE-BY-MINUTE EXECUTION

### 00:00-05:00 | CAPTURE (Add 3-5 raw notes)

Open `front-desk/intake.md` and add 3-5 lines. Examples:

```
That thing that broke yesterday
Email from Jim about pricing  
Check if backup is working
Customer complaint on Twitter
New feature idea from shower thought
```

**Rule**: Write whatever is in your head. Don't organize. Don't edit.

### 05:00-12:00 | TRIAGE (Convert 3+ to actions)

**Option A - Interactive**: Run `python scripts/triage_interactive.py` (prompts you for each decision)

**Option B - Manual**: For each new line in intake.md, add to `front-desk/triage.md`:

```
2025-08-23 | note_id=21 | action: investigate-broken-thing | due: 24h | priority: high
2025-08-23 | note_id=22 | action: reply-jim-pricing | due: 48h | priority: medium
2025-08-23 | note_id=23 | action: verify-backup-cron | due: 72h | priority: low
```

**Formula**:
- Urgent/customer/broken = 24h due, high priority
- Normal tasks = 48h due, medium priority  
- Research/planning = 72h+ due, low priority

### 12:00-17:00 | LOG (Record evidence)

Append to `front-desk/log.jsonl` for each triaged item:

```json
{"ts":"2025-08-23T10:00:00Z","note_id":21,"status":"triaged","action":"investigate-broken-thing","priority":"high"}
{"ts":"2025-08-23T10:00:01Z","note_id":22,"status":"triaged","action":"reply-jim-pricing","priority":"medium"}
{"ts":"2025-08-23T10:00:02Z","note_id":23,"status":"triaged","action":"verify-backup-cron","priority":"low"}
```

### 17:00-20:00 | COUNT (Update report)

Open `reports/week-01.md` and update the numbers:

```markdown
# Week 01 Report

Generated: 2025-08-23 10:00:00 UTC

| Metric | Count |
|--------|-------|
| Total Notes | 23 |  ← Add today's count
| Triaged | 18 |      ← Add today's triaged
| Completion | 78% |   ← Recalculate
| Days Active | 2 |    ← Increment

Status: Module 1 IN PROGRESS
```

## DAILY TARGETS (Non-negotiable)

- **Minimum Input**: 3 new items in intake.md
- **Minimum Process**: 3 items triaged
- **Minimum Evidence**: 3 new log entries
- **Minimum Progress**: Report numbers must increase

## SUCCESS GATE TRACKING (Day 14)

Track daily toward gate requirements:

| Day | Notes Total | Triaged Total | On Track? |
|-----|-------------|---------------|-----------|
| 1   | 10          | 5             | ✓         |
| 2   | 23          | 18            | ✓         |
| 3   | -           | -             | -         |
| ... | ...         | ...           | ...       |
| 14  | ≥100 target | ≥70 target    | GATE      |

## ENFORCEMENT

```bash
# Start your session:
./scripts/enforce_rules.sh start intake  # Starts 25-min timer

# Or use the daily loop script:
./scripts/daily_loop.sh  # Runs the 20-min loop
```

## FORBIDDEN DURING DAILY LOOP

❌ NO redesigning the system  
❌ NO creating new files  
❌ NO optimizing the process  
❌ NO thinking about "better ways"  
❌ NO working past 20 minutes  

## ALLOWED ONLY

✓ Add to intake.md  
✓ Move to triage.md  
✓ Log to log.jsonl  
✓ Update week-01.md counts  
✓ Stop at 20 minutes  

## IF YOU MISS A DAY

Missing a day creates debt. Next session = 30 minutes to catch up.  
Missing 3+ days = Restart from Day 1 (evidence shows gaps).

---

**Remember**: The loop works because you do it daily, not because it's perfect.  
**Evidence**: Every day's work appears in log.jsonl with timestamps.