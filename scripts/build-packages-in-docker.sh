#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Docker writes regenerated dist/lockfile output as root inside the bind-mount,
# which breaks host-side git operations (stash pop, checkout, restore, rebase)
# because non-root users can't unlink root-owned files. We restore ownership at
# the end of the run so the host user can manipulate everything afterwards.
#
# - HOST_UID/HOST_GID are resolved on the host before docker run is invoked, so
#   the values entering the container are already literal numeric ids.
# - The chown is unconditional (runs even if the build failed) so we never leave
#   a partial root-owned state on disk; the script's exit code preserves the
#   build's exit code via $rc.
# - /repo/node_modules is excluded on purpose: it's a docker-managed named
#   volume (brewery_app_root_node_modules), not a host bind-mount, and chowning
#   its contents inside the container is both unnecessary and slow.
docker run --rm \
  -v "${REPO_ROOT}:/repo" \
  -v brewery_app_root_node_modules:/repo/node_modules \
  -w /repo \
  -e HOST_UID="$(id -u)" \
  -e HOST_GID="$(id -g)" \
  node:20-slim \
  bash -lc 'npm ci && npm run build:packages; rc=$?; chown -R "$HOST_UID:$HOST_GID" /repo/packages /repo/apps /repo/services /repo/package.json /repo/package-lock.json; exit $rc'

