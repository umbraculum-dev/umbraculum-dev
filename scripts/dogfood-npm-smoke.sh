#!/usr/bin/env bash
# Registry-only smoke: prove @umbraculum/contracts + @umbraculum/api-client install
# outside the monorepo (external integrator path).
#
# Usage (from repo root):
#   ./scripts/dogfood-npm-smoke.sh
#
# Optional env:
#   CONTRACTS_VERSION=0.0.1 API_CLIENT_VERSION=0.0.1
set -euo pipefail

CONTRACTS_VERSION="${CONTRACTS_VERSION:-0.0.1}"
API_CLIENT_VERSION="${API_CLIENT_VERSION:-0.0.1}"
TMPDIR="${TMPDIR:-/tmp}/umbraculum-dogfood-npm-smoke-$$"
trap 'rm -rf "${TMPDIR}"' EXIT

mkdir -p "${TMPDIR}"
cd "${TMPDIR}"

echo "=== dogfood-npm-smoke ==="
echo "dir=${TMPDIR}"
echo "contracts=@${CONTRACTS_VERSION} api-client=@${API_CLIENT_VERSION}"

npm init -y >/dev/null
npm install "@umbraculum/contracts@${CONTRACTS_VERSION}" "@umbraculum/api-client@${API_CLIENT_VERSION}"

echo "--- api-client dependencies ---"
npm view "@umbraculum/api-client@${API_CLIENT_VERSION}" dependencies

node --input-type=module -e "
import('@umbraculum/api-client/brewery').then((m) => {
  const keys = Object.keys(m).slice(0, 8);
  console.log('brewery exports sample:', keys.join(', '));
  if (!keys.length) throw new Error('no brewery exports');
});
"

echo "OK: registry dogfood smoke passed"
