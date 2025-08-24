#!/usr/bin/env bash
#
# Test script for Front Desk n8n webhook
# Tests the n8n webhook endpoint with a minimal payload
#
# Required environment variables:
#   N8N_WEBHOOK_PROD_URL - Production webhook URL from n8n
#   N8N_WEBHOOK_SECRET - Shared secret for authentication
#
# Usage:
#   export N8N_WEBHOOK_PROD_URL="https://mmtuentertainment.app.n8n.cloud/webhook/[id]/frontdesk/intake"
#   export N8N_WEBHOOK_SECRET="your-secret-here"
#   ./scripts/test-webhook.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check required environment variables
if [ -z "${N8N_WEBHOOK_PROD_URL:-}" ]; then
    echo -e "${RED}Error: N8N_WEBHOOK_PROD_URL is not set${NC}"
    echo "Please set: export N8N_WEBHOOK_PROD_URL='https://your-instance.app.n8n.cloud/webhook/[id]/frontdesk/intake'"
    exit 1
fi

if [ -z "${N8N_WEBHOOK_SECRET:-}" ]; then
    echo -e "${RED}Error: N8N_WEBHOOK_SECRET is not set${NC}"
    echo "Please set: export N8N_WEBHOOK_SECRET='your-secret-here'"
    exit 1
fi

echo -e "${GREEN}Testing Front Desk n8n Webhook${NC}"
echo "URL: ${N8N_WEBHOOK_PROD_URL}"
echo ""

# Test payload - minimal valid data
PAYLOAD='{
  "subject": "Test Ticket - Webhook Integration",
  "body": "This is a test ticket created by the webhook test script.",
  "contact": {
    "email": "ops@example.com",
    "name": "Test User",
    "phone": "+14155551234",
    "language": "en-US",
    "timezone": "America/New_York"
  },
  "tags": ["test", "webhook", "integration"],
  "priority": "P3",
  "status": "NEW",
  "category": "test"
}'

echo -e "${YELLOW}Sending test payload...${NC}"

# Send request and capture response
RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "${N8N_WEBHOOK_PROD_URL}" \
    -H 'Content-Type: application/json' \
    -H 'x-frontdesk-source: local-test' \
    -H "x-signature: ${N8N_WEBHOOK_SECRET}" \
    -d "${PAYLOAD}" 2>&1) || {
    echo -e "${RED}Error: Failed to send webhook request${NC}"
    echo "curl error: $?"
    exit 1
}

# Extract HTTP status code (last line) and body (everything else)
HTTP_CODE=$(echo "${RESPONSE}" | tail -n1)
BODY=$(echo "${RESPONSE}" | sed '$d')

echo ""
echo "HTTP Status: ${HTTP_CODE}"

# Check status code
if [ "${HTTP_CODE}" -eq 200 ]; then
    echo -e "${GREEN}✓ Webhook test successful!${NC}"
    echo ""
    echo "Response body:"
    if command -v jq &> /dev/null; then
        echo "${BODY}" | jq '.' || echo "${BODY}"
    else
        echo "${BODY}"
    fi
    
    # Check for expected fields in response
    if echo "${BODY}" | grep -q '"status"'; then
        echo ""
        echo -e "${GREEN}✓ Response contains expected fields${NC}"
        
        # Check if ingested successfully
        if echo "${BODY}" | grep -q '"ingested"'; then
            echo -e "${GREEN}✓ Data successfully ingested${NC}"
        elif echo "${BODY}" | grep -q '"normalized"'; then
            echo -e "${YELLOW}⚠ Data normalized but not ingested (ingest service may be down)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Response format unexpected${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}Test completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Check n8n Executions tab for this run"
    echo "2. Verify data in front-desk/log.jsonl"
    echo "3. Configure your helpdesk webhook using the same URL and secret"
    
elif [ "${HTTP_CODE}" -eq 401 ]; then
    echo -e "${RED}✗ Authentication failed (401)${NC}"
    echo "Check that x-signature header matches N8N_WEBHOOK_SECRET"
    echo "Response: ${BODY}"
    exit 1
    
elif [ "${HTTP_CODE}" -eq 404 ]; then
    echo -e "${RED}✗ Webhook not found (404)${NC}"
    echo "Possible causes:"
    echo "- Workflow not activated"
    echo "- Using test URL instead of production URL"
    echo "- Incorrect webhook path"
    echo "Response: ${BODY}"
    exit 1
    
elif [ "${HTTP_CODE}" -eq 500 ]; then
    echo -e "${RED}✗ Server error (500)${NC}"
    echo "Check n8n execution logs for details"
    echo "Response: ${BODY}"
    exit 1
    
else
    echo -e "${RED}✗ Unexpected status code: ${HTTP_CODE}${NC}"
    echo "Response: ${BODY}"
    exit 1
fi