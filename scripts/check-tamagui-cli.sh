#!/usr/bin/env bash
# Tamagui duplicate-instance gate — run from repo root inside node:20-slim (or web container).
# Detects version skew and nested tamagui copies under file: workspace links.
# See docs/TAMAGUI.md § "Tamagui CLI check".
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Stale nested installs confuse @tamagui/cli (root npm install + file: links).
rm -rf packages/platform/ui/node_modules packages/verticals/brewery/recipes-ui/node_modules

cd apps/web
export npm_config_legacy_peer_deps=true
npm ci --no-audit --no-fund

# npm may nest tamagui under symlinked @umbraculum/* workspaces — strip then dedupe.
rm -rf node_modules/@umbraculum/ui/node_modules node_modules/@umbraculum/brewery-recipes-ui/node_modules
npm dedupe --legacy-peer-deps

npx @tamagui/cli check
