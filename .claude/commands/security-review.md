---
name: security-review
description: Make all security gates green on current PR
---

# Security Review Gates

## Scope
Make all gates green on current PR:
- Update Semgrep (native config) + Gitleaks actions
- Annotate findings in PR  
- Re-run workflows and summarize residual issues

## Security Tools Integration

### 1. Semgrep Configuration
- Update .semgrep.yml with latest security rules
- Configure custom rules for our tech stack
- Set severity thresholds and exclusions

### 2. Gitleaks Setup
- Configure .gitleaks.toml for secret detection
- Set up pre-commit hooks
- Create allowlist for false positives

### 3. CI/CD Integration
- Update GitHub Actions workflows
- Add security scanning to PR checks
- Configure failure conditions and notifications

### 4. PR Annotations
- Annotate security findings directly in PR
- Provide remediation guidance
- Link to internal security documentation

## Quality Gates
- All critical/high security issues resolved
- No new secrets detected
- Security tests passing
- Documentation updated for any new patterns

Arguments: $ARGUMENTS (optional: --fix-auto, --severity-threshold)