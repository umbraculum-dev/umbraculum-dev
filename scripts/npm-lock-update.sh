#!/usr/bin/env bash
# Composer "update" equivalent — re-resolve dependencies and rewrite lockfile(s).
# After update: test, then commit package.json + matching package-lock.json together.
#
# Usage:
#   ./scripts/npm-lock-update.sh [root|web]
#
# See DEVELOPMENT.md § npm lockfiles (monorepo policy).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-root}"

update_root() {
  echo "[npm-lock-update] root — npm install (rewrites package-lock.json)"
  docker run --rm -v "${REPO_ROOT}:/repo" -w /repo node:20-slim \
    bash -lc "npm install --no-audit --no-fund"
  echo "[npm-lock-update] root — npm ci proof"
  docker run --rm -v "${REPO_ROOT}:/repo" -w /repo node:20-slim \
    bash -lc "npm ci --no-audit --no-fund"
}

update_web() {
  echo "[npm-lock-update] apps/web — npm install (rewrites apps/web/package-lock.json)"
  if docker compose -f "${REPO_ROOT}/docker-compose.yml" ps web --status running -q 2>/dev/null | grep -q .; then
    docker compose -f "${REPO_ROOT}/docker-compose.yml" exec -T web \
      sh -c "npm install --include=dev --no-audit --no-fund"
    docker compose -f "${REPO_ROOT}/docker-compose.yml" exec -T web \
      sh -c "npm ci --no-audit --no-fund"
  else
    docker run --rm -v "${REPO_ROOT}/apps/web:/app" -w /app \
      -e npm_config_legacy_peer_deps=true \
      node:20-slim bash -lc "npm install --include=dev --no-audit --no-fund && npm ci --no-audit --no-fund"
  fi
}

case "$TARGET" in
  root)
    update_root
    ;;
  web)
    update_web
    ;;
  *)
    echo "npm-lock-update: unknown target '$TARGET' (use root|web)" >&2
    exit 1
    ;;
esac

echo "[npm-lock-update] OK ($TARGET) — commit lockfile(s) with package.json after testing"
