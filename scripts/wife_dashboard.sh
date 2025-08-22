#!/usr/bin/env bash
# Wife Dashboard - Monitor and control marriage protection
set -euo pipefail

# Configuration
WIFE_SECRET_FILE=".ops/wife.secret" 
LOG_FILE="front-desk/log.jsonl"

# Ensure wife secret exists
setup_wife_access() {
    if [[ ! -f "$WIFE_SECRET_FILE" ]]; then
        echo "👋 Welcome! Setting up wife dashboard access..."
        echo ""
        echo "This dashboard gives you full control over work time limits."
        echo "You can monitor daily hours, set approval codes, and emergency halt work."
        echo ""
        read -s -p "Create a secret passcode for dashboard access: " secret
        echo ""
        echo "$secret" > "$WIFE_SECRET_FILE"
        chmod 600 "$WIFE_SECRET_FILE"
        echo "✅ Wife dashboard access configured!"
        echo ""
    fi
}

# Verify wife access
verify_access() {
    if [[ ! -f "$WIFE_SECRET_FILE" ]]; then
        echo "❌ Wife dashboard not set up. Run: wife_dashboard.sh setup"
        exit 1
    fi
    
    read -s -p "Enter wife dashboard passcode: " input_secret
    echo ""
    
    if [[ "$input_secret" != "$(cat "$WIFE_SECRET_FILE")" ]]; then
        echo "❌ Invalid passcode. Access denied."
        exit 1
    fi
    
    echo "✅ Access granted!"
    echo ""
}

# Parse work sessions from JSONL log
parse_work_sessions() {
    local period="$1"  # "today" or "week"
    local start_date
    
    if [[ "$period" == "today" ]]; then
        start_date=$(date +%Y-%m-%d)
    else
        # Week starts on Monday
        start_date=$(date -d "monday" +%Y-%m-%d)
    fi
    
    if [[ ! -f "$LOG_FILE" ]]; then
        echo "No work log found."
        return
    fi
    
    # Extract marriage_protection events
    grep '"module":"marriage_protection"' "$LOG_FILE" 2>/dev/null | \
    jq -r "select(.timestamp >= \"${start_date}T00:00:00Z\") | [.timestamp, .action, .seconds_today] | @csv" 2>/dev/null || true
}

# Today's summary
cmd_today() {
    echo "📊 TODAY'S WORK SUMMARY - $(date +%Y-%m-%d)"
    echo "============================================"
    
    local current_seconds=0
    if [[ -f ".ops/session/$(date +%Y-%m-%d).state" ]]; then
        current_seconds=$(grep "work_seconds=" ".ops/session/$(date +%Y-%m-%d).state" | cut -d'=' -f2)
    fi
    
    local hours=$((current_seconds / 3600))
    local minutes=$(((current_seconds % 3600) / 60))
    
    echo "⏱️  Current work time: ${hours}h ${minutes}m"
    echo "📏 Daily limit: 8h"
    
    if [[ $current_seconds -ge 28800 ]]; then  # 8 hours
        echo "🚨 Status: OVERTIME"
        if [[ -f ".ops/approvals/$(date +%Y-%m-%d).code" ]]; then
            echo "✅ Your approval code is active"
        else
            echo "⚠️  No approval code set - work is blocked"
        fi
    else
        local remaining=$((28800 - current_seconds))
        local remaining_hours=$((remaining / 3600))
        local remaining_minutes=$(((remaining % 3600) / 60))
        echo "✅ Status: Within limits (${remaining_hours}h ${remaining_minutes}m remaining)"
    fi
    
    echo ""
    echo "📋 Recent Activity:"
    parse_work_sessions "today" | tail -5 | while IFS=',' read -r timestamp action seconds; do
        local clean_timestamp=$(echo "$timestamp" | tr -d '"' | cut -dT -f2 | cut -d: -f1,2)
        local clean_action=$(echo "$action" | tr -d '"')
        local clean_seconds=$(echo "$seconds" | tr -d '"')
        local hours=$((clean_seconds / 3600))
        local mins=$(((clean_seconds % 3600) / 60))
        echo "  $clean_timestamp: $clean_action (${hours}h ${mins}m total)"
    done
    
    # Check for daemon status
    if [[ -f ".ops/marriage_protection.pid" ]] && kill -0 "$(cat ".ops/marriage_protection.pid")" 2>/dev/null; then
        echo ""
        echo "🟢 Monitoring daemon: ACTIVE"
    else
        echo ""
        echo "🔴 Monitoring daemon: STOPPED"
    fi
}

