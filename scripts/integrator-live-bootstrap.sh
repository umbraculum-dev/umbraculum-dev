#!/usr/bin/env bash
# Bootstrap a fresh compose stack for integrator-live-smoke (CI + local repro).
#
# Phase 1: primary Postgres only (+ Redis/Gotenberg for api deps).
# Do NOT start postgres-replica yet — migrations in phase 2 advance primary WAL;
# a replica base-backup taken before migrate will fail on the next start.
# Phase 2: npm ci + migrate deploy + db:seed + seed:e2e (one-off api container).
# Phase 3: replica + pgpool + nginx + api + web (replica base-backup from migrated primary).
#
# Usage (from repo root):
#   ./scripts/integrator-live-bootstrap.sh
set -euo pipefail

echo "=== integrator-live-bootstrap: phase 1 (database infra) ==="
docker compose up -d --wait postgres redis gotenberg

echo "=== integrator-live-bootstrap: phase 2 (schema + seeds) ==="
docker compose run --rm --no-deps -T api bash -lc '
  set -euo pipefail
  cd /app
  npm ci --no-audit --no-fund
  DATABASE_URL=$DATABASE_URL_DIRECT ./node_modules/.bin/prisma migrate deploy --schema prisma/schema.prisma
  DATABASE_URL=$DATABASE_URL_DIRECT npm run db:seed
  DATABASE_URL=$DATABASE_URL_DIRECT npm run seed:e2e
'

echo "=== integrator-live-bootstrap: phase 3 (replication + application tier) ==="
docker compose up -d --wait postgres-replica pgpool nginx api web

echo "OK: integrator-live-bootstrap complete"
