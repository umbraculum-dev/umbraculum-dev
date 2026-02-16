# TODOs (living)

This file tracks near-term implementation tasks and “migration reminders” as we bootstrap the product.

## Water calculator (high priority)

- [ ] Implement how recipes manage **late additions** and **boil additions** (separate from mash), since they do not contribute to mash calculations.
- [ ] Add a BrewersFriend-like **final recap**: show **recipe residual alkalinity (RA)** vs **style expected RA** (heuristic), alongside predicted mash pH and a clear “this is a rule-of-thumb” explanation.
- [ ] Add a dedicated **“Kettle/Boil add-on water”** page for preparing water additions used at boil/kettle (separate from mash water).

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

## Internationalization (i18n)

- [ ] Assess i18n approach (locales, text translations, units formatting) and how it should work across web + mobile.

## Web SEO / SSR assessment

- [ ] Assess SEO with the current Next.js App Router usage (client components, hydration, view-source). If pages aren’t SEO-friendly, reassess what must become SSR/server components + metadata strategy.
  - Notes / approach: `docs/SEO.md`

## Water calculator (BrunWater parity)

- [ ] Mash acidification: add “manual entry” mode (user inputs acid addition amount; app estimates resulting alkalinity/pH and stores both input + calculated snapshot).
- [ ] If/when we add an overall brew-day water summary/profile, it must incorporate **sparge** salts + sparge acid ion contributions (not just mash).

