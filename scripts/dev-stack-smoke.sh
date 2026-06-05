#!/usr/bin/env bash
# Full dev-stack smoke through nginx (default :18080): health, web login page,
# native bearer login, cookie-session login (browser UI path), catalog reads.
#
# Agent gate: AGENTS.md § "Dev stack health after ci-parity / API / nginx".
# Run after docker compose up, after `docker compose restart api`, or after
# ci-parity archive runs that may have disturbed bind-mounted package trees.
#
# Usage:
#   ./scripts/dev-stack-smoke.sh
#   ./scripts/dev-stack-smoke.sh http://localhost:18080
#
# E2E personas: docs/TESTING.md § "E2E fixture identities"
# Seed if login returns 401: docker compose exec api npm run seed:e2e
#
# Optional UI login (Playwright): apps/web/e2e — npm run test:smoke -w @umbraculum/web-e2e
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_URL="${1:-http://localhost:18080}"

green() { printf '\033[32m%s\033[0m\n' "$1"; }
red()   { printf '\033[31m%s\033[0m\n' "$1"; }

echo "=== dev-stack-smoke BASE_URL=${BASE_URL} ==="

"${REPO_ROOT}/scripts/smoke.sh" "${BASE_URL}"
"${REPO_ROOT}/scripts/integrator-api-smoke.sh" "${BASE_URL}"

LOGIN_STATUS="$(curl -fsS -o /dev/null -w '%{http_code}' "${BASE_URL}/en/login" || echo "000")"
if [ "${LOGIN_STATUS}" = "200" ]; then
  green "[dev-stack-smoke] GET /en/login -> 200 OK"
else
  red "[dev-stack-smoke] GET /en/login -> ${LOGIN_STATUS} (expected 200)"
  exit 1
fi

green "[dev-stack-smoke] all checks passed"
