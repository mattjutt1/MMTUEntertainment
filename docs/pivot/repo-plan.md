# Repository Refactor Plan
*Aligned with Pivot Rules: LTV:CAC ≥ 3, W4 ≥ 20%, Gross margin ≥ 60%, Smoke conv ≥ 5%*

## Strategic Objectives

1. **Revenue Focus**: Eliminate sub-threshold products (W4 < 10%)
2. **Operational Efficiency**: Reduce maintenance overhead by 60%
3. **Data Governance**: Centralize analytics and business intelligence
4. **Development Velocity**: Streamline structure for faster iteration

## Phase 1: Archive Low-Impact Assets

### Archive Targets
```bash
# Archive completed (move to /_archive/)
mv apps/comparison-matrix /_archive/comparison-matrix-$(date +%Y%m%d)
mv research/ /_archive/research-$(date +%Y%m%d)
mv test-results/ /_archive/test-results-$(date +%Y%m%d)

# Remove test artifacts older than 30 days
find . -name "playwright-report" -mtime +30 -exec rm -rf {} \;
find . -name "test-results" -mtime +30 -exec rm -rf {} \;
```

### File Removals
```bash
# Dead files identified in audit
rm anthropic.claude-code-1.0.83.vsix
rm screenshot-*.png
rm test-*.py trace-test.js
rm -rf /research/{data}/
```

**Impact**: -40% storage, -20% file count

## Phase 2: Restructure Documentation

### New Documentation Structure
```
/docs/
├── pivot/                    # Strategic documents
│   ├── repo-audit.md
│   ├── repo-plan.md
│   └── metrics-tracking.md
├── apps/                     # Per-app documentation
│   ├── driftguard/
│   ├── overlay-studio/
│   └── marketing-site/
├── operations/               # Business operations
│   ├── policies.md
│   ├── stripe-onboarding.md
│   └── support-procedures.md
└── archive/                  # Historical documents
```

### Migration Commands
```bash
# Create new structure
mkdir -p docs/{apps,operations,archive}
mkdir -p docs/apps/{driftguard,overlay-studio,marketing-site}

# Migrate existing docs
mv docs/policies.md docs/operations/
mv docs/stripe-onboarding.md docs/operations/
mv docs/milestones.md docs/archive/
mv docs/project-mindmap.md docs/archive/

# Consolidate app-specific docs
mv apps/DriftGuard-Checks/README.md docs/apps/driftguard/
mv apps/stream-overlay-studio/README*.md docs/apps/overlay-studio/
mv products/site/README.md docs/apps/marketing-site/
```

**Impact**: +90% documentation discoverability

## Phase 3: Data Centralization

### New Data Structure
```
/data/
├── raw/                      # Source data
│   ├── analytics/
│   ├── revenue/
│   └── experiments/
├── processed/                # Cleaned data
│   ├── metrics/
│   ├── reports/
│   └── insights/
└── exports/                  # External integrations
    ├── stripe/
    ├── posthog/
    └── hubspot/
```

### Data Migration
```bash
# Create data structure
mkdir -p data/{raw,processed,exports}
mkdir -p data/raw/{analytics,revenue,experiments}
mkdir -p data/processed/{metrics,reports,insights}
mkdir -p data/exports/{stripe,posthog,hubspot}

# Migrate existing data files
mv growth/leads/*.csv data/raw/revenue/
mv docs/metrics/*.md data/processed/metrics/
mv perp\ find/*.csv data/raw/analytics/
mv mmtuentertainment\ research/*.csv data/raw/analytics/

# Consolidate analytics configs
mv products/site/config/ data/raw/analytics/site-config/
mv apps/*/analytics/ data/raw/analytics/app-configs/
```

**Impact**: +100% data governance, centralized business intelligence

## Phase 4: Application Consolidation

### Revenue App Optimization

#### DriftGuard (KEEP - Core Revenue)
```bash
# No structural changes - production revenue product
# Focus: Performance optimization, feature development
apps/DriftGuard-Checks/  # Status: MAINTAIN
```

#### Marketing Site (KEEP - Direct Revenue)
```bash
# Enhance conversion tracking
# Focus: A/B testing, funnel optimization
products/site/  # Status: OPTIMIZE
```

#### Stream Overlay Studio (KEEP - Premium Product)
```bash
# Streamline for Pro tier conversion
# Focus: Feature flagging, pricing optimization
apps/stream-overlay-studio/  # Status: OPTIMIZE
```

