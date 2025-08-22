# HubSpot Lead Scoring & Auto-Booking System

## Lead Scoring Algorithm (0-100 scale)

### Company Size Indicators (+40 points max)
- **≥200 repositories**: +20 points
- **≥100 repositories**: +15 points  
- **≥50 repositories**: +10 points
- **10-49 repositories**: +5 points
- **<10 repositories**: +0 points

### Authentication & Security Maturity (+20 points max)
- **SSO/SCIM implemented**: +20 points
- **2FA enforced org-wide**: +15 points
- **SAML integration**: +10 points
- **Basic 2FA enabled**: +5 points
- **No enterprise auth**: +0 points

### Development Velocity (+20 points max)
- **>1000 PRs/month**: +20 points
- **500-1000 PRs/month**: +15 points
- **100-499 PRs/month**: +10 points
- **50-99 PRs/month**: +5 points
- **<50 PRs/month**: +0 points

### Compliance Timeline (+20 points max)
- **Compliance deadline <30 days**: +20 points
- **Compliance deadline <90 days**: +15 points
- **Compliance deadline <180 days**: +10 points
- **Compliance timeline 6-12 months**: +5 points
- **No immediate compliance needs**: +0 points

### Security Team Size (Inverse indicator - smaller = higher score)
- **≤2 security team members**: +20 points
- **3-5 security team members**: +15 points
- **6-10 security team members**: +10 points
- **11-20 security team members**: +5 points
- **>20 security team members**: +0 points

## Auto-Booking Thresholds

### SQL (Sales Qualified Lead) ≥ 60 points
- **Action**: Auto-book Calendly consultation within 24 hours
- **Routing**: Priority sales queue
- **Follow-up**: Email sequence with case studies and ROI calculator

### MQL (Marketing Qualified Lead) 40-59 points  
- **Action**: Add to nurture sequence
- **Follow-up**: Educational content, security best practices
- **Timeline**: Re-evaluate in 30 days

### Cold Lead <40 points
- **Action**: Standard marketing automation
- **Follow-up**: Monthly newsletter, product updates
- **Timeline**: Re-evaluate in 90 days

## HubSpot Integration Fields

### Contact Properties
```javascript
{
  // UTM Attribution
  "utm_source": "string",
  "utm_medium": "string", 
  "utm_campaign": "string",
  "utm_content": "string",
  "utm_term": "string",
  
  // Lead Scoring Inputs
  "github_repos_count": "number",
  "monthly_pr_volume": "number",
  "has_sso_saml": "boolean",
  "has_2fa_enforced": "boolean",
  "compliance_deadline": "date",
  "security_team_size": "number",
  
  // Calculated Fields
  "lead_score": "number",
  "lead_status": "enum", // SQL, MQL, Cold
  "auto_book_eligible": "boolean",
  "scoring_timestamp": "datetime",
  
  // Purchase Intent
  "report_tier_interested": "enum", // standard, custom, executive
  "original_report_price": "number",
  "bundle_upsell_shown": "boolean",
  "bundle_upsell_accepted": "boolean"
}
```

### Deal Properties
```javascript
{
  "original_report_tier": "string",
  "bundle_included": "boolean",
  "total_deal_value": "number",
  "expected_close_date": "date",
  "lead_source_detail": "string",
  "scoring_factors": "string" // JSON of scoring breakdown
}
```

## Automation Workflows

### High-Value Lead (Score ≥80)
1. **Immediate**: Slack notification to sales team
2. **5 minutes**: Auto-book Calendly with executive calendar
3. **1 hour**: Send personalized email with ROI calculator
4. **24 hours**: Follow-up call if no calendar booking

### SQL Lead (Score 60-79)
1. **15 minutes**: Auto-book Calendly consultation
2. **2 hours**: Send case study email with similar company
3. **24 hours**: LinkedIn connection request from sales rep
4. **48 hours**: Follow-up email if no response

### MQL Lead (Score 40-59)
1. **1 day**: Add to educational email sequence
2. **3 days**: Send security best practices guide
3. **7 days**: Invite to monthly security webinar
4. **30 days**: Re-score and potentially upgrade to SQL

## API Integration Requirements

### Lead Scoring Endpoint
```javascript
POST /api/hubspot/score-lead
{
  "email": "string",
  "company": "string", 
  "github_org": "string", // Optional
  "repos_count": "number",
  "monthly_prs": "number",
  "has_sso": "boolean",
  "compliance_timeline": "string",
  "security_team_size": "number",
  "utm_params": "object",
  "report_context": {
    "tier": "string",
    "price": "number", 
    "report_type": "string"
  }
}
```

### Auto-Booking Integration
```javascript
POST /api/calendly/auto-book
{
  "lead_score": "number",
  "contact_email": "string",
  "preferred_times": "array",
  "calendar_type": "enum", // executive, standard
  "booking_reason": "string",
  "hubspot_contact_id": "string"
}
```

## Qualification Questions (For Executive Tier)

### Company Scale
- How many GitHub repositories does your organization manage?
- What's your typical monthly PR volume?
- How many developers are on your team?

### Security Maturity  
- Do you currently use SSO/SAML for GitHub access?
- Is 2FA enforced across your organization?
- What compliance frameworks are you working towards? (SOC2, ISO27001, etc.)

### Timeline & Urgency
- Do you have any upcoming compliance deadlines?
- When do you need to have security processes fully implemented?
- What's driving the urgency for this security assessment?

### Current Security Team
- How many dedicated security team members do you have?
- Who currently handles security reviews for code changes?
- What security tools are you already using?

## Success Metrics

### Lead Quality Indicators
- **Conversion Rate**: SQL → Closed-Won (Target: ≥25%)
- **Qualification Accuracy**: SQL score correlation with actual conversion (Target: ≥0.7)
- **Time to Close**: Days from SQL to Closed-Won (Target: <30 days)

### System Performance
- **Auto-Booking Rate**: Eligible leads that complete booking (Target: ≥60%)
- **Score Distribution**: Healthy distribution across score ranges
- **False Positive Rate**: High-score leads that don't convert (Target: <20%)

### Revenue Impact
- **Average Deal Size**: SQLs vs. non-SQLs
- **Pipeline Velocity**: Time from MQL to SQL to Close
- **Upsell Rate**: Bundle attachment for high-scoring leads

## Implementation Checklist

### Phase 1: Lead Scoring (Week 1)
- [ ] Implement scoring algorithm in reports checkout
- [ ] Create HubSpot contact properties
- [ ] Build lead scoring API endpoint
- [ ] Test scoring with sample data

### Phase 2: Auto-Booking (Week 2)  
- [ ] Integrate Calendly API
- [ ] Create auto-booking workflows
- [ ] Set up Slack notifications for high-value leads
- [ ] Test end-to-end booking flow

### Phase 3: Optimization (Week 3)
- [ ] Implement A/B tests for scoring thresholds
- [ ] Add lead source attribution tracking
- [ ] Create sales dashboard with lead metrics
- [ ] Train sales team on new lead process

### Phase 4: Analytics (Week 4)
- [ ] Build conversion tracking dashboard
- [ ] Implement scoring model refinement
- [ ] Add predictive analytics for deal probability
- [ ] Create ROI reporting for lead scoring system