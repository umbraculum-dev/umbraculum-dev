# DB replication + pgpool routing verification (runbook)

Repo root (canonical): `~/dkprojects/rfapps/umbraculum-dev`

## Prerequisites

- Stack is up:
  - `cd ~/dkprojects/rfapps/umbraculum-dev`
  - `docker compose ps`
- Services expected: `postgres`, `postgres-replica`, `pgpool`, `db-guard`, `api`

## Commands

### 1) Replication health (primary + replica)

- Replica is a standby:
  - `docker compose exec -T postgres-replica psql -U postgres -d postgres -c "SELECT pg_is_in_recovery() AS is_replica;"`
  - Expect: `t`

- Primary sees a streaming standby:
  - `docker compose exec -T postgres psql -U postgres -d postgres -c "SELECT application_name, state, sync_state, replay_lag FROM pg_stat_replication;"`
  - Expect at least one row with `state=streaming`

- Replication slot exists (prevents WAL recycling while standby is behind):
  - `docker compose exec -T postgres psql -U postgres -d postgres -c "SELECT slot_name, slot_type, active, restart_lsn FROM pg_replication_slots;"`
  - Expect: `replica1` (or your configured slot name), `slot_type=physical`

### 2) WAL archive (catch-up beyond streaming)

- Confirm WAL segments are being archived by the primary:
  - `docker compose exec -T postgres sh -lc "ls -la /wal-archive | head"`
  - Expect: files like `000000010000....`

### 3) pgpool node status (read-splitting eligibility)

- From the primary container (psql client available), query pgpool:
  - `docker compose exec -T postgres sh -lc 'PGPASSWORD=postgres psql -h pgpool -p 5432 -U postgres -d postgres -c \"show pool_nodes;\"'`
  - Expect:
    - node 0 role `primary`
    - node 1 role `standby`
    - `load_balance_node` is `true` for the standby when healthy

### 4) Sync + auto-degrade mode (db-guard)

- Check current sync settings (primary):
  - `docker compose exec -T postgres psql -U postgres -d postgres -c "SHOW synchronous_commit;"`
  - `docker compose exec -T postgres psql -U postgres -d postgres -c "SHOW synchronous_standby_names;"`

- Watch db-guard for mode transitions:
  - `docker compose logs -f db-guard`

**Manual simulation (optional, disruptive):**
- Stop replica and confirm degrade:
  - `docker compose stop postgres-replica`
  - Expect db-guard logs: “detaching replica” and `synchronous_standby_names` becomes empty.
- Start replica and confirm recovery:
  - `docker compose up -d postgres-replica`
  - Expect db-guard logs: “attaching replica” and `synchronous_standby_names` becomes non-empty.

## Stop conditions

- Replica is `streaming` again and (when healthy) `sync_state=sync`.
- `show pool_nodes;` shows standby node `up` and eligible for load balancing.
- WAL archive is receiving segments and replication slot exists.

