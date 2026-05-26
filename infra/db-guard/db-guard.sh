#!/usr/bin/env bash
set -euo pipefail

PGPOOL_HOST="${PGPOOL_HOST:-pgpool}"
PGPOOL_PORT="${PGPOOL_PORT:-5432}"
PCP_PORT="${PCP_PORT:-9898}"
PCP_USER="${PCP_USER:-pgpooladmin}"
PCP_PASSWORD="${PCP_PASSWORD:-pgpooladmin}"
PCP_NODE_REPLICA_ID="${PCP_NODE_REPLICA_ID:-1}"

PRIMARY_HOST="${PRIMARY_HOST:-postgres}"
PRIMARY_PORT="${PRIMARY_PORT:-5432}"
PRIMARY_USER="${PRIMARY_USER:-postgres}"
PRIMARY_PASSWORD="${PRIMARY_PASSWORD:-postgres}"
PRIMARY_DB="${PRIMARY_DB:-postgres}"

SYNC_STANDBY_NAME="${SYNC_STANDBY_NAME:-walreceiver}"
REPLAY_LAG_MAX_MS="${REPLAY_LAG_MAX_MS:-1000}"
CHECK_INTERVAL_SECONDS="${CHECK_INTERVAL_SECONDS:-5}"

export PATH="/opt/bitnami/postgresql/bin:/opt/bitnami/pgpool/bin:${PATH}"

HOME_DIR="${HOME:-/tmp}"
HOME_DIR="/tmp"
mkdir -p "${HOME_DIR}"

PCPPASS_FILE="${HOME_DIR}/.pcppass"
printf '%s:%s:%s:%s\n' "${PGPOOL_HOST}" "${PCP_PORT}" "${PCP_USER}" "${PCP_PASSWORD}" >"${PCPPASS_FILE}"
chmod 0600 "${PCPPASS_FILE}"
export HOME="${HOME_DIR}"

export PGPASSWORD="${PRIMARY_PASSWORD}"

psql_primary() {
  psql -h "${PRIMARY_HOST}" -p "${PRIMARY_PORT}" -U "${PRIMARY_USER}" -d "${PRIMARY_DB}" -At -c "$1"
}

psql_pgpool() {
  PGPASSWORD="${PRIMARY_PASSWORD}" psql -h "${PGPOOL_HOST}" -p "${PGPOOL_PORT}" -U "${PRIMARY_USER}" -d "${PRIMARY_DB}" -At -c "$1"
}

detach_replica() {
  pcp_detach_node -h "${PGPOOL_HOST}" -p "${PCP_PORT}" -U "${PCP_USER}" -w "${PCP_NODE_REPLICA_ID}" >/dev/null 2>&1 || true
}

attach_replica() {
  pcp_attach_node -h "${PGPOOL_HOST}" -p "${PCP_PORT}" -U "${PCP_USER}" -w "${PCP_NODE_REPLICA_ID}" >/dev/null 2>&1 || true
}

set_sync_on() {
  local standby
  standby="$(psql_primary "SELECT application_name FROM pg_stat_replication WHERE state = 'streaming' ORDER BY COALESCE(replay_lag, interval '0') ASC LIMIT 1;" | head -n 1 || true)"
  standby="${standby:-${SYNC_STANDBY_NAME}}"

  psql_primary "ALTER SYSTEM SET synchronous_commit = 'remote_apply';" >/dev/null
  psql_primary "ALTER SYSTEM SET synchronous_standby_names = 'FIRST 1 (${standby})';" >/dev/null
  psql_primary "SELECT pg_reload_conf();" >/dev/null
}

set_sync_off() {
  psql_primary "ALTER SYSTEM SET synchronous_standby_names = '';" >/dev/null
  psql_primary "SELECT pg_reload_conf();" >/dev/null
}

is_replica_healthy() {
  local row
  row="$(psql_primary "SELECT state, COALESCE(EXTRACT(EPOCH FROM replay_lag) * 1000, 0)::bigint FROM pg_stat_replication LIMIT 1;")" || return 1
  local state lag_ms
  state="$(printf '%s' "$row" | cut -d'|' -f1)"
  lag_ms="$(printf '%s' "$row" | cut -d'|' -f2)"

  if [ "$state" != "streaming" ]; then
    return 1
  fi
  if [ "$lag_ms" -gt "$REPLAY_LAG_MAX_MS" ]; then
    return 1
  fi
  return 0
}

replica_node_is_up_in_pgpool() {
  # show pool_nodes returns a row per node; 5th column is status (up/down).
  # We'll treat anything other than 'up' as not usable.
  local row status
  row="$(psql_pgpool "show pool_nodes;" | awk -F'|' -v id="$PCP_NODE_REPLICA_ID" '$1==id {print $0}' 2>/dev/null || true)"
  status="$(printf '%s' "$row" | awk -F'|' '{print $4}' 2>/dev/null || true)"
  [ "$status" = "up" ]
}

echo "[db-guard] starting: lag_max_ms=${REPLAY_LAG_MAX_MS} interval_s=${CHECK_INTERVAL_SECONDS}"

mode="unknown"

while true; do
  if is_replica_healthy; then
    if [ "${mode}" != "sync_on" ]; then
      echo "[db-guard] replica healthy; enabling sync replication and attaching replica to pgpool"
      set_sync_on || true
      attach_replica
      mode="sync_on"
    fi
  else
    if [ "${mode}" != "sync_off" ]; then
      echo "[db-guard] replica unhealthy/lagging; disabling sync requirement and detaching replica from pgpool"
      set_sync_off || true
      detach_replica
      mode="sync_off"
    fi
  fi
  sleep "${CHECK_INTERVAL_SECONDS}"
done

