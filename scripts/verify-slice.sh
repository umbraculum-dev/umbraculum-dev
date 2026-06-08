#!/usr/bin/env bash
# Path-aware T2 pre-push: npm run verify:pre-push  (NOT bare ci-parity-check.sh --archive run).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SLICE_HELPER="${REPO_ROOT}/scripts/lib/verify-slice.py"

usage() {
  cat <<'EOF'
Usage: verify-slice.sh --tier T0|T1|T2 [options]

Run partitioned verification for a change surface.

Options:
  --tier T0|T1|T2       Verification tier (required)
  --full                T2-release: full sequential ci-parity manifest (all jobs)
  --jobs <a,b,c>        T2: explicit ci-parity job override
  --slice <name>        Named slice from .umbraculum/verification-slices.json
  --from-diff <ref>     Auto-select slice(s) from git diff (default base: origin/master)
  --base <ref>          Base ref for diff resolution (default: origin/master)
  -h, --help            Show this help

Examples:
  ./scripts/verify-slice.sh --tier T0 --slice openapi
  ./scripts/verify-slice.sh --tier T1 --from-diff origin/master
  ./scripts/verify-slice.sh --tier T2              # same as npm run verify:pre-push
  ./scripts/verify-slice.sh --tier T2 --full       # same as npm run verify:pre-push:release

Agent pre-push: always prefer npm run verify:pre-push — do not substitute
  ./scripts/ci-parity-check.sh --archive run  (no --jobs; sequential full manifest).
EOF
}

TIER=""
SLICE=""
FROM_DIFF=""
BASE_REF="origin/master"
T2_FULL=""
T2_JOBS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tier)
      TIER="${2:?--tier requires T0, T1, or T2}"
      shift 2
      ;;
    --full)
      T2_FULL=1
      shift
      ;;
    --jobs)
      T2_JOBS="${2:?--jobs requires comma-separated job ids}"
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

run_native_step() {
  local step_id="$1"
  case "$step_id" in
    api-integration)
      echo "==> [api-integration] docker compose up + vitest"
      docker compose -f "${REPO_ROOT}/docker-compose.yml" up -d postgres redis gotenberg
      docker compose -f "${REPO_ROOT}/docker-compose.yml" exec -T api sh -c 'cd /app && npm install --no-audit --no-fund && npm test'
      ;;
    packages-dist-check)
      echo "==> [packages-dist-check] check-packages-dist-up-to-date.sh"
      (cd "$REPO_ROOT" && ./scripts/check-packages-dist-up-to-date.sh)
      ;;
    docs-site-build)
      echo "==> [docs-site-build] npm run build -w @umbraculum/docs-site"
      (cd "$REPO_ROOT" && ./scripts/docker-npm-run.sh -r 'npm run build -w @umbraculum/docs-site')
      ;;
    check-web-url-segments)
      echo "==> [check-web-url-segments] npm run check-web-url-segments (container)"
      (cd "$REPO_ROOT" && ./scripts/docker-npm-run.sh -r 'npm run check-web-url-segments')
      ;;
    expo-doctor)
      echo "==> [expo-doctor] check-native-expo-doctor.sh + native-brewery typecheck (EAS-like)"
      docker run --rm -v "${REPO_ROOT}:/repo" -w /repo node:20-slim \
        bash -lc "npm ci --no-audit --no-fund && ./scripts/check-native-expo-doctor.sh && npm run typecheck -w @umbraculum/native-brewery"
      ;;
    *)
      echo "verify-slice: unknown native step ${step_id}" >&2
      return 1
      ;;
  esac
}

