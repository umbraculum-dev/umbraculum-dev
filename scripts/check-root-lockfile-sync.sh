#!/usr/bin/env bash
# Fail when root package-lock.json is out of sync with package.json (npm ci would fail).
# Uses node:20-slim on the host; runs in-process when already inside a container.
# See DEVELOPMENT.md § "npm lockfiles (monorepo policy)".
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

run_sync_check() {
  local before
  cd "$REPO_ROOT"
  before="$(mktemp)"
  cp package-lock.json "$before"
  npm install --package-lock-only --no-audit --no-fund >/dev/null
  if cmp -s "$before" package-lock.json; then
    rm -f "$before"
    echo "check-root-lockfile-sync: OK"
    return 0
  fi
  cp "$before" package-lock.json
  rm -f "$before"
  echo "check-root-lockfile-sync: FAIL — root package-lock.json out of sync with package.json" >&2
  echo "  CI runs: npm ci at repo root (node:20-slim / npm 10)." >&2
  echo "  Regenerate: docker run --rm -v \"\$PWD:/repo\" -w /repo node:20-slim bash -lc 'npm install --no-audit --no-fund'" >&2
  echo "  Then verify:  docker run --rm -v \"\$PWD:/repo\" -w /repo node:20-slim bash -lc 'npm ci --no-audit --no-fund'" >&2
  return 1
}

if [[ -f /.dockerenv ]]; then
  run_sync_check
else
  docker run --rm -v "${REPO_ROOT}:/repo" -w /repo node:20-slim bash -lc '
    set -euo pipefail
    before="$(mktemp)"
    cp package-lock.json "$before"
    npm install --package-lock-only --no-audit --no-fund >/dev/null
    if cmp -s "$before" package-lock.json; then
      rm -f "$before"
      echo "check-root-lockfile-sync: OK"
    else
      cp "$before" package-lock.json
      rm -f "$before"
      echo "check-root-lockfile-sync: FAIL — root package-lock.json out of sync with package.json" >&2
      exit 1
    fi
  '
fi
