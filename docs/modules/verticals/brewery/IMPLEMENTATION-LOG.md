# Brewery vertical — implementation log

**Tier:** Public  
**Status:** v1.0 (living document)  
**Audience:** contributors working on the brewery reference vertical (recipes, brew-day, water, inventory-shaped routes).

> **Not platform architecture.** Read [`PLATFORM-ARCHITECTURE.md`](../../../PLATFORM-ARCHITECTURE.md) for vision, canonical modules vs vertical configurations, AI consultant, and monetization.  
> **Cross-platform boundaries** (route IDs, `useT`, api-client auth, webview bridge, DB routing): [`CROSS-PLATFORM-BOUNDARIES.md`](../../../CROSS-PLATFORM-BOUNDARIES.md).

Brewery is a **tier-6 vertical configuration**, not a canonical module — see [`README.md`](README.md) and [RFC-0001](../../../rfcs/0001-modules-tiers-governance-and-automation-placement.md).

**Trajectory and shipped status:** [`ROADMAP.md`](../../../ROADMAP.md) and PLATFORM-ARCHITECTURE §3 audit supersede the historical greenfield phase plan in [`archive/architecture-Rev02-2026-05-snapshot.md`](../../../archive/architecture-Rev02-2026-05-snapshot.md) §11.

---

## 1. Product goals and non-goals

### Goals

- **Native apps are mandatory** (iOS/Android app stores). Native is not a “PWA replacement”; it is the differentiator:
  - brew-day must work with poor/no connectivity
  - offline-first logging
  - store presence for marketing
- **Desktop web is the workhorse** for serious workflows (recipe building, analysis, administration).
- **AI-first development:**
  - reduce cognitive load and context switching
  - prefer mainstream conventions and type safety
  - code is shipped with tests (unit + e2e) from day 1
- **Keep billing simple:**
  - Stripe workspace tiers (see [`ORG-BILLING-STRIPE-REVENUECAT-FASTIFY.md`](../../../ORG-BILLING-STRIPE-REVENUECAT-FASTIFY.md))
  - billing adapter boundary so alternate providers remain possible later

### Non-goals (for v0)

- Level 3 local-first sync (multi-device conflict-free merges) unless demanded by customers.
- Complex GraphQL schema governance (REST + projection first).
- Microservices, event sourcing, CQRS, custom infrastructure.

---

## 2. Stack and monorepo shape (brewery reference)

### Chosen stack

- **Web:** Next.js + React + TypeScript
- **Native:** React Native + Expo + TypeScript
- **API:** Node.js + Fastify + TypeScript (monolith)
- **ORM:** Prisma → PostgreSQL (`pgvector/pgvector:pg16` in dev/CI for AI RAG)
- **Offline (device):** SQLite (native apps)
- **Edge:** Nginx (“doorman”) — `/api` → Fastify, `/` → Next.js
- **Local dev:** Docker Compose (routing parity with production)
- **CI/CD:** GitHub Actions

### Shared UI (Tamagui)

- `@umbraculum/ui` — platform-neutral primitives
- `@umbraculum/brewery-recipes-ui` — recipe/water/yeast domain UI on top of `@umbraculum/ui`
- Apps keep adapters for auth, routing, and media — see [`CROSS-PLATFORM-BOUNDARIES.md`](../../../CROSS-PLATFORM-BOUNDARIES.md)

Historically, recipe feature components were duplicated across `apps/web` and `apps/native`; the resolution was to move presentational UI into `@umbraculum/ui` and `@umbraculum/brewery-recipes-ui` and keep platform concerns in app adapters.

### Domain packages (brewery-flavored)

- `@umbraculum/brewery-core` — brewing calculations and unit conversions (pure functions; strong unit tests)
- `@umbraculum/brewery-beerjson` — BeerJSON schema layer ([`BEERJSON-FIRST.md`](BEERJSON-FIRST.md))

---

## 3. UI information architecture (web + mobile)

### Principle: separate “input pages” from “results pages”

- **Input pages** change data and run calculations (mash inputs, sparge inputs).
- **Results pages** appear only when results are large enough to need a stable report view, multiple subpanels, or export/share workflows.

### Criteria for adding `water/results`

Add a dedicated results page (e.g. `/recipes/:id/water/results`) only when at least one is true:

- the results surface is too big for the input pages without overload
- a stable snapshot view is needed (last saved calculation only; no double calculation)
- export/share (print/PDF/email) benefits from a dedicated page

Until then, keep small **read-only summaries** and deep links from input pages/hub.

---

## 4. Request flow (LEMP analogy)

**Nginx is the doorman. Next.js is the web app. Fastify is the backend.**

| Layer | Responsibility |
|-------|----------------|
| **Nginx** | TLS, route `/api/*` → Fastify, `/` → Next.js, rate limits |
| **Next.js** | Web routing, SSR/CSR, calls `/api` |
| **Fastify** | Auth/ACL, business rules, Prisma/Postgres, Stripe/RevenueCat webhooks, jobs (rendering queue, etc.) |
| **Expo** | Offline-first UI, local SQLite, sync queue when online |

---

## 5. Tenancy and ACL (workspace-scoped)

> **Terminology:** The platform uses **Workspace** + **WorkspaceMember** (not “Account”). API routes live under `/workspaces`; request context uses `active_workspace_id`. Older docs that say `account_id` or `/accounts` are obsolete.

### Tenancy

- **Workspace-owned** model: users belong to one or more workspaces (clubs/breweries) with roles.

### Roles

User-facing role names:

- `owner`
- `brewery-admin`
- `member`
- `viewer`

Implementation: database identifiers use `brewery_admin` (underscore); UI may show `brewery-admin`.

