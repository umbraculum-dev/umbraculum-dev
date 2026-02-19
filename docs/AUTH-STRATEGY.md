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

Expired sessions are not automatically removed. Run the cleanup job periodically (e.g. daily):

```bash
docker compose exec api npm run job:session-cleanup
```

In production, schedule this via cron or your orchestrator's job runner.

## Session TTL

Sessions expire after 14 days. The `sessionAuth` plugin rejects expired sessions on each request and deletes them best-effort.
