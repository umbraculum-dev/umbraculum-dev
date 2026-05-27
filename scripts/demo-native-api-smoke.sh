#!/usr/bin/env bash
# API-level smoke for native demo flows (login, recipes, webview-exchange).
# Does not replace physical-device §5.1 checks in canonical-native-platform-surface.md.
#
# Usage:
#   ./scripts/demo-native-api-smoke.sh
#   BASE_URL=https://demo.umbraculum.dev ./scripts/demo-native-api-smoke.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${BASE_URL:-https://demo.umbraculum.dev}"
EMAIL="${DEMO_EMAIL:-e2e-admin@brewery.local}"
PASSWORD="${DEMO_PASSWORD:-e2e-admin-pw!}"

api() {
  local method="$1"
  local path="$2"
  shift 2
  curl -fsS -m 20 -X "${method}" "${BASE_URL}${path}" "$@"
}

echo "=== demo-native-api-smoke ==="
echo "BASE_URL=${BASE_URL}"

echo "1. /api/health"
health="$(api GET /api/health)"
echo "   ${health}"
echo "${health}" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'

echo "2. POST /api/auth/login/native"
login_json="$(api POST /api/auth/login/native \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")"
token="$(echo "${login_json}" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('token',''))")"
if [[ -z "${token}" ]]; then
  echo "FAIL: no token in login response"
  exit 1
fi
echo "   token acquired (${#token} chars)"

echo "3. GET /api/auth/me"
api GET /api/auth/me -H "Authorization: Bearer ${token}" | head -c 120
echo ""

echo "4. GET /api/recipes (list)"
api GET /api/recipes -H "Authorization: Bearer ${token}" | head -c 120
echo ""

echo "5. POST /api/auth/webview-exchange (inventory fallback)"
api POST /api/auth/webview-exchange \
  -H "Authorization: Bearer ${token}" \
  -H 'Content-Type: application/json' \
  -d '{"next":"/en/inventory"}' | head -c 160
echo ""

echo "OK: API smoke passed for ${BASE_URL}"
