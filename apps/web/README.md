# @brewery/web

Next.js + React + Tamagui web application — the desktop-first surface of Umbraculum's brewery vertical.

> [!NOTE]
> Part of [Umbraculum](../../README.md) — the process-manufacturing platform, brewery-configured by default. Brand resolved 2026-05-18; see [`docs/RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md). The npm scope `@brewery/*` is parked pending sub-plan #9 ([`RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md) §10); do not rewrite import paths.

## What this is

The web application — the primary user-facing surface of the brewery vertical today. Built on Next.js 15 (App Router) + React 19 + Tamagui (with `react-native-web` so platform-neutral components from `@umbraculum/ui` and `@brewery/recipes-ui` render identically here and in `apps/native`). Authentication rides cookie sessions (`sid` httpOnly) with the API service at `services/api`; localization runs through `next-intl` reading from `@umbraculum/i18n`; charts use Victory; chat surfaces and the AI consultant are integrated as first-class panels.

The architectural shape — what's a feature here vs. in a sibling package — is documented in [`docs/architecture-Rev02.md`](../../docs/architecture-Rev02.md) (the brewery-vertical implementation log). The platform-level framing (web + native sharing core logic via `@brewery/*` packages) lives in [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md).

## Scope

- **Contains**: Next.js App Router routes (`app/[locale]/**`), middleware (`middleware.ts`), per-locale i18n request handler (`src/i18n/`), client-side navigation glue (`src/navigation/`), Tamagui config (`tamagui.config.ts`), Next config (`next.config.js`), the media-sync script (`scripts/sync-media.mjs`), the i18n-coverage guardrail (`scripts/i18n-guardrail.mjs`), the Playwright E2E sub-suite (`e2e/`).
- **Does not contain**: API route handlers (those live in `services/api`); shared UI primitives (`@umbraculum/ui`); domain UI (`@brewery/recipes-ui`); message catalogs (`@umbraculum/i18n`); contract types (`@brewery/contracts`); media assets (`@umbraculum/media` — synced into `public/media/` by the pre-build script); the native app (`apps/native`).

## Quick start

From repo root:

1. Stack up: `docker compose up -d` (brings up the API, Postgres primary + replica, pgpool, Redis, nginx).
2. Visit `http://localhost:18080` (the dev nginx serves the app).
3. For hot-reloading dev: the web container runs `next dev -H 0.0.0.0 -p 3000` automatically; logs are visible via `docker compose logs -f web`.

## Build / test / lint (local)

Per the [`node-npm-container-only`](../../.cursor/skills/node-npm-container-only.md) rule, all commands run inside containers — never against host Node.

- **Build (production)**: `docker compose exec web npm run build` (runs the pre-build media sync, then `next build`).
- **Lint**: `docker compose exec web npm run lint` (`next lint`).
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../docs/TYPING.md) §"Per-workspace CI gate". This workspace landed in Phase 4 (typecheck infrastructure) and Phase 6h (`verbatimModuleSyntax`); the pilot strict-flag rollout is in progress per the same doc.
- **i18n coverage check**: `docker compose exec web npm run i18n:guardrail` (verifies every key referenced in the codebase exists in `@umbraculum/i18n` for every shipped locale).
- **E2E**: see the dedicated suite at [`e2e/README.md`](e2e/README.md) — runs in a one-shot Playwright Docker container against the live dev stack.
- **Unit tests**: vitest is not configured in this workspace; component-level testing happens in the sibling `@umbraculum/ui` and `@brewery/recipes-ui` packages, and end-to-end behavior is covered by the Playwright suite. See [`docs/TESTING.md`](../../docs/TESTING.md) §"Layer map" for the per-layer responsibility split.

## How it fits in

- **Consumed by**: end users (via the dev nginx today; via `umbraculum.dev` after the public flip per [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) §10.1).
- **Depends on**: `services/api` (HTTP backend); `@brewery/contracts` (typed responses); `@umbraculum/ui` + `@brewery/recipes-ui` (UI primitives + domain UI); `@umbraculum/i18n` + `@umbraculum/i18n-react` (localization); `@umbraculum/navigation` (route ID system shared with native); `@umbraculum/media` (assets); `@brewery/beerjson` (recipe parsing/normalization); `@umbraculum/brewery-core` (math primitives, gravity/SG conversions).
- **Auth**: cookie-based (`sid` httpOnly). The native sibling rides bearer tokens — the difference is abstracted in `@brewery/api-client`.

## Status

Shipping (work-in-progress). The brewery-vertical UI is the core surface; the AI-consultant panel is integrated as of Sprint #2; charts (gravity, water chemistry) are wired through Victory. Coverage of the second-vertical configurations is on the H1 2027 trajectory per [`docs/ROADMAP.md`](../../docs/ROADMAP.md); the `react-native-web` + Tamagui shape is intentionally chosen so adding a new vertical does not require rewriting the web app.

## Further reading

- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) — platform vision, AI consultant blueprint, public-flip trajectory
- [`docs/architecture-Rev02.md`](../../docs/architecture-Rev02.md) — brewery-vertical implementation log
- [`docs/AUTH-STRATEGY.md`](../../docs/AUTH-STRATEGY.md) — cookie-web + bearer-native + future webview bridge
- [`docs/TAMAGUI.md`](../../docs/TAMAGUI.md) — Tamagui type-system caveats and adaptation strategy
- [`docs/TESTING.md`](../../docs/TESTING.md) — platform-wide test layer map
- [`docs/DOCS-README-STANDARDS.md`](../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`e2e/README.md`](e2e/README.md) — the Playwright E2E sub-suite
