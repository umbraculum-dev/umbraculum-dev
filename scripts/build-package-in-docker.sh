#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GRAPH_HELPER="${REPO_ROOT}/scripts/lib/package-build-graph.py"
# shellcheck source=lib/docker-npm-volumes.sh
source "${REPO_ROOT}/scripts/lib/docker-npm-volumes.sh"

usage() {
  cat <<'EOF'
Usage: build-package-in-docker.sh [options] [@umbraculum/workspace ...]

Build committed package dist/ outputs inside Docker (scoped or full).

Options:
  --all                   Build all workspaces in build:packages order
  --from-diff <ref>       Build workspaces touched since <ref> (plus uncommitted)
  --include-dependents    Also rebuild downstream consumers from the graph
  --fresh                 Run npm ci before build (uses warm named volume)
  --base <ref>            Base ref for lockfile-change detection with --from-diff
  -h, --help              Show this help

Examples:
  ./scripts/build-package-in-docker.sh @umbraculum/contracts
  ./scripts/build-package-in-docker.sh @umbraculum/contracts --include-dependents
  ./scripts/build-package-in-docker.sh --from-diff main --include-dependents
  ./scripts/build-package-in-docker.sh --all
  ./scripts/build-package-in-docker.sh @umbraculum/contracts --fresh

Scoped builds (default) install only the requested workspace(s) into the
bind-mounted repo with warm npm cache + optional root node_modules volume.
Full --all / --fresh uses umbraculum_root_node_modules + npm ci.

See docs/DEVELOPMENT-NPM-VOLUMES.md.
EOF
}

ALL=0
FROM_DIFF=""
INCLUDE_DEPENDENTS=0
FRESH=0
BASE_REF=""
WORKSPACES=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --all)
      ALL=1
      shift
      ;;
    --from-diff)
      FROM_DIFF="${2:?--from-diff requires a ref}"
      shift 2
      ;;
    --include-dependents)
      INCLUDE_DEPENDENTS=1
      shift
      ;;
    --fresh)
      FRESH=1
      shift
      ;;
    --base)
      BASE_REF="${2:?--base requires a ref}"
      shift 2
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    @umbraculum/*)
      WORKSPACES+=("$1")
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ "$ALL" -eq 1 && ( -n "$FROM_DIFF" || ${#WORKSPACES[@]} -gt 0 ) ]]; then
  echo "error: --all cannot be combined with workspace names or --from-diff" >&2
  exit 1
fi

if [[ "$ALL" -eq 0 && -z "$FROM_DIFF" && ${#WORKSPACES[@]} -eq 0 ]]; then
  echo "error: specify workspace name(s), --from-diff, or --all" >&2
  usage >&2
  exit 1
fi

RESOLVE_ARGS=(python3 "$GRAPH_HELPER" --repo-root "$REPO_ROOT" resolve)
if [[ "$ALL" -eq 1 ]]; then
  RESOLVE_ARGS+=(--all)
elif [[ -n "$FROM_DIFF" ]]; then
  RESOLVE_ARGS+=(--from-diff "$FROM_DIFF")
else
  RESOLVE_ARGS+=("${WORKSPACES[@]}")
fi
if [[ "$INCLUDE_DEPENDENTS" -eq 1 ]]; then
  RESOLVE_ARGS+=(--include-dependents)
fi

mapfile -t BUILD_LIST < <("${RESOLVE_ARGS[@]}")
if [[ ${#BUILD_LIST[@]} -eq 0 ]]; then
  echo "OK: no package workspaces to build"
  exit 0
fi

LOCKFILE_ARGS=(python3 "$GRAPH_HELPER" --repo-root "$REPO_ROOT" lockfile-changed)
if [[ -n "$BASE_REF" ]]; then
  LOCKFILE_ARGS+=(--base "$BASE_REF")
elif [[ -n "$FROM_DIFF" ]]; then
  LOCKFILE_ARGS+=(--base "$FROM_DIFF")
fi
if "${LOCKFILE_ARGS[@]}" >/dev/null 2>&1; then
  echo "note: lockfile changed in diff — prefer --fresh for npm ci on full builds" >&2
fi

BUILD_COMMANDS=()
if [[ "$ALL" -eq 1 ]]; then
  BUILD_COMMANDS+=("npm run build:packages")
else
  for ws in "${BUILD_LIST[@]}"; do
    BUILD_COMMANDS+=("npm run build -w ${ws}")
  done
fi

DOCKER_ARGS=(
  docker run --rm
  -v "${REPO_ROOT}:/repo"
  -w /repo
  -e HOST_UID="$(id -u)"
  -e HOST_GID="$(id -g)"
  "${DOCKER_NPM_CACHE_MOUNT[@]}"
)

if [[ "$ALL" -eq 1 || "$FRESH" -eq 1 ]]; then
  DOCKER_ARGS+=("${DOCKER_NPM_ROOT_NODE_MODULES_MOUNT[@]}")
  INSTALL_STEP="npm ci --no-audit --no-fund --prefer-offline"
else
  DOCKER_ARGS+=("${DOCKER_NPM_ROOT_NODE_MODULES_MOUNT[@]}")
  INSTALL_WORKSPACES=(--include-workspace-root)
  for ws in "${BUILD_LIST[@]}"; do
    INSTALL_WORKSPACES+=(-w "$ws")
  done
  INSTALL_STEP="npm install ${UMBRACULUM_NPM_INSTALL_FLAGS} ${INSTALL_WORKSPACES[*]}"
fi

INNER=$(
  cat <<EOF
set -e
${INSTALL_STEP}
$(printf '%s\n' "${BUILD_COMMANDS[@]}")
EOF
)

echo "Building workspace(s): ${BUILD_LIST[*]}"

"${DOCKER_ARGS[@]}" node:20-slim \
  bash -lc "${INNER}; rc=\$?; chown -R \"\$HOST_UID:\$HOST_GID\" /repo/packages /repo/apps /repo/services /repo/package.json /repo/package-lock.json; exit \$rc"

echo "OK: built ${#BUILD_LIST[@]} workspace(s): ${BUILD_LIST[*]}"
