#!/usr/bin/env bash
set -euo pipefail
echo "==> Container states"
docker compose ps
echo "==> Recent logs (calcom)"
docker compose logs --tail=80 calcom || true
echo "==> Recent logs (zammad)"
docker compose logs --tail=80 zammad || true
echo "==> Probing health endpoints"
(curl -fsS -o /dev/null http://localhost:8085/ && echo "OK cal") || echo "cal FAILED"
(curl -fsS http://localhost:8086 && echo "OK zammad") || echo "zammad FAILED"