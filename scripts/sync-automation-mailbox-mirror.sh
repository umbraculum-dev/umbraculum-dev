#!/usr/bin/env bash
# Sync the platform-side mirror of the OpenPLC sister-repo mailbox artifact.
#
# This is the M2 mechanism described in
# `docs/design/canonical-automation-module-surface.md` §12.2:
#
#   1. Sister repo `brewery-alarms-tanks-supervisor` emits
#      `out/mailbox.json` from `tools/build_mailbox_artifact.py`.
#   2. This script copies that file into
#      `packages/automation-contracts/data/mailbox.json`.
#   3. `src/mailbox-data.ts` validates the mirror at module-load time;
#      vitest covers the same checks at CI time.
#
# Usage:
#   bash scripts/sync-automation-mailbox-mirror.sh
#       Default path: ../arduino-and-plc/openplc/brewery/
#                       tanks-pump-priority-and-low-high-levels-sensors-alarms/
#
#   SISTER_REPO=/path/to/sister-repo \
#     bash scripts/sync-automation-mailbox-mirror.sh
#       Override path explicitly.
#
#   bash scripts/sync-automation-mailbox-mirror.sh --check
#       Diff-only mode: exits non-zero if the mirror is out of date.
#       Useful from CI when the sister repo is checked out alongside.
#
# Drift policy:
#   - The mirror IS the contract. If you change the sister-repo emitter,
#     re-emit `out/mailbox.json`, then re-run this sync, then commit
#     both repos together (or commit sister repo first and let this PR
#     drag the mirror in).
#   - Never hand-edit `data/mailbox.json` on the platform side. The
#     sister repo is SoT for `PI_*` names, addresses, and semantics.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_SISTER_REPO="${REPO_ROOT}/../openplc-sister-repo"
SISTER_REPO="${SISTER_REPO:-${DEFAULT_SISTER_REPO}}"
SISTER_ARTIFACT="${SISTER_REPO}/out/mailbox.json"
MIRROR="${REPO_ROOT}/packages/automation-contracts/data/mailbox.json"

mode="copy"
if [[ "${1:-}" == "--check" ]]; then
  mode="check"
fi

if [[ ! -f "${SISTER_ARTIFACT}" ]]; then
  echo "ERROR: sister-repo artifact not found at:" >&2
  echo "  ${SISTER_ARTIFACT}" >&2
  echo "" >&2
  echo "Override with: SISTER_REPO=/path/to/sister-repo $0" >&2
  echo "" >&2
  echo "Or regenerate the artifact in the sister repo first:" >&2
  echo "  cd ${SISTER_REPO} && make mailbox-artifact" >&2
  exit 2
fi

case "${mode}" in
  copy)
    if [[ -f "${MIRROR}" ]] && cmp -s "${SISTER_ARTIFACT}" "${MIRROR}"; then
      echo "Mirror already up to date: ${MIRROR}"
      exit 0
    fi
    mkdir -p "$(dirname "${MIRROR}")"
    cp "${SISTER_ARTIFACT}" "${MIRROR}"
    echo "Synced mailbox mirror:"
    echo "  src: ${SISTER_ARTIFACT}"
    echo "  dst: ${MIRROR}"
    echo ""
    echo "Next: rebuild the package inside the Node container so dist/ stays"
    echo "      in lockstep, then commit both files together."
    ;;
  check)
    if [[ ! -f "${MIRROR}" ]]; then
      echo "ERROR: mirror missing at ${MIRROR}" >&2
      exit 1
    fi
    if ! cmp -s "${SISTER_ARTIFACT}" "${MIRROR}"; then
      echo "ERROR: mailbox mirror is out of date" >&2
      echo "" >&2
      echo "Sister repo ${SISTER_ARTIFACT} differs from platform mirror ${MIRROR}." >&2
      echo "Re-run without --check to update the mirror, then commit." >&2
      echo "" >&2
      echo "Diff (truncated):" >&2
      diff -u "${MIRROR}" "${SISTER_ARTIFACT}" | head -40 >&2 || true
      exit 1
    fi
    echo "Mailbox mirror is in sync with ${SISTER_ARTIFACT}"
    ;;
esac
