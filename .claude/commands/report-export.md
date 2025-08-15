---
name: report-export  
description: Create HTML→PDF SOC2-lite export wired to Evidence Store
---

# SOC2-lite Report Export

## Scope
Create HTML→PDF SOC2-lite export wired to Evidence Store (Supabase):
- Include org/repo, time window, severity counts, links to evidence
- Generate professional compliance report
- Integrate with our evidence collection system

## Report Components

### 1. Executive Summary
- Organization and repository overview
- Assessment time window and scope
- High-level findings and risk assessment
- Compliance status summary

### 2. Technical Findings
- Security control assessment results
- Vulnerability analysis with severity breakdown
- Configuration compliance status
- Access control and audit trail review

### 3. Evidence Collection
- Link to Supabase Evidence Store
- Automated evidence gathering from CI/CD
- Screenshot and log collection
- Compliance artifact organization

### 4. Remediation Plan
- Priority-ranked action items
- Timeline and ownership assignments
- Risk mitigation strategies
- Continuous monitoring recommendations

## Technical Implementation
- HTML template with professional styling
- PDF generation with proper formatting
- Supabase integration for evidence data
- Automated report scheduling and delivery

## Deliverables
- SOC2-lite report template
- PDF export functionality
- Evidence Store integration
- Sample report for demonstration

Arguments: $ARGUMENTS (required: --org, --repo; optional: --start-date, --end-date, --format)