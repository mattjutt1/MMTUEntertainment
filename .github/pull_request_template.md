## 🚦 Launch Gates & Metrics

### Metrics Snapshot
<!-- Required for ramp changes - attach screenshot or paste data -->
- **Sample Size**: _[current sample size]_
- **Time Running**: _[hours/days experiment has been running]_
- **Key Metrics**: 
  - Attach Rate: _%_
  - RPV Delta: _%_
  - Refund Delta: _+/- % points_
  - Other: _[experiment-specific metrics]_

### Gatekeeper Verdict
<!-- Auto-populated by CI workflow -->
- [ ] Gatekeeper evaluation pending
- [ ] ✅ ALLOW - All criteria met
- [ ] ❌ DENY - Criteria not met (see reasoning)

### Rollback Plan
<!-- How to quickly revert if issues arise -->
- **Rollback Method**: _[flag flip, git revert, etc.]_
- **Rollback Time**: _[estimated time to execute]_
- **Monitoring**: _[what metrics to watch post-rollback]_

### Revenue Hypothesis
<!-- What business impact do you expect? -->
- **Expected Impact**: _[+/- X% revenue, attach rate, etc.]_
- **Confidence Level**: _[High/Medium/Low]_
- **Risk Assessment**: _[potential downside, mitigation]_

---

## Standard PR Checklist

### Changes Made
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)  
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Performance improvement
- [ ] Code refactoring (no functional changes)
- [ ] Documentation update
- [ ] **Ramp/Flag change** (requires gatekeeper approval)

### Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated  
- [ ] Manual testing completed
- [ ] Performance impact assessed
- [ ] Cross-browser testing (if UI changes)

### Security & Quality
- [ ] No sensitive data in commit
- [ ] Gitleaks scan passed
- [ ] Semgrep scan reviewed
- [ ] Code review completed
- [ ] Breaking changes documented

### Documentation
- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Changelog updated (if needed)
- [ ] Metrics documentation updated (for experiment changes)

---

## Notes
<!-- Additional context, screenshots, or information for reviewers -->
