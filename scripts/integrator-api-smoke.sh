#!/usr/bin/env bash
# Integrator smoke: cookie-session login + brewery catalog reads (web client path).
# Complements scripts/smoke.sh (native bearer) and scripts/demo-native-api-smoke.sh.
#
# Usage:
#   ./scripts/integrator-api-smoke.sh
#   ./scripts/integrator-api-smoke.sh http://localhost:18080
#
# Requires curl + jq. Expects E2E admin persona (docker compose exec api npm run seed:e2e).
set -u
set -o pipefail

BASE_URL="${1:-http://localhost:18080}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PERSONA_EMAIL="${E2E_ADMIN_EMAIL:-e2e-admin@brewery.local}"
PERSONA_PASSWORD="${E2E_ADMIN_PASSWORD:-e2e-admin-pw!}"
COLD_START_RETRIES=15
COLD_START_DELAY_SECONDS=2
COOKIE_JAR="$(mktemp)"
trap 'rm -f "${COOKIE_JAR}"' EXIT

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$1"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    red "[integrator-smoke] missing required command: $1"
    exit 1
  fi
}

require_cmd curl
require_cmd jq

FAILED=0

assert_ok_field() {
  local label="$1"
  local body="$2"
  local ok
  ok="$(printf '%s' "$body" | jq -r '.ok // false' 2>/dev/null || echo false)"
  if [ "$ok" = "true" ]; then
    green "[integrator-smoke] ${label} ok=true"
  else
    red "[integrator-smoke] ${label} ok!=true (body: ${body})"
    FAILED=1
  fi
}

echo "[integrator-smoke] BASE_URL=${BASE_URL}"

HEALTH_BODY=""
i=0
while true; do
  HEALTH_BODY="$(curl -fsS "${BASE_URL}/api/health" 2>/dev/null || true)"
  if [ -n "${HEALTH_BODY}" ]; then
    break
  fi
  i=$((i + 1))
  if [ "$i" -ge "$COLD_START_RETRIES" ]; then
    red "[integrator-smoke] stack not reachable at ${BASE_URL} after $((COLD_START_RETRIES * COLD_START_DELAY_SECONDS))s"
    yellow "[integrator-smoke] hint: docker compose ps && docker compose logs --tail=40 api nginx"
    yellow "[integrator-smoke] hint: after 'docker compose restart api', wait for 'Server listening' in api logs"
    exit 2
  fi
  sleep "$COLD_START_DELAY_SECONDS"
done
assert_ok_field "/api/health" "${HEALTH_BODY}"

LOGIN_BODY="$(curl -fsS -X POST "${BASE_URL}/api/auth/login" \
  -H 'content-type: application/json' \
  -c "${COOKIE_JAR}" \
  --data "$(jq -nc --arg e "${PERSONA_EMAIL}" --arg p "${PERSONA_PASSWORD}" '{email:$e, password:$p, preferredLocale:"en"}')" \
  2>/dev/null || true)"

if [ -z "${LOGIN_BODY}" ]; then
  red "[integrator-smoke] POST /api/auth/login failed"
  yellow "[integrator-smoke] hint: docker compose exec api npm run seed:e2e"
  exit 1
fi
assert_ok_field "POST /api/auth/login" "${LOGIN_BODY}"

ME_BODY="$(curl -fsS "${BASE_URL}/api/auth/me" -b "${COOKIE_JAR}" 2>/dev/null || true)"
assert_ok_field "GET /api/auth/me" "${ME_BODY}"

WS_BODY="$(curl -fsS "${BASE_URL}/api/workspaces" -b "${COOKIE_JAR}" 2>/dev/null || true)"
assert_ok_field "GET /api/workspaces" "${WS_BODY}"

HAS_BREWERY="$( (command -v python3 >/dev/null && python3 "${REPO_ROOT}/scripts/lib/resolve-install-manifest.py" --field hasBrewery) || node "${REPO_ROOT}/scripts/lib/resolve-install-manifest.mjs" --field hasBrewery 2>/dev/null || echo true)"

if [ "${HAS_BREWERY}" = "true" ]; then
  STYLES_BODY="$(curl -fsS "${BASE_URL}/api/styles" -b "${COOKIE_JAR}" 2>/dev/null || true)"
  assert_ok_field "GET /api/styles" "${STYLES_BODY}"

  STYLE_COUNT="$(printf '%s' "${STYLES_BODY}" | jq -r '.styles | length' 2>/dev/null || echo 0)"
  if [ "${STYLE_COUNT}" -gt 0 ] 2>/dev/null; then
    FIRST_VERSION="$(printf '%s' "${STYLES_BODY}" | jq -r '.styles[0].version // empty' 2>/dev/null || true)"
    if [ -n "${FIRST_VERSION}" ] && [ "${FIRST_VERSION}" != "null" ]; then
      green "[integrator-smoke] GET /api/styles -> ${STYLE_COUNT} styles; first.version=${FIRST_VERSION} (string wire shape OK)"
    else
      yellow "[integrator-smoke] GET /api/styles -> styles present but first.version empty"
    fi
  else
    yellow "[integrator-smoke] GET /api/styles returned zero styles (seed may be minimal)"
  fi
else
  yellow "[integrator-smoke] core installation profile — skipping brewery catalog (/api/styles)"
fi

if [ "${FAILED}" -eq 0 ]; then
  green "[integrator-smoke] all checks passed"
  exit 0
fi
red "[integrator-smoke] one or more checks failed"
exit 1
