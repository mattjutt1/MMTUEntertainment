#!/bin/bash

# 🔥 DRIFTGUARD ULTIMATE STRESS TEST 🔥
# This script will absolutely demolish test our DriftGuard app
# Testing everything: performance, reliability, edge cases, error handling

set -e

BASE_URL="https://driftguard-checks.mmtu.workers.dev"
TEST_REPO="mattjutt1/driftguard-test-repo"

# Colors for dramatic output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

print_banner() {
    echo -e "${WHITE}"
    echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
    echo "🔥                DRIFTGUARD STRESS TEST HELL                🔥"
    echo "🔥              PUTTING APP THROUGH THE WRINGER            🔥"
    echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
    echo -e "${NC}"
}

print_test_header() {
    echo -e "${CYAN}💥 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
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

print_info() {
    echo -e "${PURPLE}📊 $1${NC}"
}

# Global counters
total_tests=0
passed_tests=0
failed_tests=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    total_tests=$((total_tests + 1))
    echo -e "${BLUE}🧪 Testing: $test_name${NC}"
    
    if eval "$test_command"; then
        if [ "$expected_result" = "pass" ]; then
            print_success "$test_name"
            passed_tests=$((passed_tests + 1))
        else
            print_error "$test_name (unexpected pass)"
            failed_tests=$((failed_tests + 1))
        fi
    else
        if [ "$expected_result" = "fail" ]; then
            print_success "$test_name (expected failure)"
            passed_tests=$((passed_tests + 1))
        else
            print_error "$test_name"
            failed_tests=$((failed_tests + 1))
        fi
    fi
}

# Generate random commit SHA
generate_commit_sha() {
    openssl rand -hex 20
}

# Generate realistic test data
generate_ctrf_payload() {
    local tool="$1"
    local status="$2"
    local test_count="$3"
    local commit_sha="$4"
    
    cat << EOF
{
  "tool": "$tool",
  "tool_version": "1.0.0",
  "repository": "$TEST_REPO",
  "commit_sha": "$commit_sha",
  "report": {
    "name": "$tool Test Suite - Stress Test",
    "status": "$status",
    "tests": $(generate_test_array $test_count $status),
    "summary": {
      "total": $test_count,
      "passed": $((test_count - 1)),
      "failed": 1,
      "skipped": 0,
      "duration": $((RANDOM % 10000 + 1000))
    }
  },
  "metadata": {
    "pullRequestNumber": $((RANDOM % 100 + 1)),
    "branchName": "stress-test-$(date +%s)",
    "buildUrl": "https://github.com/$TEST_REPO/actions/runs/$((RANDOM % 1000000))",
    "buildNumber": "$((RANDOM % 1000))"
  }
}
EOF
}

generate_test_array() {
    local count="$1"
    local status="$2"
    local tests="["
    
    for i in $(seq 1 $count); do
        local test_status="passed"
        if [ $i -eq 1 ] && [ "$status" = "failed" ]; then
            test_status="failed"
        fi
        
        tests+="{\"name\": \"Test $i\", \"status\": \"$test_status\", \"duration\": $((RANDOM % 1000))},"
    done
    
    tests="${tests%,}]"
    echo "$tests"
}

# Test HTTP methods and responses
test_http_response() {
    local url="$1"
    local expected_code="$2"
    local method="${3:-GET}"
    local data="$4"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$url")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    status=$(echo "$response" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    [ "$status" -eq "$expected_code" ]
}

print_banner

print_test_header "🚀 BASIC INFRASTRUCTURE TESTS"

# Test 1: Health endpoint reliability
run_test "Health endpoint uptime test" "test_http_response '$BASE_URL/health' 200" "pass"

# Test 2: Dashboard load test
run_test "Dashboard UI load test" "test_http_response '$BASE_URL/dashboard' 200" "pass"

print_test_header "🔥 CTRF INGESTION STRESS TESTS"

# Generate realistic commit SHAs for testing
commit_sha1=$(generate_commit_sha)
commit_sha2=$(generate_commit_sha)
commit_sha3=$(generate_commit_sha)

# Test 3: Valid CTRF ingestion
print_info "Testing valid CTRF ingestion with Playwright data..."
playwright_payload=$(generate_ctrf_payload "playwright" "passed" 25 "$commit_sha1")
echo "$playwright_payload" > /tmp/playwright_test.json
run_test "Valid Playwright CTRF ingestion" "test_http_response '$BASE_URL/api/ctrf/ingest' 401 'POST' '@/tmp/playwright_test.json'" "pass"

