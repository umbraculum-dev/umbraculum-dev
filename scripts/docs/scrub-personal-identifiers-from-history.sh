#!/usr/bin/env bash
# Rewrite git history to remove legacy personal identifiers from all commits.
#
# Run ONLY before the repo is public, from a clean working tree, with a backup.
# Requires: pip install git-filter-repo
#
# Setup (once):
#   cp scripts/docs/personal-history-scrub-expressions.example.txt \
#      scripts/docs/.personal-history-scrub-expressions.txt
#   # Edit the gitignored file with your legacy==>neutral replacement pairs.
#
# Usage:
#   git status   # must be clean (commit or stash first)
#   bash scripts/docs/scrub-personal-identifiers-from-history.sh
#   git log --all -S'legacy-term' --oneline   # expect empty for each scrubbed term
#   git push --force-with-lease origin master   # maintainer only, pre-flip window

set -euo pipefail

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "ERROR: install git-filter-repo (pip install git-filter-repo)" >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: working tree must be clean before history rewrite" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EXPR_FILE="${REPO_ROOT}/scripts/docs/.personal-history-scrub-expressions.txt"

if [[ ! -f "${EXPR_FILE}" ]]; then
  echo "ERROR: missing ${EXPR_FILE}" >&2
  echo "Copy scripts/docs/personal-history-scrub-expressions.example.txt and edit it." >&2
  exit 1
fi

cd "${REPO_ROOT}"
git filter-repo --replace-text "${EXPR_FILE}" --force

echo ""
echo "History rewrite complete. Verify with git log -S for each legacy term you scrubbed."
echo "Then force-push before flip (maintainer): git push --force-with-lease origin master"
