# Dashboard Archive Analysis - 2025-08-19

**Goal**: Evaluate stream-overlay-studio/ and portfolio-dashboard/ for archiving

## Safety Probe Results

### ❌ UNSAFE TO ARCHIVE

**stream-overlay-studio**: Referenced in active scripts
- `scripts/repo_audit.mjs:13` - package.json path
- `scripts/repo_audit.mjs:23` - directory reference

**portfolio-dashboard**: Clean (no references found)
- No references in .github/workflows
- No references in scripts
- No references in package.json or pnpm-workspace.yaml

### 🔍 Recent Activity Check (60 days)
- **stream-overlay-studio**: No recent commits
- **portfolio-dashboard**: No recent commits

### 📋 Workspace Status
Both folders are included via `apps/*` in pnpm-workspace.yaml, making them part of the active workspace.

## Decision: **SKIP ARCHIVING**

**Reason**: stream-overlay-studio is actively referenced in repo audit scripts, indicating it's part of the operational infrastructure.

**Recommendation**: 
1. Keep both folders active until script dependencies are resolved
2. Consider updating repo_audit.mjs to remove stream-overlay-studio references if no longer needed
3. Re-evaluate in future cleanup cycles

## Next Steps
- Continue with current archive PR (safer items only)
- Address script dependencies in separate cleanup cycle
- Monitor workspace usage patterns for future decisions

*Safety-first approach: when in doubt, preserve and investigate further*