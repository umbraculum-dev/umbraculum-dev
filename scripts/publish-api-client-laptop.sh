#!/usr/bin/env bash
# Publish (or republish) @umbraculum/api-client only.
# Use when a new semver (e.g. 0.0.2 with ./transport export) must land before brewery SDK dogfood.
#
# Usage (from repo root ~/dkprojects/rfapps/umbraculum-dev):
#   ./scripts/publish-api-client-laptop.sh
#   DRY_RUN=1 ./scripts/publish-api-client-laptop.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

PKG_DIR="packages/platform/api-client"
PKG_NAME="@umbraculum/api-client"

if ! command -v jq >/dev/null 2>&1; then
  echo "FAIL: jq required"
  exit 1
fi

echo "=== publish-api-client-laptop ==="
echo "DRY_RUN=${DRY_RUN:-0}"

VERSION="$(jq -r .version "${PKG_DIR}/package.json")"
if npm view "${PKG_NAME}@${VERSION}" version >/dev/null 2>&1; then
  echo "OK: ${PKG_NAME}@${VERSION} already on registry — nothing to do"
  exit 0
fi

ensure_api_client_dist() {
  local dist="${PKG_DIR}/dist"
  if [ -f "${dist}/index.js" ] && [ -f "${dist}/transport/index.js" ]; then
    if [ ! -w "${dist}/index.js" ]; then
      echo "dist/ exists but is not writable (usually root-owned after ci-parity Docker)."
      echo "Publishing existing dist/ artifacts without rebuild."
      echo "To refresh later: sudo chown -R \$(id -un):\$(id -gn) ${dist} && npm run build -w @umbraculum/api-client"
      return 0
    fi
  fi
  npm run build -w @umbraculum/api-client
}

ensure_api_client_dist

cp "${PKG_DIR}/package.json" /tmp/api-client-package.json.bak
jq '.dependencies["@umbraculum/contracts"] = "^0.0.1" | .dependencies["@umbraculum/automation-contracts"] = "^0.0.2" | .dependencies["@umbraculum/pim-contracts"] = "^0.0.2" | .dependencies["@umbraculum/mrp-contracts"] = "^0.0.2" | .dependencies["@umbraculum/crp-contracts"] = "^0.0.2"' \
  "${PKG_DIR}/package.json" > /tmp/api-client-package.json
mv /tmp/api-client-package.json "${PKG_DIR}/package.json"

echo ":: publish ${PKG_NAME} from ${PKG_DIR}"
if [ "${DRY_RUN:-0}" = "1" ]; then
  (cd "${PKG_DIR}" && npm publish --access public --dry-run)
else
  (cd "${PKG_DIR}" && npm publish --access public)
fi

mv /tmp/api-client-package.json.bak "${PKG_DIR}/package.json"

if [ "${DRY_RUN:-0}" = "1" ]; then
  echo "DRY_RUN: skip registry verify"
  exit 0
fi

echo "Verifying registry…"
for i in 1 2 3 4 5; do
  if npm view "${PKG_NAME}@${VERSION}" version >/dev/null 2>&1; then
    echo "OK: ${PKG_NAME}@$(npm view "${PKG_NAME}@${VERSION}" version) on registry"
    if ! npm view "${PKG_NAME}@${VERSION}" exports --json | jq -e 'has("./transport")' >/dev/null 2>&1; then
      echo "FAIL: ${PKG_NAME}@${VERSION} missing ./transport export in package.json"
      exit 1
    fi
    echo "OK: ./transport export present on registry"
    exit 0
  fi
  echo "  attempt ${i}/5: not visible yet, sleeping 3s…"
  sleep 3
done

echo "FAIL: publish reported success but ${PKG_NAME}@${VERSION} not found on registry"
echo "Check npm profile / 2FA / https://www.npmjs.com/package/${PKG_NAME#@}"
exit 1
