#!/bin/bash
# Rule Enforcement Helper - Prevents spiral behavior

# RULE 1: Start 25-minute timer
start_session() {
    local file_choice=$1
    if [ -z "$file_choice" ]; then
        echo "ERROR: Must declare which file to edit (intake/triage/log/report)"
        exit 1
    fi
    
    echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"event\":\"session_start\",\"locked_file\":\"$file_choice\",\"duration_min\":25}" >> front-desk/log.jsonl
    echo "SESSION STARTED: You have 25 minutes. Editing: $file_choice"
    echo "Timer started at $(date)"
    
    # Background timer
    (sleep 1500 && echo -e "\n\n🛑 STOP NOW! 25 MINUTES COMPLETE! 🛑\n\n" && \
     echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"event\":\"session_end\",\"forced_stop\":true}" >> front-desk/log.jsonl) &
    
    echo "Timer PID: $!"
}

# RULE 2: 70% Decision Helper  
make_decision() {
    echo "List 7 things you KNOW:"
    for i in {1..7}; do
        read -p "$i. " known
    done
    
    echo "List up to 3 things you DON'T know:"
    for i in {1..3}; do
        read -p "$i. " unknown
        if [ ! -z "$unknown" ]; then
            echo "UNKNOWN: $unknown" >> front-desk/intake.md
        fi
    done
    
    echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"event\":\"70_percent_decision\",\"acted\":true}" >> front-desk/log.jsonl
    echo "✓ Decision recorded. Proceed with action."
}

# RULE 3: Create revert point
create_revert() {
    local file=$1
    cp "$file" "$file.bak"
    echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"event\":\"revert_point\",\"file\":\"$file\"}" >> front-desk/log.jsonl
    echo "✓ Revert point created for $file"
}

# RULE 4: Check single-file lock
check_lock() {
    local changes=$(git status --porcelain | grep -v "^??" | wc -l)
    if [ "$changes" -gt 1 ]; then
        echo "❌ VIOLATION: Multiple files edited!"
        echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"violation\":\"rule_4\",\"penalty_served\":false}" >> front-desk/log.jsonl
        git checkout .
        echo "All changes reverted. Start over with ONE file."
        exit 1
    fi
}

# RULE 5: Detect redesign attempts
detect_redesign() {
    local new_files=$(git status --porcelain | grep "^??" | grep -v -E "(intake|triage|log|week-)" | wc -l)
    if [ "$new_files" -gt 0 ]; then
        echo "❌ VIOLATION: New files detected (redesign attempt)!"
        echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"violation\":\"rule_5\",\"penalty_served\":false}" >> front-desk/log.jsonl
        echo "Penalty: Add 10 items to intake.md immediately"
        exit 1
    fi
}

# Compliance check
check_compliance() {
    local violations=$(grep "violation" front-desk/log.jsonl 2>/dev/null | wc -l)
    echo "Total violations: $violations"
    
    if [ "$violations" -gt 3 ]; then
        echo "⚠️  PENALTY MODE ACTIVE:"
        echo "- Next session: 15 minutes only"
        echo "- Manual mode only (no scripts)"
        echo "- Write 'I follow the rules' 10x in intake.md"
    fi
}

# Main menu
case "$1" in
    start)
        start_session "$2"
        ;;
    decide)
        make_decision
        ;;
    revert)
        create_revert "$2"
        ;;
    check)
        check_lock
        detect_redesign
        ;;
    comply)
        check_compliance
        ;;
    doubt)
        # Quick doubt check
        echo "Checking doubt events..."
        DOUBT_COUNT=$(grep -c "doubt_cleared" front-desk/log.jsonl 2>/dev/null || echo 0)
        echo "Doubt events today: $DOUBT_COUNT"
        if [ "$DOUBT_COUNT" -gt 3 ]; then
            echo "⚠️  HIGH DOUBT - Take a break"
        fi
        ;;
    *)
        echo "Usage: $0 {start|decide|revert|check|comply|doubt} [file]"
        echo ""
        echo "Commands:"
        echo "  start <intake|triage|log|report> - Start 25min session"
        echo "  decide                            - Make 70% decision"
        echo "  revert <file>                     - Create revert point"
        echo "  check                             - Verify rule compliance"
        echo "  comply                            - Show violation count"
        echo "  doubt                             - Check doubt frequency"
        exit 1
        ;;
esac