# DriftGuard Checks - GitHub Marketplace Listing

## Title
DriftGuard Checks

## Tagline (140 chars)
PR quality gates without the platform tax. Policy-driven merge protection with instant setup and transparent pricing.

## Long Description

### What is DriftGuard Checks?

DriftGuard Checks provides **policy-driven PR quality gates** that integrate natively with GitHub's merge protection system. Unlike heavyweight static analysis platforms that charge per seat or lines of code, DriftGuard focuses specifically on **PR workflow protection** with simple org-based pricing.

### Key Features

**🛡️ Instant Policy Enforcement**
- Pre-configured security policies for common vulnerabilities
- Custom policy creation with YAML configuration
- Automatic policy updates based on security advisories

**⚡ Native GitHub Integration**
- Works with existing branch protection rules
- Integrates with GitHub status checks API
- Supports GitHub Enterprise Server and GitHub.com

**📊 Transparent Reporting**
- Real-time policy violation reports
- Historical compliance tracking
- Slack/Teams notifications for policy events

**🔧 Zero Configuration Setup**
- Install and protect repos in under 5 minutes
- Smart defaults for common security policies
- No CI/CD pipeline changes required

### How It Works

1. **Install**: Add DriftGuard to your organization
2. **Configure**: Select repos and enable policy packs
3. **Protect**: PRs are automatically checked against policies
4. **Merge**: Only compliant PRs can be merged

### Pricing

- **Free**: 1 repo, 100 PRs/month, basic security policies
- **Starter ($99/month)**: 5 repos, 500 PRs/month, Slack integration
- **Team ($299/month)**: 25 repos, 2000 PRs/month, custom policies, SSO
- **Enterprise**: Unlimited repos, priority support, audit logs, SLA

### Permissions Rationale

**Repository permissions (Read)**: Analyze file contents for policy violations
**Pull request permissions (Write)**: Create status checks and comments on PRs
**Organization permissions (Read)**: Access organization settings for team-based policies
**Webhook permissions**: Receive notifications when PRs are opened/updated

### Support & Documentation

- **Documentation**: https://github.com/mattjutt1/MMTUEntertainment/tree/main/apps/DriftGuard-Checks
- **Support Email**: support@mmtuentertainment.com
- **Response Time**: 24 hours for paid plans, 48 hours for free tier
- **Community**: GitHub Discussions in DriftGuard repository

### Legal

- **Privacy Policy**: https://github.com/mattjutt1/MMTUEntertainment/blob/main/legal/PRIVACY.md
- **Terms of Service**: https://github.com/mattjutt1/MMTUEntertainment/blob/main/legal/TERMS.md
- **Security**: SOC 2 Type II compliant, data encrypted in transit and at rest

## Screenshot Captions & Alt Text

1. **Dashboard Overview**
   - Caption: "Organization-wide policy compliance dashboard"
   - Alt: "Screenshot showing DriftGuard dashboard with policy status across multiple repositories"

2. **Policy Configuration**
   - Caption: "Configure security policies with YAML or visual editor"
   - Alt: "Screenshot of policy configuration interface with YAML editor and policy options"

3. **PR Status Check**
   - Caption: "Native GitHub status checks show policy compliance"
   - Alt: "GitHub pull request showing DriftGuard status check with policy results"

4. **Violation Details**
   - Caption: "Detailed policy violation reports with remediation guidance"
   - Alt: "Screenshot showing detailed policy violation with file location and fix suggestions"

5. **Team Notifications**
   - Caption: "Slack/Teams integration for policy events and compliance updates"
   - Alt: "Screenshot of Slack notification showing policy violation alert with details"

6. **Historical Analytics**
   - Caption: "Track compliance trends and policy effectiveness over time"
   - Alt: "Analytics dashboard showing compliance metrics and trends across time periods"

## FAQ

**Q: How does DriftGuard compare to SonarCloud or CodeQL?**
A: DriftGuard focuses specifically on PR merge protection rather than comprehensive code analysis. It's designed for teams that want policy enforcement without the complexity and cost of full static analysis platforms.

**Q: What policies are included?**
A: Built-in policies cover OWASP Top 10, dependency vulnerabilities, secrets detection, and common security misconfigurations. Custom policies can be created using our YAML DSL.

**Q: Does this work with GitHub Enterprise Server?**
A: Yes, DriftGuard supports both GitHub.com and GitHub Enterprise Server installations.

**Q: Can I customize the policies?**
A: Absolutely. Team and Enterprise plans include custom policy creation with our visual editor or YAML configuration.

**Q: What happens if DriftGuard is down?**
A: DriftGuard is designed with high availability. If our service is unavailable, PRs are allowed to merge to prevent blocking your workflow.

---

## Competitive Positioning Notes

<!-- SonarCloud: LOC-based pricing, comprehensive analysis platform -->
<!-- DeepSource: $8-24/seat/month, broad security scope -->  
<!-- Codacy: ~$15-18/user/month, traditional static analysis -->
<!-- DriftGuard: Org-based, PR-focused, simple policy enforcement -->