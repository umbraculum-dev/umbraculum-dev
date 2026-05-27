# Pgpool-II + sync replication verification (local + production-like)

This doc verifies the DB routing foundation:

- pgpool-II is the **single DB entrypoint** (app uses one `DATABASE_URL`).
- Postgres primary/replica streaming replication is healthy.
- Replication slot + WAL archive are working (replica can catch up without re-seeding).
- The `db-guard` auto-degrades to **primary-only** when replica is unhealthy/lagging.
- Auth/session and read-after-write flows remain correct.

Set `REPO_ROOT` to your clone (see [`DEVELOPMENT.md`](../DEVELOPMENT.md)), then:

- `cd $REPO_ROOT`

## 1) Service health (compose)

```bash
cd $REPO_ROOT
docker compose ps postgres postgres-replica pgpool db-guard api nginx web
```

## 2) Postgres replication health (primary + replica)

Replica is a hot standby:

```bash
cd $REPO_ROOT
docker compose exec -T postgres-replica psql -U postgres -d postgres -c "SELECT pg_is_in_recovery() AS is_replica;"
```

Primary sees a streaming standby, and (when healthy) it should be `sync_state=sync`:

```bash
cd $REPO_ROOT
docker compose exec -T postgres psql -U postgres -d postgres -c "SELECT application_name, state, sync_state FROM pg_stat_replication;"
```

## 3) Replication slot (durability)

Confirm the physical slot exists and is active:

```bash
cd $REPO_ROOT
docker compose exec -T postgres psql -U postgres -d postgres -c "SELECT slot_name, slot_type, active FROM pg_replication_slots;"
```

## 4) WAL archiving (durability)

Confirm WAL segments are being archived:

```bash
cd $REPO_ROOT
docker compose exec -T postgres sh -lc "ls -la /wal-archive | head"
```

Notes:

- Current implementation archives to a **docker volume** (`wal_archive`) mounted at `/wal-archive`.
- Production can use a durable disk/NFS path first, and later switch `archive_command` to object storage tooling (S3-compatible) without changing the app.

## 5) Pgpool node state + read routing

From the primary container, query pgpool:

```bash
cd $REPO_ROOT
docker compose exec -T postgres sh -lc "PGPASSWORD=postgres psql -h pgpool -U postgres -d postgres -c \"show pool_nodes;\""
```

What to look for:

- Node `postgres` is `primary`.
- Node `postgres-replica` is `standby`.
- When both nodes are healthy, pgpool will choose a `load_balance_node` (may be primary or standby depending on health/lag).

## 6) Auto-degrade behavior (`db-guard`)

The guard toggles:

- Postgres sync requirement (`synchronous_standby_names`)
- pgpool replica eligibility (PCP attach/detach)

### 6.1 Confirm guard is running

```bash
cd $REPO_ROOT
docker compose logs --tail=120 db-guard
```

### 6.2 Degrade test (stop replica briefly)

Stop replica and wait a few seconds (guard interval):

```bash
cd $REPO_ROOT
docker compose stop postgres-replica
sleep 8
docker compose exec -T postgres psql -U postgres -d postgres -c "SHOW synchronous_standby_names;"
docker compose exec -T postgres sh -lc "PGPASSWORD=postgres psql -h pgpool -U postgres -d postgres -c \"show pool_nodes;\""
```

Expected:

- `synchronous_standby_names` becomes empty (writes won’t block).
- pgpool marks replica backend as down/unusable.

## Pgpool image source note

- Docker Hub `bitnami/pgpool` did not have pullable tags in this environment.
- We use the maintained Bitnami image from AWS Public ECR:
  - `public.ecr.aws/bitnami/pgpool:4.6.3`

Restart replica and wait:

```bash
cd $REPO_ROOT
docker compose up -d postgres-replica
sleep 12
docker compose exec -T postgres psql -U postgres -d postgres -c "SHOW synchronous_standby_names;"
docker compose exec -T postgres psql -U postgres -d postgres -c "SELECT application_name, state, sync_state FROM pg_stat_replication;"
docker compose exec -T postgres sh -lc "PGPASSWORD=postgres psql -h pgpool -U postgres -d postgres -c \"show pool_nodes;\""
```

Expected:

- `synchronous_standby_names` is restored (sync enabled).
- Replica returns to `state=streaming`, `sync_state=sync`.
- pgpool sees the standby as up again.

## 7) Auth/session + read-after-write checks (manual)

Because auth uses httpOnly cookies, the simplest check is via browser:

- Log in via `http://localhost:${NGINX_HTTP_PORT:-18080}/en/login` (or your configured port)
- Confirm normal navigation works.

Then run the degrade test (Section 6.2) while staying on a protected page:

- Expected: you should **not** see transient logout/401 behavior during replica downtime (guard routes everything to primary and removes sync requirement).

If you prefer curl (placeholders):

```bash
cd $REPO_ROOT
COOKIE_JAR="$(mktemp)"

# Login (replace placeholders)
curl -sS -c "$COOKIE_JAR" -H "Content-Type: application/json" \
  -d '{"email":"<EMAIL>","password":"<PASSWORD>","preferredLocale":"en"}' \
  "http://localhost:${NGINX_HTTP_PORT:-18080}/api/auth/login" >/dev/null

# Immediate read-after-write check
curl -sS -b "$COOKIE_JAR" "http://localhost:${NGINX_HTTP_PORT:-18080}/api/auth/me" | head
```

