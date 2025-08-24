# Front Desk Module – System Design Report (v0.1)

> Bounded context: **Front Desk (Module 1)**. One “room” with everything needed to intake, triage, schedule, route, and keep a tamper‑evident ledger of work. Built for a mom‑and‑pop operator, $0 infra, offline‑first, easy to grow.

---

## 1) Purpose & Business Outcome

**Purpose.** Turn chaotic inbound (ideas, calls, emails, walk‑ins) into trackable, scheduled, and closed‑loop work without SaaS cost.

**Outcomes.**
- Clear queue of work with owner, due date, and status.
- < 20 minutes/day operator effort.
- Evidence trail for every decision and hand‑off.

---

## 2) Operating Model (Room → Stations)

The room contains stations (independent jobs) that work together through simple contracts.

**Core stations (v0.1):**
1. **Reception** – capture raw items from anywhere.
2. **Triage** – convert raw items into tasks (T‑IDs) with owner/when/why.
3. **Schedule** – create/update calendar events and reminders.
4. **Routing** – apply rules to send tasks to the right module (Customer, Finance, Reliability, etc.).
5. **Ledger** – append‑only log of everything (tamper‑evident for tasks; regular timestamp log for operational events).
6. **Rhythm** – a daily script that runs checks, produces a report, and keeps the room healthy.

**Optional stations (ready to add later):**
- **Call desk** (telephony capture), **Mail/Docs** (scan + classify), **Visitor log**, **Crisis lane** (priority/escalation), **Analytics** (KPIs).

---

## 3) Contracts & Data Formats

**A. Reception inbox**
```
/front-desk/intake.md    # free-form capture, one line per item (markdown ok)
```

**B. Task record (T‑ID)** — single‑source of truth
```
/front-desk/tasks/T-0001.md
---
title: Replace footer legal links
source: intake
priority: P2
owner: matt
status: open
created: 2025-08-22
due: 2025-08-25
links:
  - pr: 79
---
Context and notes...
```

**C. Ledger (append‑only)**
```
/front-desk/log.jsonl   # one JSON object per line
{"id":"T-0001","type":"triage","ts":"2025-08-22T12:34:56Z","prev_hash":"","hash":"...","fields":{"title":"Replace footer legal links"}}
{"module":"marriage_protection","action":"daemon_started","ts":"2025-08-22T13:00:00Z"}
```
- **Tasks** entries are hash‑chained for tamper evidence.
- **Operational** entries (e.g., timers) are timestamped events (no chain).

**D. Calendar contract (ICS)**
```
/front-desk/calendar/
  2025-08-23-standup.ics
```
Minimal iCalendar VEVENT with DTSTART/DTEND/SUMMARY/UID. (Portable to any calendar app.)

**E. Routing manifest**
```
/front-desk/routing.yml
rules:
  - if: "title ~= 'invoice|payment'"
    send_to: finance
  - if: "title ~= 'bug|outage'"
    send_to: reliability
  - if: "tag == 'customer'"
    send_to: customers
```

---

## 4) Repository Layout (v0.1)
```
/front-desk/
  intake.md
  log.jsonl
  routing.yml
  calendar/
  tasks/
/scripts/
  triage.py              # intake → T‑IDs + ledger (hash chain)
  daily_loop.sh          # rhythm job: sanity checks + report
  verify_log.py          # integrity checks
  ci/smoke_runtime_probe.sh
/docs/
  FRONT_DESK_GUIDE.md    # this module’s README
  MARRIAGE_PROTECTION_GUIDE.md
/tests/
  front_desk.bats
```

---

## 5) Station Responsibilities

### 5.1 Reception
- Append ideas to **intake.md** (CLI shortcut provided).
- Optional: import sources (email export, voicemail transcript, notes files).

### 5.2 Triage
- Reads `intake.md`, creates `tasks/T‑xxxx.md`, writes a task ledger entry.
- Applies basic classification (who/when/priority/tags).
- Leaves the raw line in `intake.md` (provenance) and adds a backlink to the created T‑ID.

### 5.3 Schedule
- For any task with a `due` or `meeting` field, writes a tiny `.ics` file in `calendar/`.
- ICS files are importable anywhere; also used by automated reminders.

### 5.4 Routing
- Evaluates `routing.yml` rules, adds `module:` field to task, and (if needed) opens a hand‑off file under that module’s inbox.

