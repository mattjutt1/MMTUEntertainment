#!/usr/bin/env bash
set -euo pipefail
pass=true

echo "== Doctrine strings =="
if grep -nE "Prove it, then scale it|PRE-THRESHOLD" governance/MASTER_PROMPT.md MASTER_PROMPT_FOR_GPT5.md >/dev/null; then
  echo "✓ doctrine present in prompts"
else
  echo "✗ doctrine missing in prompts"; pass=false
fi

echo "== CI gates =="
if grep -nE "(actionlint|semgrep|trivy|gitleaks|playwright)" .github/workflows/*.yml >/dev/null 2>&1; then
  echo "✓ CI security gates referenced"
else
  echo "✗ CI gate refs not found"; pass=false
fi

echo "== Runlog entries =="
if [[ -f .orchestrator/runlog.jsonl ]] && grep -nE "finish_to_working|tests_dual_mode_and_pending_patch" .orchestrator/runlog.jsonl >/dev/null; then
  echo "✓ runlog evidence found"
  tail -n 3 .orchestrator/runlog.jsonl
else
  echo "✗ runlog entries not found"; pass=false
fi

$pass && echo "ALL CHECKS PASS" || { echo "SOME CHECKS FAILED"; exit 1; }
