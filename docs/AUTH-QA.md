## Auth QA checklist (local)

### API smoke
- **signup**: `POST /api/auth/signup` sets `sid` cookie and returns `activeAccountId`
- **auth/me**: `GET /api/auth/me` works with cookie; returns `user`, `accounts`, `activeAccountId`
- **logout**: `POST /api/auth/logout` clears session and subsequent `/api/auth/me` returns 401
- **active account**:
  - login with 2+ accounts returns `activeAccountId: null`
  - `POST /api/auth/active-account` sets it and account-scoped endpoints (e.g. `/api/recipes`) start working

### Web smoke (i18n + auth)
- `/en/login` ↔ `/it/login` language switcher updates URL and the submitted `preferredLocale`
- Login redirects:
  - unauthenticated access to protected pages redirects to `/{locale}/login?next=...`
  - login redirects back to `next` when provided
- If user has multiple accounts:
  - after login → `/[locale]/select-account`
  - selecting an account → dashboard
- “Translations status” note is visible on login/signup pages and the “Help translate” link goes to `/[locale]/i18n-contributing`

