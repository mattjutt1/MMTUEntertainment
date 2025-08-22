# MMTU Governance Refactor — Ultra-Think Plan (Zero-Mess)

**Investment Discipline Integration for Maximum ARR, Minimum Risk**

---

## Executive Snapshot

• **Current state**: Clean CI baseline with smoke tests ≤3min, branch protection active, but no governance framework for business decisions  
• **Key constraint**: ≤3 active bets concentration rule not enforced; risk of scattered focus diluting ARR/retention gains  
• **Biggest downside risk**: Orphan governance artifacts creating maintenance debt without business impact  
• **Fastest business wins**: (1) PR template forcing asymmetric bet framing = immediate decision quality, (2) Weekly digest = accountability loop  
• **Asymmetric bet structure**: Downside capped at ~2 dev-days implementation + maintenance overhead; 10× upside via systematic decision discipline improving conversion/retention  
• **Margin of safety**: All changes reversible via git revert; existing CI/smoke infrastructure preserved; no breaking changes to main workflows  
• **Circle of competence**: Leverages existing CI/GitHub/documentation patterns; avoids complex business logic or database changes  
• **10× upside path**: Systematic bet evaluation → better resource allocation → higher conversion rates → sustained ARR growth via compound decision quality

---

## Phase Plan (0→4) with Acceptance Checks

### Phase 0: Baseline Audit
**Goals**: Establish clean foundation, inventory technical debt  
**Risks**: Discovering major orphan cleanup blocking governance rollout  
**Mitigation**: Time-box audit to 1 day; defer non-critical orphan cleanup  

**Acceptance checks**: 
- Smoke job passes in <3min
- CI green on current branch  
- Orphan inventory generated with count ≤20 items

**Done criteria**: Binary pass/fail on smoke + orphan count documented

### Phase 1: Governance Refactor  
**Goals**: Install core governance artifacts and enforcement  
**Risks**: PR template changes breaking existing workflows  
**Mitigation**: Preserve existing template structure; add sections only  

**Acceptance checks**:
- PR template renders correctly in GitHub UI
- `docs/pivot-rules.md` validates against business targets (≤3 bets, 4-week cycles)
- Prompts reference Pabrai principles explicitly

**Done criteria**: Test PR shows new template blocks; pivot rules file exists; prompts updated

### Phase 2: Operationalization
**Goals**: Automate governance enforcement via workflows and boards  
**Risks**: GitHub API permissions failing for project board access  
**Mitigation**: Test API access first; fallback to manual board tracking  

**Acceptance checks**:
- Weekly digest workflow runs without errors
- Project board query returns ≤3 active items
- Workflow produces artifact with decisions summary

**Done criteria**: Workflow green + artifact downloadable + board count ≤3

### Phase 3: Validation
**Goals**: Prove governance system operational end-to-end  
**Risks**: Integration gaps between template/workflow/board  
**Mitigation**: Full test cycle with real PR and workflow execution  

**Acceptance checks**:
- Test PR blocks until asymmetric bet section completed
- Digest workflow artifact contains expected sections
- Board CLI query returns structured JSON with active count

**Done criteria**: All validation commands pass with expected outputs

### Phase 4: Extension Gates
**Goals**: Future-proof governance for new feature development  
**Risks**: Governance becoming bureaucratic overhead vs business enabler  
**Mitigation**: Keep rules simple; focus on decision quality not process volume  

**Acceptance checks**:
- New feature PRs automatically inherit bet framing requirements
- Kill/scale reviews scheduled every 4 weeks
- Circle of competence violations flagged in code review

**Done criteria**: Documentation updated with extension patterns; review cycles scheduled

---

## Work Graph & Ordering Constraints

### Critical Path Dependencies
```
baseline_audit → governance_artifacts → operationalization → validation → extension_gates
```

### Parallel Execution Opportunities
- PR template + pivot rules (both doc changes, no CI contention)
- Prompt updates (can run parallel to template work)
- Orphan audit script + weekly digest workflow (different file paths)

### CI Concurrency Notes
- All doc changes trigger documentation CI only
- Script additions may trigger TypeScript/lint checks
- Workflow additions trigger workflow validation
- No paths-filter conflicts expected (governance vs product code)

### Prerequisites
- Orphan audit → CI guard implementation
- PR template → test PR creation
- Weekly digest → project board API permissions
- Board enforcement → CLI access setup

---

## Planned Artifacts & Unified Diffs

