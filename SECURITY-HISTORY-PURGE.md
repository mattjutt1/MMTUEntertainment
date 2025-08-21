# History Purge & Credential Rotation – Guide

This PR removed currently tracked sensitive artifacts. To eliminate them from git history,
schedule a maintenance window and run one of the following on a **throwaway clone**:

## Option A: git-filter-repo (recommended)
# brew install git-filter-repo  (or follow official install)
git filter-repo --invert-paths --path data/autonomous-primitives.csv   --path growth/leads/50-lead-list.csv   --path growth/outreach/send-batch01.html   --path growth/outreach/batches/2025-08-17-batch01.csv   --path growth/outreach/tracker.csv

# Force-push protected branches only after: backup, PR freeze, and owner approval.

## Option B: BFG Repo-Cleaner (alternative)
# java -jar bfg.jar --delete-files <pattern(s)> .
# then: git reflog expire --expire=now --all && git gc --prune=now --aggressive

## After purge – mandatory rotations
- Rotate any API keys, tokens, or credentials mentioned in those files.
- Invalidate old tokens and reissue webhooks (e.g., Stripe).
- Communicate cutover window & steps to maintainers.

## Verification Checklist
- New clone shows no traces of removed paths.
- All protected branches rebuilt cleanly; CI green.
- Branch protection & required checks verified unchanged after force-push.

Owner: <name> | Approver: <name> | Scheduled window: <date/time>
