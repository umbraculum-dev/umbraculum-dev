# TODOs (living)

This file tracks near-term implementation tasks and “migration reminders” as we bootstrap the product.

## Water calculator (high priority)

- [ ] **Sparge salts vs sparge pH**: verify whether sparge salt additions currently influence predicted sparge pH; if not, implement the same Ca/Mg (RA-like) pH shift approach used for mash so gypsum/CaCl₂ can move predicted sparge pH modestly.
- [ ] **Deprecate mash pH v0**: after we’ve tested v1 enough for confidence, remove v0 endpoints/logic and UI fallbacks (keep a short-lived migration window if needed).
- [ ] Implement how recipes manage **late additions** and **boil additions** (separate from mash), since they do not contribute to mash calculations.
- [ ] Add a BrewersFriend-like **final recap**: show **recipe residual alkalinity (RA)** vs **style expected RA** (heuristic), alongside predicted mash pH and a clear “this is a rule-of-thumb” explanation.
- [ ] Add a dedicated **“Kettle/Boil add-on water”** page for preparing water additions used at boil/kettle (separate from mash water).

## Recipes / templates

- [ ] **Assess external libraries** for importing recipes (BeerXML + BeerJSON) into our `Recipe` model (`gristJson` / `hopsJson` / `yeastJson`).
  - See `RECIPES-IMPORT-TODO.md` for the agreed path forward (manual import + server-side importer plan).
  - [ ] **Scope v1 to server-side only** (API importer). Web UI uploads/pastes recipe data; parsing happens in the API.
  - [ ] Decide input UX: file upload vs paste text (and which we support first).
  - [ ] Define a licensing policy: default to user-provided files; do not redistribute third-party recipe datasets unless explicitly licensed.
  - [ ] Choose approach: maintained library vs minimal in-house parser for the subset we need.

## Authentication (real, production-ready)

- [ ] Implement real auth end-to-end:
  - [ ] Email/password **signup** + **login**
  - [ ] **DB-backed sessions** with `sid` httpOnly cookie
  - [ ] Add a scheduled cleanup job: `DELETE FROM "Session" WHERE "expiresAt" < now()` to prevent unbounded growth (indexed by `expiresAt`).
  - [ ] Persist `preferredLocale` from login/signup, and ensure locale-prefixed routes work for auth pages (`/en/...`, `/it/...`)
  - [ ] “Active account” selection after login when user has multiple accounts
- [ ] Add “i18n contributing” flow/tooling (recommended: Weblate) and keep translation catalogs maintained.

## Authentication (important)

- [ ] **Dev-only header auth is temporary** (current approach):
  - API accepts `X-User-Id` and `X-Account-Id` in development.
  - Local DB is bootstrapped via a seed script (stable IDs).
- [ ] **Migrate to proper auth** after initial development:
  - session/JWT scaffolding
  - real login/logout
  - remove reliance on dev headers (or confine them behind a dev-only gate)

## Tenancy + ACL (always enforce)

- [ ] All domain tables must include `account_id` (or `accountId`) and be scoped server-side.
- [ ] Enforce membership/role checks centrally (service layer), not ad-hoc in routes.
- [ ] Keep “active account” explicit (`activeAccountId`), never implicit.

## Near-term milestones

- [ ] Core schema: `User`, `Account`, `AccountMember` (+ roles)
- [ ] Minimal endpoints: `/me`, `/accounts` (GET/POST)
- [ ] Web thin shell: account list + create account (dev only)

## Web SEO / SSR assessment

- [ ] Assess SEO with the current Next.js App Router usage (client components, hydration, view-source). If pages aren’t SEO-friendly, reassess what must become SSR/server components + metadata strategy.
  - Notes / approach: `docs/SEO.md`

## Web UI accessibility settings

- [ ] **Make density mode more effective**: gradually replace hard-coded inline paddings/margins in web UI with shared CSS variables/tokens (so `compact/comfortable` affects more of the app consistently).

## Water calculator (BrunWater parity)

- [ ] Mash acidification: add “manual entry” mode (user inputs acid addition amount; app estimates resulting alkalinity/pH and stores both input + calculated snapshot).
- [ ] If/when we add an overall brew-day water summary/profile, it must incorporate **sparge** salts + sparge acid ion contributions (not just mash).

