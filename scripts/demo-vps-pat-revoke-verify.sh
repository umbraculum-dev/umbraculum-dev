#!/usr/bin/env bash
# Verify demo VPS no longer depends on a GitHub PAT after umbraculum-dev is public.
# Run on the demo VPS as root (or the user that runs git pull on /opt/umbraculum-dev).
set -euo pipefail

UMBRACULUM_DEV_ROOT="${UMBRACULUM_DEV_ROOT:-/opt/umbraculum-dev}"
FAIL=0

echo "==> credential helper (expect unset)"
if git config --global --get credential.helper >/dev/null 2>&1; then
  echo "FAIL: credential.helper is still set: $(git config --global --get credential.helper)" >&2
  FAIL=1
else
  echo "OK: no global credential.helper"
fi

echo "==> /root/.git-credentials (expect absent)"
if [[ -f /root/.git-credentials ]]; then
  echo "FAIL: /root/.git-credentials still exists" >&2
  FAIL=1
else
  echo "OK: no /root/.git-credentials"
fi

echo "==> anonymous ls-remote (public clone path)"
if ! git ls-remote https://github.com/umbraculum-dev/umbraculum-dev.git HEAD >/dev/null; then
  echo "FAIL: anonymous ls-remote failed" >&2
  FAIL=1
else
  echo "OK: anonymous ls-remote"
fi

echo "==> git fetch in $UMBRACULUM_DEV_ROOT"
if [[ ! -d "$UMBRACULUM_DEV_ROOT/.git" ]]; then
  echo "FAIL: missing clone at $UMBRACULUM_DEV_ROOT" >&2
  exit 1
fi
if ! git -C "$UMBRACULUM_DEV_ROOT" fetch origin; then
  echo "FAIL: git fetch origin failed (check remote URL is public HTTPS)" >&2
  FAIL=1
else
  echo "OK: git fetch origin"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "PAT revoke verification FAILED — see demo-host-runbook.md §3" >&2
  exit 1
fi

echo "PAT revoke verification OK — remember to revoke the token in GitHub UI if not done yet."
