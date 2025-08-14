# DriftGuard Pricing Strategy

## Pricing Tiers

### Free Tier
- **Price**: $0/month
- **Repos**: 1 repository
- **PRs**: 100 PRs analyzed per month
- **Policies**: Basic security policy pack
- **Support**: Community support
- **Features**: 
  - GitHub status checks
  - Basic violation reports
  - 7-day history

### Starter Tier
- **Price**: $99/month
- **Repos**: 5 repositories  
- **PRs**: 500 PRs analyzed per month
- **Policies**: Extended security policies + custom rules
- **Support**: Email support (48h response)
- **Features**:
  - Slack/Teams integration
  - 90-day history
  - Policy configuration UI
  - Team notifications

### Team Tier  
- **Price**: $299/month
- **Repos**: 25 repositories
- **PRs**: 2,000 PRs analyzed per month
- **Policies**: All policy packs + unlimited custom policies
- **Support**: Priority email support (24h response)
- **Features**:
  - SSO integration
  - Audit logs
  - Advanced analytics
  - Policy testing sandbox
  - API access

### Enterprise Tier
- **Price**: Custom pricing (starting $999/month)
- **Repos**: Unlimited repositories
- **PRs**: Unlimited PRs analyzed
- **Policies**: Custom policy development included
- **Support**: Dedicated support + SLA
- **Features**:
  - On-premise deployment options
  - Custom integrations
  - Advanced compliance reporting
  - Priority feature requests
  - Professional services

## Usage-Based Overage

**PR Analysis Overage**: $0.10 per additional PR analyzed beyond plan limits
**Repository Overage**: $20/month per additional repository beyond plan limits

## Annual Discount
- **Starter**: $990/year (2 months free)
- **Team**: $2,990/year (2 months free)  
- **Enterprise**: Custom annual pricing with additional discounts

## Pricing Model Rationale

### Why Org-Based Pricing?
- **Predictable costs** for engineering teams
- **No per-seat scaling** that penalizes team growth
- **Usage-based limits** ensure fair resource allocation
- **Simple procurement** for enterprise buyers

### Why PR-Based Limits?
- **Direct value correlation**: You pay for what you analyze
- **Natural usage patterns**: Active teams generate more PRs
- **Elastic scaling**: Overage pricing for burst periods
- **Cost control**: Teams can manage usage by batching changes

## Competitive Positioning

| Feature | DriftGuard | SonarCloud | DeepSource | Codacy |
|---------|------------|------------|------------|--------|
| Pricing Model | Org + Usage | LOC-based | Per-seat | Per-user |
| Starting Price | $99/month | ~€10/month | $8/seat/month | ~$15/user/month |
| Focus Area | PR Gates | Code Quality | Security | Code Review |
| Setup Time | <5 minutes | 30+ minutes | 15+ minutes | 20+ minutes |
| GitHub Native | Yes | Plugin | Plugin | Plugin |

## Implementation Notes

### Metering Requirements
- Track PRs analyzed per organization per month
- Monitor repository count per organization
- Implement usage alerts at 80% and 100% of limits
- Provide usage dashboard for administrators

### Billing Integration
- Stripe integration for subscription management
- GitHub Marketplace billing for marketplace sales
- Usage-based billing for overage charges
- Annual billing with automatic renewals

### Plan Enforcement
- Soft limits with grace period for overages
- Hard limits with upgrade prompts
- Automatic downgrade path for expired trials
- Granular feature flagging per plan tier