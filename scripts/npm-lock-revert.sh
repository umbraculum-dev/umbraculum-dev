#!/usr/bin/env bash
# Full revert after an accidental lock update — NOT git restore alone.
# Restores committed lockfile(s) from HEAD and reinstalls node_modules from them.
#
# Usage:
#   ./scripts/npm-lock-revert.sh [root|web|all]
#
# See DEVELOPMENT.md § npm lockfiles (monorepo policy).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-all}"

revert_paths() {
  case "$1" in
    root)
      git -C "$REPO_ROOT" restore package-lock.json
      ;;
    web)
      git -C "$REPO_ROOT" restore apps/web/package-lock.json
      ;;
    all)
      git -C "$REPO_ROOT" restore package-lock.json apps/web/package-lock.json
      ;;
    *)
      echo "npm-lock-revert: unknown target '$1'" >&2
      exit 1
      ;;
  esac
}

revert_paths "$TARGET"
"${REPO_ROOT}/scripts/npm-lock-install.sh" "$TARGET"

echo "[npm-lock-revert] OK ($TARGET) — locks match HEAD; node_modules reinstalled from locks"
