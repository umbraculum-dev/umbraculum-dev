#!/usr/bin/env bash
set -euo pipefail

mkdir -p /wal-archive
chown -R postgres:postgres /wal-archive

exec docker-entrypoint.sh postgres "$@"

