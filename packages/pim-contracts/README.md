# @umbraculum/pim-contracts

Canonical `pim` module contract package: product / variant / attribute / category / media-ref wire types, write request schemas, and contract-version handshake per [RFC-0004](../../docs/rfcs/0004-canonical-pim.md).

> [!NOTE]
> Part of [Umbraculum](../../README.md) — an open-source toolset for building workspace-shaped operational applications. Sixth canonical module ([RFC-0001](../../docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md) Decision B + [RFC-0004](../../docs/rfcs/0004-canonical-pim.md)); first allocation under the post-`automation` "open-door" precedent — RFC-0001 §4.2 YAGNI explicitly stretched (rationale: platform-owner-driven implementation, not speculative reservation; see RFC-0004 §3.1). Package landed under the `@umbraculum/*` scope from the start, so no rename history applies.

## What this is

MIT-licensed contract types for the canonical `pim` module ([`docs/design/canonical-pim-module-surface.md`](../../docs/design/canonical-pim-module-surface.md), authored alongside Phase B+C delivery).

Six exported surfaces:

- **`CONTRACT_VERSION` + `classifyContractVersionSkew`** — version-handshake primitives shared with all `@umbraculum/*-contracts` packages. Same `major → refuse / minor → warn / patch → silent` policy as `@umbraculum/automation-contracts`. Phase A version: `0.1.0-alpha.1`.
- **`ProductSchema` / `ProductRefSchema` / `ProductStatusSchema`** — master product wire shape (id, workspaceId, sku, name, status, optional `primaryAttributeSetId`) + by-id reference shape + list/get response envelopes + create/update request schemas.
- **`VariantSchema` / `VariantRefSchema`** — per-product variant wire shape with `attributeValues` discriminated-union map keyed by attribute code + create/update request schemas.
- **`AttributeSchema` / `AttributeTypeSchema` / `AttributeValueSchema`** — attribute definition (8-value type union: `string|number|boolean|date|select|multiselect|media_ref|reference`) + value-side discriminated union + create/update request schemas.
- **`AttributeSetSchema` / `CategorySchema` / `CategoryTreeNodeSchema`** — attribute-set grouping + category multi-rooted tree (nullable `parentId`) + create/update request schemas.
- **`MediaAssetRefSchema` / `MediaAssetRoleSchema`** — opaque reference into `@umbraculum/media` (`primary|gallery|swatch|document`) + create/update request schemas. PIM owns the *reference*, not the pipeline; this is the canonical-vs-canonical boundary.
- **`PimDeleteResponseSchema`** — shared `{ ok: true }` mutation delete envelope.

## Scope

- **Contains**: Zod schemas, inferred TypeScript types, `CONTRACT_VERSION`, list/get response envelopes, create/update request schemas, delete response envelope, version-handshake helpers.
- **Does not contain**: Prisma models (those live in [`services/api/prisma/schema.prisma`](../../services/api/prisma/schema.prisma) under `@@schema("pim")`), route handlers (those live in [`services/api/src/modules/pim/`](../../services/api/src/modules/pim/)), media-asset binary pipeline (owned by `@umbraculum/media`), or vendor-specific channel-feed contracts (future commerce/PIM-feed work).

## Phase coupling

| Phase | What lives here |
|---|---|
| **A — Contracts (today)** | Zod schemas + `CONTRACT_VERSION` constant. **This package.** |
| B — Read path (today) | Consumed by [`services/api/src/modules/pim/`](../../services/api/src/modules/pim/) (Prisma services, `GET /pim/*` routes). |
| C — Web admin (today) | Consumed by [`apps/web/app/[locale]/(pim)/`](../../apps/web/app/%5Blocale%5D/%28pim%29/) Tamagui admin pages (response-side re-parse for defense in depth per [RFC-0003](../../docs/rfcs/0003-validation-library-adoption.md)). |
| D — Cross-module integration (today, Option B) | Phase D integration test ([`services/api/src/tests/pimBreweryIntegration.test.ts`](../../services/api/src/tests/pimBreweryIntegration.test.ts)) exercises PIM + brewery module composition without a brewery-side schema link; "Option A" (real `Recipe.pimProductId` FK) is queued as tech debt — see [`docs/design/canonical-pim-module-surface.md`](../../docs/design/canonical-pim-module-surface.md) §"Open work". |
| E — Write paths (today) | Create/update request schemas plus shared delete envelope for the API mutation routes. AI proposal tools and full web edit/delete UX remain follow-on work. |
| F — Channel feeds (partial today) | Vendor-neutral product-catalog CSV is shipped through the rendering pipeline; vendor-specific storefront / marketplace projections remain deferred. |

## Build / test / lint (local)

From repo root (run Node/npm inside the project container, not on the host — see the root [`README.md`](../../README.md) for service/container setup; the local-only `DEVELOPMENT-LOCAL.md` is per-developer and gitignored):

- **Build**: `npm run build -w @umbraculum/pim-contracts`
- **Test**: `npm run test -w @umbraculum/pim-contracts`
- **Typecheck**: `npm run typecheck -w @umbraculum/pim-contracts`
- **Dist refresh (in-container, committed to CI)**: `bash scripts/build-packages-in-docker.sh`

## Cross-references

- [RFC-0004](../../docs/rfcs/0004-canonical-pim.md) — canonical PIM allocation, phasing, scope boundary vs other canonicals.
- [RFC-0001](../../docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md) §Decision B — reserved canonical codes (six codes including `pim`).
- [RFC-0002](../../docs/rfcs/0002-canonical-module-physical-layout.md) — `packages/<code>-contracts/` placement rule.
- [RFC-0003](../../docs/rfcs/0003-validation-library-adoption.md) — Zod-as-canonical-validator rule; response-side re-parse for defense in depth.
- [`docs/design/canonical-pim-module-surface.md`](../../docs/design/canonical-pim-module-surface.md) — surface design doc (post-implementation, authored as part of Phase D).
- [`docs/modules/canonical/pim.md`](../../docs/modules/canonical/pim.md) — public module page.
- [`services/api/src/modules/pim/`](../../services/api/src/modules/pim/) — Phase B API slice consuming these schemas.
- [`apps/web/app/[locale]/(pim)/`](../../apps/web/app/%5Blocale%5D/%28pim%29/) — Phase C/E Tamagui admin pages consuming these schemas.
- [`packages/module-sdk/`](../module-sdk/) — peer SDK; `registerPimModule(app)` calls `registerModule({ code: "pim", prismaSchema: "pim" })`.
