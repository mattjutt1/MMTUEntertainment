# Branch Protection Configuration for Security Gates

This guide shows how to configure GitHub branch protection rules to make security gates **required** for merging to main.

## 🎯 Goal

Make security gates **required checks** so PRs cannot merge unless:
- ✅ SAST scan passes (no HIGH/CRITICAL new findings)
- ✅ Secrets scan passes (no secrets detected) 
- ✅ SBOM scan passes (no HIGH/CRITICAL vulnerabilities)
- ✅ ZAP scan passes (when triggered)

## 🔧 Required Status Checks

Based on our workflows, configure these **exact** check names:

### Critical Required Checks (Always Required)
```
site-e2e-smoke (chromium)
ai-guardrails
```

### Security Gates (Additional Required)  
```
SAST Scan
Secrets Scan  
SBOM & Dependency Scan
```

### Conditional Gates (Auto-skip when not applicable)
```
ZAP Baseline Scan
```

### Individual Gate Jobs (Alternative Configuration)
If you prefer granular control, require these specific job names:
```
sast
secrets
sbom
zap
```

## 📋 Step-by-Step Setup

### Option 1: GitHub Web UI (Recommended)

1. **Navigate to Branch Protection**
   - Go to repository → Settings → Branches
   - Click "Add rule" or edit existing rule for `main`

2. **Configure Protection Rules**
   ```
   ☑️ Require a pull request before merging
   ☑️ Require approvals: 1 (or your team preference)
   ☑️ Require status checks to pass before merging
   ☑️ Require branches to be up to date before merging
   ```

3. **Add Required Status Checks**
   In the "Status checks found in the last week" section, select:
   ```
   ☑️ site-e2e-smoke (chromium)
   ☑️ ai-guardrails
   ☑️ SAST Scan
   ☑️ Secrets Scan
   ☑️ SBOM & Dependency Scan
   ☑️ ZAP Baseline Scan (optional - auto-skips)
   ```

4. **Additional Recommended Settings**
   ```
   ☑️ Require conversation resolution before merging
   ☑️ Include administrators (enforce rules on admins)
   ☑️ Allow force pushes: ❌ (disabled)
   ☑️ Allow deletions: ❌ (disabled)
   ```

### Option 2: GitHub CLI (Scripted)

```bash
# Set branch protection with required checks
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"checks":[
    {"context":"site-e2e-smoke (chromium)"},
    {"context":"ai-guardrails"},
    {"context":"SAST Scan"},
    {"context":"Secrets Scan"},
    {"context":"SBOM & Dependency Scan"},
    {"context":"ZAP Baseline Scan"}
  ]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

### Option 3: Terraform (Infrastructure as Code)

```hcl
resource "github_branch_protection" "main" {
  repository_id = var.repository_name

  pattern          = "main"
  enforce_admins   = true
  allows_deletions = false

  required_status_checks {
    strict = true
    checks = [
      "site-e2e-smoke (chromium)",
      "ai-guardrails", 
      "SAST Scan",
      "Secrets Scan", 
      "SBOM & Dependency Scan",
      "ZAP Baseline Scan"
    ]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    require_code_owner_reviews     = true
    dismiss_stale_reviews          = true
  }
}
```

## ✅ Validation Steps

After configuring branch protection, validate the setup:

### 1. Test with Clean PR (Should Pass)
```bash
# Create clean PR with docs changes only  
git checkout -b test-clean-pr
echo "Test change" >> README.md
git add README.md
git commit -m "docs: test clean PR"
git push origin test-clean-pr
gh pr create --title "Test Clean PR" --body "Should pass all security gates"
```

**Expected Result**: ✅ All checks pass or skip appropriately

### 2. Test with Security Issues (Should Block)
```bash
# Use our test script
./test-security-gates/test-gates.sh
```

**Expected Result**: ❌ PR blocked due to failing required checks

### 3. Verify Required Checks
```bash
# Check current branch protection status
gh api repos/:owner/:repo/branches/main/protection | jq '.required_status_checks'
```

**Expected Output**:
```json
{
  "strict": true,
  "checks": [
    {"context": "site-e2e-smoke (chromium)"},
    {"context": "ai-guardrails"},
    {"context": "SAST Scan"},
    {"context": "Secrets Scan"},
    {"context": "SBOM & Dependency Scan"},
    {"context": "ZAP Baseline Scan"}
  ]
}
```

## 🔍 Troubleshooting

### Check Names Don't Appear
**Problem**: Status checks not showing in branch protection UI

**Solutions**:
1. Run workflows at least once so GitHub discovers the check names
2. Create a test PR to trigger workflows: `./test-security-gates/test-gates.sh`
3. Wait 5-10 minutes after workflow completion
4. Refresh branch protection settings page

### Checks Always Pending
**Problem**: Required checks show as "Pending" and never complete

**Solutions**:
1. Verify workflow triggers match your PR patterns
2. Check workflow file syntax: `actionlint .github/workflows/security-gates.yml`
3. Ensure no workflow-level `paths` filters (use job-level `if:` instead)
4. Check workflow permissions are correct

### False Positives Blocking PRs
**Problem**: Security gates failing on acceptable issues

**Solutions**:
1. Configure allowlists:
   - Gitleaks: Update `.gitleaks.toml`
   - ZAP: Update `.zap/rules.tsv`
   - Semgrep: Add `# nosemgrep` comments for false positives
