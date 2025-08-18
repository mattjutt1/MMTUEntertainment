# BANTER_TEMPLATE.md
*Communication Templates for Manager ↔ Claude Collaboration*

## MANAGER → CLAUDE DELEGATION

### Standard Task Assignment
```
MANAGER → CLAUDE

MODE
<reasoning_effort>high</reasoning_effort>
<agent_mode>autonomous</agent_mode>
<persistence>
- Autonomous PM/Ops builder for MMTU Entertainment
- Work until objectives resolved with verifiable evidence
- Document assumptions, self-correct if wrong, do not ask for confirmation
- Stop only when evidence posted in Notion + JSON appended to .orchestrator/runlog.jsonl
</persistence>

ROLE: Senior PM/Ops executor collaborating with Matt (CEO) + GPT-5 (Manager)
DOCTRINE: **Prove it, then scale it.** Until ≥$11,989/mo for 3 months, proven playbooks only.

CONTEXT
- Notion: "MMTU Company OS" → "MMTU Zero-to-One Planner"
- Required DBs: Projects, Experiments, ICP_Interviews, Content_Calendar, Distribution_Partners, Risks, Metrics_Scorecard, Backlog, Weekly_Cadence
- Tools: VS Code ISE + Notion MCP + CLI arsenal

OBJECTIVES (today, no tangents)
[SPECIFIC OBJECTIVES HERE]

STOP CONDITIONS
- Notion permission error → STOP, print "Needs Add connections → <exact page/DB>"
- Otherwise continue autonomously until deliverables complete

EXPECTED REPLY: Plan, Risks/Blocks, Work log, Artifacts, Status, Next steps
```

### Quick Commands
```
/execute [task] --priority [high/med/low] --timeline [timeframe] --revenue-impact [$amount]
/status --component [area] --depth [summary/detailed]
/escalate --issue [description] --urgency [critical/high/med] --context [background]
/audit --scope [databases/files/metrics] --format [json/table/narrative]
```

## CLAUDE → MANAGER REPORTING

### Standard Status Report
```
CLAUDE → MANAGER

EXECUTION REPORT
Response ID: [unique-identifier]

PLAN EXECUTION (≤10 min loop)
**Objective**: [What was accomplished]
**Approach**: [Methodology used]
**Timeline**: [Actual vs estimated time]

RISKS & BLOCKS
**Current Risks**: [Active risks/blockers]
**Mitigation**: [Actions taken]
**Escalation Needed**: [Manager attention required]

WORK LOG
- HH:MM - [Action with details]
- HH:MM - [Tool used and outcome]
- HH:MM - [Validation and results]

ARTIFACTS
**Notion Updates**: [Page/DB]: [URL] - [Changes made]
**Repository**: [File path]: [Changes]
**Evidence**: [Direct URLs to verification]

STATUS: 🟢 Green / 🟡 Yellow / 🟠 Red
NEXT ACTIONS: [What Claude will do] / [Manager review needed]
REVENUE IMPACT: [Direct effect] / [Timeline to revenue] / [Success metrics]
```

### Quick Updates
```
/report --status [green/yellow/red] --completion [%] --blockers [list]
/evidence --notion-url [url] --changes [summary] --validation [method]
/risk --new [description] --severity [1-5] --mitigation [plan]
/revenue --impact [$amount] --timeline [when] --confidence [%]
```

## COMMUNICATION PATTERNS

### Daily Standup Format
**Manager Opens**: "Daily standup - revenue focus. Claude, report yesterday's progress toward $11,989/mo goal."

**Claude Reports**: 
- Completed: [Revenue-impacting work done]
- Today: [Revenue-focused objectives]
- Blockers: [Anything preventing revenue progress]

**Manager Responds**: Priority adjustments, risk mitigation, resource allocation

### Weekly Review Format
**Manager Opens**: "Weekly review - are we on track for $11,989/mo? Revenue status check."

**Claude Reports**:
- Revenue metrics: [Current monthly run rate]
- Experiment results: [What's working/not working] 
- Pipeline status: [Customer/sales progress]
- Risk assessment: [Threats to revenue target]

**Manager Responds**: Strategy adjustments, resource reallocation, escalation decisions

### Escalation Format
**Claude Escalates**: "ESCALATION REQUIRED - [Issue] blocking revenue progress. Manager intervention needed."

**Manager Responds**: Decision, resource provision, or CEO escalation

## DECISION-MAKING PROTOCOLS

### Revenue Impact Assessment
Every task must answer:
1. **Direct Revenue**: How much $ will this generate within 90 days?
2. **Revenue Timeline**: When will revenue impact be measurable?
3. **Success Metrics**: How will we know this worked?
4. **Opportunity Cost**: What revenue are we NOT pursuing instead?

### Priority Matrix
1. **P0 Critical**: Direct revenue generation (customer sales, product delivery)
2. **P1 High**: Revenue enablement (customer discovery, product development)
3. **P2 Medium**: Revenue optimization (conversion improvement, cost reduction)
4. **P3 Low**: Revenue support (documentation, process improvement)

### Quality Gates
Before any deliverable is marked complete:
1. Revenue impact quantified and positive
2. Evidence documented in Notion with URLs
3. Risks identified with mitigation plans
4. Next actions defined with owners
5. Success metrics established
6. Timeline confirmed

---
*Use these templates for all Manager ↔ Claude communication to maintain focus on $11,989/mo revenue goal.*