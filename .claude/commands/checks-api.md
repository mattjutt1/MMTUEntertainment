---
name: checks-api
description: Implement GitHub Checks for DriftGuard with remediation & line annotations
---

# GitHub Checks API Implementation for DriftGuard

## Scope
Implement GitHub Checks for DriftGuard with remediation & line annotations:

1. Create/Update check runs with ≤50 annotations per request; paginate if needed
2. Use details_url to point to our report preview  
3. Return: code diffs, payload examples, and a sample PR link

## Implementation Steps

### 1. Check Run Creation
- Create check run on PR/push events
- Set status to "in_progress" initially
- Include details_url pointing to report preview

### 2. Security Analysis & Annotations
- Run DriftGuard security checks
- Generate annotations with file/line/message
- Batch annotations (max 50 per request)
- Use severity levels: notice/warning/failure

### 3. Report Generation
- Generate detailed security report
- Include remediation suggestions
- Link to evidence and compliance docs

### 4. Check Run Updates
- Update check run with conclusion (success/failure/neutral)
- Include summary and annotation counts
- Provide actionable next steps

## Deliverables
- GitHub Checks API integration code
- Sample payload examples
- Test PR demonstrating annotations
- Documentation for team usage

Arguments: $ARGUMENTS (optional: --pr-number, --repo-owner, --repo-name)