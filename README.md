# MMTUEntertainment

## Mission & Pillars
**Mission:** We build software that fixes what truly hurts—so real people win.

**Pillars**
1) Empathy-first discovery
2) Practical, low-friction solutions
3) Foundation before hype


## Quick links (copy/paste into browser)
- Repo: https://github.com/mattjutt1/MMTUEntertainment
- Docs: docs/README.md
- Service Health CI: `.github/workflows/stack-health-check.yml`
- Branch Protection: `docs/Branch-Protection.md`
- Playwright config: `products/site/playwright.config.ts`

## $0 Business Operations System

**Started**: 2025-08-22T19:47:00Z (see START.yml)  
**Cost**: $0/month  
**Scale**: Mom-and-pop (1 operator, 60 min/day max)

### Module 1: Front Desk ($0)

Simple inbox that turns raw notes into next actions with proof.

#### Quick Start

1. **Add ideas** to `front-desk/intake.md` (one per line)
2. **Run triage**: `python scripts/triage.py`
3. **Check report**: `reports/week-01.md`
4. **When stuck**: `./scripts/doubt_reset.sh`

#### Files

- `front-desk/intake.md` - Drop raw ideas here
- `front-desk/triage.md` - Actionable items with due dates
- `front-desk/log.jsonl` - Append-only audit trail
- `scripts/triage.py` - Processes intake → triage → log

#### Manual Mode (no Python)

If you don't have Python, manually:
1. Copy lines from intake.md
2. Add to triage.md: `2025-08-22 | note_id=X | action: do-thing | due: 48h`
3. Add to log.jsonl: `{"ts":"2025-08-22T10:00:00Z","note_id":X,"status":"triaged","action":"do-thing"}`

#### Success Metrics (Day 14)

- [✓] 10+ items processed through intake
- [ ] 10+ items triaged in log
- [✓] Weekly report exists

### Principles

1. **$0 budget** - No paid services, tokens, or accounts
2. **Falsifiable start** - START.yml defines the beginning
3. **Evidence-based** - Every action leaves a trace in log.jsonl
4. **Mom-and-pop scale** - 1 person, 60 minutes/day maximum

### Next Modules (Coming Soon)

- Module 2: Customers - Close the loop with people
- Module 3: Reliability - Simple uptime monitoring

## About
This repo includes a pnpm TypeScript/Playwright monorepo and supporting CI. See `docs/README.md` for the Diátaxis docs spine and authoring guidance.

