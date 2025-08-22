# Developer Guidance - Phase 5 Throughput & Velocity

## Overview
Phase 5 introduces CI optimizations and streamlined merge flows to improve developer velocity while maintaining security and quality gates.

## Key Changes (Post PR #74)

### 🚀 Faster Documentation Updates
**Docs-only PRs now complete in ≤5s** (vs previous ~56s)

**What qualifies as docs-only**:
- Changes to `docs/**`
- `README.md`, `CHANGELOG.md`
- `.cspell.json`, `.lycheeignore`, `.lychee.toml`

**What happens**:
- ✅ Single noop step executes
- ✅ Required check returns SUCCESS  
- ✅ Branch protection satisfied
- ❌ No E2E tests run (unnecessary for docs)

### 🔒 Security Scans (Non-blocking)
**GitLeaks and Semgrep now use `allow-failure`**

**What this means**:
- 🔍 Scans still run and report results
- 📊 SARIF reports still populate Security tab
- ⚠️ Failures don't block emergency merges
- 🚨 Still visible in PR checks (just non-blocking)

**Developer action**: Fix security issues when convenient, but urgent merges aren't blocked.

## Workflow Behavior Guide

### PR Types & Expected Behavior

| Your Changes | Workflow Path | Runtime | E2E Tests | Merge Status |
|--------------|---------------|---------|-----------|--------------|
| **Docs only** (*.md, .cspell.json) | Noop | ≤5s | ❌ Skip | ✅ Fast merge |
| **Site only** (products/site/**) | Full E2E | ~58s | ✅ Run | ✅ Protected |
| **Mixed** (site + docs) | Full E2E | ~115s | ✅ Run | ✅ Protected |
| **Other files** without site changes | Error | ~10s | ❌ Block | ❌ Requires site changes |

### Branch Protection Requirements

**Required Checks** (must be SUCCESS to merge):
- `Site E2E Smoke Tests (≤3min)`
- `Prompt Contract Lint`

**Optional Checks** (don't block merge):
- `GitLeaks Security Scan`
- `SAST Security Scan` (Semgrep)

## Best Practices

### 📝 Documentation Contributions
```bash
# Fast track for docs-only changes
git checkout -b docs/your-improvement
# Edit docs files only
git commit -m "docs: improve developer guidance" 
git push
# PR merges in ~5s after creation
```

### 🔧 Site Development  
```bash
# Always include site changes for non-docs PRs
git checkout -b feature/new-component
# Make your changes to products/site/**
# If you also update docs, that's fine (mixed PR)
git commit -m "feat: add new component with docs"
git push  
# PR runs full E2E tests (~1-2 minutes)
```

### 🚨 Emergency Merges
```bash
# Critical fixes can merge even with security scan failures
git checkout -b hotfix/critical-issue
# Fix the urgent issue
git commit -m "fix: resolve critical production issue"
git push
# Merge immediately - security scans won't block
# Address any security findings in follow-up PR
```

## Troubleshooting

### "Why is my docs-only PR running E2E tests?"
**Check these conditions**:
1. **Ensure PR #74 is merged** (Phase 5 deployment)
2. **Verify changes are truly docs-only** (no site/** files)
3. **Check filter debug output** in workflow logs

**Expected debug output for docs-only PR**:
```yaml
site: false
docs_only: true  
any_changes: true
is_docs_only_pr: true
```

### "Why did my security scan failure block my merge?"
**This shouldn't happen post-Phase 5**. If it does:
1. **Check workflow names** contain "(allow-failure)"
2. **Verify PR #74 changes are deployed**
3. **Report issue** - this is a regression

### "My non-site PR is being blocked"
**This is expected behavior**. You need to either:
1. **Add site changes** to your PR, or
2. **Make it docs-only** by removing non-docs changes, or
3. **Split into separate PRs** (docs-only + site-changes)

## Fast-Track Labels (Future)
*Planned but not yet implemented*:

**`ci:fast-lane`**: Priority processing for small PRs  
**Usage**: Add label for urgent but low-risk changes  
**Effect**: Skip non-essential checks, faster queue processing

## Performance Expectations

### Runtime Targets (Post-Optimization)
- **Docs-only**: ≤5s (95% improvement)
- **Site-only**: ~58s (unchanged)  
- **Mixed**: ~115s (unchanged)
- **Security scans**: Non-blocking (parallel execution)

### CI Efficiency Gains
- **~20% of PRs**: Docs-only (significant time savings)
- **~53s saved** per docs-only PR
- **~18 minutes saved** per 20 PRs (typical sprint)

## Developer Velocity Metrics

### Before Phase 5
- All PRs: ~56s minimum (even docs changes)
- Security failures: Block urgent merges
- Mixed PRs: Risk of accidentally skipping E2E tests

### After Phase 5  
- Docs PRs: ≤5s (19x faster)
- Emergency merges: Security scans don't block
- Mixed PRs: Guaranteed E2E execution (no regression)
- Site PRs: Unchanged performance (maintained quality)

## Migration Notes

### For Existing PRs
**Before PR #74 merge**: All PRs use old logic (slower)  
**After PR #74 merge**: New PRs automatically use optimized paths

### For Reviewers
- **Docs-only PRs**: Fast SUCCESS expected, no E2E artifacts
- **Site/Mixed PRs**: Full E2E results available as before
- **Security findings**: Still visible, just non-blocking

### For Maintainers
- **Branch protection**: Unchanged (same required checks)
- **Security visibility**: Preserved (SARIF + PR checks) 
- **Rollback ready**: `git revert` Phase 5 changes if needed

---

**Questions?** Check `docs/Runbook-Site-E2E.md` for technical details or create an issue for guidance improvements.