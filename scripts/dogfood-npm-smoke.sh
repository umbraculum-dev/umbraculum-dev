#!/usr/bin/env bash
# Registry-only smoke: prove published @umbraculum/* SDK packages install outside the
# monorepo (external integrator + third-party module paths).
#
# Usage (from repo root):
#   ./scripts/dogfood-npm-smoke.sh
#
# Optional env:
#   CONTRACTS_VERSION=0.0.1 API_CLIENT_VERSION=0.0.1
#   MODULE_SDK_VERSION=0.0.2 AI_TOOL_SDK_VERSION=0.1.1 AUTOMATION_CONTRACTS_VERSION=0.0.2
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CONTRACTS_VERSION="${CONTRACTS_VERSION:-0.0.1}"
API_CLIENT_VERSION="${API_CLIENT_VERSION:-0.0.1}"
MODULE_SDK_VERSION="${MODULE_SDK_VERSION:-0.0.2}"
AI_TOOL_SDK_VERSION="${AI_TOOL_SDK_VERSION:-0.1.1}"
AUTOMATION_CONTRACTS_VERSION="${AUTOMATION_CONTRACTS_VERSION:-0.0.2}"
TMPDIR="${TMPDIR:-/tmp}/umbraculum-dogfood-npm-smoke-$$"
trap 'rm -rf "${TMPDIR}"' EXIT

mkdir -p "${TMPDIR}"
cd "${TMPDIR}"

echo "=== dogfood-npm-smoke (contracts + api-client) ==="
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

node --check "${REPO_ROOT}/scripts/integrator-bearer-smoke.mjs"

echo "=== dogfood-npm-smoke (module-sdk α batch) ==="
echo "module-sdk=@${MODULE_SDK_VERSION} ai-tool-sdk=@${AI_TOOL_SDK_VERSION} automation-contracts=@${AUTOMATION_CONTRACTS_VERSION}"

BATCH_DIR="${TMPDIR}/module-sdk-batch"
mkdir -p "${BATCH_DIR}"
cd "${BATCH_DIR}"

npm init -y >/dev/null
npm install \
  "@umbraculum/module-sdk@${MODULE_SDK_VERSION}" \
  "@umbraculum/ai-tool-sdk@${AI_TOOL_SDK_VERSION}" \
  "@umbraculum/automation-contracts@${AUTOMATION_CONTRACTS_VERSION}"

echo "--- module-sdk registry dependencies ---"
npm view "@umbraculum/module-sdk@${MODULE_SDK_VERSION}" dependencies

node --input-type=module -e "
import('@umbraculum/module-sdk').then((m) => {
  const keys = Object.keys(m).slice(0, 8);
  console.log('module-sdk exports sample:', keys.join(', '));
  if (!keys.length) throw new Error('no module-sdk exports');
});
import('@umbraculum/automation-contracts').then((m) => {
  const keys = Object.keys(m).slice(0, 8);
  console.log('automation-contracts exports sample:', keys.join(', '));
  if (!keys.length) throw new Error('no automation-contracts exports');
});
"

# ai-tool-sdk is types-only at runtime (export type *); install resolution is the proof.
node --input-type=module -e "
import('@umbraculum/ai-tool-sdk').then(() => console.log('ai-tool-sdk: module resolves (types-only package)'));
"

echo "OK: registry dogfood smoke passed"
