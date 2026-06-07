#!/usr/bin/env bash
# First-time (or manual) publish of @umbraculum/brewery-contracts + @umbraculum/brewery-api-client.
# Run on the maintainer host after ci-parity sdk-publish-prep is green.
#
# Prerequisites:
#   - npm login with publish rights to @umbraculum org
#   - npm ci && npm run build:packages && npm run test:packages (or ci-parity sdk-publish-prep)
#   - @umbraculum/contracts @0.0.1 and @umbraculum/api-client @0.0.2 already on registry
#
# After laptop publish, configure OIDC trust for publish-contracts-api-client.yml
# (see docs/design/npm-sdk-trusted-publishing.md § brewery vertical SDK).
#
# Usage:
#   ./scripts/publish-brewery-sdk-laptop.sh
#   DRY_RUN=1 ./scripts/publish-brewery-sdk-laptop.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

if ! command -v jq >/dev/null 2>&1; then
  echo "FAIL: jq required"
  exit 1
fi

echo "=== publish-brewery-sdk-laptop ==="
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

verify_on_registry() {
  local label="$1"
  local version="$2"
  if [ "${DRY_RUN:-0}" = "1" ]; then
    return 0
  fi
  for i in 1 2 3 4 5; do
    if npm view "${label}@${version}" version >/dev/null 2>&1; then
      echo "OK: ${label}@$(npm view "${label}@${version}" version) on registry"
      return 0
    fi
    echo "  ${label}: not visible yet (attempt ${i}/5), sleeping 3s…"
    sleep 3
  done
  echo "FAIL: ${label}@${version} not found on registry after publish"
  exit 1
}

echo "1. @umbraculum/brewery-contracts"
cp packages/verticals/brewery/contracts/package.json /tmp/brewery-contracts-package.json.bak
jq '.dependencies["@umbraculum/contracts"] = "^0.0.1"' \
  packages/verticals/brewery/contracts/package.json > /tmp/brewery-contracts-package.json
mv /tmp/brewery-contracts-package.json packages/verticals/brewery/contracts/package.json
publish_pkg packages/verticals/brewery/contracts "@umbraculum/brewery-contracts"
verify_on_registry "@umbraculum/brewery-contracts" "$(jq -r .version packages/verticals/brewery/contracts/package.json)"
mv /tmp/brewery-contracts-package.json.bak packages/verticals/brewery/contracts/package.json

echo "2. Rewrite brewery-api-client deps for registry tarball"
cp packages/verticals/brewery/api-client/package.json /tmp/brewery-api-client-package.json.bak
jq '.dependencies["@umbraculum/api-client"] = "^0.0.3" | .dependencies["@umbraculum/brewery-contracts"] = "^0.0.1"' \
  packages/verticals/brewery/api-client/package.json > /tmp/brewery-api-client-package.json
mv /tmp/brewery-api-client-package.json packages/verticals/brewery/api-client/package.json

echo "3. @umbraculum/brewery-api-client"
publish_pkg packages/verticals/brewery/api-client "@umbraculum/brewery-api-client"
verify_on_registry "@umbraculum/brewery-api-client" "$(jq -r .version packages/verticals/brewery/api-client/package.json)"
mv /tmp/brewery-api-client-package.json.bak packages/verticals/brewery/api-client/package.json

echo "OK: brewery-contracts + brewery-api-client publish step complete"
echo "Next: npx npm@11.16.0 trust github … (see npm-sdk-trusted-publishing.md § brewery vertical SDK)"
echo "      Optional OIDC verification: git tag sdk-contracts-v0.0.2 && git push origin sdk-contracts-v0.0.2"
