# @brewery/beerjson

Typed BeerJSON wrapper + editor-row helpers — the canonical brewing-recipe interchange format for Umbraculum's brewery vertical.

> [!NOTE]
> Part of [Umbraculum](../../README.md) — the process-manufacturing platform, brewery-configured by default. Brand resolved 2026-05-18; see [`docs/RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md). The npm scope `@brewery/*` is parked pending sub-plan #9 ([`RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md) §10); do not rewrite import paths.

## What this is

The platform's BeerJSON adaptation layer. The brewery vertical is **BeerJSON-first** — every recipe is canonically modeled as a BeerJSON document, with BeerXML supported only as an import path (see [`docs/BEERJSON-FIRST.md`](../../docs/BEERJSON-FIRST.md) for the strict-export discipline). This package wraps the upstream `@beerjson/beerjson` schema with TypeScript types tuned for our editor surface, plus a small library of "editor-row" helpers that translate between the on-disk BeerJSON shape and the in-memory shape consumed by `@brewery/recipes-ui` editors (grist rows, hop rows, water-profile rows, etc.). Pure conversions like SG ↔ Plato come from `@brewery/core`; this package focuses on schema-aware transformations.

Math primitives (gravity / SG conversions, unit normalization) live in `@brewery/core` rather than here, so non-recipe surfaces can use them without pulling in BeerJSON-specific types.

## Scope

- **Contains**: BeerJSON-aware TypeScript types (`BeerJsonRecipe`, `BeerJsonDocument`, `EditorGristRow`, etc.); editor-row converters between BeerJSON and the editor-friendly in-memory shape; `parseValueWithUnit` and similar BeerJSON-shaped value extractors; re-exports of `sgToPlato` from `@brewery/core` for editor-side ergonomics; a vitest suite (`src/index.test.ts`) covering the converters.
- **Does not contain**: the upstream BeerJSON schema itself (lives in `@beerjson/beerjson`); BeerXML import logic (lives in `services/api/src/importers/`); the editor UI (lives in `@brewery/recipes-ui`); pure math primitives that don't need BeerJSON shape (live in `@brewery/core`).

## Usage

```ts
import { sgToPlato, type EditorGristRow } from "@brewery/beerjson";

const plato = sgToPlato(1.052);
```

Detailed editor-row conversion examples live next to the editor that consumes them in `@brewery/recipes-ui`; this package is the type/converter source-of-truth, not the docs surface for editor behavior.

## Build / test / lint (local)

This package ships dual-format runtime + types (ESM + CJS + d.ts) so it can be consumed by Metro (React Native), Next.js, and the Node-side API service.

- **Runtime entrypoint**: `dist/index.js` (ESM) / `dist/index.cjs` (CJS)
- **Type entrypoint**: `dist/index.d.ts`

Commands (run from repo root, container-friendly per the [`node-npm-container-only`](../../.cursor/skills/node-npm-container-only.md) rule):

- **Build**: `npm run build:packages` (uses `tsup` per the package.json `build` script).
- **Test**: `npm run test --workspace=@brewery/beerjson` (vitest in container; see [`docs/TESTING.md`](../../docs/TESTING.md)).
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../docs/TYPING.md) §"Per-workspace CI gate" (this workspace landed `exactOptionalPropertyTypes` in Phase 6g — one of the 5 deferred workspaces — and carries all 6 candidate strict flags after Phase 6h).

## How it fits in

- **Consumed by**: `apps/web`, `apps/native`, `services/api` (BeerJSON parsing on import), `@brewery/recipes-ui` (editor-row converters).
- **Depends on**: `@brewery/core` (re-exports `sgToPlato`); the upstream `@beerjson/beerjson` schema (referenced through `services/api`'s direct dependency, not bundled here).

## Status

Stable for the editor surfaces shipping today. The strict-export discipline ([`docs/BEERJSON-FIRST.md`](../../docs/BEERJSON-FIRST.md)) is the architectural anchor: when a new field needs to round-trip through a recipe, BeerJSON gets it first and the editor converters follow.

## Further reading

- [`docs/BEERJSON-FIRST.md`](../../docs/BEERJSON-FIRST.md) — BeerJSON-first data model and strict-export discipline
- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) — platform vision
- [`docs/DOCS-README-STANDARDS.md`](../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`docs/RAW-MATERIALS-SEEDABLE-SOURCES.md`](../../docs/RAW-MATERIALS-SEEDABLE-SOURCES.md) — ingredient datasets that map onto BeerJSON shapes
