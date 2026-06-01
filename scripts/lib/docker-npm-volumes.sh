#!/usr/bin/env bash
# Shared Docker named-volume mounts for npm installs (Linux + Docker Desktop macOS).
#
# Named volumes (not host bind mounts) keep install trees and the npm cache outside
# the git bind mount — Composer-vendor-like persistence without OS-specific paths.
#
# Canonical doc: docs/DEVELOPMENT-NPM-VOLUMES.md

# shellcheck disable=SC2034
readonly UMBRACULUM_NPM_CACHE_VOLUME="${UMBRACULUM_NPM_CACHE_VOLUME:-umbraculum_npm_cache}"
# shellcheck disable=SC2034
readonly UMBRACULUM_ROOT_NODE_MODULES_VOLUME="${UMBRACULUM_ROOT_NODE_MODULES_VOLUME:-umbraculum_root_node_modules}"
# shellcheck disable=SC2034
readonly UMBRACULUM_API_NODE_MODULES_VOLUME="${UMBRACULUM_API_NODE_MODULES_VOLUME:-umbraculum_api_node_modules}"

# Legacy name from pre-rename build script — same role as umbraculum_root_node_modules.
readonly UMBRACULUM_ROOT_NODE_MODULES_VOLUME_LEGACY="brewery_app_root_node_modules"

# Arrays for `docker run` / compose-compatible `-v name:path` pairs.
DOCKER_NPM_CACHE_MOUNT=(-v "${UMBRACULUM_NPM_CACHE_VOLUME}:/root/.npm")
DOCKER_NPM_ROOT_NODE_MODULES_MOUNT=(-v "${UMBRACULUM_ROOT_NODE_MODULES_VOLUME}:/repo/node_modules")
DOCKER_NPM_API_NODE_MODULES_MOUNT=(-v "${UMBRACULUM_API_NODE_MODULES_VOLUME}:/app/node_modules")

# Default npm install flags for warm-cache dev loops (safe when cache is cold).
readonly UMBRACULUM_NPM_INSTALL_FLAGS="${UMBRACULUM_NPM_INSTALL_FLAGS:---no-audit --no-fund --prefer-offline}"
