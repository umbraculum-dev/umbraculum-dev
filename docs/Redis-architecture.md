# Redis architecture (sessions)

## Scope (current implementation)

- **Redis is a cache / acceleration layer** for sessions.
- **Postgres remains the source of truth** for sessions (Prisma `session` table).
- If Redis is unavailable or missing a key, the API falls back to Postgres.

## Compose wiring (local dev)

- Service: `redis` (`redis:7`)
- Data: persisted via named volume `redisdata` mounted at `/data`
- API env: `REDIS_URL=redis://redis:6379/0`

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

## Persistence (snapshots / restart resilience)

- Redis persistence is enabled via the `/data` volume.
- Redis defaults to **RDB snapshots** (point-in-time). After a restart/crash, some recent cache writes may be lost.
- This is acceptable in the current design because **DB fallback repopulates** missing cache entries.
- If you ever move to “Redis is the primary session store”, consider enabling **AOF** and choosing an `appendfsync` policy (commonly `everysec`).

## Verification (local)

From repo root:

- `cd /home/rf/dkprojects/rfapps/brewery-app`
- Redis up: `docker compose ps redis`
- Smoke test from API container:
  - `docker compose exec -T api node --input-type=module -e "import { createClient } from 'redis'; const c=createClient({url:process.env.REDIS_URL}); await c.connect(); await c.set('brewery:smoke','ok',{EX:30}); console.log(await c.get('brewery:smoke')); await c.quit();"`
- Restart resilience:
  - `docker compose restart redis`
  - verify authenticated flows still work (DB fallback) and cache warms again with traffic

## Rollback

- Set `REDIS_URL` empty/undefined in `docker-compose.yml` for `api` (or in your environment), then **recreate** the API container:
  - `docker compose up -d --force-recreate api`
- With `REDIS_URL` unset, the API operates **DB-only** for sessions.

