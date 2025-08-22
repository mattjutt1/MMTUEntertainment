# EXACT FIRST 30 MINUTES - DO, DON'T THINK

Set a timer for 30 minutes. Follow these steps exactly. No deviations.

## 00:00-05:00 | SETUP PHASE

```bash
# Minute 0-1: Create structure
mkdir front-desk scripts reports
touch START.yml
touch front-desk/intake.md front-desk/triage.md front-desk/log.jsonl
touch reports/week-01.md

# Minute 1-2: Get current UTC time
date -u '+%Y-%m-%dT%H:%M:%SZ'

# Minute 2-3: Fill START.yml (copy exactly, replace TIME_HERE with output above)
cat > START.yml << 'EOF'
start_at_utc: "TIME_HERE"
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

# Minute 3-4: Commit START
git add START.yml
git commit -m "chore(start): define project beginning by contract (START.yml)"

# Minute 4-5: Verify files exist
ls -la front-desk/
```

## 05:00-15:00 | INTAKE PHASE

Open `front-desk/intake.md` and paste these 10 lines (or your own - ANYTHING works):

```
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
```

Save the file. Don't organize. Don't edit. Just paste and save.

## 15:00-25:00 | TRIAGE PHASE

Open `front-desk/triage.md` and add these 5 lines EXACTLY:

```
2025-08-22 | note_id=1 | action: fix-login-form | due: 48h
2025-08-22 | note_id=2 | action: call-customer | due: 24h
2025-08-22 | note_id=3 | action: check-competitor-sites | due: 7d
2025-08-22 | note_id=4 | action: renew-ssl-cert | due: 48h
2025-08-22 | note_id=5 | action: review-pr-queue | due: 24h
```

## 25:00-30:00 | LOG & REPORT PHASE

### Minute 25-27: Add to log.jsonl

Open `front-desk/log.jsonl` and paste these 5 lines:

```json
{"ts":"2025-08-22T10:00:00Z","note_id":1,"status":"triaged","action":"fix-login-form"}
{"ts":"2025-08-22T10:00:01Z","note_id":2,"status":"triaged","action":"call-customer"}
{"ts":"2025-08-22T10:00:02Z","note_id":3,"status":"triaged","action":"check-competitor-sites"}
{"ts":"2025-08-22T10:00:03Z","note_id":4,"status":"triaged","action":"renew-ssl-cert"}
{"ts":"2025-08-22T10:00:04Z","note_id":5,"status":"triaged","action":"review-pr-queue"}
```

### Minute 27-29: Create report

Open `reports/week-01.md` and paste:

```markdown
# Week 01 Report

| Metric | Count |
|--------|-------|
| Total Notes | 10 |
| Triaged | 5 |
| Completion | 50% |
```

### Minute 29-30: Final commit

```bash
git add -A
git commit -m "feat(front-desk): v0.0 intake→triage→log pipeline + week-01 report"
```

## ✅ DONE - YOU HAVE STARTED

Timer shows 30:00. You have:
- START.yml with timestamp (the beginning)
- 10 items in intake
- 5 items triaged
- 5 log entries
- 1 report

You can now see the starting line. The work has begun. Evidence exists.

## FORBIDDEN during these 30 minutes:
- ❌ NO thinking about "better ways"
- ❌ NO researching tools
- ❌ NO planning ahead
- ❌ NO organizing the items
- ❌ NO making it "nice"

Just follow the steps. The system works because you used it, not because you optimized it.