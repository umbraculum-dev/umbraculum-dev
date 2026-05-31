#!/usr/bin/env bash
# Thin wrapper — renders packaging/ubuntu-touch/umbraculum-reference/umbraculum.desktop
# from umbraculum.desktop.in. Pass through UMBRACULUM_WEB_* env vars (see package README).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec "${REPO_ROOT}/packaging/ubuntu-touch/umbraculum-reference/scripts/render-desktop.sh" "$@"
