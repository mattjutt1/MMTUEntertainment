#!/usr/bin/env bash
# Enhanced Activity Monitor for Marriage Protection Mode
# Provides complete transparency of work activities for wife dashboard

set -euo pipefail

# Configuration
ACTIVITY_LOG="front-desk/activity.jsonl"
MONITOR_INTERVAL=${MONITOR_INTERVAL:-30}  # seconds
PRIVACY_FILTER=1  # Filter sensitive content

# Ensure log directory exists
mkdir -p "$(dirname "$ACTIVITY_LOG")"

# Get current work context
get_work_context() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local context="{}"
    
    # Current directory and project
    if [[ -d .git ]]; then
        local git_branch=$(git branch --show-current 2>/dev/null || echo "unknown")
        local git_repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
        local last_commit=$(git log -1 --oneline 2>/dev/null || echo "No commits")
        
        context=$(echo "$context" | jq --arg repo "$git_repo" --arg branch "$git_branch" --arg commit "$last_commit" \
            '. + {git_repo: $repo, git_branch: $branch, last_commit: $commit}')
    fi
    
    # Recently modified files (last 5 minutes)
    local recent_files=()
    while IFS= read -r -d '' file; do
        # Skip hidden files and sensitive paths
        if [[ ! "$file" =~ ^\.|/\.|node_modules|\.git/ ]]; then
            recent_files+=("$(basename "$file")")
        fi
    done < <(find . -maxdepth 3 -type f -newermt "5 minutes ago" -print0 2>/dev/null || true)
    
    if [[ ${#recent_files[@]} -gt 0 ]]; then
        local files_json=$(printf '%s\n' "${recent_files[@]}" | head -10 | jq -R . | jq -s .)
        context=$(echo "$context" | jq --argjson files "$files_json" '. + {recent_files: $files}')
    fi
    
    # Current triage task context
    if [[ -f "front-desk/triage.md" ]]; then
        local current_task=$(tail -5 "front-desk/triage.md" | grep "| T-" | tail -1 | cut -d'|' -f3 | xargs || echo "No active task")
        context=$(echo "$context" | jq --arg task "$current_task" '. + {current_task: $task}')
    fi
    
    # Active processes (development related)
    local dev_processes=()
    while IFS= read -r process; do
        dev_processes+=("$process")
    done < <(ps aux | grep -E "(code|vim|nano|node|npm|python|git)" | grep -v grep | awk '{print $11}' | sort | uniq | head -5 || true)
    
    if [[ ${#dev_processes[@]} -gt 0 ]]; then
        local proc_json=$(printf '%s\n' "${dev_processes[@]}" | jq -R . | jq -s .)
        context=$(echo "$context" | jq --argjson processes "$proc_json" '. + {active_processes: $processes}')
    fi
    
    # Terminal activity (last command, sanitized)
    local last_command=""
    if [[ -f ~/.bash_history ]]; then
        last_command=$(tail -1 ~/.bash_history 2>/dev/null | sed 's/^[[:space:]]*//' || echo "")
        # Filter sensitive commands
        if [[ "$last_command" =~ (password|secret|key|token) ]]; then
            last_command="[SENSITIVE COMMAND FILTERED]"
        fi
    fi
    
    context=$(echo "$context" | jq --arg cmd "$last_command" '. + {last_command: $cmd}')
    
    # Work session summary
    local session_duration=0
    if [[ -f ".ops/session/$(date +%Y-%m-%d).state" ]]; then
        session_duration=$(grep "work_seconds=" ".ops/session/$(date +%Y-%m-%d).state" | cut -d'=' -f2 || echo "0")
    fi
    
    local session_hours=$((session_duration / 3600))
    local session_minutes=$(((session_duration % 3600) / 60))
    
    # Create activity entry
    local activity_entry=$(jq -n \
        --arg timestamp "$timestamp" \
        --argjson context "$context" \
        --arg session "${session_hours}h ${session_minutes}m" \
        --arg location "$(pwd | sed "s|$HOME|~|")" \
        '{
            timestamp: $timestamp,
            type: "work_activity",
            session_time: $session,
            current_location: $location,
            work_context: $context,
            source: "activity_monitor"
        }')
    
    echo "$activity_entry"
}

# Log git activity when commits happen
log_git_activity() {
    if [[ -d .git ]]; then
        local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        local last_commit=$(git log -1 --pretty=format:'%h: %s' 2>/dev/null || echo "")
        
        if [[ -n "$last_commit" && ! -f ".last_logged_commit" || "$(cat .last_logged_commit 2>/dev/null)" != "$last_commit" ]]; then
            local files_changed=$(git diff --name-only HEAD~1 2>/dev/null | head -5 | tr '\n' ',' | sed 's/,$//' || echo "")
            
            local git_entry=$(jq -n \
                --arg timestamp "$timestamp" \
                --arg commit "$last_commit" \
                --arg files "$files_changed" \
                --arg branch "$(git branch --show-current)" \
                '{
                    timestamp: $timestamp,
                    type: "git_commit",
                    commit_message: $commit,
                    files_changed: $files,
                    branch: $branch,
                    source: "activity_monitor"
                }')
            
            echo "$git_entry" >> "$ACTIVITY_LOG"
            echo "$last_commit" > .last_logged_commit
        fi
    fi
}

# Main monitoring loop
monitor_activity() {
    echo "[activity-monitor] Starting work transparency monitoring..."
    
    while true; do
        # Log current work context
        local activity=$(get_work_context)
        echo "$activity" >> "$ACTIVITY_LOG"
        
        # Check for git activity
        log_git_activity
        
        # Keep activity log manageable (last 1000 entries)
        if [[ $(wc -l < "$ACTIVITY_LOG" 2>/dev/null || echo "0") -gt 1000 ]]; then
            tail -1000 "$ACTIVITY_LOG" > "${ACTIVITY_LOG}.tmp" && mv "${ACTIVITY_LOG}.tmp" "$ACTIVITY_LOG"
        fi
        
        sleep "$MONITOR_INTERVAL"
    done
}

# Commands
case "${1:-monitor}" in
    "monitor")
        monitor_activity
        ;;
    "current")
        get_work_context
        ;;
    "git-activity")
        log_git_activity
        ;;
    "help")
        echo "Marriage Protection Activity Monitor"
        echo "Commands:"
        echo "  monitor     - Start continuous activity monitoring"
        echo "  current     - Show current work context"
        echo "  git-activity- Log recent git activity"
        echo "  help        - Show this help"
        ;;
    *)
        echo "Unknown command. Use 'help' for usage."
        exit 1
        ;;
esac