#!/bin/bash

# Revenue Optimization Automation Script
# Aligned with MMTU Entertainment Pivot Strategy
# LTV:CAC ≥ 3, W4 ≥ 20%, Gross margin ≥ 60%, Smoke conv ≥ 5%

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
METRICS_FILE="$PROJECT_ROOT/data/processed/metrics/revenue-metrics.json"
ALERT_THRESHOLD_W4=10  # Below 10% W4 triggers alert
ALERT_THRESHOLD_LTV_CAC=3  # Below 3:1 LTV:CAC triggers alert

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Create required directories
setup_directories() {
    log "Setting up directory structure..."
    mkdir -p "$PROJECT_ROOT/data/processed/metrics"
    mkdir -p "$PROJECT_ROOT/data/raw/revenue" 
    mkdir -p "$PROJECT_ROOT/data/exports/stripe"
    mkdir -p "$PROJECT_ROOT/pivot-checks"
}

# Revenue threshold check function
check_revenue_thresholds() {
    log "Checking revenue thresholds..."
    
    # Mock data for demonstration - replace with actual API calls
    local w4_conversion=15  # Would come from analytics API
    local ltv_cac_ratio=2.5  # Would come from CRM/analytics
    local gross_margin=65   # Would come from financial systems
    
    local violations=()
    
    if (( $(echo "$w4_conversion < $ALERT_THRESHOLD_W4" | bc -l) )); then
        violations+=("W4 Conversion: $w4_conversion% (threshold: ≥${ALERT_THRESHOLD_W4}%)")
    fi
    
    if (( $(echo "$ltv_cac_ratio < $ALERT_THRESHOLD_LTV_CAC" | bc -l) )); then
        violations+=("LTV:CAC Ratio: $ltv_cac_ratio (threshold: ≥$ALERT_THRESHOLD_LTV_CAC)")
    fi
    
    if [ ${#violations[@]} -gt 0 ]; then
        error "Revenue threshold violations detected:"
        printf '%s\n' "${violations[@]}"
        return 1
    else
        log "All revenue thresholds met ✅"
        return 0
    fi
}

# Generate revenue optimization report
generate_report() {
    log "Generating revenue optimization report..."
    
    local report_file="$PROJECT_ROOT/pivot-checks/revenue-optimization-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# Revenue Optimization Report
Generated: $(date)

## Key Metrics Dashboard
- **LTV:CAC Ratio**: 2.5 (Target: ≥3.0) ⚠️
- **W4 Conversion**: 15% (Target: ≥20%) ⚠️ 
- **Gross Margin**: 65% (Target: ≥60%) ✅
- **Smoke Conversion**: 8% (Target: ≥5%) ✅

## Revenue Products Status
### Core Revenue (KEEP)
- ✅ **DriftGuard**: Production revenue product
- ✅ **Marketing Site**: Direct revenue generation
- ✅ **Stream Overlay Studio**: Premium product tier

### Support Products (EVALUATE)
- ⚠️ **Portfolio Dashboard**: Consider merge with main site
- ⚠️ **MemeLoader Lite**: Simplify to lead generation
- 🔍 **Reports App**: Pending revenue analysis

## Recommended Actions
1. **Immediate**: Focus marketing spend on highest LTV:CAC channels
2. **Short-term**: Optimize W4 conversion funnel for DriftGuard
3. **Medium-term**: Implement revenue tracking automation
4. **Long-term**: Sunset sub-threshold products (W4 < 10%)

## MCP Integration Opportunities
- PostHog: Revenue analytics and funnel analysis
- HubSpot: CRM optimization and lead scoring
- PostgreSQL: Customer data warehouse queries

## Next Review: $(date -d "+1 week")
EOF

    log "Report generated: $report_file"
}

# Clean up old test artifacts per pivot rules
cleanup_test_artifacts() {
    log "Cleaning up old test artifacts..."
    
    find "$PROJECT_ROOT" -name "playwright-report" -mtime +30 -exec rm -rf {} + 2>/dev/null || true
    find "$PROJECT_ROOT" -name "test-results" -mtime +30 -exec rm -rf {} + 2>/dev/null || true
    find "$PROJECT_ROOT" -name "*.log" -mtime +7 -exec rm {} + 2>/dev/null || true
    
    log "Cleanup completed"
}

# Main automation workflow
main() {
    log "🚀 Starting Revenue Optimization Automation"
    
    setup_directories
    
    if check_revenue_thresholds; then
        log "✅ Revenue thresholds check passed"
    else
        warn "❌ Revenue thresholds check failed - generating detailed report"
    fi
    
    generate_report
    cleanup_test_artifacts
    
    log "🎯 Revenue optimization automation completed"
    log "📊 Next steps: Review generated report and implement recommended actions"
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi