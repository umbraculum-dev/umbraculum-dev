#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GRAPH_HELPER="${REPO_ROOT}/scripts/lib/package-build-graph.py"
BUILD_SCRIPT="${REPO_ROOT}/scripts/build-package-in-docker.sh"

usage() {
  cat <<'EOF'
Usage: check-packages-dist-up-to-date.sh [options]

Verify committed packages/*/dist matches src/ by rebuilding and diffing.

Options:
  --all              Full monorepo rebuild (SDK / release gate)
  --base <ref>       Compare dist drift since <ref> (default: uncommitted only)
  --include-dependents  Rebuild downstream consumers (default: on)
  --no-dependents    Rebuild only directly affected packages
  -h, --help         Show this help

Default (no --all): rebuild only packages with src/ changes in the diff,
then git diff --exit-code on affected packages/*/dist only.
EOF
}

ALL=0
BASE_REF=""
INCLUDE_DEPENDENTS=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --all)
      ALL=1
      shift
      ;;
    --base)
      BASE_REF="${2:?--base requires a ref}"
      shift 2
      ;;
    --include-dependents)
      INCLUDE_DEPENDENTS=1
      shift
      ;;
    --no-dependents)
      INCLUDE_DEPENDENTS=0
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ "$ALL" -eq 1 ]]; then
  "${BUILD_SCRIPT}" --all >/dev/null
  git diff --exit-code -- packages/*/dist packages/*/package.json >/dev/null
  echo "OK: all packages dist outputs are up to date"
  exit 0
fi

RESOLVE_ARGS=(python3 "$GRAPH_HELPER" --repo-root "$REPO_ROOT" paths-to-workspaces)
if [[ -n "$BASE_REF" ]]; then
  RESOLVE_ARGS+=(--base "$BASE_REF")
fi

mapfile -t AFFECTED < <("${RESOLVE_ARGS[@]}")
if [[ ${#AFFECTED[@]} -eq 0 ]]; then
  echo "OK: no package src/ changes detected — dist check skipped"
  exit 0
fi

BUILD_ARGS=()
if [[ -n "$BASE_REF" ]]; then
  BUILD_ARGS+=(--from-diff "$BASE_REF")
else
  BUILD_ARGS+=(--from-diff HEAD)
fi
if [[ "$INCLUDE_DEPENDENTS" -eq 1 ]]; then
  BUILD_ARGS+=(--include-dependents)
fi

RESOLVE_BUILD=(python3 "$GRAPH_HELPER" --repo-root "$REPO_ROOT" resolve)
if [[ -n "$BASE_REF" ]]; then
  RESOLVE_BUILD+=(--from-diff "$BASE_REF")
else
  RESOLVE_BUILD+=(--from-diff HEAD)
fi
if [[ "$INCLUDE_DEPENDENTS" -eq 1 ]]; then
  RESOLVE_BUILD+=(--include-dependents)
fi
mapfile -t BUILD_LIST < <("${RESOLVE_BUILD[@]}")

"${BUILD_SCRIPT}" "${BUILD_ARGS[@]}" >/dev/null

DIST_PATHS=()
for ws in "${BUILD_LIST[@]}"; do
  dir=$(python3 -c "
import json
from pathlib import Path
g = json.loads(Path('${REPO_ROOT}/.umbraculum/package-build-graph.json').read_text())
for prefix, name in g['pathPrefix'].items():
    if name == '${ws}':
        print(prefix.rstrip('/'))
        break
")
  if [[ -n "$dir" ]]; then
    DIST_PATHS+=("${dir}/dist")
  fi
done

if [[ ${#DIST_PATHS[@]} -eq 0 ]]; then
  echo "error: could not map workspaces to dist paths" >&2
  exit 1
fi

git diff --exit-code -- "${DIST_PATHS[@]}" >/dev/null

echo "OK: dist outputs up to date for: ${BUILD_LIST[*]}"
