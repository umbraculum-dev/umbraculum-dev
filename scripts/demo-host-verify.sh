#!/usr/bin/env bash
# Verify demo.umbraculum.dev is serving the Umbraculum stack (not a parking page).
# Exit 0 only when https://demo.umbraculum.dev/api/health returns {"ok":true}.
set -euo pipefail

DEMO_HOST="${DEMO_HOST:-demo.umbraculum.dev}"
BASE="https://${DEMO_HOST}"

echo "=== DNS ==="
dig +short "${DEMO_HOST}" A 2>/dev/null || true

echo "=== HTTPS health (required for EAS / Android) ==="
if ! body="$(curl -fsS -m 15 "${BASE}/api/health" 2>&1)"; then
  echo "FAIL: ${BASE}/api/health — ${body}"
  echo ""
  echo "=== HTTP fallback (diagnostic only) ==="
  curl -sS -m 10 "http://${DEMO_HOST}/api/health" | head -c 200 || true
  echo ""
  exit 1
fi

echo "${body}"
if ! echo "${body}" | grep -q '"ok"[[:space:]]*:[[:space:]]*true'; then
  echo "FAIL: unexpected health body (is this a parking page / wrong vhost?)"
  exit 1
fi

echo "OK: demo host is serving Umbraculum API"