### Authorization

- **Application-level authorization** (Fastify middleware + service-layer checks) is the baseline.
- **Row Level Security (RLS)** may be added later; not required for v0.

### Data ownership

Domain tables are scoped by `workspace_id` (or equivalent FK). Every read/write is scoped by:

- authenticated `user_id`
- chosen **active workspace**
- membership + role checks

### Support tooling (deferred)

Support-only “login as workspace” / impersonation must be **audited** and restricted to privileged roles. Not shipped in v0; keep as a design constraint.

See [`AUTH-STRATEGY.md`](../../../AUTH-STRATEGY.md).

---

## 6. Offline strategy: Level 2 now, Level 3 deferred

### Requirements

- Brew-day workflows must **never lose data**.
- Measurements and notes are stored locally immediately.

### Level 2 (chosen)

- **Write locally first** (SQLite) with `sync_state = pending`.
- Sync loop retries until the server acknowledges events.
- Server endpoints are **idempotent** by client-generated `event_id` (UUID).

### Append-only events

Brew-day data is modeled as immutable events (gravity/temp/pH, notes, timers, corrections referencing superseded events). Sync is “add missing events,” which avoids most conflicts.

### Level 3 (deferred)

Multi-device offline conflict resolution is not planned unless demanded. Mutable entities (recipes) can use versioning if conflicts are introduced later.

---

## 7. API design (brewery domain)

REST-first. Prefer `?include=` and `?fields=` before GraphQL.

**Workspace and membership:** `/workspaces`, `/workspaces/:id/members`, etc. (see `services/api/src/routes/workspaces.ts`).

**Brewery domain (examples):** recipes, brew sessions, inventory, water — routes under `services/api/src/modules/brewery/` and legacy flat routes being migrated per [RFC-0006](../../../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md).

**Sync (when implemented):**

- `POST /sync/push` — idempotent event batch
- `GET /sync/pull?since=` — changes since cursor

**Public recipe submission (deferred):** web form + API path with captcha/keys and rate limits — design constraint only.

---

## 8. Data model constraints (brewery)

### Core entities (high level)

- `Workspace`, `WorkspaceMember`, `User`, `Session`
- `Recipe`, `BrewSession`, brew-day events (append-only where applicable)

Prisma models live in [`services/api/prisma/schema.prisma`](../../../../services/api/prisma/schema.prisma). Platform vs brewery taxonomy: [`PLATFORM-ARCHITECTURE.md`](../../../PLATFORM-ARCHITECTURE.md) §3.4.

### Water profiles (day-1 rule)

- exactly **one water profile per recipe** (1:1)
- cannot be shared across recipes; **duplicate** creates a new profile record
- water screens edit only water correction (not grist/hops)
- **single source of truth** — profile is authoritative; recipe views may display derived values only

See [`WATER-CHEM-MASH-PH-MODEL.md`](WATER-CHEM-MASH-PH-MODEL.md).

### Global rule: no duplicate editable sources

Avoid storing the same conceptual data in two editable places — offline sync and recalculation break when updates do not propagate deterministically.

---

## 9. Brew-day steps, reminders, and safety

Custom user-defined brew-day steps (including safety steps):

- examples: “close LPG valve”, “sanitise pump”, “open chiller bypass”
- defaults at workspace/brewery profile level; overrides per brew session
- notifications/reminders — future ([RFC-0008](../../../rfcs/0008-notifications-outbound-delivery.md) boundary)

Native apps are the primary surface for brew-day reliability.

---

## 10. Testing conventions (brewery flows)

- **Unit:** Vitest — `@umbraculum/brewery-core`, `services/api`
- **Integration:** API + DB (compose test DB)
- **E2E:** Playwright (web) — see [`TESTING.md`](../../../TESTING.md)
- **Mobile:** unit + selective integration early; heavier mobile e2e after flows stabilize

### `data-testid` (balanced rule)

Add `data-testid` to workflow-critical controls (save/delete/sync, key fields, nav, confirm modals). Prefer `getByRole` / `getByLabel` when stable. See [`DEVELOPMENT-ACCESSIBILITY.md`](../../../DEVELOPMENT-ACCESSIBILITY.md).

---

## 11. Living constraints (“always apply” for brewery work)

- Keep backend monolithic and boring.
- REST-first; projection before GraphQL.
- Offline reliability is a product guarantee on native.
- Append-only events for brew-day logs.
- Workspace tenancy + role-based ACL enforced server-side.
- Water profile 1:1 with recipe; single source of truth for water data.
- No duplicated editable domain data in multiple places.
- Brew-day custom steps + safety reminders are first-class (notifications later).
- Tests ship with features.
- Cross-platform shared code follows [`CROSS-PLATFORM-BOUNDARIES.md`](../../../CROSS-PLATFORM-BOUNDARIES.md).

---

## Related docs

| Topic | Doc |
|-------|-----|
| Vertical overview | [`README.md`](README.md) |
| BeerJSON | [`BEERJSON-FIRST.md`](BEERJSON-FIRST.md) |
| Water chemistry | [`WATER-CHEM-MASH-PH-MODEL.md`](WATER-CHEM-MASH-PH-MODEL.md) |
| Equipment / gravity | [`EQUIPMENT-AND-GRAVITY-ANALYSIS.md`](EQUIPMENT-AND-GRAVITY-ANALYSIS.md) |
| Yeast math | [`YEAST-MATH.md`](YEAST-MATH.md) |
| Historical phase plan | [`archive/architecture-Rev02-2026-05-snapshot.md`](../../../archive/architecture-Rev02-2026-05-snapshot.md) |
