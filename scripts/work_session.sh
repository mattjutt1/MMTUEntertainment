#!/usr/bin/env bash
# Work Session Manager - Wraps all work activities with Marriage Protection
set -euo pipefail

# Marriage Protection: Check if work is allowed before ANY work
if ! ./scripts/marriage_protection.sh start; then
    exit 1
fi

# Trap to ensure session is logged on exit
trap './scripts/marriage_protection.sh stop' EXIT

echo "🛡️  Marriage Protection Mode: ACTIVE"
echo "📊 Run './scripts/marriage_protection.sh status' anytime to check daily hours"
echo "💕 Every 2 hours you'll be prompted to check in with your wife"
echo ""

# Start the work session
echo "Starting work session..."
echo "Available commands:"
echo "  1. ./scripts/daily_loop.sh     - Run 20-minute daily routine"
echo "  2. Normal development work     - Just start coding"
echo "  3. git/PR activities          - Version control work"
echo ""
echo "When done with ALL work for the day, press Ctrl+C or exit this session."
echo ""

# Keep session alive until user exits
echo "🚀 Work session active. Press Ctrl+C when done working for the day."
while true; do
    sleep 30
    # Check every 30 seconds if we should do a wife check-in
    if [[ -f .next_checkin ]] && [[ $(date +%s) -gt $(cat .next_checkin) ]]; then
        ./scripts/marriage_protection.sh check-in
        # Set next check-in for 2 hours from now
        echo $(($(date +%s) + 7200)) > .next_checkin
    fi
done