### Support App Decisions

#### Portfolio Dashboard (MODIFY → Merge)
```bash
# Merge analytics into main site dashboard
mv apps/portfolio-dashboard/src/components/MetricCard.tsx products/site/components/
mv apps/portfolio-dashboard/src/providers/ products/site/analytics/
# Archive standalone app
mv apps/portfolio-dashboard /_archive/portfolio-dashboard-$(date +%Y%m%d)
```

#### MemeLoader Lite (MODIFY → Lead Gen Focus)
```bash
# Simplify to pure lead generation
rm -rf apps/memeMixer-lite/src/components/MemeEditor.tsx  # Complex features
# Keep: Landing page, email capture, conversion tracking
# Focus: Minimize maintenance, maximize lead quality
```

#### Reports App (EVALUATE)
```bash
# Decision point: Service revenue vs maintenance cost
# If service revenue > $5K/month: KEEP
# If service revenue < $5K/month: ARCHIVE
# Current status: PENDING REVENUE ANALYSIS
```

## Phase 5: Operational Infrastructure

### New Structure Implementation
```
/pivot-checks/               # Operational monitoring
├── impact-report.md
├── revenue-tracking.sh
├── conversion-metrics.py
└── cleanup-automation.sh

/scripts/                    # Consolidated automation
├── deploy/                  # Deployment scripts
├── analytics/               # Data processing
└── maintenance/             # Cleanup automation
```

### Automation Setup
```bash
# Create operational structure
mkdir -p pivot-checks scripts/{deploy,analytics,maintenance}

# Migrate and consolidate scripts
mv scripts/deploy-*.sh scripts/deploy/
mv scripts/*analytics* scripts/analytics/
mv scripts/setup.js scripts/maintenance/

# Create monitoring automation
cat > pivot-checks/cleanup-automation.sh << 'EOF'
#!/bin/bash
# Automated cleanup per pivot rules
find . -name "test-results" -mtime +30 -exec rm -rf {} \;
find . -name "*.log" -mtime +7 -exec rm {} \;
# Revenue threshold check (implement metric collection)
EOF
```

## Implementation Timeline

### Week 1: Foundation
- [ ] Execute Phase 1 (Archive)
- [ ] Create new directory structure
- [ ] Document migration process

### Week 2: Consolidation  
- [ ] Execute Phase 2 (Documentation)
- [ ] Execute Phase 3 (Data)
- [ ] Test all deployments

### Week 3: Optimization
- [ ] Execute Phase 4 (Applications)
- [ ] Implement monitoring
- [ ] Performance validation

### Week 4: Validation
- [ ] Revenue impact analysis
- [ ] Operational efficiency metrics
- [ ] Stakeholder approval for production

## Success Metrics

### Technical Metrics
- **Storage reduction**: Target 40%
- **File count reduction**: Target 35%
- **Build time improvement**: Target 25%
- **Maintenance overhead**: Target -60%

### Business Metrics
- **Revenue focus**: >80% files directly revenue-related
- **Conversion tracking**: 100% revenue paths monitored
- **Decision speed**: <48hrs for app kill/keep decisions
- **Operational clarity**: Single source of truth for metrics

## Risk Mitigation

### Backup Strategy
```bash
# Full repository backup before changes
git tag pre-pivot-refactor-$(date +%Y%m%d)
tar -czf mmtu-backup-$(date +%Y%m%d).tar.gz .
cp mmtu-backup-*.tar.gz /_archive/
```

### Rollback Plan
- All changes in feature branch (no main commits)
- Atomic commits per phase
- Automated testing after each phase
- 24hr validation period before next phase

### Stakeholder Communication
- Daily progress updates during implementation
- Weekly revenue impact reports
- Monthly operational efficiency metrics
- Quarterly strategic alignment reviews

## Approval Requirements

### Technical Approval
- [ ] Code review by technical lead
- [ ] Deployment testing in staging
- [ ] Performance benchmarking
- [ ] Security validation

### Business Approval  
- [ ] Revenue impact assessment
- [ ] Operational cost analysis
- [ ] Strategic alignment confirmation
- [ ] Stakeholder sign-off

---

**Next Steps**: 
1. Review this plan with stakeholders
2. Approve Phase 1 execution
3. Begin archive process
4. Monitor impact metrics

*Implementation begins upon approval - no main branch changes until validated*