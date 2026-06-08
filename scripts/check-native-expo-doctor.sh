#!/usr/bin/env bash
# EAS-like expo-doctor gate for apps/native/brewery (RFC-0011 Wave 4A).
# Run from repo root after root `npm ci`. See docs/design/expo-doctor-monorepo-assessment.md.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Stale nested installs confuse expo-doctor duplicate detection (pre–Wave 4A layout + ui workspace).
rm -rf apps/native/node_modules packages/platform/ui/node_modules
# Phantom peer copies at root (expo-font@56, react-native-svg@15.15.x) — not used by brewery autolinking.
rm -rf node_modules/react-native-svg node_modules/expo-font

cd apps/native/brewery
npx expo install --check
npx expo-doctor@latest
