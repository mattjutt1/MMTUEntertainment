# /action-sweep

**Command**: `/action-sweep`
**Category**: Meta & Orchestration
**Purpose**: Parse chat/journal/runlog to update action registry and publish Action Radar
**Wave-enabled**: false
**Performance-profile**: standard

## Description

Systematically parse communication channels, journal entries, and execution logs to identify actionable tasks, update the action registry, and publish a prioritized "Action Radar" with clear ownership assignments.

## Data Sources

### Primary Sources
- **Runlog**: `.orchestrator/runlog.jsonl` - execution history and evidence
- **Journal**: `docs/journal/YYYY-MM-DD.md` - daily notes and decisions
- **Action Registry**: `docs/action-registry.jsonl` - current task queue

### Secondary Sources
- **NeuroMap**: `neuromap/MMTU-NeuroMap.mmd` - strategic context
- **Project Docs**: `docs/project-mindmap.md`, `docs/milestones.md`
- **Recent Commits**: Git history for context on recent changes

## Processing Logic

### Action Extraction Patterns
- **Explicit Tasks**: "TODO", "ACTION", "NEXT", "IMPLEMENT", "BUILD"
- **Decisions**: "DECIDE", "CHOOSE", "EVALUATE", "RESEARCH"
- **Blockers**: "BLOCKED", "WAITING", "DEPENDENCY", "APPROVAL NEEDED"
- **Opportunities**: "IDEA", "POTENTIAL", "CONSIDER", "EXPLORE"

### Owner Assignment Rules
- **ChatGPT-5**: Strategy, pricing, partnerships, business decisions
- **Claude**: Implementation, technical decisions, system architecture
- **Matthew**: Approvals, credentials, final decisions, external relationships

### Priority Scoring (RICE Framework)
- **Reach**: How many users/customers affected (1-5)
- **Impact**: Magnitude of impact per user (1-5)
- **Confidence**: Certainty of estimates (1-5)
- **Effort**: Implementation complexity (1-5, inverse)
- **Score**: (Reach × Impact × Confidence) / Effort

## Action Registry Format

```jsonl
{"id": "unique_id", "task": "description", "owner": "ChatGPT-5|Claude|Matthew", "priority": "high|medium|low", "rice_score": 85, "status": "open|in_progress|blocked|completed", "created": "2025-01-14T12:00:00Z", "due": "2025-01-21T12:00:00Z", "dependencies": ["other_task_id"], "evidence": ["file_paths", "urls"], "notes": "additional context"}
```

## Action Radar Output

### Top 5 Tasks by Owner
```markdown
# Action Radar - [Date]

## ChatGPT-5 (Strategy & Business)
1. [RICE: 95] Finalize DriftGuard pricing tiers and competitive positioning
2. [RICE: 88] Research partnership opportunities with GitHub Marketplace top apps
3. [RICE: 82] Develop Q1 2025 go-to-market strategy for micro-offers

## Claude (Technical Implementation)  
1. [RICE: 92] Complete DriftGuard monetization infrastructure (Stripe, billing)
2. [RICE: 87] Build micro-offer landing page with conversion optimization
3. [RICE: 79] Implement advanced GitHub App permissions and scoping

## Matthew (Approvals & External)
1. [RICE: 90] Approve final DriftGuard pricing and launch timeline
2. [RICE: 85] Review and approve partnership agreements
3. [RICE: 75] Provide Stripe/payment processing credentials
```

### Risk Dashboard
- **High-Risk Items**: Tasks with dependencies or external blockers
- **Bottlenecks**: Items blocking multiple other tasks
- **Aging Tasks**: Open items >7 days without progress

## Automation Features

### Smart Categorization
- **Revenue Impact**: Direct revenue generation vs. supporting activities
- **Time Sensitivity**: Deadlines, market windows, competitive pressure
- **Resource Requirements**: Development effort, external dependencies, approvals
- **Risk Level**: Implementation complexity, external dependencies, unknowns

### Duplicate Detection
- **Semantic Similarity**: Identify similar tasks across different sources
- **Consolidation**: Merge duplicate tasks with combined context
- **Cross-Reference**: Link related tasks and dependencies

### Progress Tracking
- **Status Updates**: Automatically update task status based on evidence
- **Completion Detection**: Mark tasks complete when evidence shows delivery
- **Blocker Identification**: Flag tasks waiting on dependencies or approvals

## Integration Points

### Communication Channels
- **Runlog Parsing**: Extract completed tasks and evidence
- **Journal Analysis**: Identify new tasks and decisions from daily notes
- **Git History**: Correlate code changes with task completion

### Project Management
- **Milestone Alignment**: Connect tasks to project milestones and deadlines
- **Resource Planning**: Estimate effort and schedule based on task complexity
- **Dependency Management**: Track and resolve task dependencies

### Reporting
- **Weekly Reviews**: Input for weekly operational reviews
- **Executive Dashboard**: High-level progress and risk indicators
- **Team Coordination**: Clear ownership and priority for distributed team

## Usage

```bash
/action-sweep [source] [lookback_days] [output_format]
```

Examples:
```bash
/action-sweep "all" "7" "radar"           # Full sweep, last 7 days, Action Radar output
/action-sweep "runlog" "3" "json"        # Runlog only, last 3 days, JSON format
/action-sweep "journal" "1" "markdown"   # Today's journal, markdown output
```

Systematically processes all action sources to maintain current task registry and provide clear prioritization with ownership assignments.