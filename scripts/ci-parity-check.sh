#!/usr/bin/env bash
# Thin wrapper — canonical implementation: @umbraculum/ci-parity + .umbraculum/ci-parity.json
# See docs/CI-PARITY.md
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

if [ -x "$REPO_ROOT/node_modules/.bin/ci-parity" ]; then
  exec "$REPO_ROOT/node_modules/.bin/ci-parity" "$@"
fi

exec npx @umbraculum/ci-parity@^1 "$@"
