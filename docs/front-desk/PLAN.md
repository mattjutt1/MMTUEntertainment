# Front Desk — Source-of-Truth Plan

## 0) Goals, guardrails, and "done"

**Business goal:** a reliable, auditable Front Desk that ingests work from common channels, enriches with SLAs, logs immutably, is searchable, observable, and controlled by flags/RBAC.

**Governance:** Protected main with named required checks; CI uses workflow/job concurrency with `cancel-in-progress: true` to keep the lane clear.

**Definition of Done (global):**

- Smokes finish ≤3 minutes and are required for merge.
- All data validates against JSON Schema 2020-12 (AJV).
- Logs land in Loki and are visible in Grafana panels.
- Searchable in Meilisearch within <200 ms after index.

## 1) Data contract & seeds (standards first)

**Why:** interoperability and predictable automation.

**Standards:**
- **Timestamps:** RFC 3339 (note: RFC 9557 is an extension; base RFC 3339 is sufficient here).
- **Languages:** BCP-47 tags (e.g., `en-US`).
- **Time zones:** IANA TZ (e.g., `America/New_York`).
- **Phone numbers:** E.164 format (e.g., `+14155551234`).
- **IDs:** ULID (lexicographically sortable).
- **Validation:** JSON Schema 2020-12 via AJV.

**Schemas (minimum):** `frontdesk-event.schema.json`, `contact.schema.json`, `audit.schema.json`.

**Seeds:** statuses (NEW→CLOSED), priorities (P1–P4), categories, SLA policies (FR/Resolution), business hours (timezone + holiday ICS), roles (Agent/Supervisor/Admin).

**Acceptance:** Valid sample payloads pass AJV; invalid BCP-47/TZ/E.164 rejected with clear schema path errors.

## 2) Ingestion service (append-only)

**Path:** POST `/ingest/frontdesk`

**Flow:** AJV validate (2020-12) → assign ULID → append one line to `log.jsonl` with RFC 3339 ts → 200 {id}; invalid → 400 with error details.

**Integrity:** end-of-day SHA-256 digest of the file appended to `log.digests`.

**Acceptance:** Each valid POST produces exactly one new JSONL line with ts and id.

## 3) Intake connectors (omnichannel via push webhooks)

**Primary:** Zammad webhooks (ticket created/updated) → POST to our automation endpoint with retries; alternative: FreeScout API & Webhooks module.

**Later:** chat widget, IVR, scheduling.

**Acceptance:** Updating a ticket in the helpdesk produces a normalized payload at our endpoint.

## 4) Automation & routing (normalize → enrich → forward)

**Tool:** n8n Webhook trigger (use Test & Production URLs; "Respond: When Last Node Finishes" for echoing final normalized payload).

**Steps:** normalize fields → tag/category → compute priority → attach SLA (see §5) → POST to `/ingest/frontdesk`.

**Acceptance:** Normalized JSON echoed by n8n during tests; 400s bubble up on schema failures.

## 5) SLA engine & business hours

**Inputs:** `sla_policies.json`, `business_hours.json` (tz + optional holiday ICS).

**Output:** `sla.first_response.target_at`, `sla.resolution.target_at` (RFC 3339).

**Acceptance:** P1 at 13:00 local business day ⇒ FR target +1h inside business hours; holidays pause; assertions covered by unit tests.

## 6) Audit-trail integrity (tamper evidence)

**Daily:** SHA-256 digest over `log.jsonl` → append to `log.digests`; optional weekly Merkle root over the seven daily digests.

**Acceptance:** Any alteration of a prior line is detected by recomputing and comparing digests.

## 7) Observability (logs & SLO dashboards)

**Collector:** OpenTelemetry Collector filelog receiver tails `log.jsonl`, parses JSON → Loki; Grafana dashboards for runs/errors/p95/freshness.

**Acceptance:** New ingest appears in Grafana Explore within seconds with parsed fields.

## 8) Operator search

**Engine:** Meilisearch (self-host or Cloud). Minimal indexer that pushes normalized events for quick recall by ULID/ref/status/tags.

**Acceptance:** Search by ULID returns in <200 ms; index updated on append.

## 9) Identity & RBAC

**Provider:** Keycloak OIDC; enforce role claims in middleware; rely on OIDC discovery endpoints for config.

**Acceptance:** Protected endpoints require a token; role-based checks verified by tests.

## 10) Feature flags

**Platform:** Unleash (OSS). Toggle risky automation like `frontdesk.autoTriage` without redeploy.

**Acceptance:** Flipping the flag changes behavior immediately (observed in logs).

## 11) Security & privacy baseline

**OWASP logging:** include actor, action, object, outcome, correlation_id in logs; avoid sensitive payloads.

**PII handling:** follow NIST SP 800-122 guidance to minimize, classify, and protect PII.

## 12) Daily ops loop (idempotent; no overlap)

**Mechanics:** scheduled job (e.g., systemd.timer or CI cron) with flock to prevent overlaps; recompute daily digest and post health ping.

**Acceptance:** 7/7 runs succeed; missed run after reboot catches up exactly once.

## 13) Testing & SLOs

**Unit:** JSON Schemas & SLA math (positive/negative).

**Integration:** `/ingest` → JSONL append → OTel→Loki pipeline → visible in Grafana; indexing → searchable in Meili.

**PR smokes:** ≤3 minutes, path-filtered. Required before merge (branch protection).

**SLOs:** Availability 7/7 days; ingest→observability p95 ≤10 min; log freshness ≤1 h; integrity failures = 0.

## Cross-module data spine (who feeds whom)

Zammad/FreeScout → n8n Webhook (Test/Prod; Respond on finish) → `/ingest` (AJV→ULID→JSONL) → daily digest → OTel filelog → Loki/Grafana → Meilisearch; gated by RBAC/flags.

## Rollout order (smallest safe change)

M1→M2→M3/4→M7/8→M5/6→M9/10→M12/13. (CI lane and branch protection are pre-reqs.)