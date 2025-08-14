# /execute-and-report

**Command**: `/execute-and-report`
**Category**: Meta & Orchestration
**Purpose**: Task execution with structured evidence logging and feedback reporting
**Wave-enabled**: false
**Performance-profile**: standard

## Description

Execute accepted tasks in ≤10 minute incremental steps with structured evidence logging and feedback reporting to ChatGPT-5.

## Workflow

1. **PLAN**: Break down task into ≤10 minute executable steps
2. **EXECUTE**: Implement steps with evidence collection
3. **REPORT**: Log evidence to `.orchestrator/runlog.jsonl` and append feedback to `docs/journal/YYYY-MM-DD.md`

## Evidence Logging

### JSONL Format (`.orchestrator/runlog.jsonl`)
```json
{"timestamp": "2025-01-14T12:34:56Z", "task": "task_description", "status": "completed|blocked|in_progress", "evidence": ["file_changes", "test_results"], "duration_minutes": 8, "next_step": "description"}
```

### Journal Format (`docs/journal/YYYY-MM-DD.md`)
```markdown
## Task: [Brief Description] - [HH:MM]
**Status**: ✅ Completed | ⚠️ Blocked | 🔄 In Progress
**Duration**: Xm
**Changes**: file1.js, file2.ts
**Evidence**: Tests pass, feature working
**Next**: [Next logical step]
```

## Integration

- References: `README_Infrastructure_Mode.md > Feedback Loop`
- Logging: `.orchestrator/runlog.jsonl` (structured)
- Journal: `docs/journal/YYYY-MM-DD.md` (human-readable)
- Feedback: ChatGPT-5 summary with diffs/paths/blockers

## Usage

```bash
/execute-and-report [task_description]
```

Task will be executed with automatic evidence collection and reporting to both structured logs and daily journal.