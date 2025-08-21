#!/bin/bash
set -e

# Local Stack Health Test Script
# Validates Cal.com and Zammad endpoints before creating PR

echo "🧪 Starting local stack health validation..."
echo "================================================"

# Configuration
TIMEOUT_CAL=12
TIMEOUT_ZAMMAD=8
SLEEP_CAL=15
SLEEP_ZAMMAD=20

cd stacks/business-ops

# Start stack
echo "🚀 Starting Business-Ops Stack (core profile)..."
docker compose --profile core up -d

echo "⏳ Waiting 60 seconds for service initialization..."
sleep 60

# Database health check
echo "🔍 Checking database readiness..."
for service in calcom-db zammad-postgresql; do
    if docker compose exec -T $service pg_isready > /dev/null 2>&1; then
        echo "  ✅ $service ready"
    else
        echo "  ❌ $service not ready"
        exit 1
    fi
done

# Cal.com health check with retry logic
echo "🔍 Testing Cal.com health endpoint..."
cal_status=""
for i in $(seq 1 $TIMEOUT_CAL); do
    cal_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8085/auth/setup?step=1" 2>/dev/null || echo "000")
    if [ "$cal_status" = "200" ]; then
        echo "  ✅ Cal.com health check passed (attempt $i/$TIMEOUT_CAL)"
        break
    else
        echo "  ⏳ Cal.com attempt $i/$TIMEOUT_CAL failed (status: $cal_status)"
        if [ $i -eq $TIMEOUT_CAL ]; then
            echo "  ❌ Cal.com health check failed after $TIMEOUT_CAL attempts"
            echo "  📋 Cal.com logs:"
            docker compose logs calcom --tail=10
            exit 1
        fi
        sleep $SLEEP_CAL
    fi
done

# Zammad health check with retry logic
echo "🔍 Testing Zammad multi-service health..."
zammad_success=false
for i in $(seq 1 $TIMEOUT_ZAMMAD); do
    # Get Rails container IP
    RAILS_IP=$(docker inspect business-ops_zammad-railsserver_1 2>/dev/null | jq -r '.[0].NetworkSettings.Networks."business-ops-network".IPAddress' 2>/dev/null || echo "")
    
    if [ -n "$RAILS_IP" ] && [ "$RAILS_IP" != "null" ]; then
        response=$(curl -s --max-time 5 "http://$RAILS_IP:3000/api/v1/getting_started" 2>/dev/null || echo "")
        if echo "$response" | jq -e '.setup_done != null' > /dev/null 2>&1; then
            echo "  ✅ Zammad Rails health check passed (attempt $i/$TIMEOUT_ZAMMAD)"
            zammad_success=true
            break
        fi
    fi
    
    echo "  ⏳ Zammad attempt $i/$TIMEOUT_ZAMMAD failed"
    if [ $i -eq $TIMEOUT_ZAMMAD ]; then
        echo "  ❌ Zammad health check failed after $TIMEOUT_ZAMMAD attempts"
        echo "  📋 Zammad logs:"
        docker compose logs zammad-railsserver --tail=10
        docker compose logs zammad-postgresql --tail=5
        exit 1
    fi
    sleep $SLEEP_ZAMMAD
done

# Success summary
echo ""
echo "🎉 LOCAL HEALTH CHECK PASSED!"
echo "================================================"
echo "✅ Cal.com: HTTP $cal_status from /auth/setup?step=1"
echo "✅ Zammad: Valid JSON from Rails API /api/v1/getting_started"
echo "✅ Databases: PostgreSQL containers healthy"
echo ""
echo "🚀 Ready to create PR with confidence!"
echo "   Your changes will pass CI smoke tests."

# Cleanup
echo ""
echo "🧹 Cleaning up containers..."
docker compose --profile core down -v --remove-orphans > /dev/null 2>&1

echo "✨ Local validation complete."