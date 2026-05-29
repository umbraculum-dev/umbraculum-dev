#!/usr/bin/env bash
# ci-parity-check.sh — run the three static-analysis CI jobs (docs-readmes,
# typecheck, web-lint) against a clean `git archive HEAD` snapshot.
#
# WHY THIS SCRIPT EXISTS
# ----------------------
# The user surfaced this question 2026-05-19 after slot 7 of sub-plan #9 was
# committed locally green but failed on GitHub Actions with three independent
# errors: "why can't we catch them locally? fortunately they are caught by
# github and this shows our strategy is good: but we must understand how to
# catch them locally."
#
# The three local-vs-CI divergence mechanisms (see
# docs/design/brewery-scope-migration-plan.md §6.7) are:
#
#   1. Gitignored cross-references — a tracked README links to a `.gitignored`
#      file (e.g. `DEVELOPMENT.md`); local check-readmes.py resolves the link
#      against the host filesystem (file exists for the developer) → reports
#      OK; CI starts from `actions/checkout@v5` (tracked-only) → link 404s.
#
#   2. Nested-workspace install drift — root `workspaces:
#      ["apps/*", "services/*", "packages/*"]` is a one-level glob, so
#      `apps/web/e2e` (two levels deep) is NOT installed by
#      `npm install --workspaces`. Local docker reproductions see leftover
#      `apps/web/e2e/node_modules` via bind-mount → typecheck resolves
#      @playwright/test; CI starts clean → TS2307.
#
#   3. Stale `node_modules` shadowing — every developer host accumulates
#      `<workspace>/node_modules` state over time; bind-mounting the host
#      tree into a docker reproduction shadows whatever the in-container
#      `npm install` would (or wouldn't) produce. ESLint type-aware rules
#      can fire differently when transitive deps resolve unexpectedly.
#
# WHAT THIS SCRIPT DOES
# ---------------------
# 1. `git archive HEAD` → pure tracked-files snapshot under /tmp/ci-parity-<sha>/
#    (no node_modules, no gitignored files, no host-state contamination).
# 2. Bind-mount that snapshot into a `node:20-slim` container.
# 3. Install Python3 (for docs-readmes), npm install --workspaces, install
#    apps/web/e2e separately (mirrors the fix landed in
#    `.github/workflows/typecheck.yml`), then run:
#      - docs-readmes (CI: `.github/workflows/docs-readmes.yml`)
#      - typecheck across the 15 in-scope workspaces (CI:
#        `.github/workflows/typecheck.yml`)
#      - full ESLint repo sweep (CI: `.github/workflows/web-lint.yml`)
# 4. Emit one-line per job pass/fail. Exit non-zero if any job failed.
# 5. Clean up via docker (root-owned files from in-container npm install
#    can't be `rm`'d on the host).
#
# WHAT THIS SCRIPT DOES *NOT* DO
# ------------------------------
# - Does NOT run the api/web container-based tests (api vitest, web smoke
#   through Nginx) — use `docker compose exec` against the live stack.
# - Does NOT run the Playwright e2e suite — use the dedicated playwright
#   container (see apps/web/e2e/README.md).
# - Does NOT validate npm registry resolution, real DNS, or GitHub API
#   surfaces — trust CI for those.
#
# WHEN TO RUN IT
# --------------
# Before pushing any commit whose CI footprint is non-trivial. Specifically:
# every slot commit in sub-plan #9, every CI-hygiene fix, every change that
# touches `eslint.config.mjs` or `tsconfig*.json` or `.github/workflows/`.
# Bounded ~2 minutes (npm install dominates).
#
# USAGE
# -----
#   ./scripts/ci-parity-check.sh                 # default: HEAD
#   ./scripts/ci-parity-check.sh --sha <rev>     # check a specific revision
#   ./scripts/ci-parity-check.sh --keep          # keep /tmp snapshot for inspection
#
# PREREQUISITES (host)
# --------------------
#   git, bash, Docker (Docker Desktop on macOS/Windows; WSL2 on Windows).
#   Host Node.js is NOT used — all npm/tsc/lint/python run inside node:20-slim
#   on a git-archive snapshot (cross-platform parity with GitHub Actions).
#
# EXIT CODES
# ----------
#   0 — all three CI-parity jobs green
#   1 — one or more jobs failed (per-job status printed)
#   2 — script failed before reaching any CI job (env issue, archive failure)
#
# ----------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# Parse args.
SHA="HEAD"
KEEP_SNAPSHOT=0
while [ $# -gt 0 ]; do
  case "$1" in
    --sha) SHA="$2"; shift 2;;
    --keep) KEEP_SNAPSHOT=1; shift;;
    -h|--help) sed -n '2,60p' "$0"; exit 0;;
    *) echo "ERROR: unknown arg: $1" >&2; exit 2;;
  esac
