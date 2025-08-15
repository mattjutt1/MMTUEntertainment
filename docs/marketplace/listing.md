# DriftGuard — GitHub-first compliance checks & 1-click audit reports

## App Information

**Title**: DriftGuard — GitHub-first compliance checks & 1-click audit reports

**Tagline**: Catch drift in PRs, prove compliance in minutes, not months.

**Category**: Security & Compliance

**Description**: 
DriftGuard runs lightweight security & policy checks on every PR and collects evidence automatically. Export SOC2/ISO-lite reports with a click. Works with existing scanners; no per-seat tax.

## Key Features

1. **Checks in PR** with remediation & line annotations (batched)
   - Automated security scanning on every pull request
   - Inline code annotations with specific remediation guidance
   - Integration with GitHub Checks API for seamless workflow

2. **Evidence Store** that links findings ↔ commits ↔ fixes
   - Automatic evidence collection and correlation
   - Audit trail linking security findings to resolution commits
   - Compliance-ready documentation generation

3. **1-click HTML→PDF report** with severity counts and timestamps
   - Professional compliance reports (SOC2/ISO-lite format)
   - Executive summaries with risk analysis
   - Automated evidence compilation and formatting

## Target Audience

**Who it's for**: Seed→Series-B teams, consultants, and dev-first orgs prepping for audits.

- **Startups**: Preparing for Series A/B funding security requirements
- **Consultants**: Providing compliance services to multiple clients
- **Development Teams**: Maintaining security posture during rapid growth
- **Audit-Prep Organizations**: Streamlining compliance documentation

## Pricing (per organization / month)

- **Starter $99**: Up to 10 repositories, basic security checks, monthly reports
- **Growth $299**: Up to 50 repositories, advanced scanning, weekly reports, API access
- **Audit-Ready $799**: Unlimited repositories, custom compliance frameworks, real-time reporting, dedicated support

**Trial**: 14-day free trial (limited to 3 repositories and 5 PR checks)

## Support & Contact

**Support Email**: [support@mmtuentertainment.com](mailto:support@mmtuentertainment.com)
**Documentation**: [docs.driftguard.app](https://docs.driftguard.app)
**Status Page**: [status.driftguard.app](https://status.driftguard.app)

## Legal & Privacy

**Privacy Policy**: [/docs/marketplace/privacy.md](privacy.md)
**Terms of Service**: [/docs/marketplace/tos.md](tos.md)

## Required Screenshots

1. **PR with Checks annotations** (green pass and failing example)
   - Screenshot showing DriftGuard check results in GitHub PR
   - Example of inline code annotations with remediation suggestions
   - Both passing and failing check states

2. **Evidence dashboard** (counts by severity)
   - Main dashboard showing security findings overview
   - Severity breakdown (Critical/High/Medium/Low)
   - Trends and compliance metrics

3. **Report PDF preview page** with "Download" CTA
   - SOC2-lite report preview interface
   - Professional PDF output sample
   - Download and sharing options

## Integration Requirements

- **GitHub Permissions**: Contents (read), Checks (write), Pull requests (read)
- **Webhook Events**: push, pull_request, marketplace_purchase
- **API Dependencies**: GitHub REST API, GitHub Checks API
- **Security**: All data encrypted in transit and at rest, GDPR compliant