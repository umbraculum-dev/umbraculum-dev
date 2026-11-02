#!/usr/bin/env bash
# Generate runtime secrets then exec pgpool in foreground.
set -euo pipefail

export PATH="/usr/sbin:/usr/bin:/sbin:/bin"

CONF_DIR="${PGPOOL_CONF_DIR:-/etc/pgpool2}"
RUN_DIR="${PGPOOL_RUN_DIR:-/var/run/pgpool}"
LOG_DIR="${PGPOOL_LOG_DIR:-/var/log/postgresql}"
PG_HOME="${PGPOOL_HOME:-/var/lib/postgresql}"
PG_USER="${PGPOOL_POSTGRES_USERNAME:-postgres}"
PG_PASS="${PGPOOL_POSTGRES_PASSWORD:-postgres}"
PCP_USER="${PGPOOL_ADMIN_USERNAME:-pgpooladmin}"
PCP_PASS="${PGPOOL_ADMIN_PASSWORD:-pgpooladmin}"
# Local-dev encryption key for AES pool_passwd (SCRAM backends). Not a prod secret.
ENC_KEY="${PGPOOL_ENC_KEY:-umbraculum-local-pgpool-key}"

mkdir -p "${RUN_DIR}" "${CONF_DIR}" "${LOG_DIR}" "${PG_HOME}"
chmod 0755 "${RUN_DIR}" "${LOG_DIR}"

if [ -f /config/pgpool.conf ]; then
  cp /config/pgpool.conf "${CONF_DIR}/pgpool.conf"
fi
if [ -f /config/pool_hba.conf ]; then
  cp /config/pool_hba.conf "${CONF_DIR}/pool_hba.conf"
fi

POOL_PASSWD="${CONF_DIR}/pool_passwd"
sed -i "s|^pool_passwd = .*|pool_passwd = '${POOL_PASSWD}'|" "${CONF_DIR}/pgpool.conf"
: >"${POOL_PASSWD}"

KEY_FILE="${PG_HOME}/.pgpoolkey"
printf '%s\n' "${ENC_KEY}" >"${KEY_FILE}"
chmod 0600 "${KEY_FILE}"
export PGPOOLKEYFILE="${KEY_FILE}"
export HOME="${PG_HOME}"

# AES entry for SCRAM backends (Postgres 16 default password_encryption).
pg_enc -f "${CONF_DIR}/pgpool.conf" -K "${ENC_KEY}" -u "${PG_USER}" -m "${PG_PASS}"
chmod 0600 "${POOL_PASSWD}"

PCP_CONF="${CONF_DIR}/pcp.conf"
PCP_MD5="$(printf '%s' "${PCP_PASS}" | md5sum | awk '{print $1}')"
printf '%s:%s\n' "${PCP_USER}" "${PCP_MD5}" >"${PCP_CONF}"
chmod 0600 "${PCP_CONF}"

echo "[pgpool] starting (conf=${CONF_DIR}/pgpool.conf)"
exec pgpool -n -f "${CONF_DIR}/pgpool.conf" -F "${PCP_CONF}" -a "${CONF_DIR}/pool_hba.conf"
