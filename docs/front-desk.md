# Front Desk Module - Operations Runbook

## System Overview

The Front Desk module provides tamper-evident task management with cryptographic integrity checking. It transforms raw ideas into structured, trackable work items while maintaining a complete audit trail.

## Data Flow

```
Raw Ideas → Intake → Triage → Structured Tasks → Evidence Log
```

- **Source of truth**: `front-desk/intake.md` → triage → `front-desk/log.jsonl` (JSON Lines)
- **Integrity**: Append-only + SHA-256 chained hashes 
- **Reports**: Auto-generated weekly summaries in `reports/week-XX.md`
- **Governance**: Decision log embedded in JSON events (CSF 2.0 Govern function)

## Daily Operations

### Start Work Session
```bash
./scripts/work_session.sh    # Includes marriage protection
```

### Manual Daily Loop (20-minute cap)
```bash
./scripts/daily_loop.sh      # Triage + verify + report
```

### Check Integrity
```bash
python3 scripts/verify_log.py front-desk/log.jsonl
# Expected: "OK N entries: chain verified"
```

### Generate Weekly Report
```bash
python3 scripts/make_weekly_report.py
# Creates: reports/week-XX.md
```

## File Structure

```
front-desk/
├── intake.md           # Raw bullet list of ideas
├── triage.md          # Structured T-XXXX table
├── log.jsonl          # Tamper-evident event log
└── policy.md          # Governance rules

scripts/
├── daily_loop.sh      # Main 20-minute routine
├── triage.py          # Intake → triage processor
├── verify_log.py      # Hash chain validator
└── make_weekly_report.py  # Weekly summary generator

reports/
└── week-XX.md         # Auto-generated summaries
```

## Integrity Verification

### Hash Chain Structure
Each log entry contains:
- `hash`: SHA-256 of canonical JSON (excluding hash field)
- `prev_hash`: Hash of previous entry (empty string for first entry)
- Standard fields: `ts`, `type`, `id`, `status`, `src`, `note`

### Verification Process
1. **Daily**: Automatic verification in `daily_loop.sh`
2. **Manual**: Run `python3 scripts/verify_log.py front-desk/log.jsonl`
3. **Git**: Optional `git fsck --full` for repository integrity

### Tamper Detection
- Any modification to past entries breaks the hash chain
- Verification fails immediately with exact line number
- System stops processing until integrity is restored

## Troubleshooting

### Broken Hash Chain
```bash
# Error: "hash mismatch at line X"
# 1. Identify corruption source
# 2. Restore from git backup: git checkout HEAD~1 -- front-desk/log.jsonl
# 3. Re-run verification
```

### Missing Files
```bash
# Reinitialize from scratch
echo "# Intake — Front Desk" > front-desk/intake.md
echo "We help neighbors, one small fix at a time." >> front-desk/intake.md
touch front-desk/log.jsonl
```

### Performance Issues
- Log files >10MB: Consider archival/rotation
- Verification slow: Check for binary data in JSON fields
- Git repo large: Use `git gc --aggressive`

## Security Properties

### Cryptographic Guarantees
- **Append-only**: Cannot modify past without detection
- **Non-repudiation**: Timestamp + hash provides evidence
- **Integrity**: SHA-256 chain prevents silent corruption
- **Auditability**: Complete event history preserved

### Threat Model
- **Protects against**: Accidental corruption, malicious editing, data loss
- **Does not protect**: Against entire file deletion, system compromise
- **Mitigation**: Git versioning + regular backups

## Governance Integration

### Decision Logging (CSF 2.0 Govern Function)
Add governance events to log:
```json
{
  "ts": "2025-08-22T21:00:00Z",
  "type": "decision",
  "decision": "changed triage threshold from 5 to 10 items",
  "rationale": "reducing noise in weekly reports",
  "authority": "operator",
  "prev_hash": "...",
  "hash": "..."
}
```

### Policy Enforcement
- 20-minute daily time cap (enforced by `daily_loop.sh`)
- Maximum 10 items per triage session (enforced by `triage.py`)
- Weekly reporting requirement (enforced by Marriage Protection)
- Hash chain verification before processing (fail-safe)

## Integration Points

### Future Modules
- **Customer Module**: Query `type: "customer"` events for response tracking
- **Reliability Module**: Add `type: "incident"` events to same log
- **Finance Module**: Tag events with `billable: true` for cost tracking
- **Scale Module**: Multi-operator coordination via git branches

### External Systems
- **Git**: Repository integrity + versioning
- **Cron/Task Scheduler**: Automated daily execution
- **Marriage Protection**: Work hour enforcement
- **CI/CD**: Optional integrity checking in workflows

## Success Metrics

### Daily
- Daily loop executed: `<20 minutes`
- Hash chain verified: `OK N entries`
- Items processed: `≥1 per day`

### Weekly  
- Active days: `≥5/7`
- Total events: `≥10`
- Integrity failures: `0`

### 14-Day Gate
- Usage compliance: `≥12/14 days`
- Data quality: `Zero broken JSONL lines`
- Marriage protection: `Wife satisfaction maintained`

---

**Principle**: Preserve evidence, maintain integrity, respect time boundaries.