#!/usr/bin/env bash
# Marriage Protection Mode - 8h daily cap with background monitoring
set -euo pipefail

# Configuration
MAX_HOURS=8
MAX_SECONDS=$((MAX_HOURS * 3600))
CHECKIN_INTERVAL_SECONDS=7200  # 2 hours
IDLE_THRESHOLD_SECONDS=900     # 15 minutes
TICK_SECONDS=${TICK_SECONDS:-60}  # Configurable for testing

# Paths
OPS_DIR=".ops"
SESSION_DIR="$OPS_DIR/session"
APPROVALS_DIR="$OPS_DIR/approvals"
PID_FILE="$OPS_DIR/marriage_protection.pid"
LOG_FILE="front-desk/log.jsonl"
TODAY=$(date +%Y-%m-%d)
STATE_FILE="$SESSION_DIR/$TODAY.state"
APPROVAL_FILE="$APPROVALS_DIR/$TODAY.code"

# Ensure directories exist
mkdir -p "$SESSION_DIR" "$APPROVALS_DIR" "$(dirname "$LOG_FILE")" "reports/daily"

# Logging function
log_event() {
    local action="$1"
    local data="${2:-{}}"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local work_seconds=$(get_work_seconds)
    local task_ref=$(get_current_task_ref)
    
    local entry=$(cat <<EOF
{"timestamp":"$timestamp","module":"marriage_protection","action":"$action","seconds_today":$work_seconds,"task_ref":$task_ref,"data":$data,"source":"marriage_protection"}
EOF
)
    echo "$entry" >> "$LOG_FILE"
}

# Get current work seconds for today
get_work_seconds() {
    if [[ -f "$STATE_FILE" ]]; then
        local work_seconds=$(grep "work_seconds=" "$STATE_FILE" | cut -d'=' -f2)
        echo "${work_seconds:-0}"
    else
        echo "0"
    fi
}

# Get most recent T-ID from intake
get_current_task_ref() {
    if [[ -f "front-desk/intake.md" ]]; then
        local task_ref=$(grep -o "T-[0-9]\{4\}" "front-desk/triage.md" 2>/dev/null | tail -1)
        if [[ -n "$task_ref" ]]; then
            echo "\"$task_ref\""
        else
            echo "null"
        fi
    else
        echo "null"
    fi
}

# Check if files have been modified recently (activity detection)
detect_activity() {
    local threshold_time=$(($(date +%s) - IDLE_THRESHOLD_SECONDS))
    # Check for any file modifications in working tree within threshold
    if find . -maxdepth 3 -type f -newer <(date -d "@$threshold_time" '+%Y-%m-%d %H:%M:%S') 2>/dev/null | grep -q .; then
        return 0  # Activity detected
    else
        return 1  # No activity
    fi
}

# Background daemon loop
start_daemon() {
    local work_seconds=0
    local last_checkin_seconds=0
    local is_active=true
    
    # Load existing state
    if [[ -f "$STATE_FILE" ]]; then
        work_seconds=$(grep "work_seconds=" "$STATE_FILE" | cut -d'=' -f2 || echo "0")
        last_checkin_seconds=$(grep "last_checkin=" "$STATE_FILE" | cut -d'=' -f2 || echo "0")
    fi
    
    log_event "daemon_started" "{\"initial_seconds\":$work_seconds}"
    
    # Start activity monitor for wife transparency
    echo "[marriage-protection] Starting activity transparency monitoring..."
    ./scripts/activity_monitor.sh monitor &
    echo $! > "$OPS_DIR/activity_monitor.pid"
    
    while true; do
        sleep "$TICK_SECONDS"
        
        # Check if we should continue (approval needed?)
        if [[ $work_seconds -ge $MAX_SECONDS ]]; then
            if [[ ! -f "$APPROVAL_FILE" ]]; then
                log_event "overtime_blocked" "{\"seconds\":$work_seconds}"
                echo "⚠️  Overtime requires wife approval code. Work paused." >> "reports/daily/$TODAY.txt"
                # Don't increment time, just wait
                continue
            else
                log_event "overtime_approved" "{\"seconds\":$work_seconds}"
            fi
        fi
        
        # Activity detection
        if detect_activity; then
            if ! $is_active; then
                log_event "activity_resumed" "{\"seconds\":$work_seconds}"
                is_active=true
            fi
            work_seconds=$((work_seconds + TICK_SECONDS))
        else
            if $is_active; then
                log_event "idle_detected" "{\"seconds\":$work_seconds}"
                is_active=false
            fi
            # Don't increment work_seconds when idle
        fi
        
        # Check-in reminders
        if [[ $work_seconds -gt 0 ]] && [[ $((work_seconds - last_checkin_seconds)) -ge $CHECKIN_INTERVAL_SECONDS ]]; then
            log_event "checkin_reminder" "{\"seconds\":$work_seconds}"
            echo "💕 $(date): 2-hour check-in reminder - Go hug your wife!" >> "reports/daily/$TODAY.txt"
            last_checkin_seconds=$work_seconds
        fi
        
        # Save state atomically
        local temp_state=$(mktemp)
        cat > "$temp_state" <<EOF
work_seconds=$work_seconds
last_checkin=$last_checkin_seconds
last_tick=$(date +%s)
is_active=$is_active
EOF
        mv "$temp_state" "$STATE_FILE"
    done
}

