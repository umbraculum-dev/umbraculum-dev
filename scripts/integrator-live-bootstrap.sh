#!/usr/bin/env bash
# Bootstrap a fresh compose stack for integrator-live-smoke (CI + local repro).
#
# Phase 1: Postgres/pgpool/Redis/Gotenberg
# Phase 2: npm ci + migrate deploy + db:seed + seed:e2e (one-off api container)
# Phase 3: nginx + api + web for HTTP smokes
#
# Usage (from repo root):
#   ./scripts/integrator-live-bootstrap.sh
set -euo pipefail

echo "=== integrator-live-bootstrap: phase 1 (database infra) ==="
docker compose up -d --wait postgres postgres-replica pgpool redis gotenberg

echo "=== integrator-live-bootstrap: phase 2 (schema + seeds) ==="
docker compose run --rm --no-deps -T api bash -lc '
  set -euo pipefail
  cd /app
  npm ci --no-audit --no-fund
  DATABASE_URL=$DATABASE_URL_DIRECT ./node_modules/.bin/prisma migrate deploy --schema prisma/schema.prisma
  npm run db:seed
  npm run seed:e2e
'

echo "=== integrator-live-bootstrap: phase 3 (application tier) ==="
docker compose up -d --wait nginx api web

echo "OK: integrator-live-bootstrap complete"
