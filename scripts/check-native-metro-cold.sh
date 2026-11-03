#!/usr/bin/env bash
# Cold Metro Android-bundle smoke — catches warm-cache / false-green traps.
# Proves Metro can emit apps/native/brewery JS for platform=android without
# Node builtins (e.g. fs) leaking into the graph. No physical phone required.
#
# Usage (repo root):
#   ./scripts/check-native-metro-cold.sh
#   LAN_IP=192.168.1.116 ./scripts/check-native-metro-cold.sh
#
# See docs/DEVELOPMENT-NATIVE-LOCAL.md § Pre-release: cold Metro / clean graph
# and docs/design/native-metro-cold-bundle-gate.md (automation proposal).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CONTAINER_NAME="brewery-metro"
BUNDLE_PATH="/apps/native/brewery/index.bundle?platform=android&dev=true&hot=false&lazy=true&minify=false"
OUT_FILE="${TMPDIR:-/tmp}/umbraculum-metro-android-cold.bundle"
MAX_WAIT_SECS="${METRO_COLD_WAIT_SECS:-180}"

echo "[native-metro-cold] restarting Metro with cleared bundler cache (-c)"
./scripts/start-metro-dev.sh

echo "[native-metro-cold] waiting for packager status (max ${MAX_WAIT_SECS}s)"
deadline=$((SECONDS + MAX_WAIT_SECS))
while (( SECONDS < deadline )); do
  if curl -sf --connect-timeout 2 "http://127.0.0.1:8081/status" | grep -q 'packager-status:running'; then
    echo "[native-metro-cold] Metro is up"
    break
  fi
  if ! docker inspect "${CONTAINER_NAME}" >/dev/null 2>&1; then
    echo "[native-metro-cold] FAIL: container ${CONTAINER_NAME} exited early" >&2
    docker logs --tail=40 "${CONTAINER_NAME}" 2>&1 || true
    exit 1
  fi
  sleep 2
done
if ! curl -sf --connect-timeout 2 "http://127.0.0.1:8081/status" | grep -q 'packager-status:running'; then
  echo "[native-metro-cold] FAIL: Metro did not become ready within ${MAX_WAIT_SECS}s" >&2
  docker logs --tail=40 "${CONTAINER_NAME}" 2>&1 || true
  exit 1
fi

echo "[native-metro-cold] requesting Android bundle"
http_code="$(curl -sS -o "${OUT_FILE}" -w '%{http_code}' --max-time 300 \
  "http://127.0.0.1:8081${BUNDLE_PATH}" || true)"

if [[ "${http_code}" != "200" ]]; then
  echo "[native-metro-cold] FAIL: HTTP ${http_code} (expected 200)" >&2
  head -c 2000 "${OUT_FILE}" >&2 || true
  echo >&2
  exit 1
fi

if head -c 64 "${OUT_FILE}" | grep -q '^{'; then
  if grep -qE 'UnableToResolveError|"fs"|Node standard library' "${OUT_FILE}"; then
    echo "[native-metro-cold] FAIL: Metro returned a resolve/Node-builtin error JSON body" >&2
    head -c 2000 "${OUT_FILE}" >&2 || true
    echo >&2
    exit 1
  fi
  echo "[native-metro-cold] FAIL: response looks like JSON error, not a JS bundle" >&2
  head -c 500 "${OUT_FILE}" >&2 || true
  echo >&2
  exit 1
fi

bytes="$(wc -c < "${OUT_FILE}" | tr -d ' ')"
if [[ "${bytes}" -lt 100000 ]]; then
  echo "[native-metro-cold] FAIL: bundle too small (${bytes} bytes) — likely incomplete" >&2
  exit 1
fi

echo "[native-metro-cold] OK Android bundle HTTP 200 (${bytes} bytes)"
echo "[native-metro-cold] note: Expo Go on device must match SDK 58 (see DEVELOPMENT-NATIVE-LOCAL.md)"
exit 0
