#!/usr/bin/env bash
# Stack smoke test: nginx -> web -> api -> postgres path is alive.
# Exit codes:
#   0  - healthy
#   1  - smoke failure (a check returned non-2xx or unexpected body)
#   2  - stack not reachable (nginx never came up within retry budget)
#
# Usage:
#   ./scripts/smoke.sh                       # http://localhost:18080
#   ./scripts/smoke.sh http://host:18080
#
# Requires curl + jq on the host. Does NOT require the seeder to have run
# beforehand: if /api/auth/login/native returns 401, the smoke is still
# considered "stack up" and exits 1 with a clear "seed:e2e?" hint.
set -u
set -o pipefail

BASE_URL="${1:-http://localhost:18080}"
PERSONA_EMAIL="${E2E_ADMIN_EMAIL:-e2e-admin@brewery.local}"
PERSONA_PASSWORD="${E2E_ADMIN_PASSWORD:-e2e-admin-pw!}"
COLD_START_RETRIES=15
COLD_START_DELAY_SECONDS=2

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$1"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    red "[smoke] missing required command: $1"
    exit 1
  fi
}

require_cmd curl
require_cmd jq

# -------------------------------------------------------------------
# Step 0: wait for nginx to be reachable at all (cold-start window).
# -------------------------------------------------------------------
i=0
while true; do
  if curl -fsS -o /dev/null -w '' "$BASE_URL/api/health"; then
    break
  fi
  i=$((i + 1))
  if [ "$i" -ge "$COLD_START_RETRIES" ]; then
    red "[smoke] stack not reachable at $BASE_URL after $((COLD_START_RETRIES * COLD_START_DELAY_SECONDS))s"
    yellow "[smoke] hint: 'docker compose ps' and 'docker compose logs --tail=80 web api nginx'"
    yellow "[smoke] hint: if nginx is up but /api/* 502s, see DEVELOPMENT-LOCAL.md '502 Bad Gateway'"
    exit 2
  fi
  sleep "$COLD_START_DELAY_SECONDS"
done

FAILED=0

assert_status() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    green "[smoke] $label -> $actual OK"
  else
    red   "[smoke] $label -> $actual (expected $expected)"
    FAILED=1
  fi
}

# -------------------------------------------------------------------
# Check 1: /api/health
# -------------------------------------------------------------------
HEALTH_BODY="$(curl -fsS "$BASE_URL/api/health" || true)"
HEALTH_OK="$(printf '%s' "$HEALTH_BODY" | jq -r '.ok // false' 2>/dev/null || echo false)"
if [ "$HEALTH_OK" = "true" ]; then
  green "[smoke] /api/health ok=true OK"
else
  red   "[smoke] /api/health ok!=true (body: $HEALTH_BODY)"
  FAILED=1
fi

# -------------------------------------------------------------------
# Check 2: /en/ (locale-prefixed home page should render)
# Next.js normalizes trailing slashes: /en/ -> 308 -> /en (200). We
# follow redirects with -L so the smoke matches what a real browser
# sees (and so that locale-routing changes that move where /en
# actually serves from don't silently break this check).
# -------------------------------------------------------------------
EN_STATUS="$(curl -fsS -L -o /dev/null -w '%{http_code}' "$BASE_URL/en/" || echo "000")"
assert_status "/en/" "200" "$EN_STATUS"

# -------------------------------------------------------------------
# Check 3: /api/auth/login/native with E2E admin persona
# -------------------------------------------------------------------
LOGIN_BODY="$(curl -fsS -X POST "$BASE_URL/api/auth/login/native" \
  -H 'content-type: application/json' \
  --data "$(jq -nc --arg e "$PERSONA_EMAIL" --arg p "$PERSONA_PASSWORD" '{email:$e, password:$p, preferredLocale:"en"}')" \
  || true)"

TOKEN="$(printf '%s' "$LOGIN_BODY" | jq -r '.token // empty' 2>/dev/null || true)"

if [ -z "$TOKEN" ]; then
  red   "[smoke] /api/auth/login/native did not return a token"
  yellow "[smoke] hint: have you run 'docker compose exec api npm run seed:e2e'?"
  yellow "[smoke] hint: see docs/TESTING.md 'E2E fixture identities'"
  FAILED=1
else
  green "[smoke] /api/auth/login/native -> token issued OK"

  # -----------------------------------------------------------------
  # Check 4: /api/auth/me with the token (must carry activeWorkspaceId)
  # -----------------------------------------------------------------
  ME_BODY="$(curl -fsS "$BASE_URL/api/auth/me" -H "authorization: Bearer $TOKEN" || true)"
  ME_OK="$(printf '%s' "$ME_BODY" | jq -r '.ok // false' 2>/dev/null || echo false)"
  ME_WS="$(printf '%s' "$ME_BODY" | jq -r '.activeWorkspaceId // empty' 2>/dev/null || true)"
  if [ "$ME_OK" = "true" ] && [ -n "$ME_WS" ]; then
    green "[smoke] /api/auth/me ok=true activeWorkspaceId=$ME_WS OK"
  else
    red "[smoke] /api/auth/me ok!=true or missing activeWorkspaceId (body: $ME_BODY)"
    FAILED=1
  fi

  # -----------------------------------------------------------------
  # Check 5: /api/auth/logout cleans up the session
  # -----------------------------------------------------------------
  LOGOUT_STATUS="$(curl -fsS -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/auth/logout" \
    -H "authorization: Bearer $TOKEN" || echo "000")"
  assert_status "/api/auth/logout" "200" "$LOGOUT_STATUS"
fi

if [ "$FAILED" -eq 0 ]; then
  green "[smoke] all checks passed"
  exit 0
fi
red "[smoke] one or more checks failed"
exit 1
