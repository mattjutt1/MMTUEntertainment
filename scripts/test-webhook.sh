#!/usr/bin/env bash
set -euo pipefail
: "${N8N_WEBHOOK_PROD_URL:?Missing N8N_WEBHOOK_PROD_URL}"
: "${N8N_WEBHOOK_SECRET:=}"

hdrs=(-H "Content-Type: application/json")
if [[ -n "${N8N_WEBHOOK_SECRET}" ]]; then
  hdrs+=(-H "X-Webhook-Secret: ${N8N_WEBHOOK_SECRET}")
fi

cat <<'JSON' | curl -sS -X POST "${N8N_WEBHOOK_PROD_URL}" "${hdrs[@]}" --data @-
{
  "source": "zammad",
  "event_type": "ticket.created",
  "language": "en-US",
  "timezone": "America/New_York",
  "priority": "P3",
  "status": "NEW",
  "category": "general",
  "contact": { "name": "Ada Lovelace", "email": "ada@example.com", "phone": "+12125551234" },
  "message": "Example ticket from webhook smoke",
  "tags": ["smoke", "frontdesk"],
  "meta": { "ref": "SMOKE-" }
}
JSON
echo
