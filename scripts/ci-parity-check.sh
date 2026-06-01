#!/usr/bin/env bash
# Thin wrapper — canonical implementation: @umbraculum/ci-parity + .umbraculum/ci-parity.json
# See docs/CI-PARITY.md § "Snapshot modes"
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Prefer system Node/npm over Cursor's bundled toolchain (its npx can fail on AppImage mounts).
export PATH="/usr/local/bin:/usr/bin:/bin:${PATH}"

# Default: --ci (working tree) for WIP iteration.
# Pre-push gate (agents): commit first, then --archive or npm run verify:pre-push (auto-archive on clean tree).
# Override: CI_PARITY_SNAPSHOT=archive, or --sha <ref> for replay.
use_checkout=1
extra_args=()
forward_args=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --archive)
      use_checkout=0
      shift
      ;;
    --ci)
      use_checkout=1
      extra_args+=(--ci)
      shift
      ;;
    --sha)
      use_checkout=0
      forward_args+=("$1")
      shift
      if [[ $# -gt 0 ]]; then
        forward_args+=("$1")
        shift
      fi
      ;;
    --sha=*)
      use_checkout=0
      forward_args+=("$1")
      shift
      ;;
    *)
      forward_args+=("$1")
      shift
      ;;
  esac
done

if [[ "${CI_PARITY_SNAPSHOT:-}" == "archive" ]]; then
  use_checkout=0
fi

if [[ "$use_checkout" -eq 1 ]]; then
  extra_args+=(--ci)
  echo "ci-parity-check: verifying working tree (--ci), including uncommitted edits" >&2
else
  echo "ci-parity-check: git-archive replay (committed tree only)" >&2
fi

run_ci_parity() {
  if [[ -x "$REPO_ROOT/node_modules/.bin/ci-parity" ]]; then
    exec "$REPO_ROOT/node_modules/.bin/ci-parity" "${extra_args[@]}" "${forward_args[@]}"
  fi
  exec npx @umbraculum/ci-parity@^1 "${extra_args[@]}" "${forward_args[@]}"
}

run_ci_parity
