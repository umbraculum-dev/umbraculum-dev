#!/usr/bin/env bash
# Fail when forbidden per-workspace lockfiles appear on disk.
# @umbraculum/api deps are pinned in the root package-lock.json only.
# See DEVELOPMENT.md § "npm lockfiles (monorepo policy)".
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

FORBIDDEN=(
  services/api/package-lock.json
)

fail=0
for path in "${FORBIDDEN[@]}"; do
  if [[ -f "$path" ]]; then
    echo "check-monorepo-lockfiles: FAIL — forbidden lockfile: $path" >&2
    echo "  Remove it: rm -f $path" >&2
    echo "  Cause: isolated npm install in services/api (api compose cwd=/app)." >&2
    echo "  Policy: api versions live in root package-lock.json; see DEVELOPMENT.md." >&2
    fail=1
  fi
done

if git diff --cached --name-only 2>/dev/null | grep -qx 'services/api/package-lock.json'; then
  echo "check-monorepo-lockfiles: FAIL — services/api/package-lock.json is staged for commit" >&2
  echo "  Unstage: git restore --staged services/api/package-lock.json && rm -f services/api/package-lock.json" >&2
  fail=1
fi

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi

echo "check-monorepo-lockfiles: OK"
