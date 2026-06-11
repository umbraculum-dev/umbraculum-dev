#!/usr/bin/env bash
# Composer "install" equivalent — install node_modules from committed lockfile(s).
# Does NOT rewrite package-lock.json. Use npm-lock-update.sh to refresh locks.
#
# Usage:
#   ./scripts/npm-lock-install.sh [root|web|all]
#
# See DEVELOPMENT.md § npm lockfiles (monorepo policy).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-all}"

install_root() {
  echo "[npm-lock-install] root — npm ci (from package-lock.json)"
  docker run --rm -v "${REPO_ROOT}:/repo" -w /repo node:20-slim \
    bash -lc "npm ci --no-audit --no-fund"
}

install_web() {
  echo "[npm-lock-install] apps/web — npm ci (from apps/web/package-lock.json)"
  local -a run_args=(
    run --rm
    -v "${REPO_ROOT}/apps/web:/app"
    -w /app
    -e npm_config_legacy_peer_deps=true
    node:20-slim
    bash -lc "npm ci --no-audit --no-fund"
  )
  if docker compose -f "${REPO_ROOT}/docker-compose.yml" ps web --status running -q 2>/dev/null | grep -q .; then
    echo "[npm-lock-install] web container running — using docker compose exec"
    docker compose -f "${REPO_ROOT}/docker-compose.yml" exec -T web \
      sh -c "npm ci --no-audit --no-fund"
  else
    docker "${run_args[@]}"
  fi
}

case "$TARGET" in
  root)
    install_root
    ;;
  web)
    install_web
    ;;
  all)
    install_root
    install_web
    ;;
  *)
    echo "npm-lock-install: unknown target '$TARGET' (use root|web|all)" >&2
    exit 1
    ;;
esac

echo "[npm-lock-install] OK ($TARGET)"
