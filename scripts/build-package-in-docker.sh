#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GRAPH_HELPER="${REPO_ROOT}/scripts/lib/package-build-graph.py"

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
bind-mounted repo (no named node_modules volume) to avoid ENOTEMPTY drift.
Full --all / --fresh uses brewery_app_root_node_modules + npm ci.
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
)

if [[ "$ALL" -eq 1 || "$FRESH" -eq 1 ]]; then
  DOCKER_ARGS+=(-v brewery_app_root_node_modules:/repo/node_modules)
  INSTALL_STEP="npm ci"
else
  INSTALL_WORKSPACES=(--include-workspace-root)
  for ws in "${BUILD_LIST[@]}"; do
    INSTALL_WORKSPACES+=(-w "$ws")
  done
  INSTALL_STEP="npm install --no-audit --no-fund --prefer-offline ${INSTALL_WORKSPACES[*]}"
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
