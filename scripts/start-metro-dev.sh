#!/usr/bin/env bash
set -euo pipefail

# Start Metro for apps/native in Docker with the laptop's current outbound LAN
# IP, so Expo Go on a phone can both (a) reach the bundle and (b) auto-derive
# the dev API base URL from Metro's hostUri (see apps/native/src/auth/apiBaseUrl.ts
# and docs/NATIVE-STRATEGY-AND-CI.md §5.1).
#
# Usage:
#   ./scripts/start-metro-dev.sh                # auto-detect LAN IP
#   LAN_IP=192.168.1.117 ./scripts/start-metro-dev.sh   # override (e.g. pick Ethernet over WiFi)
#
# After this returns, follow Metro with:
#   docker logs -f brewery-metro
# Stop with:
#   docker stop brewery-metro      # --rm removes the container automatically

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTAINER_NAME="brewery-metro"

# 1. Resolve LAN IP. Honor an explicit LAN_IP env override; otherwise derive
#    the IP of the interface the OS would use to reach the internet (which is
#    also the IP the phone — on the same LAN — would use to reach the laptop).
if [[ -z "${LAN_IP:-}" ]]; then
  LAN_IP="$(ip route get 1.1.1.1 2>/dev/null \
    | awk '{for (i=1;i<=NF;i++) if ($i=="src") { print $(i+1); exit }}')"
fi

if [[ -z "${LAN_IP}" ]]; then
  echo "ERROR: could not auto-detect a LAN IP via 'ip route get 1.1.1.1'." >&2
  echo "       Pass one explicitly: LAN_IP=192.168.x.y $0" >&2
  exit 1
fi

# Reject obviously-wrong IPs that wouldn't be reachable from a phone on WiFi.
case "${LAN_IP}" in
  127.* | 169.254.*) echo "ERROR: detected non-LAN IP '${LAN_IP}'. Provide LAN_IP=... explicitly." >&2; exit 1 ;;
esac

# 2. Clean up any prior brewery-metro container — covers both "Exited (255)"
#    leftovers and "container name already in use" races.
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true

# 3. Start Metro. --rm so the container auto-cleans on stop. The inline
#    `npm install` keeps node_modules aligned with package.json before
#    expo start, which prevents the React/react-dom ABI errors we tracked
#    in DEVELOPMENT-LOCAL.md → "Expo Go ABI exception".
echo "Starting Metro with REACT_NATIVE_PACKAGER_HOSTNAME=${LAN_IP}" >&2
docker run -d --rm \
  --name "${CONTAINER_NAME}" \
  -p 19000:19000 -p 19001:19001 -p 19002:19002 -p 8081:8081 \
  -e REACT_NATIVE_PACKAGER_HOSTNAME="${LAN_IP}" \
  -v "${REPO_ROOT}:/repo" \
  -w /repo/apps/native \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund && ./node_modules/.bin/expo start --lan -c"

echo
echo "Container: ${CONTAINER_NAME}"
echo "LAN IP:    ${LAN_IP}"
echo "QR target: exp://${LAN_IP}:8081"
echo "Metro web preview: http://localhost:8081/"
echo
echo "Follow logs: docker logs -f ${CONTAINER_NAME}"
echo "Stop:        docker stop ${CONTAINER_NAME}"
