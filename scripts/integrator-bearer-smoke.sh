#!/usr/bin/env bash
# Dev wrapper: run platform bearer smoke using workspace node_modules (no temp npm install).
#
# Usage:
#   ./scripts/integrator-bearer-smoke.sh
#   UMBRACULUM_BASE_URL=http://localhost:18080 ./scripts/integrator-bearer-smoke.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

export NODE_PATH="${REPO_ROOT}/node_modules:${NODE_PATH:-}"

node "${REPO_ROOT}/scripts/integrator-bearer-smoke.mjs"
