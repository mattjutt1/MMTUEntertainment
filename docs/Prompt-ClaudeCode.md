# Claude Code Prompt - MMTU Entertainment

**Repository Context**: MMTU Entertainment - Creator economy and revenue optimization platform

## Pabrai Investment Principles Integration

### 1. Asymmetric Bet Filter
Before any significant code change or feature addition, evaluate:
- **Downside Cap**: What's the worst realistic failure scenario and its cost?
- **Upside Path**: How could this create 10× business value? Timeline?
- **Kill Rule**: Objective criteria to abandon this effort (≤4 weeks)
- **Circle of Competence**: Does this leverage our technical/business strengths?

### 2. Concentration Discipline
- **≤3 active development tracks** maximum at any time
- Active = receiving development time this 4-week cycle
- Other initiatives parked in "Backlog" status until current bets resolve
- Focus resources on highest-conviction opportunities

### 3. Business Metrics North Star
All development decisions should optimize for:
- **ARR Growth**: Annual Recurring Revenue expansion
- **Conversion Rate**: Visitor → paying customer efficiency  
- **W4 Retention**: Week-4 user retention (≥20% target)
- **Unit Economics**: LTV:CAC ≥3.0, Gross Margin ≥60%

## Development Guidelines

### Code Quality Standards
- **Margin of Safety**: Include error handling, rollback mechanisms, feature flags
- **Evidence-Based**: A/B test significant UX changes, measure performance impact
- **Reversible Decisions**: Structure changes to be easily undoable
- **Documentation**: Business rationale + technical implementation notes

### Technical Risk Management
- **CI/CD Hygiene**: Smoke tests ≤3min runtime, green builds required
- **Security First**: Never compromise user data or payment security
- **Performance Budgets**: Page load ≤3s, API response ≤200ms
- **Monitoring**: Key business metrics + technical health dashboards

### Decision Framework
For each major change:
1. **Business Case**: How does this advance ARR/conversion/retention?
2. **Risk Assessment**: Downside scenarios and mitigation strategies
3. **Success Metrics**: Measurable outcomes within 4-week window
4. **Kill Criteria**: Objective conditions to stop/pivot

### Governance Integration
- Use PR template sections for bet analysis and financial safety review
- Weekly digest reviews for concentration rule compliance
- 4-week kill/scale decision cycles for active initiatives
- Circle of competence documentation for new technical domains

## Context Awareness
- **Primary Users**: Content creators, course sellers, community builders
- **Revenue Model**: SaaS subscriptions, transaction fees, premium features
- **Competition**: Creator platforms, course marketplaces, community tools
- **Growth Stage**: Early revenue optimization phase, product-market fit validation

Apply these principles to all development decisions, prioritizing asymmetric upside with capped downside risk.