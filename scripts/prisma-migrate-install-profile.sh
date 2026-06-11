#!/usr/bin/env bash
# Apply Prisma migrations for the active installation profile.
# Core profile: migrate deploy then strip brewery schema (disable-only uninstall leaves schema).
# Reference profile: full migrate deploy including brewery schema.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="${REPO_ROOT}/services/api"
cd "$API_DIR"

HAS_BREWERY="$(python3 "${REPO_ROOT}/scripts/lib/resolve-install-manifest.py" --field hasBrewery)"

echo "[prisma-migrate] profile hasBrewery=${HAS_BREWERY}"
npx --no-install prisma migrate deploy --schema prisma/schema.prisma

if [[ "${HAS_BREWERY}" != "true" ]]; then
  echo "[prisma-migrate] core profile — stripping brewery schema"
  npx --no-install prisma db execute \
    --file "${REPO_ROOT}/scripts/prisma/strip-brewery-schema.sql" \
    --schema prisma/schema.prisma
fi
