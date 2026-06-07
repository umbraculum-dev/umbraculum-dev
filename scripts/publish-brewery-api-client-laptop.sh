#!/usr/bin/env bash
# Publish (or republish) @umbraculum/brewery-api-client only.
# Use when brewery-contracts is already on the registry but api-client 404s.
#
# Usage:
#   ./scripts/publish-brewery-api-client-laptop.sh
#   DRY_RUN=1 ./scripts/publish-brewery-api-client-laptop.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

PKG_DIR="packages/verticals/brewery/api-client"
PKG_NAME="@umbraculum/brewery-api-client"

if ! command -v jq >/dev/null 2>&1; then
  echo "FAIL: jq required"
  exit 1
fi

echo "=== publish-brewery-api-client-laptop ==="
echo "DRY_RUN=${DRY_RUN:-0}"

VERSION="$(jq -r .version "${PKG_DIR}/package.json")"
if npm view "${PKG_NAME}@${VERSION}" version >/dev/null 2>&1; then
  echo "OK: ${PKG_NAME}@${VERSION} already on registry — nothing to do"
  exit 0
fi

ensure_brewery_api_client_dist() {
  local dist="${PKG_DIR}/dist"
  if [ -f "${dist}/index.js" ] && [ -f "${dist}/index.d.ts" ] && [ -f "${dist}/index.cjs" ]; then
    if [ ! -w "${dist}/index.js" ]; then
      echo "dist/ exists but is not writable (usually root-owned after ci-parity Docker)."
      echo "Publishing existing dist/ artifacts without rebuild."
      echo "To refresh later: sudo chown -R \$(id -un):\$(id -gn) ${dist} && npm run build -w @umbraculum/brewery-api-client"
      return 0
    fi
  fi
  npm run build -w @umbraculum/brewery-api-client
}

ensure_brewery_api_client_dist

cp "${PKG_DIR}/package.json" /tmp/brewery-api-client-package.json.bak
jq '.dependencies["@umbraculum/api-client"] = "^0.0.2" | .dependencies["@umbraculum/brewery-contracts"] = "^0.0.1"' \
  "${PKG_DIR}/package.json" > /tmp/brewery-api-client-package.json
mv /tmp/brewery-api-client-package.json "${PKG_DIR}/package.json"

echo ":: publish ${PKG_NAME} from ${PKG_DIR}"
if [ "${DRY_RUN:-0}" = "1" ]; then
  (cd "${PKG_DIR}" && npm publish --access public --dry-run)
else
  (cd "${PKG_DIR}" && npm publish --access public)
fi

mv /tmp/brewery-api-client-package.json.bak "${PKG_DIR}/package.json"

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY_RUN: skip registry verify"
  exit 0
fi

echo "Verifying registry…"
for i in 1 2 3 4 5; do
  if npm view "${PKG_NAME}@${VERSION}" version >/dev/null 2>&1; then
    echo "OK: ${PKG_NAME}@$(npm view "${PKG_NAME}@${VERSION}" version) on registry"
    exit 0
  fi
  echo "  attempt ${i}/5: not visible yet, sleeping 3s…"
  sleep 3
done

echo "FAIL: publish reported success but ${PKG_NAME}@${VERSION} not found on registry"
echo "Check npm profile / 2FA / https://www.npmjs.com/package/${PKG_NAME#@}"
exit 1