### 5.5 Ledger
- Appends every state change to `log.jsonl`.
- For **tasks**, computes and stores `hash` and `prev_hash`.
- `verify_log.py` recomputes the chain daily; failures stop the rhythm job and open a fix‑me task.

### 5.6 Rhythm
- `daily_loop.sh` runs:
  1) integrity checks  2) overdue scan  3) calendar build  4) one‑page report to `reports/`
- Enforces the 20‑minute boundary (timer + “stop now” prompt).

---

## 6) Interfaces to Other Rooms

- **Customers**: tasks with `module: customers` land in `/customers/inbox/` with a link back to the T‑ID; status sync is by writing back to the task file and ledger.
- **Reliability**: outage/bug triage opens `/reliability/incidents/I-xxxx.md` with a cross‑link to the originating T‑ID; closing the incident auto‑updates the task.
- **Finance**: invoice/payment tasks create `/finance/queue/F-xxxx.md`; when paid, Finance writes a completion note back to the task.

All cross‑room comms are **file‑based and link‑backed**—offline‑first, Git‑sync‑friendly.

---

## 7) KPIs & SLAs (v0.1 baselines)
- **Intake-to‑triage**: ≥ 90% of new lines triaged within **24h**.
- **Triage cadence**: daily rhythm ≤ **20 min**.
- **Overdue rate**: < **10%** of open tasks overdue.
- **Ledger health**: 100% hash‑chain verification.
- **Calendar hygiene**: 100% tasks with dates have an `.ics`.

(Thresholds are placeholders—replace with your measured 2‑week data.)

---

## 8) Test Plan (acceptance checks)
- `verify_log.py` reports **OK** and `front_desk.bats` passes.
- Creating 5 sample lines in `intake.md` yields 5 `tasks/T‑xxxx.md` and 5 ledger entries.
- Adding a `due:` field writes a valid `.ics` file (linted by a tiny validator).
- A `routing.yml` rule updates `module:` on a matching task.
- Daily rhythm finishes < **2 minutes** on a low‑power laptop.

---

## 9) Security & Privacy
- Repository stays private; only minimal metadata stored.
- Ledger chain detects tampering of task history.
- `.ics` contains only what you put in the task; no hidden fields.
- Optional: secrets and private notes live outside the repo or in an encrypted subfolder.

---

## 10) Implementation Notes (today’s tech, zero cost)
- Bash + Python 3.11+ only; no servers, no DB.
- All data is plain text (markdown/JSONL/ICS) → durable for 10+ years.
- Scripts are idempotent; re‑running is safe.
- Works offline; Git is the sync/protection layer when online.

**Interoperability standards used:** JSON Lines for logs; iCalendar (`.ics`) for time; simple YAML for rules.

---

## 11) Roadmap (v0.2 and beyond)
- **Telephony intake**: optional Asterisk/Matrix bridge writes voicemail transcripts to `intake.md`.
- **Email intake**: periodic export → parse and append.
- **Visitor log**: keypad form → `intake.md` with `tag: visitor`.
- **Analytics**: weekly KPIs with sparklines in `reports/`.
- **APIs**: read‑only HTTP endpoint (static site + JSON) for status dashboards.

---

## 12) Gaps to Drill Later (don’t block v0.1)
- Policy thresholds with sources (exact SLA/KPI numbers for your context).
- Per‑station acceptance checklists (Reception, Schedule, Routing) written out.
- Evidence playbooks (where artifacts live for audits/retros).

---

## 13) Day‑1 Operator Guide (20‑minute routine)
1. Add any new items to `front-desk/intake.md`.
2. Run `scripts/daily_loop.sh` (it triages, schedules, routes, verifies).
3. Open `reports/week-xx.md` to see status.
4. Stop when the timer says 20 minutes (protect the habit).

---

## 14) Success Criteria for v0.1
- 14 consecutive days with daily loop success.
- ≥ 30 tasks processed end‑to‑end.
- Zero integrity failures in the ledger.
- Calendar artifacts present for all dated tasks.

---

## 15) Rollback & Recovery
- Everything is files → `git revert` brings you back.
- If ledger check fails, the daily loop stops and opens a fix‑me task with the failing line number.
- If you lose power mid‑run, re‑run the loop; scripts are safe to repeat.

---

*Prepared for: MMTU “Front Desk” Module | Version: 2025‑08‑23 | Maintainer: Matt*

