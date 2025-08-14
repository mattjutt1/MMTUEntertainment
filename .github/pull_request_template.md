# Pull Request

## Summary
Brief description of changes and their purpose.

## Metrics snapshot
<!-- Required for all experiment-related PRs -->

### Current baseline metrics
- [ ] Sample size: [N] orders/visitors/installs over [timeframe]
- [ ] Key metric 1: [X%] (e.g., attach rate, RPV, conversion rate)  
- [ ] Key metric 2: [X%] (e.g., refund rate, support tickets)
- [ ] Confidence level: [90%/95%/99%]

### Expected impact
- [ ] Primary metric change: [±X%] with [reasoning]
- [ ] Secondary effects: [list any expected downstream impacts]
- [ ] Risk assessment: [low/medium/high] based on [factors]

## Gatekeeper verdict
<!-- Auto-populated by CI or manual evaluation -->

**Status**: ⏳ Pending evaluation / ✅ ALLOW / ❌ DENY / ⚠️ Override required

**Experiment(s)**: [list affected experiments]

**Reasoning**: [auto-generated from gatekeeper evaluation]

**Next steps**: [auto-generated action items]

## Rollback plan
<!-- Required for all production changes -->

### Immediate rollback (< 5 minutes)
- [ ] **Command**: `npx tsx scripts/gatekeeper.ts promote [experiment] [current] 0`
- [ ] **Verification**: Check feature flag in Supabase + PostHog events stop
- [ ] **Communication**: [Slack channels, stakeholders to notify]

### Full rollback (< 30 minutes) 
- [ ] **Git revert**: This PR can be cleanly reverted: Yes/No
- [ ] **Database changes**: [list any schema/data changes to undo]
- [ ] **Cache invalidation**: [CDN, Redis, browser cache considerations]
- [ ] **Dependent services**: [any downstream services to update]

### Success criteria for rollback
- [ ] **Metrics return to baseline**: [specific thresholds]
- [ ] **Error rates normalize**: [acceptable error rate %]
- [ ] **User experience restored**: [key user flows working]

## Revenue hypothesis
<!-- Required for pricing/monetization changes -->

### Financial model
- [ ] **RPV impact**: Expected [±$X] per visitor based on [calculation]
- [ ] **Volume impact**: Expected [±X%] conversion rate change
- [ ] **Net revenue**: [monthly/weekly projected impact with confidence bands]

### Validation approach  
- [ ] **Leading indicators**: [metrics to watch in first 24-48 hours]
- [ ] **Sample size planning**: Need [N] samples for [statistical power]%
- [ ] **Success criteria**: Declare success when [specific threshold met]
- [ ] **Failure criteria**: Stop experiment if [specific conditions]

## Testing checklist

### Pre-deployment
- [ ] **Unit tests**: All tests pass
- [ ] **Integration tests**: E2E flows work in staging
- [ ] **Performance tests**: No regression in key metrics
- [ ] **Security scans**: Gitleaks + Semgrep pass

### Post-deployment monitoring
- [ ] **Analytics events**: Verify events firing correctly in PostHog
- [ ] **Error tracking**: No spike in errors/exceptions  
- [ ] **User feedback**: Monitor support channels for issues
- [ ] **System health**: Database, API, CDN performance stable

## Compliance and governance

### Code review requirements
- [ ] **CODEOWNERS approval**: Required for experiment changes
- [ ] **Security review**: Required if handling PII or payments  
- [ ] **Performance review**: Required if touching critical path
- [ ] **Product review**: Required for user-facing changes

### Documentation updates
- [ ] **Runbook updated**: Operational procedures documented
- [ ] **Metrics documentation**: Event schemas and queries updated
- [ ] **Architecture docs**: Any system changes documented  
- [ ] **Post-mortem**: Previous incident learnings incorporated

---

## Gatekeeper evaluation
<!-- This section is auto-populated by CI -->

```json
{
  "timestamp": "",
  "experiments_evaluated": [],
  "decisions": [],
  "next_evaluation": "",
  "override_required": false
}
```

---

### PR Labels
Please apply appropriate labels:
- `experiment-change` - Changes to experiments or feature flags
- `ramp-change` - Changes traffic allocation percentages  
- `revenue-impact` - May affect revenue metrics
- `GATEKEEPER_OVERRIDE` - Emergency override (requires approval)
- `security-review` - Needs security team review
- `performance-impact` - May affect system performance

### Linked Issues
Fixes #[issue number]
Related to #[issue number]