# Week summary
cmd_week() {
    echo "📊 THIS WEEK'S WORK SUMMARY"
    echo "============================"
    
    local total_seconds=0
    local days_worked=0
    local overtime_days=0
    
    # Analyze each day this week
    for i in {0..6}; do
        local check_date=$(date -d "monday +$i days" +%Y-%m-%d)
        local state_file=".ops/session/$check_date.state"
        
        if [[ -f "$state_file" ]]; then
            local day_seconds=$(grep "work_seconds=" "$state_file" | cut -d'=' -f2)
            if [[ $day_seconds -gt 0 ]]; then
                local day_hours=$((day_seconds / 3600))
                local day_minutes=$(((day_seconds % 3600) / 60))
                local day_name=$(date -d "$check_date" +%A)
                
                echo "  $day_name ($check_date): ${day_hours}h ${day_minutes}m"
                total_seconds=$((total_seconds + day_seconds))
                days_worked=$((days_worked + 1))
                
                if [[ $day_seconds -gt 28800 ]]; then
                    overtime_days=$((overtime_days + 1))
                    echo "    ⚠️  Overtime on this day"
                fi
            fi
        fi
    done
    
    echo ""
    local total_hours=$((total_seconds / 3600))
    local total_minutes=$(((total_seconds % 3600) / 60))
    echo "📊 Week totals:"
    echo "  Total work time: ${total_hours}h ${total_minutes}m"
    echo "  Days worked: $days_worked/7"
    echo "  Overtime days: $overtime_days"
    echo "  Average per day: $((total_seconds / 7 / 3600))h $((total_seconds / 7 % 3600 / 60))m"
}

# Set approval code
cmd_set_code() {
    local code="${1:-}"
    if [[ -z "$code" ]]; then
        read -p "Enter approval code for today: " code
    fi
    
    if [[ -z "$code" ]]; then
        echo "❌ No code provided"
        return 1
    fi
    
    local approval_file=".ops/approvals/$(date +%Y-%m-%d).code"
    echo "$code" > "$approval_file"
    chmod 600 "$approval_file"
    
    echo "✅ Approval code set for $(date +%Y-%m-%d)"
    echo "Matt can now work overtime today with code: $code"
    
    # Log the action
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local entry="{\"timestamp\":\"$timestamp\",\"module\":\"marriage_protection\",\"action\":\"wife_set_approval_code\",\"seconds_today\":0,\"task_ref\":null,\"data\":{},\"source\":\"wife_dashboard\"}"
    echo "$entry" >> "$LOG_FILE"
}

# Revoke approval
cmd_revoke() {
    local approval_file=".ops/approvals/$(date +%Y-%m-%d).code"
    rm -f "$approval_file"
    
    echo "✅ Approval code revoked for $(date +%Y-%m-%d)"
    echo "Matt's work will be blocked when he hits 8 hours"
    
    # Log the action
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local entry="{\"timestamp\":\"$timestamp\",\"module\":\"marriage_protection\",\"action\":\"wife_revoked_approval\",\"seconds_today\":0,\"task_ref\":null,\"data\":{},\"source\":\"wife_dashboard\"}"
    echo "$entry" >> "$LOG_FILE"
}

# Emergency halt
cmd_halt() {
    echo "🚨 INITIATING EMERGENCY HALT"
    echo "This will immediately stop all work monitoring."
    read -p "Are you sure? (yes/no): " confirm
    
    if [[ "$confirm" == "yes" ]]; then
        scripts/marriage_protection.sh shutdown "emergency_wife_halt"
        echo "✅ Work monitoring halted immediately"
        echo "Matt has been notified to stop working"
    else
        echo "Halt cancelled"
    fi
}

# Help
cmd_help() {
    cat <<EOF
👋 Wife Dashboard - Marriage Protection Control Panel

Available commands:
  today           Show today's work summary and status
  week            Show this week's work summary  
  set-code [CODE] Set approval code for overtime today
  revoke          Remove approval code (blocks overtime)
  halt            Emergency stop all work monitoring
  help            Show this help

Examples:
  ./wife_dashboard.sh today
  ./wife_dashboard.sh set-code 1234
  ./wife_dashboard.sh halt

Purpose:
This dashboard gives you complete control over work time limits.
You can monitor daily/weekly hours, approve overtime when needed,
and emergency-halt work sessions anytime.

All actions are logged for transparency.
EOF
}

# Setup command
cmd_setup() {
    setup_wife_access
}

# Main command dispatch
case "${1:-help}" in
    "setup")
        cmd_setup
        ;;
    "today"|"week"|"set-code"|"revoke"|"halt")
        if [[ "${1}" != "setup" ]]; then
            verify_access
        fi
        case "${1}" in
            "today") cmd_today ;;
            "week") cmd_week ;;
            "set-code") cmd_set_code "${2:-}" ;;
            "revoke") cmd_revoke ;;
            "halt") cmd_halt ;;
        esac
        ;;
    "help"|*)
        cmd_help
        ;;
esac