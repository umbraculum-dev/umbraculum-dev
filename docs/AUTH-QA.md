## Auth QA checklist (local)

### API smoke
- **signup**: `POST /api/auth/signup` sets `sid` cookie and returns `activeWorkspaceId`
- **auth/me**: `GET /api/auth/me` works with cookie; returns `user`, `workspaces`, `activeWorkspaceId`
- **logout**: `POST /api/auth/logout` clears session and subsequent `/api/auth/me` returns 401
- **active workspace**:
  - login with 2+ workspaces returns `activeWorkspaceId: null`
  - `POST /api/auth/active-workspace` sets it and workspace-scoped endpoints (e.g. `/api/recipes`) start working

### Web smoke (i18n + auth)
- `/en/login` ↔ `/it/login` language switcher updates URL and the submitted `preferredLocale`
- Login redirects:
  - unauthenticated access to protected pages redirects to `/{locale}/login?next=...`
  - login redirects back to `next` when provided
- Session-expired UX (401):
  - when an authenticated page hits a 401, a “Session expired” notice appears at the top
  - the page scrolls to the top so the notice is visible
  - after ~10 seconds, the app redirects to `/{locale}/login?next=...`
  - the notice includes a “Log in now” CTA that redirects immediately
- If user has multiple workspaces:
  - after login → `/[locale]/select-workspace`
  - selecting a workspace → dashboard
- “Translations status” note is visible on login/signup pages and the “Help translate” link goes to `/[locale]/i18n-contributing`

