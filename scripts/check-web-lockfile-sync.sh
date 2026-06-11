#!/usr/bin/env bash
# Fail when apps/web/package-lock.json is out of sync with apps/web/package.json.
# See DEVELOPMENT.md § npm lockfiles (monorepo policy).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="${REPO_ROOT}/apps/web"

if [[ -f /.dockerenv ]]; then
  cd "$WEB_DIR"
  before="$(mktemp)"
  cp package-lock.json "$before"
  npm install --package-lock-only --no-audit --no-fund >/dev/null
  if cmp -s "$before" package-lock.json; then
    rm -f "$before"
    echo "check-web-lockfile-sync: OK"
    exit 0
  fi
  cp "$before" package-lock.json
  rm -f "$before"
  echo "check-web-lockfile-sync: FAIL — apps/web/package-lock.json out of sync with package.json" >&2
  exit 1
fi

docker run --rm \
  -v "${WEB_DIR}:/app" \
  -w /app \
  -e npm_config_legacy_peer_deps=true \
  node:20-slim bash -lc '
    set -euo pipefail
    before="$(mktemp)"
    cp package-lock.json "$before"
    npm install --package-lock-only --no-audit --no-fund >/dev/null
    if cmp -s "$before" package-lock.json; then
      rm -f "$before"
      echo "check-web-lockfile-sync: OK"
    else
      cp "$before" package-lock.json
      rm -f "$before"
      echo "check-web-lockfile-sync: FAIL — apps/web/package-lock.json out of sync with package.json" >&2
      exit 1
    fi
  '
