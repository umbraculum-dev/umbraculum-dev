# Data access boundaries

**Tier:** Public  
**Status:** v1.0 (as-built contract)  
**Audience:** contributors, module authors, third-party integrators, self-hosting operators.

This document states **where data lives** and **who may touch it** — the Prisma/API split that keeps ACL, tenancy, and schema evolution centralized on the platform.

> **Not Postgres topology.** Replication, pgpool, and read-routing are in [`POSTGRES-REPLICATION-ARCHITECTURE.md`](POSTGRES-REPLICATION-ARCHITECTURE.md) and [`CROSS-PLATFORM-BOUNDARIES.md`](CROSS-PLATFORM-BOUNDARIES.md) §7.  
> **Not authorization policy.** Workspace roles and membership gates are in [`TENANCY-AND-ACL.md`](TENANCY-AND-ACL.md).

---

## 1. Summary

| Layer | Data access | ORM / store |
|---|---|---|
| **`services/api`** | **Source of truth** — reads/writes Postgres | **Prisma** (only ORM in the monorepo) |
| **`apps/web`** | HTTP only | None — `@umbraculum/api-client` + `@umbraculum/contracts` |
| **`apps/native`** | HTTP only (offline cache planned) | None on wire; future **SQLite** device cache synced via API |
| **Third-party modules** | HTTP + pinned contracts | None — no Prisma, no direct Postgres |
| **In-repo module slices** | Platform Prisma client inside `services/api` | Consume platform client; own schema via `multiSchema` |

**Rule:** clients and external integrators **never** connect to Postgres. The API is the integration boundary.

---

## 2. Why the API boundary (not in-process ORM extension)

[RFC-0001 Decision F](rfcs/0001-modules-tiers-governance-and-automation-placement.md) makes cross-cutting concerns platform-owned. A single data-access path gives:

1. **ACL and tenancy** — every mutation passes through the same session context and service-layer gates ([`TENANCY-AND-ACL.md`](TENANCY-AND-ACL.md)).
2. **Schema evolution** — one Prisma migration story per Postgres schema; contracts version the wire shape.
3. **Multi-client parity** — web, native, and future integrators see the same validated DTOs ([`CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md)).
4. **AI tool safety** — tools call services, not raw DB connections ([`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §6.2).

Modules **extend domain data** in their own Prisma schemas (`brewery`, `pim`, `mrp`, …) but **consume** the platform client — they do not ship a parallel ORM or connection pool.

---

## 3. Server: Prisma in `services/api`

- **Schema:** [`services/api/prisma/schema.prisma`](../services/api/prisma/schema.prisma)
- **Client:** generated Prisma client used only inside the API service and its tests/CLI.
- **Schemas:** `platform.*` (tenancy, auth, billing, AI, integrations), module schemas (`brewery`, `automation`, `pim`, `mrp`, `crp`, `rendering`) per [RFC-0010](rfcs/0010-platform-brewery-postgres-schema-split.md) and [RFC-0002](rfcs/0002-canonical-module-physical-layout.md).
- **Migrations:** forward-only via `prisma migrate`; `directUrl` for admin lane — see [`CROSS-PLATFORM-BOUNDARIES.md`](CROSS-PLATFORM-BOUNDARIES.md) §7.

Module services under `services/api/src/modules/<code>/services/` use the **shared** `app.prisma` instance injected at route registration time.

---

## 4. Clients: HTTP + contracts

### Web and native

- **Transport:** [`packages/platform/api-client`](../packages/platform/api-client/README.md) — `createApiClient(baseUrl, auth)`
- **DTOs + runtime parsers:** [`packages/platform/contracts`](../packages/platform/contracts/README.md)
- **Auth split:** cookie (`sid`) on web, bearer on native — [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md), [`CROSS-PLATFORM-BOUNDARIES.md`](CROSS-PLATFORM-BOUNDARIES.md) §5

Clients **render and validate**; for server-centralized domains (water chemistry, analysis, …) they do **not** re-implement canonical formulas. See [`CODING-STANDARDS.md`](CODING-STANDARDS.md) (“API centralization guardrails”).

### Third-party / community modules

- Pin **`@umbraculum/<code>-contracts`** (MIT) and call documented HTTP routes.
- Partial OpenAPI catalog: [`API-OPENAPI.md`](API-OPENAPI.md)
- Contracts packages **do not** export Prisma types or client wrappers ([RFC-0002](rfcs/0002-canonical-module-physical-layout.md)).

---

## 5. Native offline (planned; not a second source of truth)

Brew-day reliability targets **write locally first**, sync when online ([`modules/verticals/brewery/IMPLEMENTATION-LOG.md`](modules/verticals/brewery/IMPLEMENTATION-LOG.md) §6):

- Device **SQLite** holds pending measurements/notes.
- **Postgres remains authoritative** — sync pushes through the same API endpoints with the same ACL gates.
- Native does **not** get a Prisma client or direct Postgres URL.

**Ubuntu Touch** does not use the native offline path — it runs `apps/web` in a Morph webview (online-first). See [`design/ubuntu-touch-shell-strategy.md`](design/ubuntu-touch-shell-strategy.md).

---

## 6. What each package may import

| Package / app | May use Prisma? | May call HTTP API? |
|---|---|---|
| `services/api` | Yes | N/A (is the API) |
| `apps/web`, `apps/native` | **No** | Yes (`@umbraculum/api-client`) |
| `packages/*-contracts` | **No** | N/A (types + parsers only) |
| `packages/platform/api-client` | **No** | Yes (implements fetch) |
| Third-party npm module | **No** | Yes |

### Client-safe vertical packages (apps/web, apps/native)

These brewery-vertical packages contain **no Prisma, no `services/api` imports, and no server-only deps**. Apps may import them directly (HTTP + contracts remain the persistence boundary):

| Package | Role |
|---|---|
| `@umbraculum/brewery-beerjson` | BeerJSON adaptation helpers (`packages/verticals/brewery/beerjson`) |
| `@umbraculum/brewery-recipes-ui` | Cross-platform recipe/water UI (`packages/verticals/brewery/recipes-ui`) |

Allowlist source of truth: [`scripts/eslint/appClientPackageAllowlist.mjs`](../scripts/eslint/appClientPackageAllowlist.mjs). ESLint burn-in: [`docs/design/solid-client-safe-imports-spike.md`](design/solid-client-safe-imports-spike.md) (WS6).

---

## 7. Module author checklist

- [ ] All persistence goes through `services/api` services using the platform Prisma client.
- [ ] New module domain models live in a module-owned Postgres schema (`@@schema("…")`), not ad-hoc tables in `public`.
- [ ] Wire shapes are defined in `@umbraculum/<code>-contracts`, not Prisma types leaked to clients.
- [ ] No `DATABASE_URL` in web, native, or published SDK packages.
- [ ] AI tools call services; no `prisma` in tool handlers beyond what services already encapsulate.

---

## 8. Cross-references

- [`TENANCY-AND-ACL.md`](TENANCY-AND-ACL.md) — membership and role gates on API paths
- [`design/ubuntu-touch-shell-strategy.md`](design/ubuntu-touch-shell-strategy.md) — UT clients use HTTP only (no device SQLite)
- [`OPEN-SOURCE-STACK.md`](OPEN-SOURCE-STACK.md) — Prisma rationale in the stack
- [`services/api/README.md`](../services/api/README.md) — API service scope
- [`modules/contribute/horizontal-services-consumption.md`](modules/contribute/horizontal-services-consumption.md) — consumption-contract quick reference
- [`rfcs/0001-modules-tiers-governance-and-automation-placement.md`](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §8.2 — Database row
