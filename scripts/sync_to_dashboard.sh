#!/usr/bin/env bash
# Sync Marriage Protection data to Wife Dashboard (Vercel)
set -euo pipefail

# Configuration
DASHBOARD_URL="${MARRIAGE_DASHBOARD_URL:-https://marriage-protection-dashboard-qqueovhwt-matthew-utts-projects.vercel.app}"
WEBHOOK_SECRET="${WEBHOOK_SECRET:-e6816565d004404fe0770c6d536f88ae}"
SYNC_INTERVAL="${SYNC_INTERVAL:-30}"  # seconds

# Files to sync
LOG_FILE="front-desk/log.jsonl"
ACTIVITY_LOG="front-desk/activity.jsonl"
STATE_FILE=".ops/session/$(date +%Y-%m-%d).state"

echo "[sync] Starting Marriage Protection dashboard sync..."

sync_status() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Get current marriage protection status
    local work_seconds=0
    local daemon_running=false
    
    if [[ -f "$STATE_FILE" ]]; then
        work_seconds=$(grep "work_seconds=" "$STATE_FILE" | cut -d'=' -f2 || echo "0")
    fi
    
    if [[ -f ".ops/marriage_protection.pid" ]] && kill -0 "$(cat .ops/marriage_protection.pid)" 2>/dev/null; then
        daemon_running=true
    fi
    
    # Get current activity
    local current_activity="{}"
    if [[ -f "$ACTIVITY_LOG" ]]; then
        current_activity=$(tail -1 "$ACTIVITY_LOG" 2>/dev/null || echo "{}")
    fi
    
    # Get recent activities (last 10)
    local recent_activities="[]"
    if [[ -f "$ACTIVITY_LOG" ]]; then
        recent_activities=$(tail -10 "$ACTIVITY_LOG" 2>/dev/null | jq -s '.' || echo "[]")
    fi
    
    # Determine status
    local status="WITHIN_LIMITS"
    if [[ $work_seconds -ge $((8 * 3600)) ]]; then
        if [[ -f ".ops/approvals/$(date +%Y-%m-%d).code" ]]; then
            status="OVERTIME_APPROVED"
        else
            status="OVERTIME_BLOCKED"
        fi
    elif [[ $work_seconds -ge $((6 * 3600)) ]]; then
        status="APPROACHING_LIMIT"
    fi
    
    # Create status payload
    local payload=$(jq -n \
        --arg timestamp "$timestamp" \
        --arg status "$status" \
        --argjson work_seconds "$work_seconds" \
        --argjson daemon_running "$daemon_running" \
        --argjson current_activity "$current_activity" \
        --argjson recent_activities "$recent_activities" \
        '{
            timestamp: $timestamp,
            work_seconds: $work_seconds,
            status: $status,
            daemon_running: $daemon_running,
            last_activity: $timestamp,
            current_activity: $current_activity,
            recent_activities: $recent_activities
        }')
    
    # Send to dashboard
    curl -s -X POST "$DASHBOARD_URL/api/sync" \
        -H "Content-Type: application/json" \
        -H "X-Webhook-Secret: $WEBHOOK_SECRET" \
        -d "$payload" > /dev/null || echo "[sync] Failed to sync"
    
    echo "[sync] Status synced to dashboard at $(date)"
}

# Handle emergency halt from dashboard
setup_halt_listener() {
    # Create a simple webhook listener for emergency halts
    local halt_file=".ops/emergency_halt_request"
    
    if [[ -f "$halt_file" ]]; then
        local halt_reason=$(cat "$halt_file")
        echo "[sync] Emergency halt requested from dashboard: $halt_reason"
        
        # Execute emergency halt
        ./scripts/marriage_protection.sh shutdown "$halt_reason"
        
        # Clean up halt request
        rm -f "$halt_file"
        
        echo "[sync] Emergency halt executed successfully"
    fi
}

# Handle overtime approvals from dashboard
setup_approval_listener() {
    local approval_file=".ops/dashboard_approval"
    
    if [[ -f "$approval_file" ]]; then
        local approval_code=$(cat "$approval_file")
        echo "[sync] Overtime approval received from dashboard: $approval_code"
        
        # Set approval code
        ./scripts/marriage_protection.sh wife-code set "$approval_code"
        
        # Clean up approval request
        rm -f "$approval_file"
        
        echo "[sync] Overtime approval set successfully"
    fi
}

# Continuous sync mode
continuous_sync() {
    echo "[sync] Starting continuous sync mode (interval: ${SYNC_INTERVAL}s)"
    
    while true; do
        sync_status
        setup_halt_listener
        setup_approval_listener
        sleep "$SYNC_INTERVAL"
    done
}

# One-time sync mode
one_time_sync() {
    sync_status
    setup_halt_listener
    setup_approval_listener
    echo "[sync] One-time sync completed"
}

# Commands
case "${1:-continuous}" in
    "continuous")
        continuous_sync
        ;;
    "once")
        one_time_sync
        ;;
    "status")
        sync_status
        ;;
    "help")
        echo "Marriage Protection Dashboard Sync"
        echo "Commands:"
        echo "  continuous  - Start continuous sync mode (default)"
        echo "  once        - Perform one-time sync"
        echo "  status      - Sync current status only"
        echo "  help        - Show this help"
        echo ""
        echo "Environment Variables:"
        echo "  MARRIAGE_DASHBOARD_URL - Dashboard URL (required)"
        echo "  MARRIAGE_DASHBOARD_API_KEY - API key (required)"
        echo "  SYNC_INTERVAL - Sync interval in seconds (default: 60)"
        ;;
    *)
        echo "Unknown command. Use 'help' for usage."
        exit 1
        ;;
esac