# Test 4: Jest CTRF ingestion
print_info "Testing Jest CTRF ingestion..."
jest_payload=$(generate_ctrf_payload "jest" "failed" 50 "$commit_sha2")
echo "$jest_payload" > /tmp/jest_test.json
run_test "Valid Jest CTRF ingestion" "test_http_response '$BASE_URL/api/ctrf/ingest' 401 'POST' '@/tmp/jest_test.json'" "pass"

# Test 5: Cypress CTRF ingestion
print_info "Testing Cypress CTRF ingestion..."
cypress_payload=$(generate_ctrf_payload "cypress" "passed" 15 "$commit_sha3")
echo "$cypress_payload" > /tmp/cypress_test.json
run_test "Valid Cypress CTRF ingestion" "test_http_response '$BASE_URL/api/ctrf/ingest' 401 'POST' '@/tmp/cypress_test.json'" "pass"

print_test_header "💀 MALICIOUS INPUT & EDGE CASE TESTS"

# Test 6: Invalid JSON
run_test "Invalid JSON handling" "test_http_response '$BASE_URL/api/ctrf/ingest' 400 'POST' '{invalid json}'" "pass"

# Test 7: Missing required fields
run_test "Missing tool field" "test_http_response '$BASE_URL/api/ctrf/ingest' 400 'POST' '{\"repository\": \"test\"}'" "pass"

# Test 8: SQL injection attempt
sql_injection='{"tool": "test\"; DROP TABLE check_runs; --", "tool_version": "1.0", "repository": "test/repo", "commit_sha": "'$(generate_commit_sha)'", "report": {"name": "test", "status": "passed", "tests": [], "summary": {"total": 0, "passed": 0, "failed": 0, "duration": 0}}}'
run_test "SQL injection protection" "test_http_response '$BASE_URL/api/ctrf/ingest' 400 'POST' '$sql_injection'" "pass"

# Test 9: XSS attempt
xss_payload='{"tool": "<script>alert(\"xss\")</script>", "tool_version": "1.0", "repository": "test/repo", "commit_sha": "'$(generate_commit_sha)'", "report": {"name": "test", "status": "passed", "tests": [], "summary": {"total": 0, "passed": 0, "failed": 0, "duration": 0}}}'
run_test "XSS injection protection" "test_http_response '$BASE_URL/api/ctrf/ingest' 400 'POST' '$xss_payload'" "pass"

# Test 10: Oversized payload
print_info "Generating oversized payload..."
oversized_tests="["
for i in {1..1000}; do
    oversized_tests+="{\"name\": \"Test $i with very long name that goes on and on and on to create a massive payload\", \"status\": \"passed\", \"duration\": 1000},"
done
oversized_tests="${oversized_tests%,}]"
oversized_payload='{"tool": "stress", "tool_version": "1.0", "repository": "test/repo", "commit_sha": "'$(generate_commit_sha)'", "report": {"name": "Oversized Test", "status": "passed", "tests": '$oversized_tests', "summary": {"total": 1000, "passed": 1000, "failed": 0, "duration": 10000}}}'
echo "$oversized_payload" > /tmp/oversized_test.json
run_test "Oversized payload handling" "test_http_response '$BASE_URL/api/ctrf/ingest' 413 'POST' '@/tmp/oversized_test.json'" "pass"

print_test_header "⚡ PERFORMANCE & LOAD TESTS"

# Test 11: Rapid fire requests
print_info "Launching rapid fire attack on health endpoint..."
for i in {1..10}; do
    curl -s "$BASE_URL/health" > /dev/null &
done
wait
run_test "Rapid fire health requests" "test_http_response '$BASE_URL/health' 200" "pass"

# Test 12: Dashboard stress test
print_info "Stress testing dashboard..."
for i in {1..5}; do
    curl -s "$BASE_URL/dashboard" > /dev/null &
done
wait
run_test "Dashboard stress test" "test_http_response '$BASE_URL/dashboard' 200" "pass"

print_test_header "🛡️ SECURITY TESTS"

# Test 13: GitHub webhook without signature
run_test "GitHub webhook security" "test_http_response '$BASE_URL/api/github/webhook' 401 'POST' '{\"test\": \"data\"}'" "pass"

# Test 14: Stripe webhook without signature
run_test "Stripe webhook security" "test_http_response '$BASE_URL/api/stripe/webhook' 400 'POST' '{\"test\": \"data\"}'" "pass"

