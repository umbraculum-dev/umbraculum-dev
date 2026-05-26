#!/usr/bin/env bash
set -euo pipefail

export PGDATA="${PGDATA:-/var/lib/postgresql/data}"
SLOT_NAME="${REPLICATION_SLOT_NAME:-replica1}"

ensure_conf_setting() {
  local key="$1"
  local value="$2"
  local file="${PGDATA}/postgresql.auto.conf"

  touch "$file"
  if grep -Eq "^[[:space:]]*${key}[[:space:]]*=" "$file"; then
    return 0
  fi

  echo "${key} = '${value}'" >>"$file"
}

if [ ! -s "${PGDATA}/PG_VERSION" ]; then
  echo "[replica] data dir empty; waiting for primary..."

  export PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"
  until pg_isready -h postgres -U postgres >/dev/null 2>&1; do
    sleep 1
  done

  echo "[replica] taking base backup from primary..."
  rm -rf "${PGDATA:?}/"*
  pg_basebackup -h postgres -U postgres -D "${PGDATA}" -Fp -Xs -P -R
  echo "[replica] base backup complete"
fi

ensure_conf_setting "primary_slot_name" "${SLOT_NAME}"
ensure_conf_setting "restore_command" "cp /wal-archive/%f %p"

exec postgres

