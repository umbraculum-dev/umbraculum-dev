#!/usr/bin/env bash
# Opt-in brewery vertical on an existing database (after switching to reference profile).
# Re-applies pending migrations; if brewery schema was stripped, run manual bootstrap per
# docs/design/brewery-vertical-lifecycle.md § "Opt-in later".
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="${REPO_ROOT}/services/api"

if [[ "$(python3 "${REPO_ROOT}/scripts/lib/resolve-install-manifest.py" --field hasBrewery)" != "true" ]]; then
  echo "[brewery-opt-in] installation profile does not include brewery — set UMBRACULUM_MODULE_PROFILE=reference or edit .umbraculum/install.json" >&2
  exit 1
fi

cd "$API_DIR"
npx --no-install prisma migrate deploy --schema prisma/schema.prisma

echo "[brewery-opt-in] migrate deploy complete. If brewery schema was previously stripped, restore from backup or follow brewery-vertical-lifecycle.md bootstrap steps."
