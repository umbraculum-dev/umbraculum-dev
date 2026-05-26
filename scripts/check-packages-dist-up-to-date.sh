#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"${REPO_ROOT}/scripts/build-packages-in-docker.sh" >/dev/null

git diff --exit-code -- packages/*/dist packages/*/package.json >/dev/null

echo "OK: packages dist outputs are up to date"

