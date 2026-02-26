#!/usr/bin/env sh
set -eu

HBA_FILE="/var/lib/postgresql/data/pg_hba.conf"

if [ ! -f "$HBA_FILE" ]; then
  echo "[init] pg_hba.conf not found at $HBA_FILE"
  exit 0
fi

# Make sure streaming replication from other compose services can authenticate.
# (This only runs on first init of the primary volume.)
if ! grep -Fq "host replication all all scram-sha-256" "$HBA_FILE"; then
  {
    echo ""
    echo "# Allow streaming replication from docker network"
    echo "host replication all all scram-sha-256"
  } >> "$HBA_FILE"
fi

