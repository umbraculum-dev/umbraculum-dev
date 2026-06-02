#!/usr/bin/env bash
# Registry npm install + platform bearer integrator smoke (loginNative + facades).
# Proves published @umbraculum/contracts + @umbraculum/api-client against a live API.
#
# Usage (from umbraculum-dev repo root):
#   ./scripts/integrator-bearer-npm-smoke.sh
#   UMBRACULUM_BASE_URL=http://localhost:18080 ./scripts/integrator-bearer-npm-smoke.sh
#
# Optional env:
#   CONTRACTS_VERSION=0.0.1 API_CLIENT_VERSION=0.0.1
#   UMBRACULUM_BASE_URL UMBRACULUM_EMAIL UMBRACULUM_PASSWORD
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CONTRACTS_VERSION="${CONTRACTS_VERSION:-0.0.1}"
API_CLIENT_VERSION="${API_CLIENT_VERSION:-0.0.1}"
UMBRACULUM_BASE_URL="${UMBRACULUM_BASE_URL:-http://localhost:18080}"
TMPDIR="${TMPDIR:-/tmp}/umbraculum-integrator-bearer-npm-smoke-$$"
trap 'rm -rf "${TMPDIR}"' EXIT

mkdir -p "${TMPDIR}"
cd "${TMPDIR}"

echo "=== integrator-bearer-npm-smoke ==="
echo "dir=${TMPDIR}"
echo "contracts=@${CONTRACTS_VERSION} api-client=@${API_CLIENT_VERSION}"
echo "base_url=${UMBRACULUM_BASE_URL}"

npm init -y >/dev/null
npm install "@umbraculum/contracts@${CONTRACTS_VERSION}" "@umbraculum/api-client@${API_CLIENT_VERSION}"

cp "${REPO_ROOT}/scripts/integrator-bearer-smoke.mjs" "${TMPDIR}/integrator-bearer-smoke.mjs"

export UMBRACULUM_BASE_URL
node "${TMPDIR}/integrator-bearer-smoke.mjs"

echo "OK: integrator bearer npm smoke passed"
