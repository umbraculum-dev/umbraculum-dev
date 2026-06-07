#!/usr/bin/env bash
# Sync announcement export from umbraculum-brochure sibling clone into docs-site vendor mirror.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${BROCHURE_ROOT:-$ROOT/../umbraculum-brochure}"
DEST="$ROOT/docs-site/vendor/brochure"
if [[ ! -d "$SRC" ]]; then
  echo "sync-brochure-vendor: missing brochure clone at $SRC (set BROCHURE_ROOT)" >&2
  exit 1
fi
cp "$SRC/announcement.config.json" "$DEST/"
cp "$SRC/scripts/announcement-theme.mjs" "$DEST/scripts/"
cp "$SRC/src/announcement.mjs" "$DEST/src/"
echo "sync-brochure-vendor: copied announcement files from $SRC -> $DEST"