run_t2() {
  local rc=0
  local parity_args=(run)
  local resolved_json
  local ci_jobs=""
  local native_steps=""
  local parallel_count=0
  local api_status="SKIPPED"
  local expo_doctor_status="SKIPPED"
  local validate_status="OK"
  local tier_label="T2-PR"

  if [[ -n "$T2_FULL" ]]; then
    tier_label="T2-release"
  fi

  # Same gate as .github/workflows/ci-parity-validate.yml (must run before ci-parity jobs).
  if ! python3 "${REPO_ROOT}/scripts/docs/validate-gha-trigger-map.py" --repo-root "$REPO_ROOT"; then
    validate_status="FAIL"
    rc=1
  elif ! "${REPO_ROOT}/scripts/ci-parity-check.sh" validate --strict; then
    validate_status="FAIL"
    rc=1
  fi
  if [[ "$rc" -ne 0 ]]; then
    echo "VERIFY-SLICE ${tier_label} @ ${SHORT_SHA}: validate=FAIL (ci-parity-validate parity — fix before ci-parity jobs)" >&2
    return 1
  fi

  if git -C "$REPO_ROOT" diff --quiet && git -C "$REPO_ROOT" diff --cached --quiet; then
    parity_args=(--archive run)
  else
    echo "verify-slice T2: uncommitted edits — running --ci first; re-run after commit with a clean tree" >&2
    parity_args=(run)
  fi

  if [[ -n "$T2_JOBS" ]]; then
    ci_jobs="$T2_JOBS"
    parity_args+=(--jobs "$ci_jobs")
    if [[ -z "$T2_FULL" ]]; then
      parity_args+=(--parallel --isolated-install)
      parallel_count="$(echo "$ci_jobs" | tr ',' '\n' | grep -c . || true)"
    fi
  elif [[ -n "$T2_FULL" ]]; then
    resolved_json="$(python3 "$SLICE_HELPER" --repo-root "$REPO_ROOT" resolve-gha-triggers --base "$BASE_REF" --full)"
    ci_jobs="$(python3 -c "import json,sys; print(','.join(json.loads(sys.argv[1])['ciParityJobs']))" "$resolved_json")"
    parity_args+=(--jobs "$ci_jobs")
  else
    resolved_json="$(python3 "$SLICE_HELPER" --repo-root "$REPO_ROOT" resolve-gha-triggers --base "$BASE_REF")"
    ci_jobs="$(python3 -c "import json,sys; print(','.join(json.loads(sys.argv[1])['ciParityJobs']))" "$resolved_json")"
    native_steps="$(python3 -c "import json,sys; print(','.join(json.loads(sys.argv[1])['nativeSteps']))" "$resolved_json")"
    parity_args+=(--parallel --isolated-install --jobs "$ci_jobs")
    parallel_count="$(echo "$ci_jobs" | tr ',' '\n' | grep -c . || true)"
    echo "verify-slice T2-PR: ci-parity jobs=${ci_jobs} parallel=${parallel_count} native=${native_steps:-none}" >&2
  fi

  local parity_summary="ci-parity=OK"
  if "${REPO_ROOT}/scripts/ci-parity-check.sh" "${parity_args[@]}"; then
    :
  else
    parity_summary="ci-parity=FAIL"
    rc=1
  fi

  if [[ -n "${native_steps:-}" ]]; then
    IFS=',' read -r -a native_array <<< "$native_steps"
    for step in "${native_array[@]}"; do
      [[ -z "$step" ]] && continue
      if run_native_step "$step"; then
        if [[ "$step" == "api-integration" ]]; then
          api_status="OK"
        elif [[ "$step" == "expo-doctor" ]]; then
          expo_doctor_status="OK"
        fi
      else
        rc=1
        if [[ "$step" == "api-integration" ]]; then
          api_status="FAIL"
        elif [[ "$step" == "expo-doctor" ]]; then
          expo_doctor_status="FAIL"
        fi
      fi
    done
  fi

  if [[ "$tier_label" == "T2-release" ]]; then
    echo "VERIFY-SLICE ${tier_label} @ ${SHORT_SHA}: ${parity_summary} jobs=${ci_jobs}"
  else
    echo "VERIFY-SLICE ${tier_label} @ ${SHORT_SHA}: validate=${validate_status} ${parity_summary} jobs=${ci_jobs} parallel=${parallel_count} api=${api_status} expo-doctor=${expo_doctor_status}"
  fi
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