### `.github/pull_request_template.md` additions
**Rationale**: Force asymmetric bet thinking at PR creation time

```diff
## Code Quality
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally

+## Asymmetric Bet Analysis
+- [ ] **Downside cap**: What's the worst realistic outcome and its cost?
+- [ ] **Upside path**: How could this create 10× value? Timeline?
+- [ ] **Kill rule**: Objective criteria to abandon this bet (≤4 weeks)
+- [ ] **Circle of competence**: Does this leverage our core strengths?
+
+## Financial Safety
+- [ ] **Burn impact**: Does this change monthly burn rate? By how much?
+- [ ] **Runway impact**: Effect on months of runway remaining?
+- [ ] **Revenue tie-in**: How does this connect to ARR/conversion/retention?

## Testing
```

### `docs/pivot-rules.md`
**Rationale**: Codify concentration and kill/scale discipline

```markdown
# MMTU Pivot Rules – Pabrai Discipline

## Concentration Principle
- **≤3 active bets** maximum at any time
- Other initiatives parked in "Backlog" status
- Active = receiving development time this 4-week cycle

## Kill/Scale Cycle (Every 4 Weeks)
- Review all active bets for continuation
- Kill: No clear progress toward upside case
- Scale: Strong signals, increase resource allocation
- Park: Promising but not top-3 priority

## Circle of Competence
Core strengths only:
- CI/E2E infrastructure and testing
- Stripe membership integration
- Cloudflare deployment and optimization
- Community/forum development

## Asymmetric Bet Criteria
1. **Downside cap**: Limited to ≤2 weeks development time
2. **Upside potential**: Clear path to 10× business impact
3. **Reversibility**: Can be undone without lasting damage
4. **Learning value**: Generates actionable business intelligence
```

### `.github/workflows/weekly-market-digest.yml`
**Rationale**: Automated accountability and decision tracking

```yaml
name: Weekly Market Digest
on:
  schedule:
    - cron: '0 9 * * 1'  # Monday 9 AM UTC
  workflow_dispatch:

jobs:
  generate-digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate decisions digest
        run: |
          echo "# Weekly Decisions Digest - $(date)" > digest.md
          echo "## Active Bets Status" >> digest.md
          gh project view "Business Action Tracks – 2025H2" --json items | jq '.items[] | select(.status=="Active")' >> digest.md
          echo "## Completed This Week" >> digest.md
          gh project view "Business Action Tracks – 2025H2" --json items | jq '.items[] | select(.status=="Done" and .updatedAt > "'$(date -d '7 days ago' -Idate)'")' >> digest.md
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - name: Upload digest
        uses: actions/upload-artifact@v4
        with:
          name: weekly-digest-${{ github.run_number }}
          path: digest.md
```

### `Prompt-ClaudeCode.md` update
**Rationale**: Enforce Pabrai framing in development workflows

```diff
## Development Principles
- Optimize workflows and isolate Playwright configuration  
- Maintain smoke tests ≤3 minutes
- Use atomic, reversible commits

+## Pabrai Governance Integration
+- Frame all work as asymmetric bets with downside caps
+- Enforce ≤3 active initiatives concentration rule
+- Apply 4-week kill/scale review cycles
+- Stay within circle of competence: CI/E2E, Stripe, Cloudflare, community
```

### `scripts/repo-hygiene/audit-orphans.ts`
**Rationale**: Prevent governance artifacts from becoming technical debt

```typescript
#!/usr/bin/env tsx
import { globSync } from 'glob';
import { readFileSync, existsSync } from 'fs';

const ALLOWLIST = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**'
];

function findOrphans(): string[] {
  const allFiles = globSync('**/*', { ignore: ALLOWLIST });
  const referenced = new Set<string>();
  
  // Check package.json scripts
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  Object.values(pkg.scripts || {}).forEach(script => {
    // Extract file references from script commands
  });
  
  // Check workflow files
  // Check import statements
  // Return orphaned files
  
  return allFiles.filter(file => !referenced.has(file));
}

const orphans = findOrphans();
console.log(`Found ${orphans.length} orphaned files:`);
orphans.forEach(file => console.log(`  ${file}`));

if (orphans.length > 0) {
  process.exit(1);
}
```

---

## Repo Hygiene Protocol (Zero-Mess Guarantee)

### Detection Rules
**Glob patterns**:
- Include: `**/*.{ts,js,md,yml,yaml,json}` 
- Exclude: `node_modules/**`, `.git/**`, `dist/**`, `build/**`, `test-results/**`

