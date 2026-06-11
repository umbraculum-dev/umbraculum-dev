#!/usr/bin/env bash
# EAS-like expo-doctor gate for the primary native app in the active installation profile.
# Run from repo root after root `npm ci`. See docs/NATIVE-STRATEGY-AND-CI.md.
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

NATIVE_APP="${NATIVE_APP:-$(resolve_manifest --field primaryNativeApp)}"

case "$NATIVE_APP" in
  starter) NATIVE_WS="@umbraculum/native-starter" ;;
  brewery) NATIVE_WS="@umbraculum/native-brewery" ;;
  *)
    echo "[native-expo-doctor] unknown nativeApps entry: ${NATIVE_APP}" >&2
    exit 1
    ;;
esac

echo "[native-expo-doctor] profile native app=${NATIVE_APP} workspace=${NATIVE_WS}"

# Stale nested installs confuse expo-doctor duplicate detection (pre–Wave 4A layout + ui workspace).
rm -rf apps/native/node_modules packages/platform/ui/node_modules
# Phantom override peer at root (expo-font@56) — not a direct dep; safe to drop before doctor.
rm -rf node_modules/expo-font

cd "apps/native/${NATIVE_APP}"
npx expo install --check
npx expo-doctor@latest

cd "$REPO_ROOT"
npm run typecheck -w "${NATIVE_WS}"