2. Adjust severity thresholds in workflow if needed

### Emergency Bypass
**Problem**: Need to merge during security tool outage

**Solutions**:
1. **Preferred**: Temporarily disable specific failing check in branch protection
2. **Admin Override**: Use administrator bypass (if enabled)
3. **Emergency**: Temporarily disable branch protection (restore immediately after)

## 📊 Monitoring and Metrics

### Success Metrics
- **Block Rate**: 100% of HIGH/CRITICAL findings block PRs
- **False Positive Rate**: <5% (manageable through allowlists)
- **Developer Experience**: Clear error messages, <10min scan time
- **Compliance**: All PRs have security evidence before merge

### GitHub Security Dashboard
After setup, monitor via:
- Repository → Security → Code scanning alerts
- Repository → Insights → Pulse (shows blocked PRs)
- Organization → Security (enterprise view)

### Workflow Metrics
```bash
# View security gate success/failure rates
gh run list --workflow security-gates.yml --limit 50 \
  --json status,conclusion,displayTitle \
  --jq '.[] | {title: .displayTitle, status: .status, conclusion: .conclusion}'
```

## 🚨 Emergency Procedures

### Security Incident Response
If security gates detect real threats:

1. **Immediate**: PR automatically blocked - no action needed
2. **Investigation**: Review findings in GitHub Security tab
3. **Remediation**: Fix issues before re-pushing
4. **Documentation**: Record incident in security log
5. **Process Review**: Update security gates if needed

### Tool Maintenance
- **Weekly**: Review security gate metrics and false positives  
- **Monthly**: Update tool configurations and rules
- **Quarterly**: Review and update required checks list

---

## 📋 Final Checklist

Before deploying to production:

- [ ] Branch protection configured for `main` branch
- [ ] All security gates set as required checks
- [ ] Test PR successfully blocked by security issues
- [ ] Clean PR successfully passes all gates  
- [ ] Security team can bypass via allowlists when needed
- [ ] Documentation updated with emergency procedures
- [ ] Team trained on new security gate process

## 🎯 Success Criteria

When complete, you can **prove** security by:

✅ **No secrets leak**: Gitleaks blocks any credential exposure  
✅ **No critical vulnerabilities**: Semgrep blocks dangerous code  
✅ **No vulnerable dependencies**: SBOM scanning blocks known CVEs  
✅ **Web security baseline**: ZAP scanning catches common vulnerabilities  
✅ **Supply-chain integrity**: Attestations prove build provenance  
✅ **Governance enforced**: CODEOWNERS ensures security review  

**Result**: "Secure" is now **provable**, not just promised.