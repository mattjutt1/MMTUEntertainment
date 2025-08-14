/command marketplace-scaffold
PLAN:
1) In apps/DriftGuard-Checks add src/marketplace/{constants.ts,storage.ts,webhooks.ts,planCheck.ts}; import in src/index.ts.
2) Add scripts/replay-marketplace-events.ts; Jest tests; docs/marketplace.md; .github/workflows/billing-config-check.yml.
3) Output PR diff; run tests. Do NOT change product behavior.
