#!/usr/bin/env bash
set -e
REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
LOCK_FILE="${LOCK_FILE:-/tmp/brewery-session-cleanup.lock}"
flock -n "$LOCK_FILE" -c "cd \"$REPO_ROOT\" && docker compose exec -T api npm run job:session-cleanup" || true