done

SHORT_SHA="$(git rev-parse --short "$SHA" 2>/dev/null || echo "${SHA//[^a-zA-Z0-9]/_}")"
SNAPSHOT_DIR="/tmp/ci-parity-${SHORT_SHA}"
TAR_FILE="/tmp/ci-parity-${SHORT_SHA}.tar"

echo "=== ci-parity-check.sh — running against ${SHA} (${SHORT_SHA}) ==="
echo ""

# Cleanup any prior snapshot at this sha (via docker to handle root-owned files).
if [ -d "$SNAPSHOT_DIR" ]; then
  echo "--- cleaning prior snapshot at $SNAPSHOT_DIR ---"
  docker run --rm -v /tmp:/host-tmp node:20-slim rm -rf "/host-tmp/$(basename "$SNAPSHOT_DIR")" >/dev/null 2>&1 || true
fi
rm -f "$TAR_FILE"

echo "--- creating tracked-only snapshot via git archive ---"
git archive "$SHA" -o "$TAR_FILE"
mkdir -p "$SNAPSHOT_DIR"
tar -xf "$TAR_FILE" -C "$SNAPSHOT_DIR"
rm -f "$TAR_FILE"
echo "snapshot: $SNAPSHOT_DIR ($(find "$SNAPSHOT_DIR" -type f | wc -l) tracked files)"
echo ""

# Run all 3 CI jobs in one docker invocation to amortize startup.
# Output is captured to a per-job log; status is computed from exit code.
LOG_DIR="${SNAPSHOT_DIR}.logs"
mkdir -p "$LOG_DIR"

echo "--- running 3 CI jobs inside node:20-slim (this is the slow step, ~2 min) ---"
set +e
docker run --rm \
  -v "$SNAPSHOT_DIR:/repo" \
  -w /repo \
  -e NODE_OPTIONS='--max-old-space-size=6144' \
  node:20-slim \
  bash -lc '
    set +e
    # apt-get python3 quietly for docs-readmes.
    apt-get update -qq >/dev/null 2>&1
    apt-get install -y -qq python3 >/dev/null 2>&1 || { echo "FATAL: could not install python3"; exit 2; }

    echo "[1/3] docs-readmes ..."
    python3 scripts/docs/check-readmes.py > /repo/.ci-parity-docs.log 2>&1
    docs_rc=$?
    echo "  exit: $docs_rc"

    # Ordering matters: lint sees the state CI`s web-lint.yml sees
    # (root install only, NO apps/web/e2e install). The e2e install
    # is then layered on for typecheck (which mirrors CI`s typecheck.yml).
    # Reversing the order would mask the rule-firing behavior of
    # type-aware ESLint rules that depend on whether @playwright/test
    # types resolve — the third local-vs-CI mechanism documented in
    # docs/design/brewery-scope-migration-plan.md §6.7.

    echo "[2a/3] npm install --workspaces (~50s; matches web-lint.yml install) ..."
    npm install --no-audit --no-fund --workspaces --include-workspace-root > /repo/.ci-parity-install.log 2>&1
    inst_rc=$?
    if [ $inst_rc -ne 0 ]; then
      echo "  FATAL install failure: exit $inst_rc"
      exit 2
    fi
    echo "  exit: 0 (root workspaces installed, e2e intentionally NOT)"

    export PATH="/repo/node_modules/.bin:$PATH"

    echo "[2b/3] lint (full repo; runs BEFORE the e2e install so its state matches web-lint.yml) ..."
    npm run lint > /repo/.ci-parity-lint.log 2>&1
    lint_rc=$?
    echo "  exit: $lint_rc"

    echo "[3a/3] install apps/web/e2e (nested workspace; matches the typecheck.yml CI hygiene #2 fix) ..."
    (cd apps/web/e2e && npm install --no-audit --no-fund) >> /repo/.ci-parity-install.log 2>&1
    e2e_inst_rc=$?
    if [ $e2e_inst_rc -ne 0 ]; then
      echo "  FATAL e2e install failure: exit $e2e_inst_rc"
      exit 2
    fi
    echo "  exit: 0"

    echo "[3b/3] typecheck (15 workspaces) ..."
    workspaces=(
      "services/api"
      "services/api/prisma|tsc"
      "apps/native"
      "apps/web/e2e"
      "packages/api-client"
      "packages/automation-contracts"
      "packages/beerjson"
      "packages/contracts"
      "packages/module-sdk"
      "packages/i18n"
      "packages/i18n-react"
      "packages/media"
      "packages/navigation"
      "packages/recipes-ui"
      "packages/test-mcp"
    )
    failed=()
    : > /repo/.ci-parity-typecheck.log
    for entry in "${workspaces[@]}"; do
      ws="${entry%%|*}"
      mode="${entry#*|}"
      if [ "$mode" = "$entry" ]; then mode="npm"; fi
      cd "/repo/$ws"
      if [ "$mode" = "tsc" ]; then
        /repo/node_modules/.bin/tsc -p tsconfig.json --noEmit >> /repo/.ci-parity-typecheck.log 2>&1
      else
        npm run typecheck --silent >> /repo/.ci-parity-typecheck.log 2>&1
      fi
      rc=$?
      if [ $rc -ne 0 ]; then failed+=("$ws"); fi
      cd /repo
    done
    if [ ${#failed[@]} -eq 0 ]; then
      tc_rc=0
      echo "  exit: 0 (15/15 workspaces clean)"
    else
      tc_rc=1
      echo "  exit: 1 (failed: ${failed[*]})"
    fi

    # Aggregate.
    overall=0
    if [ $docs_rc -ne 0 ]; then overall=1; fi
    if [ $tc_rc -ne 0 ]; then overall=1; fi
    if [ $lint_rc -ne 0 ]; then overall=1; fi
    echo "$docs_rc $tc_rc $lint_rc" > /repo/.ci-parity-status
    exit $overall
  '
docker_rc=$?
set -e

# Surface per-job results.
echo ""
echo "=== ci-parity-check.sh — summary ==="
if [ -f "$SNAPSHOT_DIR/.ci-parity-status" ]; then
  read -r docs_rc tc_rc lint_rc < "$SNAPSHOT_DIR/.ci-parity-status"
  fmt() { [ "$1" = "0" ] && echo "OK  " || echo "FAIL"; }
  echo "  docs-readmes : $(fmt "$docs_rc")  (log: ${LOG_DIR}/docs.log)"
  echo "  typecheck    : $(fmt "$tc_rc")  (log: ${LOG_DIR}/typecheck.log)"
  echo "  lint         : $(fmt "$lint_rc")  (log: ${LOG_DIR}/lint.log)"
  cp -f "$SNAPSHOT_DIR/.ci-parity-docs.log" "$LOG_DIR/docs.log" 2>/dev/null || true
  cp -f "$SNAPSHOT_DIR/.ci-parity-typecheck.log" "$LOG_DIR/typecheck.log" 2>/dev/null || true
  cp -f "$SNAPSHOT_DIR/.ci-parity-lint.log" "$LOG_DIR/lint.log" 2>/dev/null || true
else
  echo "  (status file missing — see docker output above; likely a FATAL pre-job failure)"
fi
echo ""

# Cleanup snapshot unless --keep.
if [ "$KEEP_SNAPSHOT" -eq 0 ]; then
  echo "--- cleaning snapshot ---"
  docker run --rm -v /tmp:/host-tmp node:20-slim rm -rf "/host-tmp/$(basename "$SNAPSHOT_DIR")" >/dev/null 2>&1 || true
else
  echo "--- snapshot kept at $SNAPSHOT_DIR (logs at $LOG_DIR) ---"
fi

exit $docker_rc
