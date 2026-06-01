#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SLICE_HELPER="${REPO_ROOT}/scripts/lib/verify-slice.py"

usage() {
  cat <<'EOF'
Usage: verify-slice.sh --tier T0|T1|T2 [options]

Run partitioned verification for a change surface.

Options:
  --tier T0|T1|T2       Verification tier (required)
  --slice <name>        Named slice from .umbraculum/verification-slices.json
  --from-diff <ref>     Auto-select slice(s) from git diff (default base: main)
  --base <ref>          Base ref for --from-diff (default: main)
  -h, --help            Show this help

Examples:
  ./scripts/verify-slice.sh --tier T0 --slice openapi
  ./scripts/verify-slice.sh --tier T1 --from-diff main
  ./scripts/verify-slice.sh --tier T2
EOF
}

TIER=""
SLICE=""
FROM_DIFF=""
BASE_REF="main"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tier)
      TIER="${2:?--tier requires T0, T1, or T2}"
      shift 2
      ;;
    --slice)
      SLICE="${2:?--slice requires a name}"
      shift 2
      ;;
    --from-diff)
      if [[ "${2:-}" != "" && "${2:0:1}" != "-" ]]; then
        BASE_REF="$2"
        shift
      fi
      FROM_DIFF=1
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
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$TIER" ]]; then
  echo "error: --tier is required" >&2
  usage >&2
  exit 1
fi

SHORT_SHA="$(git -C "$REPO_ROOT" rev-parse --short HEAD)"
export REPO_ROOT

run_t2() {
  local summary_parts=()
  local rc=0
  local parity_args=(run)

  # Match GHA: cold npm ci on the committed tree you are about to push.
  # --ci (working-tree mount + warm volumes) is for WIP iteration only.
  if git -C "$REPO_ROOT" diff --quiet && git -C "$REPO_ROOT" diff --cached --quiet; then
    parity_args=(--archive run)
  else
    echo "verify-slice T2: uncommitted edits — running --ci first; re-run after commit with a clean tree" >&2
    parity_args=(run)
  fi

  if "${REPO_ROOT}/scripts/ci-parity-check.sh" "${parity_args[@]}"; then
    summary_parts+=("ci-parity=OK")
  else
    summary_parts+=("ci-parity=FAIL")
    rc=1
  fi

  if python3 "$SLICE_HELPER" --repo-root "$REPO_ROOT" api-changed --base "$BASE_REF"; then
    cat <<EOF

T2 API reminder: also run the api-integration-tests-pre-push skill recipe:
  cd ${REPO_ROOT} && docker compose up -d postgres redis gotenberg
  cd ${REPO_ROOT} && docker compose exec -T api sh -c 'cd /app && npm install --no-audit --no-fund && npm test'
See docs/VERIFICATION-TIERS.md and skill api-integration-tests-pre-push.
EOF
  fi

  local summary="VERIFY-SLICE T2 pre-push @ ${SHORT_SHA}: ${summary_parts[*]}"
  echo "$summary"
  return "$rc"
}

if [[ "$TIER" == "T2" ]]; then
  run_t2
  exit $?
fi

LIST_ARGS=(python3 "$SLICE_HELPER" --repo-root "$REPO_ROOT" list-steps --tier "$TIER")
if [[ -n "$SLICE" ]]; then
  LIST_ARGS+=(--slice "$SLICE")
elif [[ -n "$FROM_DIFF" ]]; then
  LIST_ARGS+=(--from-diff --base "$BASE_REF")
else
  echo "error: specify --slice or --from-diff for tier ${TIER}" >&2
  usage >&2
  exit 1
fi

mapfile -t STEP_LINES < <("${LIST_ARGS[@]}")
if [[ ${#STEP_LINES[@]} -eq 0 ]]; then
  echo "OK: no verification steps matched for tier ${TIER}"
  exit 0
fi

declare -A RESULTS=()
OVERALL_RC=0
SLICE_LABEL="${SLICE:-from-diff}"

for line in "${STEP_LINES[@]}"; do
  step_id=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['id'])" "$line")
  cmd=$(python3 -c "import json,sys; print(json.loads(sys.argv[1])['cmd'])" "$line")
  expanded_cmd="${cmd//\$\{REPO_ROOT\}/$REPO_ROOT}"

  echo "==> [${step_id}] ${expanded_cmd}"
  if (cd "$REPO_ROOT" && bash -lc "$expanded_cmd"); then
    RESULTS["$step_id"]="OK"
  else
    RESULTS["$step_id"]="FAIL"
    OVERALL_RC=1
  fi
done

SUMMARY_PARTS=()
for step_id in "${!RESULTS[@]}"; do
  SUMMARY_PARTS+=("${step_id}=${RESULTS[$step_id]}")
done
IFS=' '
echo "VERIFY-SLICE ${TIER} ${SLICE_LABEL} @ ${SHORT_SHA}: ${SUMMARY_PARTS[*]}"
exit "$OVERALL_RC"