**Reference scanning**:
- Package.json scripts section
- GitHub workflow file paths
- Import/require statements in TypeScript/JavaScript
- Markdown link references

**Allowlist exceptions**:
- `README.md` (always keep)
- `.github/ISSUE_TEMPLATE/**` (GitHub defaults)
- `docs/archive/**` (historical reference)

### Decision Rules
- **Keep**: Referenced in active code/configs or explicitly allowlisted
- **Migrate**: Wrong location but should be preserved (move to appropriate directory)
- **Delete**: No references found and not in allowlist

### CI Guard Implementation
```bash
# Add to package.json scripts
"lint:orphans": "tsx scripts/repo-hygiene/audit-orphans.ts"

# Add to CI workflow
- name: Check for orphaned files
  run: pnpm -w run lint:orphans
```

### Evidence Generation
**Pre-change repo map**:
```bash
find . -type f -name "*.ts" -o -name "*.js" -o -name "*.md" | grep -v node_modules | sort > repo-map-before.txt
```

**Post-change validation**:
```bash
find . -type f -name "*.ts" -o -name "*.js" -o -name "*.md" | grep -v node_modules | sort > repo-map-after.txt
diff repo-map-before.txt repo-map-after.txt
pnpm -w run lint:orphans  # Must exit 0
```

---

## Validation Matrix (Commands + Expected Evidence)

| Validation Type | Command | Expected Output |
|----------------|---------|-----------------|
| **Orphan Detection** | `pnpm -w run lint:orphans` | Exit 0, "Found 0 orphaned files" |
| **Smoke Test Integrity** | `pnpm -w run test:e2e:site` | Exit 0, runtime ≤3m, "1 passed" in Chromium |
| **Weekly Digest Generation** | `gh workflow run weekly-market-digest.yml` | "completed" status, artifact "weekly-digest-*" |
| **Board Concentration** | `gh project view "Business Action Tracks – 2025H2" --json items \| jq '.items[] \| select(.status=="Active")' \| wc -l` | Number ≤3 |
| **Branch Protection** | `gh api repos/MMTUEntertainment/MMTUEntertainment/branches/main/protection` | required_status_checks includes smoke job |
| **PR Template** | Create test PR | GitHub UI shows "Asymmetric Bet Analysis" and "Financial Safety" sections |

---

## Sonnet Handoff Pack (≤10-minute Atomic Steps)

### Step 1: Baseline Audit (8 min)
**Branch**: `git checkout -b ops/refactor-pabrai-integration-20250821`  
**Files touched**: None (audit only)  
**Commands**:
```bash
pnpm -w run test:e2e:site  # Verify smoke
find . -name "*.md" -o -name "*.ts" -o -name "*.js" | grep -v node_modules | wc -l  # File count
```
**Expected**: Smoke passes ≤3min, file count documented  
**Commit**: None (audit only)  
**Rollback**: N/A

### Step 2: PR Template Update (7 min)
**Files touched**: `.github/pull_request_template.md`  
**Diff**: Apply the Asymmetric Bet Analysis and Financial Safety sections  
**Commit**: `feat: add Pabrai governance blocks to PR template`  
**Validation**: Create test PR, verify new sections appear  
**Rollback**: `git revert HEAD`

### Step 3: Pivot Rules Creation (5 min)
**Files touched**: `docs/pivot-rules.md`  
**Content**: Full pivot rules document with concentration and kill/scale cycles  
**Commit**: `docs: add pivot rules for bet concentration and kill/scale cycles`  
**Validation**: `test -f docs/pivot-rules.md && grep -q "≤3 active bets" docs/pivot-rules.md`  
**Rollback**: `git rm docs/pivot-rules.md`

### Step 4: Weekly Digest Workflow (9 min)
**Files touched**: `.github/workflows/weekly-market-digest.yml`  
**Content**: Complete workflow with project board integration  
**Commit**: `ci: add weekly market digest automation`  
**Validation**: `gh workflow list | grep "Weekly Market Digest"`  
**Rollback**: `git rm .github/workflows/weekly-market-digest.yml`

### Step 5: Prompt Updates (6 min)
**Files touched**: `Prompt-ClaudeCode.md`, `Prompt-ChatGPT-Task.md`  
**Diff**: Add Pabrai governance integration sections  
**Commit**: `docs: integrate Pabrai principles into assistant prompts`  
**Validation**: `grep -q "asymmetric bets" Prompt-ClaudeCode.md`  
**Rollback**: `git checkout HEAD~1 -- Prompt-*.md`

