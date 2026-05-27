# Postgres primary/replica + pgpool routing architecture

Repo root (canonical): `$REPO_ROOT`

This doc describes the **production-like** DB foundation implemented in Docker Compose:

- Postgres primary + hot-standby replica (streaming replication)
- WAL archiving (durability / catch-up without re-seeding)
- Replication slot (prevents WAL recycling while standby is behind)
- pgpool-II as a **single `DATABASE_URL`** entrypoint with conservative read-splitting
- `db-guard` auto-degrade to primary-only when replica is unhealthy/lagging
- Prisma migrations pinned to primary via `directUrl` (`DATABASE_URL_DIRECT`)

## Current implementation (repo)

### Services

- `postgres` (primary, read/write)
- `postgres-replica` (standby, read-only)
- `pgpool` (DB proxy; clients connect here)
- `db-guard` (health/lag guard; toggles routing + sync requirement)

See `$REPO_ROOT/docker-compose.yml`.

### pgvector image (why not stock `postgres:16`)

Post-α H2 **AI consultant RAG (Layer C D1)** stores embeddings in `ai.doc_chunks` using the Postgres **`vector`** extension (pgvector). Stock `postgres:16` images do not include that extension; migrations and init SQL are written to apply only when `pg_available_extensions` lists `vector`.

- **Dev compose + CI** use `pgvector/pgvector:pg16` for `postgres` and `postgres-replica` — same major version as before, with pgvector prebuilt.
- **First boot** on an empty volume: `infra/postgres/init/03-ai-pgvector.sql` creates the extension and `ai` schema objects.
- **Existing dev volumes:** swapping the image and running `prisma migrate deploy` applies `20260527120200_ai_pgvector_rag_schema` without wiping `brewapp` data (`docker compose up -d --force-recreate` keeps `pgdata` / `pgdata_replica` volumes).
- **Runtime contract:** operational tables stay in existing schemas; vectors are isolated in `ai.doc_chunks` (see [`docs/design/canonical-ai-rag-surface.md`](design/canonical-ai-rag-surface.md)).

Do **not** use `docker compose down -v` or `prisma migrate reset` on `brewapp` when upgrading — those destroy dev data.

**Collation version after image swap:** if the new Postgres image ships a different glibc/ICU collation version than the volume was created with, Postgres emits a `collation version mismatch` **NOTICE** on connect. **pgpool-II treats that notice as fatal** during session setup (`FATAL: unable to get session context`), which breaks login and any `DATABASE_URL` routed through pgpool. Fix (dev, preserves data):

```bash
docker compose exec -T postgres psql -U postgres -d postgres -c \
  "ALTER DATABASE brewapp REFRESH COLLATION VERSION;
   ALTER DATABASE brewapp_test REFRESH COLLATION VERSION;
   ALTER DATABASE postgres REFRESH COLLATION VERSION;"
docker compose restart pgpool api
```

### pgpool image source (why not Docker Hub `bitnami/pgpool`)

- Docker Hub `bitnami/pgpool` is listed as “active”, but in this environment it had **no pullable tags** (attempts to pull `bitnami/pgpool:latest` / `bitnami/pgpool:4.x` returned `manifest unknown`).
- We therefore use the maintained Bitnami image from AWS Public ECR:
  - `public.ecr.aws/bitnami/pgpool:4.6.3`

### Connection strings

- Runtime (Prisma / app): `DATABASE_URL=postgresql://postgres:postgres@pgpool:5432/brewapp`
- Migrations/admin tooling: `DATABASE_URL_DIRECT=postgresql://postgres:postgres@postgres:5432/brewapp`

Prisma datasource uses both:

- `services/api/prisma/schema.prisma` has `url = env("DATABASE_URL")` and `directUrl = env("DATABASE_URL_DIRECT")`.

## Replication (Postgres layer)

### Streaming replication

- The primary continuously emits WAL.
- The standby continuously receives and replays WAL.

### Replication slot

- Slot name: `replica1` (standby sets `primary_slot_name`).
- Benefit: primary retains WAL the standby still needs.
- Safety: `max_slot_wal_keep_size` is configured to avoid unbounded disk growth.

### WAL archiving (durability / catch-up)

- Primary archives WAL segments to `/wal-archive` (named volume `wal_archive`).
- Standby has `restore_command` to copy missing WAL from `/wal-archive` if it falls behind streaming.

**Production note**:

- In production, `/wal-archive` must be a **durable** location:
  - disk/NFS volume (good first step), or
  - S3-compatible object storage (future switch).
- Switching to S3 later typically means changing `archive_command`/`restore_command` tooling, without changing the app.

## Routing (pgpool-II layer)

pgpool-II provides a **single DB endpoint** and routes:

- Writes → primary
- Eligible reads → replica (load balancing enabled)

“Mostly-safe” defaults in this repo:

- `PGPOOL_DISABLE_LOAD_BALANCE_ON_WRITE=transaction` (reduces surprise read routing after a write inside a transaction)
- `black_function_list` includes sequence + advisory-lock functions (treat them as “writes” and route to primary)

pgpool config lives under:

- `infra/pgpool/pgpool-extra.conf`
- `infra/pgpool/pool_hba.conf`

## Sync replication + auto-degrade (`db-guard`)

### Normal mode (healthy replica)

`db-guard` enforces:

- `synchronous_commit=remote_apply`
- `synchronous_standby_names='FIRST 1 (<standby_application_name>)'`
- pgpool standby is attached/eligible for reads

This supports “single URL” read-splitting with strong read-after-write behavior.

### Degrade mode (replica unhealthy or lagging)

If the replica is down or exceeds the configured lag threshold, `db-guard` enforces:

- `synchronous_standby_names=''` (writes won’t block)
- standby is detached from pgpool (primary-only routing)

Replica continues catching up via streaming + archive restore, and will be re-attached once healthy.

`db-guard` code:

- `infra/db-guard/db-guard.sh`

## Verification

Use the runbook(s):

- `docs/PGPOOL-VERIFICATION.md`
- `docs/DB-REPLICATION-AND-ROUTING-VERIFICATION.md`

