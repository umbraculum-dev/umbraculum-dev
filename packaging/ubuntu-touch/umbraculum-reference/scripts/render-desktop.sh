#!/usr/bin/env bash
# Render umbraculum.desktop from umbraculum.desktop.in for Click / webapp-container.
# See README.md and docs/design/ubuntu-touch-shell-strategy.md

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

ORIGIN="${UMBRACULUM_WEB_ORIGIN:-https://demo.umbraculum.dev}"
START_PATH="${UMBRACULUM_WEB_START_PATH:-/en/dashboard}"
PATTERNS="${UMBRACULUM_WEB_URL_PATTERNS:-${ORIGIN}/*}"

# Normalize: no trailing slash on origin; start path must begin with /
ORIGIN="${ORIGIN%/}"
case "${START_PATH}" in
  /*) ;;
  *) START_PATH="/${START_PATH}" ;;
esac

START_URL="${ORIGIN}${START_PATH}"
IN_FILE="${PKG_DIR}/umbraculum.desktop.in"
OUT_FILE="${PKG_DIR}/umbraculum.desktop"

if [[ ! -f "${IN_FILE}" ]]; then
  echo "Missing template: ${IN_FILE}" >&2
  exit 1
fi

sed \
  -e "s|@URL_PATTERNS@|${PATTERNS}|g" \
  -e "s|@START_URL@|${START_URL}|g" \
  "${IN_FILE}" > "${OUT_FILE}"

echo "Wrote ${OUT_FILE}"
echo "  START_URL=${START_URL}"
echo "  URL_PATTERNS=${PATTERNS}"
