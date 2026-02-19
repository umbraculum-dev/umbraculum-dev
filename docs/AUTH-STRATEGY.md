# Auth strategy (web + native)

This document describes how authentication works for the web app and native (React Native) apps.

## Web: cookie-based sessions

- **Login**: `POST /auth/login` with `email`, `password`, `preferredLocale`
- **Response**: API sets an httpOnly `sid` cookie and returns `{ ok, user, accounts, activeAccountId }`
- **Subsequent requests**: Browser sends the `sid` cookie automatically (`credentials: same-origin`)
- **Logout**: `POST /auth/logout` — clears the cookie and deletes the session

## Native: opaque session token

- **Login**: `POST /auth/login/native` with `email`, `password`, `preferredLocale`
- **Response**: API returns `{ ok, token, user, accounts, activeAccountId }` — **no cookie**
- **Token**: The `token` is the opaque session id. Store it in secure storage (e.g. `expo-secure-store`)
- **Subsequent requests**: Send `Authorization: Bearer <token>` on every API request
- **Logout**: `POST /auth/logout` with `Authorization: Bearer <token>` — invalidates the session

## Logout (both)

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
0 3 * * * REPO_ROOT=/home/deploy/brewery-app /home/deploy/brewery-app/scripts/session-cleanup-cron.sh >> /var/log/brewery-session-cleanup.log 2>&1
```

Use the **canonical repo root** on the VPS (e.g. `/home/deploy/brewery-app`). `REPO_ROOT` can be omitted if cron runs from the repo directory. Alternatively, use a systemd timer that invokes the script.

The job deletes `Session` rows where `expiresAt < now()`. The `expiresAt` column is indexed for efficient deletion.

## Session TTL

Sessions expire after 14 days. The `sessionAuth` plugin rejects expired sessions on each request and deletes them best-effort.
