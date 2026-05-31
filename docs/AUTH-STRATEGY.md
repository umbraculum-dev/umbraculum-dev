# Auth strategy (web + native)

This document describes how authentication works for the web app and native (React Native) apps.

## Web: cookie-based sessions

- **Login**: `POST /auth/login` with `email`, `password`, `preferredLocale`
- **Response**: API sets an httpOnly `sid` cookie and returns `{ ok, user, accounts, activeAccountId }`
- **Subsequent requests**: Browser sends the `sid` cookie automatically (`credentials: same-origin`)
- **Logout**: `POST /auth/logout` — clears the cookie and deletes the session
- **Session expiry UX (web)**: when a request returns 401, the web app shows a “Session expired” notice (scrolls to top) and redirects to `/{locale}/login?next=...` after ~10 seconds.

## Native: opaque session token

- **Login**: `POST /auth/login/native` with `email`, `password`, `preferredLocale`
- **Response**: API returns `{ ok, token, user, accounts, activeAccountId }` — **no cookie**
- **Token**: The `token` is the opaque session id. Store it in secure storage (e.g. `expo-secure-store`)
- **Subsequent requests**: Send `Authorization: Bearer <token>` on every API request
- **Logout**: `POST /auth/logout` with `Authorization: Bearer <token>` — invalidates the session

**Direction (current)**: native auth is **bearer-only** (no cookie-session support).

## Webview fallback auth caveat

If we later open web-only flows in a native webview (e.g. whitelisted fallback pages), they will **not** automatically be logged in via the native bearer token.

To achieve “open web page in webview and it’s already logged in” without manual token handling, we must implement an explicit bridge (e.g. cookie/session handoff or a token → webview session mechanism).

## Webview auth bridge (bearer → cookie, system browser first)

This repo implements a **system-browser-first** bridge to open a web-only flow from native while being **already logged in** on web.

### Flow

1) **Native** (bearer-only) creates a short-lived, single-use exchange code:

- `POST /auth/webview-exchange`
- Headers: `Authorization: Bearer <token>`
- Body: `{ "next": "/en/inventory" }` (safe, locale-prefixed relative path)
- Response: `{ ok, code, expiresAt, bridgeUrl }`

2) **Native** opens `bridgeUrl` in the **system browser** (note: through nginx the URL is under `/api/...`).

3) API consumes the exchange code, mints a normal cookie session, and redirects:

- `GET /auth/webview-bridge?code=...&next=/en/inventory`
- Behavior:
  - validates `next` (safe relative path, locale-prefixed)
  - validates `code` (must exist, not expired, not already used)
  - creates a new cookie session (`sid`) and sets it as an httpOnly cookie
  - `302` redirects to `next`

### Security properties

- Exchange codes are:
  - **single-use**
  - **short-lived** (60 seconds)
  - stored **hashed** in the database (raw code is never persisted)

## Logout (both)

**OpenAPI:** Auth and session routes are documented under tag `platform` in [`services/api/openapi/openapi.json`](../services/api/openapi/openapi.json). See [`API-OPENAPI.md`](API-OPENAPI.md).

`POST /auth/logout` accepts either:
- Cookie: `sid` (web)
- Header: `Authorization: Bearer <token>` (native)

If either is present, the session is deleted. Response is always `{ ok: true }`.

## Session cleanup

Expired sessions are not automatically removed. Run the cleanup job periodically (e.g. daily).

**Local / dev**:

```bash
docker compose exec api npm run job:session-cleanup
```

**Production: schedule daily**. Add to your deployment runbook and configure your orchestrator:

- **Cron** (example, daily at 03:00): `0 3 * * * docker compose exec -T api npm run job:session-cleanup`
- **Kubernetes CronJob**, **GitHub Actions scheduled workflow**, or equivalent: run `npm run job:session-cleanup` inside the API container daily.

**VPS (Docker Compose)** — host cron with flock to avoid concurrent runs:

Use `scripts/session-cleanup-cron.sh`, which uses `flock -n` on `/tmp/brewery-session-cleanup.lock` so overlapping cron invocations skip instead of stacking.

Example crontab (daily at 03:00):

```bash
0 3 * * * REPO_ROOT=/opt/umbraculum-dev /opt/umbraculum-dev/scripts/session-cleanup-cron.sh >> /var/log/brewery-session-cleanup.log 2>&1
```

Use your VPS clone path for both `REPO_ROOT` and the script path (example above uses `/opt/umbraculum-dev`). `REPO_ROOT` can be omitted if cron runs from the repo directory. Alternatively, use a systemd timer that invokes the script.

The job deletes `Session` rows where `expiresAt < now()`. The `expiresAt` column is indexed for efficient deletion.

## Session TTL

Sessions expire after 14 days. The `sessionAuth` plugin rejects expired sessions on each request and deletes them best-effort.

## Related docs

| Topic | Doc |
|---|---|
| Cross-platform auth split + webview bridge | [`CROSS-PLATFORM-BOUNDARIES.md`](CROSS-PLATFORM-BOUNDARIES.md) §5–§6 |
| Native platform obligations | [`design/canonical-native-platform-surface.md`](design/canonical-native-platform-surface.md) |
| Ubuntu Touch (cookie web session in Morph webview) | [`design/ubuntu-touch-shell-strategy.md`](design/ubuntu-touch-shell-strategy.md) |
