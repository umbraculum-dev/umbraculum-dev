#!/usr/bin/env bash
# EAS-like expo-doctor gate for apps/native/brewery (RFC-0011 Wave 4A).
# Run from repo root after root `npm ci`. See docs/design/expo-doctor-monorepo-assessment.md.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Stale nested installs confuse expo-doctor duplicate detection (pre–Wave 4A layout + ui workspace).
rm -rf apps/native/node_modules packages/platform/ui/node_modules
# Phantom override peer at root (expo-font@56) — not a brewery direct dep; safe to drop before doctor.
# Do NOT rm node_modules/react-native-svg: after root lockfile resync npm hoists the canonical
# 15.12.1 copy here only; deleting it breaks `expo install --check` in apps/native/brewery.
rm -rf node_modules/expo-font

cd apps/native/brewery
npx expo install --check
npx expo-doctor@latest