### Step 6: Orphan Audit Script (10 min)
**Files touched**: `scripts/repo-hygiene/audit-orphans.ts`, `package.json`  
**Script**: Complete orphan detection implementation  
**Package.json addition**: `"lint:orphans": "tsx scripts/repo-hygiene/audit-orphans.ts"`  
**Commit**: `feat: add orphan file detection for repo hygiene`  
**Validation**: `pnpm -w run lint:orphans`  
**Rollback**: `git rm scripts/repo-hygiene/audit-orphans.ts && git checkout HEAD~1 -- package.json`

### Step 7: Integration Test (8 min)
**Files touched**: None (testing only)  
**Commands**:
```bash
# Test PR template
hub pull-request -d -m "Test governance integration"
# Test workflow
gh workflow run weekly-market-digest.yml
# Test board query
gh project view "Business Action Tracks – 2025H2" --json items | jq '.items[] | select(.status=="Active")' | wc -l
```
**Expected**: PR shows new sections, workflow runs, board query returns ≤3  
**Commit**: None  
**Rollback**: Close test PR

### Concurrency Notes
- Steps 2-5 can run in parallel (different file paths)
- Step 6 requires package.json lock (sequential after others)
- CI paths-filter: docs changes trigger docs CI, workflows trigger workflow validation

---

## Risk Register & Kill/Scale Triggers

### Top 5 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **GitHub API permissions fail** for project board queries | Medium | Manual board tracking fallback |
| **PR template changes break existing workflows** | High | Preserve all existing sections, add only |
| **Weekly digest workflow timeout/failure** | Low | Simple artifact generation, no complex logic |
| **Orphan audit false positives** | Medium | Conservative allowlist, manual review before delete |
| **Branch protection misconfiguration** | High | Test with non-main branch first |

### 4-Week Kill/Scale Rules

**Kill triggers** (abandon governance rollout):
- PR template adoption <50% after 4 weeks
- Weekly digest workflow fails >3 consecutive times
- Board query automation requires >10min manual setup
- Zero business impact measurable (no decision quality improvement)

**Scale triggers** (increase investment):
- PR bet framing improves decision speed by >20%
- Weekly digest enables faster pivot decisions
- Board concentration rule demonstrably improves focus
- Clear ARR/conversion improvement attributable to better decisions

---

## Decision Log

| Decision | Why Now | Options Considered | Chosen | Owner & Next Steps | Success Criteria |
|----------|---------|-------------------|---------|-------------------|------------------|
| **PR template governance** | Force bet thinking at creation time | A) Post-merge review<br/>B) Manual checklist<br/>C) Template automation | C - Template automation | Sonnet implementation → Test PR validation | New sections appear in GitHub UI |
| **≤3 bet concentration** | Prevent resource scatter reducing conversion | A) No limit<br/>B) 5 bet limit<br/>C) 3 bet limit | C - Maximum focus | Board automation → CLI query setup | `gh project` query returns ≤3 active |
| **Weekly digest automation** | Accountability without overhead | A) Manual weekly review<br/>B) Automated digest<br/>C) No systematic review | B - Automated accountability | Workflow creation → Artifact validation | Monday workflow runs, produces artifact |
| **Orphan audit tooling** | Prevent governance debt accumulation | A) Manual cleanup<br/>B) Automated detection<br/>C) No cleanup | B - Systematic prevention | Script implementation → CI integration | `pnpm lint:orphans` exits 0 |
| **4-week kill/scale cycles** | Systematic bet evaluation discipline | A) Monthly<br/>B) Quarterly<br/>C) 4-week cycles | C - Rapid iteration | Documentation → Calendar scheduling | Pivot decisions every 4 weeks |

---

**Investment Thesis**: This governance refactor represents a classic asymmetric bet—minimal downside (2 dev-days + light maintenance), maximum upside (systematic decision discipline driving ARR growth). By applying Pabrai's concentration principle (≤3 active bets) and kill/scale discipline (4-week cycles), we cap scattered focus while preserving optionality for high-impact initiatives.

**Margin of Safety**: All changes are reversible, preserve existing CI infrastructure, and require no breaking changes to core workflows. The governance system enhances rather than replaces existing development practices.

**Circle of Competence**: Leverages proven GitHub/CI/documentation patterns already mastered by the team, avoiding complex business logic or database modifications that could introduce risk.