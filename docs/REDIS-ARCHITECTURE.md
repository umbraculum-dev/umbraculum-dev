# Redis architecture (sessions + rendering queue)

## Scope (current implementation)

- **Sessions**: Redis is a cache / acceleration layer. Postgres remains
  the source of truth (`public.sessions`). If Redis is unavailable or
  missing a key, the API falls back to Postgres.
- **Rendering jobs**: Redis is the BullMQ queue transport. Postgres remains
  the durable source of truth (`rendering.render_jobs`,
  `rendering.render_job_attempts`, `rendering.render_artifacts`).
- Redis outage behavior differs by surface: authenticated requests can keep
  working through the session DB fallback, but async rendering submit returns
  `render_queue_unavailable` because BullMQ needs Redis to enqueue work.

## Compose wiring (local dev)

- Service: `redis` (`redis:7`)
- Data: persisted via named volume `redisdata` mounted at `/data`
- API env: `REDIS_URL=redis://redis:6379/0`
- Rendering queue name: `rendering.jobs`

## Session read/write flow

- **Read** (every request with cookie `sid` or bearer token):
  - try `GET session:<id>` in Redis
  - if missing/invalid: read from Postgres
  - if found in Postgres and not expired: write-through to Redis with TTL derived from `expiresAt`
- **Write** (login/signup/native login/webview bridge mint):
  - create session row in Postgres
  - best-effort `SET session:<id>` in Redis with TTL
- **Logout / expired cleanup**:
  - best-effort `DEL session:<id>` in Redis
  - delete from Postgres (best-effort for expiry cleanup paths)

## Rendering job flow

- **Submit** (`POST /rendering/jobs` with `persist-to-media` delivery):
  - validate the registered template and payload
  - create a `rendering.render_jobs` row with status `queued`
  - enqueue a BullMQ job in Redis
- **Worker**:
  - claims jobs from BullMQ
  - writes `rendering.render_job_attempts`
  - transitions the durable job row through `running` → `succeeded` / `failed`
  - stores v1 artifacts in `rendering.render_artifacts`
- **Status / retrieval**:
  - status routes read Postgres only
  - signed artifact retrieval reads Postgres and does not depend on Redis once
    the artifact exists

## Persistence (snapshots / restart resilience)

- Redis persistence is enabled via the `/data` volume.
- Redis defaults to **RDB snapshots** (point-in-time). After a restart/crash,
  some recent cache writes may be lost.
- This is acceptable for sessions because **DB fallback repopulates** missing
  cache entries.
- For rendering, Postgres still records durable job state. A queued Redis job
  lost before a worker starts may require a future reconciliation/requeue pass;
  PR3 keeps the state model explicit so that recovery logic can be added
  without changing the HTTP contract.
- If you ever move to “Redis is the primary session store” or need stronger
  queue durability, consider enabling **AOF** and choosing an `appendfsync`
  policy (commonly `everysec`).

## Verification (local)

From repo root:

- `cd ~/dkprojects/rfapps/umbraculum-dev`
- Redis up: `docker compose ps redis`
- Smoke test from API container:
  - `docker compose exec -T api node --input-type=module -e "import { createClient } from 'redis'; const c=createClient({url:process.env.REDIS_URL}); await c.connect(); await c.set('brewery:smoke','ok',{EX:30}); console.log(await c.get('brewery:smoke')); await c.quit();"`
- BullMQ coexistence smoke (queue create / close only):
  - `docker compose exec -T api node --input-type=module -e "import { Queue } from 'bullmq'; const q=new Queue('rendering.smoke',{connection:{host:'redis',port:6379,db:0}}); await q.add('smoke',{ok:true},{removeOnComplete:true}); console.log('queued'); await q.close();"`
- Restart resilience:
  - `docker compose restart redis`
  - verify authenticated flows still work (DB fallback) and cache warms again with traffic

## Rollback

- Set `REDIS_URL` empty/undefined in `docker-compose.yml` for `api` (or in your environment), then **recreate** the API container:
  - `docker compose up -d --force-recreate api`
- With `REDIS_URL` unset, the API operates **DB-only** for sessions.
  Async rendering submit is unavailable and returns `render_queue_unavailable`.

