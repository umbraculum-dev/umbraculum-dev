# @umbraculum/navigation

Cross-platform route IDs and typed route parameters. The navigation contract shared by web and native.

> [!NOTE]
> Part of [Umbraculum](../../README.md) — the process-manufacturing platform, brewery-configured by default. Brand resolved 2026-05-18; see [`docs/RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md). This package landed under the new `@umbraculum/*` scope as sub-plan #9 slot 3 (2026-05-19); see [`docs/design/brewery-scope-migration-plan.md`](../../docs/design/brewery-scope-migration-plan.md). Current route IDs include brewery-specific entries (e.g. `recipeEdit`, `waterMash`); a content split (`@umbraculum/navigation` framework + `@umbraculum/brewery-navigation` brewery routes) is deferred until a second vertical configuration lands.

## What this is

The platform-neutral navigation contract. Both `apps/web` (Next.js routing) and `apps/native` (React Navigation) refer to the same set of `RouteId` values (`"dashboard"`, `"recipes"`, `"recipeEdit"`, `"waterMash"`, etc.) with the same typed parameter shape per route (`RouteParamsById`). A shared component that wants to navigate uses the typed `RouteRef` union — `{ id: "recipeEdit", params: { recipeId: "abc" } }` — and the host app translates that into its native navigation call (Next.js `<Link href={…}>` or React Navigation `navigation.navigate(…)`). This is the architectural mechanism that lets `@umbraculum/ui` and `@umbraculum/brewery-recipes-ui` ship navigation-aware components without depending on either Next.js or React Navigation.

Two entry points are exported: the default (`@umbraculum/navigation`) for the platform-neutral types + helpers, and a native-flavored variant (`@umbraculum/navigation/native`) that adds React-Navigation-aware integration helpers used only by `apps/native`.

## Scope

- **Contains**: the `RouteId` string-literal union; the `RouteParamsById` map (per-route typed parameters); the `RouteRef` discriminated union; the `AppPlatform` type (`"web" | "native"`); helper utilities for serializing / deserializing `RouteRef` values; the `./native` sub-entrypoint with React Navigation integration adapters.
- **Does not contain**: Next.js routing config (lives in `apps/web/app/[locale]/**` and `apps/web/middleware.ts`); React Navigation stack/tab definitions (live in `apps/native/src/navigation/`); deep-link URL schemes (live in the consuming app's platform config); Expo Router config (the native app uses React Navigation directly per [`docs/architecture-Rev02.md`](../../docs/architecture-Rev02.md)).

## Usage

### Default entry point (web + native + shared UI)

```ts
import type { RouteId, RouteRef, RouteParamsById } from "@umbraculum/navigation";

const target: RouteRef = { id: "recipeEdit", params: { recipeId: "abc" } };
```

A shared component receives a callback like `onNavigate(target: RouteRef)` from the host app and remains agnostic about whether the host is Next.js or React Navigation.

### Native entry point (apps/native only)

```ts
import { … } from "@umbraculum/navigation/native";
```

The `./native` variant exists so the default entry point stays lean for web — Metro bundlers tree-shake the native helpers out of `apps/web` automatically.

## Build / test / lint (local)

This package ships dual-format runtime + types (ESM + CJS + d.ts) for both entry points.

- **Runtime entrypoints**: `dist/index.js` + `dist/native.js`
- **Type entrypoints**: `dist/index.d.ts` + `dist/native.d.ts`

Commands (run from repo root, container-friendly per the [`node-npm-container-only`](../../.cursor/skills/node-npm-container-only.md) rule):

- **Build**: `npm run build:packages` (uses `tsup` with both entry points).
- **Test**: vitest is not yet configured in this workspace; behavior is covered by the consuming apps' E2E suite (`apps/web/e2e/`) and by the typecheck gate (the type system catches misuse of `RouteRef` shapes at compile time, which is the primary correctness guarantee). See [`docs/TESTING.md`](../../docs/TESTING.md) §"Layer map".
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../docs/TYPING.md) §"Per-workspace CI gate" (this workspace carries all 6 candidate strict flags after Phase 6h).

## How it fits in

- **Consumed by**: `apps/web` (Next.js router translates `RouteRef` → `href`); `apps/native` (React Navigation translates `RouteRef` → `navigation.navigate`); `@umbraculum/ui` and `@umbraculum/brewery-recipes-ui` (any platform-neutral component that needs to express "navigate to this target" without pulling in a routing library).
- **Depends on**: nothing in the workspace scope. This package is at the bottom of the package dependency stack alongside `@umbraculum/i18n`, `@umbraculum/contracts`, and `@umbraculum/media` (the latter renamed under sub-plan #9 slot 2; remaining `@brewery/*` packages pending sub-plan #9 slots).

## Status

Stable for the brewery vertical's current route surface. Adding a new route is a three-step change: add the `RouteId` literal, add the typed parameter shape, update the host apps' route maps. The discriminated-union shape forces every host app to handle every route, which is the pattern that catches "we forgot to wire this" at compile time rather than runtime.

## Further reading

- [`docs/architecture-Rev02.md`](../../docs/architecture-Rev02.md) — brewery-vertical implementation log (cross-platform navigation choices)
- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) — platform vision and module boundaries
- [`docs/DOCS-README-STANDARDS.md`](../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
