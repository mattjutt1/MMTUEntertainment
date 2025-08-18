# Create a comprehensive verified market intelligence summary with real data
import pandas as pd

# Verified market findings data
verified_data = {
    'Category': [
        'Global CD Market Size (2024)',
        'Global CD Market Size (2034)',
        'Global CD Market CAGR',
        'US CD Market Size (2024)',
        'US CD Market Size (2034)',
        'US CD Market CAGR',
        'GitHub API Rate Limit (Authenticated)',
        'GitHub API Rate Limit (Enterprise)',
        'GitHub Marketplace Transaction Fee',
        'GitHub Teams Pricing',
        'GitHub Enterprise Pricing',
        'CodeClimate Quality Pricing',
        'CodeClimate Velocity Pricing',
        'Stack Overflow Survey Respondents',
        'JavaScript Usage Rate',
        'AI Tool Usage/Planning',
        'Developers Using Online Learning',
        'Stack Overflow Usage Rate',
        'Technical Debt as Top Frustration',
        'End Users Influence IT Decisions',
        'Purchase Decision Complexity Increase'
    ],
    'Value': [
        '$4.27 billion',
        '$17.80 billion',
        '15.35%',
        '$1.14 billion',
        '$4.83 billion',
        '15.53%',
        '5,000 requests/hour',
        '15,000 requests/hour',
        '5%',
        '$4 per user/month',
        '$21 per user/month',
        '$16.67 per user/month',
        '$37.42 per user/month',
        '65,437 responses',
        '62%',
        '76%',
        '82%',
        '80%',
        'Top frustration',
        '72%',
        '50% take more time'
    ],
    'Source': [
        'Precedence Research, June 2025',
        'Precedence Research, June 2025',
        'Precedence Research, June 2025',
        'Precedence Research, June 2025',
        'Precedence Research, June 2025',
        'Precedence Research, June 2025',
        'GitHub Official Docs, 2025',
        'GitHub Official Docs, 2025',
        'GitHub Blog, 2021',
        'GitHub Official Pricing',
        'GitHub Official Pricing',
        'PriceLevel buyer data, 2024',
        'GitClear analysis, 2024',
        'Stack Overflow Survey 2024',
        'Stack Overflow Survey 2024',
        'Stack Overflow Survey 2024',
        'Stack Overflow Survey 2024',
        'Stack Overflow Survey 2024',
        'Stack Overflow Survey 2024',
        'SurveyMonkey IT Decision Makers',
        'SurveyMonkey IT Decision Makers'
    ],
    'Impact on DriftGuard': [
        'Large addressable market',
        'Strong growth trajectory',
        'Sustainable market expansion',
        'Primary target market',
        'Significant growth opportunity',
        'Favorable market dynamics',
        'Technical scaling constraint',
        'Enterprise tier requirement',
        'Favorable unit economics',
        'Base platform cost anchor',
        'Premium positioning target',
        'Competitive price point',
        'Premium competitor benchmark',
        'Representative developer sample',
        'Core technology validation',
        'AI integration opportunity',
        'Online-first go-to-market',
        'Platform dependency validation',
        'Core value proposition validation',
        'Bottom-up adoption strategy',
        'Extended sales cycle planning'
    ]
}

df = pd.DataFrame(verified_data)
print("DriftGuard Verified Market Intelligence Summary")
print("=" * 55)
print()
print(df.to_string(index=False))

# Save to CSV
df.to_csv('driftguard_verified_market_intelligence.csv', index=False)
print("\nData saved to driftguard_verified_market_intelligence.csv")

# Calculate key metrics
cd_growth = (17.80 - 4.27) / 4.27 * 100
us_growth = (4.83 - 1.14) / 1.14 * 100

print(f"\nKey Growth Metrics:")
print(f"Global CD Market 10-year growth: {cd_growth:.1f}%")
print(f"US CD Market 10-year growth: {us_growth:.1f}%")
print(f"DriftGuard addressable market positioning: Premium to GitHub, below premium tools")