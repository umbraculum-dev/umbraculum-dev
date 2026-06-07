#!/usr/bin/env bash
# First-time (or manual) publish of @umbraculum/contracts + @umbraculum/api-client.
# Run on the maintainer host after ci-parity sdk-publish-prep is green.
#
# Prerequisites:
#   - npm login with publish rights to @umbraculum org
#   - npm ci && npm run build:packages && npm run test:packages (or ci-parity sdk-publish-prep)
#   - Seven-package α batch already on registry (automation/pim/mrp/crp-contracts @ ^0.0.2)
#
# After laptop publish, configure OIDC trust for publish-contracts-api-client.yml
# (see docs/design/npm-sdk-trusted-publishing.md) before pushing sdk-contracts-v* tags.
#
# Usage:
#   ./scripts/publish-contracts-api-client-laptop.sh
#   DRY_RUN=1 ./scripts/publish-contracts-api-client-laptop.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

if ! command -v jq >/dev/null 2>&1; then
  echo "FAIL: jq required"
  exit 1
fi

echo "=== publish-contracts-api-client-laptop ==="
echo "DRY_RUN=${DRY_RUN:-0}"

publish_pkg() {
  local dir="$1"
  local label="$2"
  echo ":: publish ${label} from ${dir}"
  if [ "${DRY_RUN:-0}" = "1" ]; then
    (cd "${dir}" && npm publish --access public --dry-run)
  else
    (cd "${dir}" && npm publish --access public)
  fi
}

echo "1. @umbraculum/contracts"
publish_pkg packages/platform/contracts "@umbraculum/contracts"

echo "2. Rewrite api-client deps for registry tarball"
cp packages/platform/api-client/package.json /tmp/api-client-package.json.bak
jq '.dependencies["@umbraculum/contracts"] = "^0.0.1" | .dependencies["@umbraculum/automation-contracts"] = "^0.0.2" | .dependencies["@umbraculum/pim-contracts"] = "^0.0.2" | .dependencies["@umbraculum/mrp-contracts"] = "^0.0.2" | .dependencies["@umbraculum/crp-contracts"] = "^0.0.2"' \
  packages/platform/api-client/package.json > /tmp/api-client-package.json
mv /tmp/api-client-package.json packages/platform/api-client/package.json

echo "3. @umbraculum/api-client"
publish_pkg packages/platform/api-client "@umbraculum/api-client"

mv /tmp/api-client-package.json.bak packages/platform/api-client/package.json

echo "OK: contracts + api-client publish step complete"
echo "Next: npx npm@11.16.0 trust github … (see npm-sdk-trusted-publishing.md)"
echo "      git tag sdk-contracts-v0.0.1 && git push origin sdk-contracts-v0.0.1  # future bumps only"
