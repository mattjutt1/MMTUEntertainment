# GPT-5 Analysis Request: E2E Test Failure Investigation

<context_type>ci_cd_debugging</context_type>
<reasoning_effort>high</reasoning_effort>
<verbosity>comprehensive</verbosity>

## Task Overview

**Critical Issue**: Site E2E Smoke Tests (≤3min) are failing and blocking docs-only PR merges, indicating systemic problems with our CI gate logic.

**Your Mission**: Use your full analytical capabilities, code analysis tools, structured reasoning, and thinking mode to identify root causes and provide actionable solutions.

## Problem Statement

### Current Failure
- **PR**: #49 (docs-only: adds `docs/phase-4-plan.md`)
- **Expected**: Should trigger `smoke-docs-noop` (no E2E tests)
- **Actual**: Full E2E tests ran and FAILED at 3m10s (exceeded 3min timeout)
- **Impact**: Blocks merge of documentation changes

### Critical Questions
1. **Why did docs-only change trigger full E2E tests?**
2. **What caused the 3m10s timeout (vs typical 58s-2m runtime)?**
3. **Is the path filter logic in `.github/workflows/site-e2e-smoke.yml` broken?**
4. **Are there infrastructure/dependency issues causing slowdown?**

## Context & Evidence

### Repository Structure
```yaml
Repository: mattjutt1/MMTUEntertainment
Branch Protection: main
Required Checks:
  - "Site E2E Smoke Tests (≤3min)" 
  - "check" (Prompt Contract Lint)
```

### Workflow Configuration
**File**: `.github/workflows/site-e2e-smoke.yml`

<workflow_analysis>
Key Logic Points:
1. **detect** job uses `dorny/paths-filter@v3`
2. **Path Filters**:
   ```yaml
   site:
     - 'products/site/**'
     - '.github/workflows/site-e2e-smoke.yml'
     - '!archive/**'
   docs_only:
     - 'docs/**'
     - '*.md'
     - '.cspell.json'
     - '.lycheeignore'
     - '.lychee.toml'
   ```
3. **Job Conditions**:
   - `smoke`: `if: needs.detect.outputs.site_changed == 'true'`
   - `smoke-docs-noop`: `if: needs.detect.outputs.docs_only == 'true' && needs.detect.outputs.site_changed != 'true'`
   - `smoke-noop`: `if: needs.detect.outputs.site_changed != 'true' && needs.detect.outputs.docs_only != 'true'`

**Question**: Should `docs/phase-4-plan.md` trigger `docs_only: true`?
</workflow_analysis>

### Failed Run Evidence
```json
{
  "run_id": "17146765003",
  "job_name": "Site E2E Smoke Tests (≤3min)",
  "conclusion": "CANCELLED", 
  "duration": "3m10s",
  "status": "BLOCKED",
  "url": "https://github.com/mattjutt1/MMTUEntertainment/actions/runs/17146765003/job/48644495428"
}
```

### Recent Successful Runs (for comparison)
- **PR #46**: 58s runtime, PASSED
- **Previous gate verification**: Consistently under 3min

### File Changes in PR #49
```bash
# Only file changed:
docs/phase-4-plan.md (new file, 1,077 bytes)

# No site/ changes
# No workflow changes  
# Pure documentation addition
```

## Analysis Framework

### 1. Workflow Logic Analysis
<structured_analysis>
**Use your code analysis capabilities to:**

1. **Examine Path Filter Logic**:
   - Analyze if `docs/phase-4-plan.md` should match `docs/**` pattern
   - Check for any regex/glob issues in filter configuration
   - Verify `dorny/paths-filter@v3` behavior with new files

2. **Conditional Logic Review**:
   - Trace through the if-conditions for each job
   - Identify potential logical gaps or overlaps
   - Check for race conditions or dependency issues

3. **Compare with Working PRs**:
   - Analyze why PR #46 (whitespace in README.md) worked correctly
   - Identify differences in path patterns or file types
</structured_analysis>

### 2. Performance Investigation
<performance_analysis>
**Use your reasoning capabilities to investigate:**

1. **Timeout Root Cause**:
   - Why 3m10s vs typical 58s-2m runtime?
   - Infrastructure issues (GitHub Actions runner performance)?
   - Dependency installation delays?
   - Test execution slowdown?

2. **Smoke Test Configuration**:
   - Review `products/site/playwright.smoke.ts` configuration
   - Check for recent changes affecting test performance
   - Analyze timeout settings and retry logic

3. **Resource Constraints**:
   - GitHub Actions runner capacity issues?
   - Network latency affecting npm installs?
   - Browser automation delays?
</performance_analysis>

### 3. Systematic Debugging
<debugging_approach>
**Use your structured problem-solving to:**

1. **Reproduce Issue Logic**:
   - Simulate the path filter evaluation locally
   - Test filter patterns against `docs/phase-4-plan.md`
   - Validate conditional expressions

2. **Isolation Testing**:
   - Identify minimal test case to reproduce failure
   - Separate path filtering from test execution issues
   - Test individual workflow jobs

3. **Historical Analysis**:
   - Compare recent workflow runs for pattern changes
   - Identify when the issue first appeared
   - Correlate with recent repository changes
</debugging_approach>

## Required Deliverables

### 1. Root Cause Analysis
<output_format>
{
  "primary_cause": "string",
  "contributing_factors": ["array of factors"],
  "confidence_level": "high|medium|low",
  "evidence": ["supporting evidence"]
}
</output_format>

### 2. Fix Recommendations
**Provide specific, actionable solutions**:

1. **Immediate Fix** (unblock current PR):
   - Exact commands or configuration changes
   - Risk assessment and rollback plan
   - Timeline for implementation

2. **Long-term Solution**:
   - Prevent recurrence 
   - Improve workflow robustness
   - Add monitoring/alerting

### 3. Workflow Improvements
**Suggest enhancements**:
- Better path filtering logic
- Timeout handling improvements  
- Debugging/observability additions
- Test performance optimizations

## Analysis Tools at Your Disposal

### Code Analysis
- **Static analysis** of workflow YAML
- **Pattern matching** for path filters
- **Logic flow tracing** through conditionals

### Structured Reasoning
- **Multi-step problem decomposition**
- **Hypothesis generation and testing**
- **Evidence correlation and synthesis**

### Performance Analysis
- **Bottleneck identification** in CI pipeline
- **Resource utilization** assessment
- **Timing analysis** of workflow steps

### Systems Thinking
- **Dependency mapping** between components
- **Failure mode analysis** 
- **Risk assessment** of proposed changes

## Success Criteria

1. **Identify exact cause** of path filter malfunction
2. **Provide working fix** for docs-only PR blocking
3. **Prevent future occurrences** with improved logic
4. **Maintain ≤3min performance** for legitimate E2E runs
5. **Preserve security** of branch protection gates

## Context for Your Analysis

### Repository Health
- **Foundation-first development** approach
- **Revenue-critical** E2E testing (protects ARR)
- **Developer velocity** focus (≤3min smoke tests)
- **16 stale PRs recently cleaned** up for focus

### Constraints
- **Must maintain** branch protection enforcement
- **Cannot break** existing working E2E functionality  
- **Should preserve** docs-only optimization
- **Must be** backward compatible

---

**GPT-5, please use your full analytical capabilities to thoroughly investigate this issue. Your structured reasoning and code analysis tools are essential for identifying the subtle workflow logic bug that's causing docs-only changes to trigger full E2E test suites.**

<collaboration_request>
Expected output: Comprehensive analysis with root cause, immediate fix, and long-term recommendations using your reasoning_effort=high capabilities.
</collaboration_request>