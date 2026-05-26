# @umbraculum/api

Fastify + Prisma + Postgres API service — the backend for Umbraculum's brewery vertical and the platform layer below it.

> [!NOTE]
> Part of [Umbraculum](../../README.md) — an open-source toolset for building workspace-shaped operational applications.

## What this is

The primary API service. Fastify 5 + Prisma 6 against Postgres (primary + replica fronted by pgpool — see [`docs/POSTGRES-REPLICATION-ARCHITECTURE.md`](../../docs/POSTGRES-REPLICATION-ARCHITECTURE.md)) with Redis for sessions and BullMQ rendering queues. The service is the source of truth for every contract surface: auth (`/auth/*` — cookie sessions for web, bearer tokens for native), recipes / brew-day computations, water chemistry, gravity analysis, billing (Stripe + RevenueCat per [`docs/ORG-BILLING-STRIPE-REVENUECAT-FASTIFY.md`](../../docs/ORG-BILLING-STRIPE-REVENUECAT-FASTIFY.md)), canonical rendering jobs (`/rendering/*` per RFC-0007), and the AI consultant orchestrator (Anthropic Claude SDK, BYOK + paid-tier unlock per [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) §6–§7).

Every cross-boundary type the API serializes is defined in `@umbraculum/contracts` — both the producer (this service) and the consumers (web, native) compile against the same types and run the same hand-rolled runtime parsers, which is what makes the contract layer trustworthy. The hand-rolled-validator decision is documented in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../../docs/CONTRACTS-VALIDATION-STRATEGY.md).

## Scope

- **Contains**: Fastify app + plugin wiring (`src/app.ts`, `src/plugins/`); HTTP route handlers grouped by domain (`src/routes/`); business-logic services (`src/services/`), including the RFC-0007 rendering job runtime; the Prisma schema + migrations (`prisma/`); domain models layered on top of Prisma (`src/domain/`); BeerJSON / BeerXML import handlers (`src/beerjson/`, `src/importers/`); seed scripts (`src/seed/`, `prisma/seed.ts`); CLI utilities for backfills, the E2E fixture seed, and one-off migrations (`src/cli/`); scheduled jobs (`src/jobs/` — Beerproto sync, session cleanup); test suites (`src/tests/` — unit + integration + contract-snapshot tests); the entrypoint (`src/server.ts`).
- **Does not contain**: web UI (`apps/web`); native UI (`apps/native`); shared types or runtime parsers (`@umbraculum/contracts`); the API client wrapper consumers use (`@umbraculum/api-client`).

## Quick start

From repo root:

1. Stack up: `docker compose up -d` (the API container starts on its own port behind nginx; Postgres + replica + pgpool + Redis + Gotenberg come up alongside).
2. Run migrations against the dev DB: `docker compose exec api npx prisma migrate dev` (already run by the container's `postinstall` for fresh installs).
3. Seed the dev DB: `docker compose exec api npm run db:seed`.
4. Tail logs: `docker compose logs -f api`.

The API binds at `:3001` inside the container; the dev nginx routes `/api/*` from `:18080` to it.

## Build / test / lint (local)

Per the `node-npm-container-only` skill shipped by `umbraculum-node-react-cursor-assistant`, every command runs inside the api container — never on host Node.

- **Build (production)**: `docker compose exec api npm run build` (`tsc -p tsconfig.json`).
- **Test (full suite)**: `docker compose exec api npm test` (resets the test DB, runs vitest including contract-snapshot tests).
- **Test (single filter)**: `docker compose exec api npm test -- -t "<vitest filter>"`.
- **Contract snapshot check**: `docker compose exec api npm run contracts:check` (fails CI if the API's serialized response shape diverges from the snapshots; refresh with `npm run contracts:update`).
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../docs/TYPING.md) §"Per-workspace CI gate" (this workspace carries all 6 candidate strict flags after Phase 6f + 6g + 6h).
- **DB migrations**: `docker compose exec api npm run db:migrate`.
- **Backfills**: `npm run db:backfill:recipe-styles`, `npm run db:backfill:recipe-beerjson`, `npm run db:backfill:integration-tokens` — all `tsx`-driven CLI entrypoints in `src/cli/`.
- **E2E fixture seed**: `npm run seed:e2e` — produces deterministic state consumed by `apps/web/e2e/`.

## How it fits in

- **Consumed by**: `apps/web` (cookie auth), `apps/native` (bearer auth), `@umbraculum/api-client` (the typed wrapper used by both apps and external SDK consumers when the public flip happens), `apps/web/e2e/` (Playwright E2E suite via the seeded fixture).
- **Depends on**: Postgres (primary + replica), pgpool, Redis, Gotenberg, Anthropic Claude API (for AI orchestrator routes); `@umbraculum/contracts` (typed contracts); `@umbraculum/rendering` (document/file rendering adapters); `@umbraculum/brewery-core` (math primitives shared with web/native); the upstream `@beerjson/beerjson` schema package.
- **Auth surfaces**: cookies for web (`sid` httpOnly), bearer tokens for native + Node SDKs. Both routes converge on the same internal session model — see [`docs/AUTH-STRATEGY.md`](../../docs/AUTH-STRATEGY.md) and [`docs/AUTH-HARDENING-ASSESSMENT.md`](../../docs/AUTH-HARDENING-ASSESSMENT.md).

## Status

Shipping. AI orchestrator + per-workspace operational memory + admin dashboard landed in Sprint #2 per [`docs/ROADMAP.md`](../../docs/ROADMAP.md). The API surface is intentionally shaped for both the brewery vertical (today) and additional vertical configurations (on the H1 2027 trajectory): routes are organized by platform-primitive (recipes, equipment, runs) rather than by brewery-specific concept, and vertical-specific behavior is reached through configuration / seed data rather than per-vertical route trees.

## Further reading

- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) — platform vision, AI consultant blueprint, BYOK + paid tier unlock
- [`docs/ARCHITECTURE-REV02.md`](../../docs/ARCHITECTURE-REV02.md) — brewery-vertical implementation log
- [`docs/AUTH-STRATEGY.md`](../../docs/AUTH-STRATEGY.md) — cookie + bearer + future webview bridge
- [`docs/POSTGRES-REPLICATION-ARCHITECTURE.md`](../../docs/POSTGRES-REPLICATION-ARCHITECTURE.md) — primary + replica + pgpool
- [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../../docs/CONTRACTS-VALIDATION-STRATEGY.md) — why the API uses hand-rolled runtime validators
- [`docs/ORG-BILLING-STRIPE-REVENUECAT-FASTIFY.md`](../../docs/ORG-BILLING-STRIPE-REVENUECAT-FASTIFY.md) — billing source-of-truth design
- [`docs/TESTING.md`](../../docs/TESTING.md) — platform-wide test layer map
- [`docs/DOCS-README-STANDARDS.md`](../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`src/seed/README.md`](src/seed/README.md) — ingredient seed/import scaffolding (sub-component)
