#!/usr/bin/env bash
# Build workspace packages for the active installation profile.
# Core packages always build; vertical packages build only when a vertical is installed.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

resolve_manifest() {
  if command -v python3 >/dev/null 2>&1; then
    python3 scripts/lib/resolve-install-manifest.py "$@"
  else
    node scripts/lib/resolve-install-manifest.mjs "$@"
  fi
}

npm run build:packages:core

if [[ "$(resolve_manifest --field hasBrewery)" == "true" ]]; then
  npm run build:packages:verticals
else
  echo "[build-packages] core installation profile — skipping vertical package builds"
fi
