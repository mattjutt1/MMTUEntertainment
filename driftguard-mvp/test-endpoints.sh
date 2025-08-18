#!/bin/bash

# DriftGuard Endpoint Testing Script
# Tests all endpoints after complete setup

set -e

BASE_URL="https://driftguard-checks.mmtu.workers.dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_test() {
    echo -e "${BLUE}🧪 Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to test endpoint
test_endpoint() {
    local method="$1"
    local path="$2"
    local expected_code="$3"
    local data="$4"
    local description="$5"
    
    print_test "$description"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL$path")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$path")
    fi
    
    body=$(echo "$response" | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
    status=$(echo "$response" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [ "$status" -eq "$expected_code" ]; then
        print_success "$description - HTTP $status"
        return 0
    else
        print_error "$description - HTTP $status (expected $expected_code)"
        if [ "$status" -eq 500 ]; then
            echo "Response: $body" | head -3
        fi
        return 1
    fi
}

echo "🚀 DriftGuard Endpoint Testing"
echo "=============================="
echo ""
echo "Testing endpoints at: $BASE_URL"
echo ""

failed_tests=0
total_tests=0

# Test 1: Health Check
total_tests=$((total_tests + 1))
test_endpoint "GET" "/health" 200 "" "Health endpoint" || failed_tests=$((failed_tests + 1))

# Test 2: Dashboard
total_tests=$((total_tests + 1))
test_endpoint "GET" "/dashboard" 200 "" "Dashboard UI" || failed_tests=$((failed_tests + 1))

# Test 3: API Documentation
total_tests=$((total_tests + 1))
test_endpoint "GET" "/api" 200 "" "API documentation" || failed_tests=$((failed_tests + 1))

# Test 4: CTRF Ingestion (should require auth)
total_tests=$((total_tests + 1))
test_ctrf_data='{
  "tool": "jest",
  "tool_version": "29.0.0",
  "repository": "test/repo",
  "commit_sha": "abc123456789012345678901234567890123456789",
  "report": {
    "name": "Test Suite",
    "status": "passed",
    "tests": [],
    "summary": {
      "total": 5,
      "passed": 5,
      "failed": 0,
      "duration": 1000
    }
  }
}'
test_endpoint "POST" "/api/ctrf/ingest" 401 "$test_ctrf_data" "CTRF ingestion (should require auth)" || failed_tests=$((failed_tests + 1))

# Test 5: GitHub Webhook (should require signature)
total_tests=$((total_tests + 1))
test_endpoint "POST" "/api/github/webhook" 401 '{"test": "data"}' "GitHub webhook (should require signature)" || failed_tests=$((failed_tests + 1))

# Test 6: Stripe Webhook (should require signature)
total_tests=$((total_tests + 1))
test_endpoint "POST" "/api/stripe/webhook" 400 '{"test": "data"}' "Stripe webhook (should require signature)" || failed_tests=$((failed_tests + 1))

# Test 7: Stripe Checkout (should require auth)
total_tests=$((total_tests + 1))
checkout_data='{
  "plan": "starter",
  "github_user": "testuser",
  "repositories": ["test/repo"]
}'
test_endpoint "POST" "/api/stripe/checkout" 401 "$checkout_data" "Stripe checkout (should require auth)" || failed_tests=$((failed_tests + 1))

echo ""
echo "=========================="
echo "📊 Test Results Summary"
echo "=========================="

passed_tests=$((total_tests - failed_tests))

if [ $failed_tests -eq 0 ]; then
    print_success "All $total_tests tests passed! 🎉"
    echo ""
    echo "✅ DriftGuard is fully functional and ready for production!"
    echo ""
    echo "Next steps:"
    echo "1. Install GitHub App on repositories"
    echo "2. Test CTRF ingestion with real data"
    echo "3. Set up Stripe live mode for payments"
    echo "4. Monitor analytics in PostHog"
    exit 0
else
    print_error "$failed_tests out of $total_tests tests failed"
    echo ""
    if [ $passed_tests -gt 0 ]; then
        print_success "$passed_tests tests passed"
    fi
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Run: pnpm run setup:validate"
    echo "2. Check that all secrets are set with: wrangler secret list"
    echo "3. Verify external services are configured"
    echo "4. Check wrangler.toml has correct environment variables"
    echo ""
    echo "📖 See setup guides for detailed configuration instructions"
    exit 1
fi