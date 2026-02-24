#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

docker run --rm \
  -v "${REPO_ROOT}:/repo" \
  -v brewery_app_root_node_modules:/repo/node_modules \
  -w /repo \
  node:20-slim \
  bash -lc "npm ci && npm run build:packages"