# Start command
cmd_start() {
    if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo "Marriage protection daemon already running (PID: $(cat "$PID_FILE"))"
        return 1
    fi
    
    echo "Starting marriage protection daemon..."
    start_daemon &
    local pid=$!
    echo "$pid" > "$PID_FILE"
    log_event "daemon_start_requested" "{\"pid\":$pid}"
    echo "✅ Marriage protection daemon started (PID: $pid)"
}

# Status command
cmd_status() {
    local work_seconds=$(get_work_seconds)
    local hours=$((work_seconds / 3600))
    local minutes=$(((work_seconds % 3600) / 60))
    local next_checkin_seconds=$((CHECKIN_INTERVAL_SECONDS - (work_seconds % CHECKIN_INTERVAL_SECONDS)))
    local next_checkin_minutes=$((next_checkin_seconds / 60))
    
    echo "📊 Marriage Protection Status - $TODAY"
    echo "======================================="
    echo "Work time today: ${hours}h ${minutes}m"
    echo "Daily limit: ${MAX_HOURS}h"
    
    if [[ $work_seconds -ge $MAX_SECONDS ]]; then
        if [[ -f "$APPROVAL_FILE" ]]; then
            echo "Status: OVERTIME APPROVED"
        else
            echo "Status: OVERTIME - APPROVAL REQUIRED"
        fi
    else
        echo "Status: WITHIN LIMITS"
    fi
    
    echo "Next check-in: ${next_checkin_minutes} minutes"
    
    if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo "Daemon: RUNNING (PID: $(cat "$PID_FILE"))"
    else
        echo "Daemon: STOPPED"
    fi
    
    echo "Approval code: $(if [[ -f "$APPROVAL_FILE" ]]; then echo "SET"; else echo "NOT SET"; fi)"
}

# Stop command  
cmd_stop() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            log_event "daemon_stopped" "{\"pid\":$pid}"
            echo "✅ Marriage protection daemon stopped"
        else
            echo "Daemon not running (stale PID file)"
        fi
        rm -f "$PID_FILE"
    else
        echo "No daemon running"
    fi
    
    # Also stop activity monitor
    if [[ -f "$OPS_DIR/activity_monitor.pid" ]]; then
        local activity_pid=$(cat "$OPS_DIR/activity_monitor.pid")
        if kill -0 "$activity_pid" 2>/dev/null; then
            kill "$activity_pid"
            echo "✅ Activity transparency monitor stopped"
        fi
        rm -f "$OPS_DIR/activity_monitor.pid"
    fi
}

# Wife code commands
cmd_wife_code() {
    case "${2:-}" in
        "set")
            if [[ -z "${3:-}" ]]; then
                echo "Usage: marriage_protection.sh wife-code set <CODE>"
                return 1
            fi
            local code="$3"
            echo "$code" > "$APPROVAL_FILE"
            chmod 600 "$APPROVAL_FILE"
            log_event "approval_code_set" "{}"
            echo "✅ Wife approval code set for $TODAY"
            ;;
        "clear")
            rm -f "$APPROVAL_FILE"
            log_event "approval_code_cleared" "{}"
            echo "✅ Wife approval code cleared"
            ;;
        *)
            echo "Usage: marriage_protection.sh wife-code {set <CODE>|clear}"
            return 1
            ;;
    esac
}

# Emergency shutdown
cmd_shutdown() {
    local reason="${2:-wife_shutdown}"
    log_event "emergency_shutdown" "{\"reason\":\"$reason\"}"
    cmd_stop
    echo "🚨 EMERGENCY SHUTDOWN: $reason"
}

# Simulate overtime (for testing)
cmd_simulate() {
    if [[ "${2:-}" == "--overtime" ]]; then
        local temp_state=$(mktemp)
        cat > "$temp_state" <<EOF
work_seconds=$((MAX_SECONDS + 1800))
last_checkin=0
last_tick=$(date +%s)
is_active=true
EOF
        mv "$temp_state" "$STATE_FILE"
        log_event "simulation_overtime" "{\"seconds\":$((MAX_SECONDS + 1800))}"
        echo "✅ Simulated overtime condition (8h30m worked)"
    else
        echo "Usage: marriage_protection.sh simulate --overtime"
    fi
}

# Help command
cmd_help() {
    cat <<EOF
Marriage Protection Mode - Usage:
  start                     Start background daemon
  status                    Show current status
  stop                      Stop background daemon
  wife-code set <CODE>      Set wife approval code
  wife-code clear           Clear approval code
  shutdown [reason]         Emergency stop with reason
  simulate --overtime       Simulate overtime for testing
  help                      Show this help

Background daemon enforces:
- 8 hour daily work limit
- 2 hour check-in reminders  
- Activity-based time tracking
- Wife approval codes for overtime
- Complete JSONL audit trail
EOF
}

# Main command dispatch
case "${1:-help}" in
    "start") cmd_start ;;
    "status") cmd_status ;;
    "stop") cmd_stop ;;
    "wife-code") cmd_wife_code "$@" ;;
    "shutdown") cmd_shutdown "$@" ;;
    "simulate") cmd_simulate "$@" ;;
    "help"|*) cmd_help ;;
esac