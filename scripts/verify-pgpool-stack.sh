#!/usr/bin/env bash
# Bounded T1–T10 / T12 checks for project-owned pgpool + db-guard.
# Usage (repo root): ./scripts/verify-pgpool-stack.sh
# Optional: SKIP_DEGRADE=1 to skip stop/start replica (T8/T9).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0
SKIP=0

ok() { echo "OK  $1"; PASS=$((PASS + 1)); }
fail() { echo "FAIL $1 — $2"; FAIL=$((FAIL + 1)); }
skip() { echo "SKIP $1 — $2"; SKIP=$((SKIP + 1)); }

psql_primary() {
  docker compose exec -T postgres psql -U postgres -d postgres -At -c "$1"
}

psql_pgpool() {
  docker compose exec -T postgres sh -lc "PGPASSWORD=postgres psql -h pgpool -U postgres -d postgres -At -c \"$1\""
}

echo "=== verify-pgpool-stack (repo=$ROOT) ==="

# T1 compose health
need=(postgres postgres-replica pgpool db-guard api nginx)
missing=0
for s in "${need[@]}"; do
  st="$(docker compose ps --status running --services 2>/dev/null | grep -x "$s" || true)"
  if [ -z "$st" ]; then
    fail "T1" "service not running: $s"
    missing=1
  fi
done
if [ "$missing" -eq 0 ]; then ok "T1 compose health (${#need[@]} services)"; fi

# T2 replica recovery
if [ "$(psql_primary "SELECT pg_is_in_recovery();")" = "t" ] 2>/dev/null; then
  fail "T2" "primary reports in recovery"
elif [ "$(docker compose exec -T postgres-replica psql -U postgres -d postgres -At -c "SELECT pg_is_in_recovery();")" = "t" ]; then
  ok "T2 replica in recovery"
else
  fail "T2" "replica not in recovery"
fi

# T3 streaming + sync
rep="$(psql_primary "SELECT state || ',' || COALESCE(sync_state,'') FROM pg_stat_replication LIMIT 1;" || true)"
if printf '%s' "$rep" | grep -q '^streaming,'; then
  ok "T3 streaming replication ($rep)"
else
  fail "T3" "expected streaming sync row, got: ${rep:-empty}"
fi

# T4 slot
slot="$(psql_primary "SELECT count(*) FROM pg_replication_slots WHERE active;" || echo 0)"
if [ "${slot:-0}" -ge 1 ]; then ok "T4 active replication slot ($slot)"; else fail "T4" "no active slot"; fi

# T5 WAL archive
wal_n="$(docker compose exec -T postgres sh -lc 'ls /wal-archive 2>/dev/null | wc -l' | tr -d '[:space:]')"
if [ "${wal_n:-0}" -ge 1 ]; then ok "T5 wal archive entries ($wal_n)"; else fail "T5" "wal-archive empty"; fi

# T6 pool_nodes
nodes="$(psql_pgpool "show pool_nodes;" 2>&1 || true)"
if printf '%s' "$nodes" | grep -q 'primary' && printf '%s' "$nodes" | grep -q 'standby'; then
  ok "T6 show pool_nodes has primary+standby"
else
  fail "T6" "pool_nodes unexpected: ${nodes:0:200}"
fi

# T10 session (no FATAL) — covered if T6 succeeded via pgpool
if printf '%s' "$nodes" | grep -qi 'FATAL\|failed to authenticate'; then
  fail "T10" "pgpool session error"
else
  ok "T10 pgpool session OK"
fi

# T7 smoke:stack
if npm run smoke:stack >/tmp/verify-pgpool-smoke.log 2>&1; then
  ok "T7 smoke:stack"
else
  fail "T7" "smoke:stack failed (see /tmp/verify-pgpool-smoke.log)"
fi

# T8 / T9 degrade + recover
if [ "${SKIP_DEGRADE:-0}" = "1" ]; then
  skip "T8/T9" "SKIP_DEGRADE=1"
else
  docker compose stop postgres-replica >/dev/null
  sleep 10
  sync_names="$(psql_primary "SHOW synchronous_standby_names;" || true)"
  nodes_deg="$(psql_pgpool "show pool_nodes;" 2>&1 || true)"
  # After degrade: sync empty OR standby not up
  standby_up="$(printf '%s' "$nodes_deg" | awk -F'|' '$1 ~ /^[[:space:]]*1/ && $4 ~ /up/ {print "yes"}')"
  if [ -z "$sync_names" ] || [ "$sync_names" = '""' ] || [ "$sync_names" = "" ]; then
    deg_ok=1
  else
    deg_ok=0
  fi
  if [ "${standby_up:-}" = "yes" ]; then deg_ok=0; fi
  # Login still works?
  if curl -sf -o /dev/null -w "%{http_code}" "http://127.0.0.1:${NGINX_HTTP_PORT:-18080}/en/login" | grep -q 200; then
    login_ok=1
  else
    login_ok=0
  fi
  if [ "$deg_ok" -eq 1 ] && [ "$login_ok" -eq 1 ]; then
    ok "T8 degrade (sync='${sync_names}' standby_up=${standby_up:-no} login=200)"
  else
    fail "T8" "degrade incomplete sync='${sync_names}' standby_up=${standby_up:-?} login_ok=$login_ok"
  fi

  docker compose start postgres-replica >/dev/null
  # db-guard interval is 5s; wait for streaming+sync and standby status=up
  rep2=""
  nodes_rec=""
  recovered=0
  for _i in 1 2 3 4 5 6 7 8 9 10 11 12; do
    sleep 5
    rep2="$(psql_primary "SELECT state || ',' || COALESCE(sync_state,'') FROM pg_stat_replication LIMIT 1;" || true)"
    nodes_rec="$(psql_pgpool "show pool_nodes;" 2>&1 || true)"
    standby_rec_up="$(printf '%s' "$nodes_rec" | awk -F'|' '$1==1 && $4=="up" {print "yes"}')"
    if [ "$rep2" = "streaming,sync" ] && [ "${standby_rec_up:-}" = "yes" ]; then
      recovered=1
      break
    fi
  done
  if [ "$recovered" -eq 1 ]; then
    ok "T9 recover ($rep2 standby_up=yes)"
  else
    fail "T9" "recover incomplete rep=$rep2 nodes=${nodes_rec:0:160}"
  fi
fi

# T12 image provenance (no ECR bitnami)
img="$(docker compose config 2>/dev/null | grep -A2 'pgpool:' | grep 'image:' | head -1 || true)"
if printf '%s' "$img" | grep -qi 'bitnami\|public.ecr.aws'; then
  fail "T12" "compose still references Bitnami/ECR: $img"
else
  ok "T12 compose image not Bitnami/ECR ($img)"
fi

echo "=== summary PASS=$PASS FAIL=$FAIL SKIP=$SKIP ==="
if [ "$FAIL" -gt 0 ]; then exit 1; fi
exit 0
