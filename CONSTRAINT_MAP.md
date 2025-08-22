# CONSTRAINT → SOLUTION MAPPING

## THE PROBLEMS THIS SYSTEM SOLVES

| Problem | Constraint | Solution | Evidence |
|---------|------------|----------|----------|
| **"I'll start after I find the perfect tool"** | $0 cost, plain files only | No tool shopping possible | Works with text editor + bash |
| **"I need to research more first"** | 70% decision rule | Act with partial info, log unknowns | Unknowns go to intake.md |
| **"This isn't the real beginning"** | START.yml timestamp | Objective, falsifiable start point | UTC timestamp in git history |
| **"The system is too complex"** | 5 files maximum | Entire system fits in head | `ls` shows complete system |
| **"I should optimize this first"** | No redesign until Day 14 | Forces usage over perfection | Count metrics only |
| **"I need better infrastructure"** | No external accounts/CI | Local text files, works offline | Evidence in log.jsonl |
| **"I don't have enough time"** | 20-minute daily sessions | Sustainable, non-overwhelming | Timer enforces stop |
| **"I'm not making progress"** | Timestamped evidence | Objective proof of work | log.jsonl entry count |

## CONSTRAINT ENFORCEMENT MECHANISMS

### Financial Constraint ($0)
```
Temptation: "Maybe I should try Notion/Asana/Todoist"
Block: No budget allocated
Redirect: Add idea to intake.md instead
```

### Time Constraint (20 min)
```
Temptation: "Let me perfect this first"
Block: Timer stops session at 20:00
Redirect: Imperfect work still counts
```

### File Constraint (5 files)
```
Temptation: "I need a better organization system"
Block: Cannot create new files until Day 14
Redirect: Use existing files differently
```

### Format Constraint (plain text)
```
Temptation: "I should build a dashboard"
Block: No tools/services allowed
Redirect: Counts in week-01.md sufficient
```

### Decision Constraint (70% rule)
```
Temptation: "I need more information"
Block: Must act with partial knowledge
Redirect: Unknowns become intake items
```

## THE CONSTRAINT CASCADE

```
$0 Budget
  ↓
No external tools/services
  ↓  
Plain text files only
  ↓
Local evidence/timestamps
  ↓
Objective beginning possible
  ↓
No "perfect setup" delay
  ↓
Start immediately
```

## PSYCHOLOGICAL MAPPING

| Mental State | Triggered By | Constraint Response |
|--------------|--------------|-------------------|
| Analysis paralysis | Too many options | $0 budget = no options |
| Perfectionism | Unlimited time | 20-minute hard stop |
| Tool obsession | "Better way" thoughts | Plain text only |
| Imposter syndrome | "Not real work" | Timestamped evidence |
| Overwhelm | Complex systems | 5-file maximum |
| Procrastination | Setup requirements | Works immediately |

## VALIDATION TESTS

Each constraint passes these tests:

### $0 Cost Test
- ✅ Can you start without spending money? YES
- ✅ Can you continue without recurring costs? YES
- ✅ Does it work with built-in tools only? YES

### Objective Beginning Test  
- ✅ Can someone else verify when you started? YES (START.yml)
- ✅ Is the start time falsifiable? YES (timestamp exists or doesn't)
- ✅ Can you move/rename the start marker? NO (contract forbids)

### Tiny Surface Test
- ✅ Can you list all files from memory? YES (5 files)
- ✅ Can you explain the system in 2 minutes? YES
- ✅ Are there <10 decision points total? YES

### Evidence Test
- ✅ Does every action leave a trace? YES (log.jsonl)
- ✅ Can progress be measured objectively? YES (counts)
- ✅ Will evidence survive tool changes? YES (plain text)

## ESCAPE VELOCITY CALCULATION

**Without constraints**: Infinite research/setup time → Never start  
**With constraints**: 30-minute setup → 14 days of evidence → Proven system

```
Traditional Approach:
Research (weeks) → Setup (days) → Optimization (months) → Usage (never)

Constraint Approach:  
START.yml (1 min) → Daily loops (20 min × 14) → Evidence (measurable)
```

The constraints don't limit you—they're the only reason you start at all.

---

**Key insight**: Every constraint eliminates a way to avoid beginning.