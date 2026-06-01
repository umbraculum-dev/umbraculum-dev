#!/usr/bin/env bash
# Run a shell command in node:20-slim with warm npm cache + optional root node_modules volume.
#
# Cross-platform: named Docker volumes only (no $HOME bind mounts).
#
# Usage:
#   ./scripts/docker-npm-run.sh [-w REL_WORKDIR] [-r] 'npm install … && npm test …'
#
#   -w  Working directory under /repo (default: repo root)
#   -r  Mount umbraculum_root_node_modules at /repo/node_modules (scoped monorepo installs)
#
# See docs/DEVELOPMENT-NPM-VOLUMES.md

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=lib/docker-npm-volumes.sh
source "$SCRIPT_DIR/lib/docker-npm-volumes.sh"

usage() {
  cat <<'EOF'
Usage: docker-npm-run.sh [-w REL_WORKDIR] [-r] 'shell command…'

Run a command in node:20-slim with:
  - umbraculum_npm_cache     -> /root/.npm
  - optional umbraculum_root_node_modules -> /repo/node_modules (-r)

Examples:
  ./scripts/docker-npm-run.sh -r \
    'npm install --no-audit --no-fund --prefer-offline -w @umbraculum/contracts --include-workspace-root && npm test -w @umbraculum/contracts'

  ./scripts/docker-npm-run.sh -w apps/native \
    'PATH="/repo/node_modules/.bin:$PATH" npm run typecheck'
EOF
}

WORKDIR="/repo"
MOUNT_ROOT_NODE_MODULES=0

while getopts "w:rh" opt; do
  case "$opt" in
    w) WORKDIR="/repo/${OPTARG#/}" ;;
    r) MOUNT_ROOT_NODE_MODULES=1 ;;
    h)
      usage
      exit 0
      ;;
    *)
      usage >&2
      exit 1
      ;;
  esac
done
shift $((OPTIND - 1))

if [[ $# -lt 1 ]]; then
  echo "error: missing shell command" >&2
  usage >&2
  exit 1
fi

CMD="$1"

DOCKER_ARGS=(
  docker run --rm
  "${DOCKER_NPM_CACHE_MOUNT[@]}"
)

if [[ "$MOUNT_ROOT_NODE_MODULES" -eq 1 ]]; then
  DOCKER_ARGS+=("${DOCKER_NPM_ROOT_NODE_MODULES_MOUNT[@]}")
fi

DOCKER_ARGS+=(
  -v "${REPO_ROOT}:/repo"
  -w "$WORKDIR"
  node:20-slim
  bash -lc "$CMD"
)

exec "${DOCKER_ARGS[@]}"
