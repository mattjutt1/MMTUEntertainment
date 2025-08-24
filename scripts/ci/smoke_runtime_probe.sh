#!/usr/bin/env bash
set -euo pipefail

JOB_NAME='Site E2E Smoke Tests (≤3min)'
WORKFLOW_NAME='Site E2E Smoke'

# Helper function to convert duration string (like "2m16s", "11s") to seconds
duration_to_seconds() {
  local duration="$1"
  local total=0
  
  # Extract minutes if present
  if [[ "$duration" =~ ([0-9]+)m ]]; then
    total=$((total + ${BASH_REMATCH[1]} * 60))
  fi
  
  # Extract seconds if present
  if [[ "$duration" =~ ([0-9]+)s ]]; then
    total=$((total + ${BASH_REMATCH[1]}))
  fi
  
  echo "$total"
}

# Get last 7 completed runs for the Site E2E Smoke workflow
RUN_DATA=$(gh run list --workflow="$WORKFLOW_NAME" -L 10 --status completed --json databaseId,url | jq -c '.[]')

if [[ -z "$RUN_DATA" ]]; then
  echo "No completed runs found for '$WORKFLOW_NAME' workflow." >&2; exit 1
fi

JOBS_JSON="[]"
COUNT=0

while IFS= read -r run_entry; do
  run_id=$(echo "$run_entry" | jq -r '.databaseId')
  html_url=$(echo "$run_entry" | jq -r '.url')
  
  # Get detailed job information for this run
  JOB_INFO=$(gh run view "$run_id" --json jobs | jq -c ".jobs[] | select(.name==\"$JOB_NAME\") | {run_id: \"$run_id\", html_url: \"$html_url\", started_at: .startedAt, completed_at: .completedAt}" || true)
  
  if [[ -n "$JOB_INFO" ]]; then
    JOBS_JSON=$(jq -c --argjson j "$JOB_INFO" '. + [$j]' <<<"$JOBS_JSON")
    COUNT=$((COUNT + 1))
    if [[ $COUNT -ge 7 ]]; then
      break
    fi
  fi
done <<<"$RUN_DATA"

if [[ $COUNT -eq 0 ]]; then
  echo "No matching job runs found for '$JOB_NAME'." >&2; exit 1
fi

# Compute durations and stats
JOBS_JSON=$(jq '[ .[] | . + {duration_sec: (( ( .completed_at | fromdateiso8601 ) - ( .started_at | fromdateiso8601 )) ) } ]' <<<"$JOBS_JSON")
LATEST_SECONDS=$(jq '.[0].duration_sec' <<<"$JOBS_JSON")
AVG_SECONDS=$(jq '[.[].duration_sec] | add / length' <<<"$JOBS_JSON")

# Calculate delta percentage using bc for better precision
DELTA_PCT=$(echo "scale=2; ($LATEST_SECONDS / $AVG_SECONDS - 1) * 100" | bc)

# Decision & action
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
STATUS="OK"
# Check for regression: latest > 180s OR latest > 120% of average
REGRESSION_CHECK="false"
if (( $(echo "$LATEST_SECONDS > 180" | bc -l) )) || (( $(echo "$LATEST_SECONDS > $AVG_SECONDS * 1.2" | bc -l) )); then
  REGRESSION_CHECK="true"
fi

if [[ "$REGRESSION_CHECK" == "true" ]]; then
  STATUS="REGRESSION"
  TITLE="CI: smoke runtime regression"
  BODY=$(jq -r --arg ts "$TIMESTAMP" --arg job "$JOB_NAME" --arg latest "$LATEST_SECONDS" --arg avg "$AVG_SECONDS" --arg delta "$DELTA_PCT" '
    def row: "• Run " + (.run_id|tostring) + " – " + (.duration_sec|tostring) + "s – " + .html_url;
    "Detected runtime regression for \($job) at \($ts) UTC.\n\n" +
    "- Latest: \($latest)s\n- Avg(7): \($avg)s\n- Delta: \($delta)%\n\nRecent runs:\n" +
    (map(row) | join("\n"))' <<<"$JOBS_JSON")
  
  # Check if issue already exists
  EXISTING_ISSUE=$(gh issue list --state open --search "CI: smoke runtime regression" --json number,title --jq '.[] | select(.title=="CI: smoke runtime regression") | .number' | head -n 1 || true)
  
  if [[ -n "$EXISTING_ISSUE" ]]; then
    echo "Updating existing issue #$EXISTING_ISSUE"
    gh issue comment "$EXISTING_ISSUE" --body "$BODY" >/dev/null
  else
    echo "Creating new issue"
    gh issue create -t "$TITLE" -b "$BODY" -l "ci,infra,investigate" >/dev/null
  fi
else
  mkdir -p .orchestrator
  echo "{\"action\":\"nightly_runtime_check\",\"timestamp\":\"$TIMESTAMP\",\"latest_seconds\":$LATEST_SECONDS,\"avg_seconds_7\":$AVG_SECONDS,\"delta_pct\":$DELTA_PCT,\"status\":\"$STATUS\"}" >> .orchestrator/runlog.jsonl
fi

# Final one-line summary
echo "smoke_runtime: latest=${LATEST_SECONDS}s avg7=$(printf '%.1f' "$AVG_SECONDS")s delta=${DELTA_PCT}% status=${STATUS}"