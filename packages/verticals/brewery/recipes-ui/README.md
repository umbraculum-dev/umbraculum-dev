# @umbraculum/brewery-recipes-ui

Domain UI components for recipes and related brewing workflows (cross-platform: web + native).

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — an open-source toolset for building workspace-shaped operational applications.

## What this is

The recipe-domain UI layer, sitting one tier above `@umbraculum/ui` (which provides platform-neutral primitives). Components in this package are aware of brewing concepts — fermentables, hops, mash steps, water profiles — and orchestrate them into editable views consumed by both `apps/web` and `apps/native`. The package is **adapter-pattern-driven** (see below): app-specific concerns (navigation, API loading, image rendering) are injected as props rather than imported from the consumer's framework, so the same component renders correctly under Next.js and Expo without conditional code paths.

## Scope

- **Contains**: reusable, cross-platform UI for recipe editors and feature widgets (web + native).
- **Does not contain**: Next.js, `next-intl`, React Navigation, Expo Router, or app-specific API/auth wiring.
- **Naming intent**: this package is intentionally recipe-centric (water, yeast, mash editors). As new domains get shared UI, prefer adding new domain packages (e.g. `@umbraculum/brewery-inventory-ui`) rather than turning this into a general “everything UI” bucket.

## Adapter pattern (mandatory)

Shared components accept injected functions/props for:

- **Navigation** (e.g. link handlers)
- **API loading** (web cookie-session vs native bearer)
- **Media rendering** (web `<img>` vs native image component)

## Build / test / lint (local)

This package ships runtime-safe JS + types under `dist/**` so it can be consumed by Metro (React Native) and Next.js without source-level transpilation.

- **Build**: from repo root, `./scripts/build-packages-in-docker.sh` (Docker route — preferred per the `node-npm-container-only` skill shipped by `umbraculum-node-react-cursor-assistant`).
- **Test**: `npm run test --workspace=@umbraculum/brewery-recipes-ui` (vitest in container; see [`docs/TESTING.md`](../../../docs/TESTING.md)).
- **Lint**: `npm run lint --workspace=@umbraculum/brewery-recipes-ui`.
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../../docs/TYPING.md) §"Per-workspace CI gate".

## How it fits in

- **Consumed by**: `apps/web` (recipe editor pages, water hub, brew-day flows); `apps/native` (the native recipe surfaces).
- **Depends on**: `@umbraculum/ui` (primitives), `@umbraculum/contracts` (typed DTOs / parsers), `@umbraculum/i18n-react` (localized strings); does **not** depend on Next.js, Expo, React Navigation, or any app-specific API client.

## Status

Recipe-centric by name and by intent. As new vertical domains land additional shared UI (e.g. `@umbraculum/brewery-inventory-ui`, `@umbraculum/brewery-wms-ui`), they should ship as separate packages rather than expanding this one — see [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) for the platform-level vertical-module shape.

## Further reading

- [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) — platform vision and vertical-module shape
- [`docs/CROSS-PLATFORM-BOUNDARIES.md`](../../../docs/CROSS-PLATFORM-BOUNDARIES.md) — cross-platform UI boundaries
- [`docs/modules/verticals/brewery/IMPLEMENTATION-LOG.md`](../../../docs/modules/verticals/brewery/IMPLEMENTATION-LOG.md) — brewery vertical implementation log
- [`docs/DOCS-README-STANDARDS.md`](../../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
