#!/usr/bin/env bash
set -euo pipefail
echo "==> Container states"
docker compose ps
echo "==> Recent logs (cal)"
docker compose logs --tail=80 cal || true
echo "==> Recent logs (zammad)"
docker compose logs --tail=80 zammad || true
echo "==> Probing health endpoints"
(curl -fsS http://localhost:8082/api/health && echo "OK cal") || echo "cal FAILED"
(curl -fsS http://localhost:8084 && echo "OK zammad") || echo "zammad FAILED"