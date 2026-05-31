# Cross-platform boundaries (web + native)

**Tier:** Public  
**Status:** v1.0 (living document — as-built contract)  
**Audience:** contributors working on shared packages, web, or native shells.

> **Not platform vision.** For horizontal-platform shape, canonical modules, and the AI consultant, read [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md).  
> **Not brewery product rules.** For the reference vertical's product constraints and domain rules, read [`modules/verticals/brewery/IMPLEMENTATION-LOG.md`](modules/verticals/brewery/IMPLEMENTATION-LOG.md).

This document records **implemented** decisions for sharing code between **Next.js (web)** and **React Native + Expo (native)** without leaking platform routers into shared screens.

---

## 1. Locales are single-source-of-truth

- **Canonical locale ownership**: `packages/i18n` (`@umbraculum/i18n`)
- Implemented exports:
  - `locales` (readonly tuple)
  - `SupportedLocale`
  - `defaultLocale`
  - `isLocale(value)`
  - `getSharedMessages(locale)` (full message tree)

Web integrates via a thin re-export:

- `apps/web/src/i18n/routing.ts` re-exports from `@umbraculum/i18n` so web can keep its existing structure while avoiding drift.

---

## 2. Routing boundary (route IDs + typed params)

We do **not** share Next.js routes or file-based routing across web/native. Instead we share a **route manifest** that allows:

- shared screens to navigate without importing Next.js or React Navigation modules
- push notifications / deep links to target stable route IDs later
- explicit policy for “ported vs not ported” flows

Implemented package:

- `packages/navigation` (`@umbraculum/navigation`)
  - `RouteId`, `RouteParamsById`, `RouteRef`
  - `routeToPath(RouteRef)` produces a **non-locale** web path (e.g. `/inventory`, `/recipes/:id/water/mash`)
  - `getRouteAvailability(id, platform)` returns:
    - `available` (web)
    - `blocked` (native default)
    - `whitelisted_web_fallback` (native, for safe webview fallback candidates)
  - `WEBVIEW_WHITELIST_ROUTE_IDS` currently starts with: `inventory`

### 2.1 “Block-first + whitelist webview fallback” (native)

**Policy direction (agreed)**:

- If a user hits a not-yet-ported route on native, show **“Not available on mobile yet”** first.
- Some routes may be **webview whitelisted** for later fallback (read-only / safe surfaces).
- Inventory is the first example whitelist candidate; later candidates may include MPR console.

### 2.2 Route policy: avoid accidental “not ported” drift

We treat porting as an explicit capability decision:

- every route has a stable `RouteId`
- native can mark a route as:
  - **blocked** (default)
  - **available** (ported)
  - **whitelisted_web_fallback** (safe webview candidate later)

This keeps the “not ported yet” state deliberate, and avoids silent divergence.

---

## 3. Universal i18n React hook (`useT` + `rich`)

To share screens across web and native while keeping message syntax consistent, shared code must **not** import `next-intl` directly.

Implemented package:

- `packages/i18n-react` (`@umbraculum/i18n-react`)
  - Universal runtime:
    - `LocaleProvider({ locale, messages })`
    - `useT(namespace)` returning `{ t(key, values), rich(key, values) }`
    - Native-ready formatting uses ICU via `intl-messageformat`, fed by `getSharedMessages(locale)`
  - Web adapter entrypoint (optional):
    - `@umbraculum/i18n-react/next-intl` provides a `useT(namespace)` implemented via `next-intl` (thin wrapper)

### 3.1 Boundary rule: shared screens must not import platform frameworks

If code is intended to be shared between web and native (screens/flows/components), it must **not import**:

- `next/*` modules
- `next-intl/*` modules
- React Navigation modules
- Expo Router modules

Instead it depends on small shared interfaces:

- routing: `@umbraculum/navigation`
- i18n: `@umbraculum/i18n` + `@umbraculum/i18n-react`

**Implemented boundary modules (source of truth)**:

| Concern | Package / adapter |
|--------|-------------------|
| Locales + messages | `packages/i18n` |
| Universal translation hook | `packages/i18n-react` |
| Universal route IDs + policy | `packages/navigation` |
| Web adapter | `apps/web/src/navigation/appRouter.ts` (`useAppRouter()`) |

---

## 4. Web adapter (Next.js)

Web keeps Next App Router + `next-intl` locale-prefixed URLs.

Implemented file:

- `apps/web/src/navigation/appRouter.ts`
  - `useAppRouter()` implements `AppRouter` over `next-intl` navigation + locale prefixing
  - It uses `routeToPath()` from `@umbraculum/navigation` and prefixes `/${locale}`.

See also [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md) and [`NATIVE-STRATEGY-AND-CI.md`](NATIVE-STRATEGY-AND-CI.md).

---

## 5. Cross-platform API client (fetch + auth)

Implemented package:

- `packages/api-client` (`@umbraculum/api-client`)
  - Uses a minimal cross-platform fetch contract (injectable `fetch`) and avoids DOM-only typing in its public API.
  - **Auth direction (current)**:
    - Web: cookie sessions (`sid`) via `cookieAuth()`
    - Native: **bearer-only** via `bearerTokenAuth(getToken)`
    - Node (if used): treat as **bearer-only**
  - **Webview caveat**: opening a web route inside a native webview is not automatically authenticated by the native bearer token. “Already logged in” webviews require the explicit bridge in §6.

---

## 6. Webview auth bridge (bearer → cookie session handoff)

To support the “block-first + whitelist web fallback” direction without weakening the core auth split (native bearer-only, web cookie-session), the API implements a **system-browser-first** bridge that:

- starts from a **native bearer session**
- mints a short-lived, single-use exchange code
- then exchanges it for a normal web cookie session (`sid`) and redirects to a safe in-app path