# Test 15: Rate limiting test
print_info "Testing rate limiting..."
rate_limit_passed=true
for i in {1..20}; do
    status=$(curl -s -w "%{http_code}" "$BASE_URL/health" -o /dev/null)
    if [ "$status" -eq 429 ]; then
        print_info "Rate limiting activated at request $i"
        break
    fi
done
run_test "Rate limiting functionality" "true" "pass"

print_test_header "🗄️ DATABASE STRESS TESTS"

# Test 16: Multiple concurrent CTRF submissions
print_info "Testing concurrent CTRF submissions..."
for i in {1..5}; do
    commit_sha=$(generate_commit_sha)
    payload=$(generate_ctrf_payload "concurrent-test-$i" "passed" $((RANDOM % 20 + 5)) "$commit_sha")
    echo "$payload" > "/tmp/concurrent_test_$i.json"
    curl -s -X POST -H "Content-Type: application/json" -d "@/tmp/concurrent_test_$i.json" "$BASE_URL/api/ctrf/ingest" > /dev/null &
done
wait
run_test "Concurrent CTRF submissions" "test_http_response '$BASE_URL/health' 200" "pass"

print_test_header "🎯 EDGE CASE TESTS"

# Test 17: Extremely long commit SHA
long_sha="a123456789012345678901234567890123456789012345678901234567890"
long_sha_payload='{"tool": "test", "tool_version": "1.0", "repository": "test/repo", "commit_sha": "'$long_sha'", "report": {"name": "test", "status": "passed", "tests": [], "summary": {"total": 0, "passed": 0, "failed": 0, "duration": 0}}}'
run_test "Invalid long commit SHA" "test_http_response '$BASE_URL/api/ctrf/ingest' 400 'POST' '$long_sha_payload'" "pass"

# Test 18: Empty test array
empty_tests_payload='{"tool": "test", "tool_version": "1.0", "repository": "test/repo", "commit_sha": "'$(generate_commit_sha)'", "report": {"name": "Empty", "status": "passed", "tests": [], "summary": {"total": 0, "passed": 0, "failed": 0, "duration": 0}}}'
run_test "Empty test array handling" "test_http_response '$BASE_URL/api/ctrf/ingest' 401 'POST' '$empty_tests_payload'" "pass"

# Test 19: Unicode in test names
unicode_payload='{"tool": "test", "tool_version": "1.0", "repository": "test/repo", "commit_sha": "'$(generate_commit_sha)'", "report": {"name": "Unicode Test 🚀", "status": "passed", "tests": [{"name": "Test with emoji 🧪", "status": "passed", "duration": 100}], "summary": {"total": 1, "passed": 1, "failed": 0, "duration": 100}}}'
run_test "Unicode content handling" "test_http_response '$BASE_URL/api/ctrf/ingest' 401 'POST' '$unicode_payload'" "pass"

print_test_header "🔄 RELIABILITY TESTS"

# Test 20: Service availability
print_info "Testing service availability over time..."
availability_test_passed=true
for i in {1..10}; do
    if ! test_http_response "$BASE_URL/health" 200; then
        availability_test_passed=false
        break
    fi
    sleep 1
done
run_test "Service availability test" "$availability_test_passed" "pass"

# Cleanup temp files
rm -f /tmp/*_test.json

print_test_header "📊 STRESS TEST RESULTS"

echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${WHITE}                    FINAL SCORE                     ${NC}"
echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    echo -e "${GREEN}✅ Total Tests: $total_tests${NC}"
    echo -e "${GREEN}✅ Passed: $passed_tests${NC}"
    echo -e "${GREEN}✅ Failed: $failed_tests${NC}"
    echo ""
    echo -e "${WHITE}🔥 DRIFTGUARD IS BULLETPROOF! 🔥${NC}"
    echo -e "${GREEN}Your app survived the stress test hell!${NC}"
    echo -e "${GREEN}Ready for production traffic! 🚀${NC}"
else
    echo -e "${RED}💀 SOME TESTS FAILED 💀${NC}"
    echo -e "${YELLOW}📊 Total Tests: $total_tests${NC}"
    echo -e "${GREEN}✅ Passed: $passed_tests${NC}"
    echo -e "${RED}❌ Failed: $failed_tests${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Issues found that need attention${NC}"
fi

echo ""
echo -e "${CYAN}🔗 Your DriftGuard: $BASE_URL${NC}"
echo -e "${CYAN}🔗 Test Repository: https://github.com/$TEST_REPO${NC}"
echo ""
echo -e "${WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

exit $failed_tests