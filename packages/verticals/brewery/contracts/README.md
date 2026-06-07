# @umbraculum/brewery-contracts

Canonical **brewery** vertical (tier-6 reference) contract package: recipe, brew-session, water-chemistry, and gravity-analysis wire types, route schemas, response parsers, and contract-version handshake per [RFC-0002](../../../../docs/rfcs/0002-canonical-module-physical-layout.md) and [RFC-0011](../../../../docs/rfcs/0011-application-surface-shell-layering.md) Decision F.

> [!NOTE]
> Part of [Umbraculum](../../../../README.md) — an open-source toolset for building workspace-shaped operational applications. The brewery vertical is the reference tier-6 configuration ([RFC-0001](../../../../docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5). This package is the **β contracts slice** for `code: brewery`; brewery math/UI packages use the `@umbraculum/brewery-*` prefix per RFC-0002 §4.

## Install

```bash
npm install @umbraculum/brewery-contracts@^0.0.1
```

Public alpha — see [third-party-module.md](../../../../docs/modules/contribute/third-party-module.md).

## What this is

MIT-licensed contract types for the brewery vertical ([`docs/modules/verticals/brewery/README.md`](../../../../docs/modules/verticals/brewery/README.md)).

Exported surfaces (grouped by source subtree):

- **`CONTRACT_VERSION` + `classifyContractVersionSkew`** — version-handshake primitives shared with all `@umbraculum/*-contracts` packages. Phase A version: `0.1.0-alpha.1`.
- **`brewery/`** — recipe CRUD/import/export route schemas, list responses, brew-session shapes, equipment profiles, styles, ingredients, inventory, brewday settings, BeerJSON export envelope.
- **`water/`** — water-profile library schemas, recipe water settings, mash/sparge/boil compute-and-save parsers (`parseMashComputeAndSaveResponse`, etc.), hub-summary parser (`parseRecipeWaterHubSummaryResponse`), derivation/value helpers shared by water UI.
- **`analysis/`** — gravity analysis response schema and `parseGravityAnalysisResponseV1` (efficiency / OG-FG derivations attached to `GET /recipes/:id`).

Platform cross-cutting types (`ErrorResponseSchema`, `AuthMeResponse`, `NumberFormatHintV1`) remain in `@umbraculum/contracts` — this package depends on that package only for format-hint types used inside water/analysis parsers.

## Scope

- **Contains**: Zod schemas, inferred TypeScript types, hand-rolled and Zod parsers, list/get response envelopes, route param/body schemas, `CONTRACT_VERSION`, version-handshake helpers.
- **Does not contain**: Prisma models (those live in [`services/api/prisma/schema.prisma`](../../../../services/api/prisma/schema.prisma) under `@@schema("brewery")`), route handlers (those live in [`services/api/src/modules/brewery/`](../../../../services/api/src/modules/brewery/)), brewing math (`@umbraculum/brewery-core`), BeerJSON editing helpers (`@umbraculum/brewery-beerjson`), or UI components (`@umbraculum/brewery-recipes-ui`).

## Phase coupling

| Phase | What lives here |
|---|---|
| **Contracts (today)** | Zod schemas + parsers + `CONTRACT_VERSION`. **This package.** Extracted from `@umbraculum/contracts` in RFC-0011 Wave 3b (2026-06-06). |
| API | Consumed by [`services/api/src/modules/brewery/`](../../../../services/api/src/modules/brewery/) Fastify routes and [`services/api/src/domain/recipeAnalysis/`](../../../../services/api/src/domain/recipeAnalysis/). |
| Client transport | Consumed by [`packages/verticals/brewery/api-client/`](../api-client/) (`@umbraculum/brewery-api-client`) for runtime-validated fetch helpers. |
| Web / native | Response-side re-parse in brewery hooks under [`apps/web/app/[locale]/(brewery)/`](../../../../apps/web/app/%5Blocale%5D/%28brewery%29/) and [`apps/native/src/modules/brewery/`](../../../../apps/native/src/modules/brewery/) per [RFC-0003](../../../../docs/rfcs/0003-validation-library-adoption.md). |

## Build / test / lint (local)

From repo root (run Node/npm inside the project container, not on the host — see the root [`README.md`](../../../../README.md)):

- **Build**: `npm run build -w @umbraculum/brewery-contracts`
- **Test**: `npm run test -w @umbraculum/brewery-contracts`
- **Typecheck**: `npm run typecheck -w @umbraculum/brewery-contracts`
- **Dist refresh (in-container, committed to CI)**: `bash scripts/build-packages-in-docker.sh`

## Cross-references

- [RFC-0011](../../../../docs/rfcs/0011-application-surface-shell-layering.md) — Decision F (extract brewery wire types from platform contracts).
- [RFC-0002](../../../../docs/rfcs/0002-canonical-module-physical-layout.md) — `packages/<code>-contracts/` placement rule; tier-6 verticals share the same four-slice shape.
- [RFC-0003](../../../../docs/rfcs/0003-validation-library-adoption.md) — Zod-as-canonical-validator rule.
- [`docs/design/pre-flip-application-surface-backbone.md`](../../../../docs/design/pre-flip-application-surface-backbone.md) §6.4 — migration table (no re-export shims from `@umbraculum/contracts`).
- [`services/api/src/modules/brewery/`](../../../../services/api/src/modules/brewery/) — API slice consuming these schemas.
- [`packages/verticals/brewery/api-client/`](../api-client/) — typed client helpers (`@umbraculum/brewery-api-client`).