Implemented pieces:

- DB model: `services/api/prisma/schema.prisma` → `WebviewExchangeCode` (`webview_exchange_codes` table)
  - stores `code_hash` (never stores raw code), `session_id`, `user_id`, `expires_at`, `used_at`
- Routes: `services/api/src/routes/auth.ts`
  - `POST /auth/webview-exchange` (bearer-only)
    - body `{ next: "/en/<path>" }`
    - response `{ ok, code, expiresAt, bridgeUrl }` where `bridgeUrl` is under `/api/auth/webview-bridge?...` (nginx rewrite)
  - `GET /auth/webview-bridge?code=...&next=...`
    - validates `next` is a safe locale-prefixed relative path (`/en...` or `/it...`)
    - validates and consumes the code (single-use, 60s TTL)
    - creates a normal cookie session and `302` redirects to `next`

This enables “Continue on web” from native for whitelisted routes while being **already logged in** in the system browser.

---

## 7. Database routing foundation (pgpool-II + replication + auto-degrade)

To enable a single `DATABASE_URL` entrypoint while keeping **auth/session correctness**, the repo implements a production-like local stack with:

- **Postgres primary + hot standby** (streaming replication)
- **Replication slot + WAL archive** so a standby can catch up without re-seeding after outages
- **pgpool-II** as a **single DB entrypoint** (`DATABASE_URL`)
- **Synchronous replication when healthy** (`remote_apply`) to keep replica reads consistent
- **Auto-degrade** to primary-only when the replica is unhealthy/lagging (preserves availability and correctness)

Implemented pieces:

- Compose wiring: `docker-compose.yml`
  - `postgres`, `postgres-replica` on **`pgvector/pgvector:pg16`** (AI RAG `vector` extension; see [`POSTGRES-REPLICATION-ARCHITECTURE.md`](POSTGRES-REPLICATION-ARCHITECTURE.md) §"pgvector image")
  - `pgpool`, `db-guard`
- Postgres durability:
  - archive volume: `wal_archive` mounted at `/wal-archive`
  - slot: `replica1`
- Guard:
  - `infra/db-guard/db-guard.sh` toggles `synchronous_standby_names` and pgpool standby attach/detach
- Prisma “safe lane” for migrations:
  - `services/api/prisma/schema.prisma` uses `directUrl = env("DATABASE_URL_DIRECT")`

Further reading:

- [`POSTGRES-REPLICATION-ARCHITECTURE.md`](POSTGRES-REPLICATION-ARCHITECTURE.md)
- [`PGPOOL-VERIFICATION.md`](PGPOOL-VERIFICATION.md)

---

## 8. Monorepo placement rule (shared packages)

Shared packages that cross the web/native boundary are **buildable packages**:

- runtime: `dist/**/*.js`
- types: `dist/**/*.d.ts`

**Strict placement rule:** if code might be reused in native, it lives under `packages/**` first. Apps provide small adapters (auth, routing, media) instead of re-implementing UI trees.

Rebuild after changes: see [`DEVELOPMENT.md`](../DEVELOPMENT.md) and the shared-packages build script (`./scripts/build-packages-in-docker.sh`).

---

## 9. Ubuntu Touch operator shell (webapp, not a UI fork)

Umbraculum does **not** ship a Qt/QML UI for [Ubuntu Touch](https://ubuntu-touch.io/). Operator modules on Lomiri reuse the **web slice** unchanged: Tamagui pages in `apps/web`, cookie-session auth, and locale-prefixed routes from `@umbraculum/navigation`.

**Distribution:** a UBports **Click webapp package** (`webapp-container` + Morph Qt WebEngine webview) pointing at the deployed `apps/web` base URL. Store presence via OpenStore; no duplicate screen tree.

**Reference implementation:** [`packaging/ubuntu-touch/umbraculum-reference/README.md`](../packaging/ubuntu-touch/umbraculum-reference/README.md) — manifest, AppArmor, launcher template, [`scripts/ubuntu-touch/render-click-desktop.sh`](../scripts/ubuntu-touch/render-click-desktop.sh).

**Platform typing today:** `@umbraculum/navigation` `AppPlatform` is `"web" | "native"`. Ubuntu Touch is treated as **web** for route availability — any web-shipped module route is UT-eligible when online.

**Explicit non-parity:** iOS/Android native offline (SQLite brew-day, bearer auth, Expo push/BLE) does **not** apply to the UT shell. See [`design/ubuntu-touch-shell-strategy.md`](design/ubuntu-touch-shell-strategy.md) for the full discourse, module eligibility matrix, and verification checklist.

---

## Related docs

- [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §3.5 — platform audit summary
- [`design/ubuntu-touch-shell-strategy.md`](design/ubuntu-touch-shell-strategy.md) — Ubuntu Touch delivery decision (Click webapp shell, online-first)
- [`../packaging/ubuntu-touch/umbraculum-reference/README.md`](../packaging/ubuntu-touch/umbraculum-reference/README.md) — reference Click package + build steps
- [`TAMAGUI.md`](TAMAGUI.md) — cross-platform UI primitive layer
- [`canonical-native-platform-surface.md`](design/canonical-native-platform-surface.md) — iOS/Android native obligations (orthogonal to UT)
- [`modules/verticals/brewery/IMPLEMENTATION-LOG.md`](modules/verticals/brewery/IMPLEMENTATION-LOG.md) — brewery vertical product + stack notes

**Former filename:** `ARCHITECTURE-REV02.md` (removed 2026-05-27; full text in [`archive/architecture-Rev02-2026-05-snapshot.md`](archive/architecture-Rev02-2026-05-snapshot.md)).
