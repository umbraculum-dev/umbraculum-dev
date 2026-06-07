# Canonical `pim` module surface — design

**Tier:** Public  
**Status:** As-built post-implementation 2026-05-20; updated by RFC-0007 PR7 channel-feed rendering work and PIM Phase E read/write work (Phase A + B + C + D-integration-test-Option-B landed in one tranche per [`docs/design/canonical-pim-build-log.md`](canonical-pim-build-log.md); core team approval implicit via solo-dev internal-alpha project posture per [`MANIFESTO.md`](../../MANIFESTO.md) §1.2)<br>
**Audience:** core team, PIM-vertical maintainers, future commerce / channel-feed implementors, module SDK authors  
**Resolves:** [RFC-0004](../rfcs/0004-canonical-pim.md) §7 ("Phase A delivers contracts; Phase B delivers read path; Phase C delivers web admin; surface doc lands post-implementation")  
**Builds on:** [RFC-0001](../rfcs/0001-modules-tiers-governance-and-automation-placement.md), [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md), [RFC-0003](../rfcs/0003-validation-library-adoption.md), [RFC-0004](../rfcs/0004-canonical-pim.md), [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.4, §6, [`packages/modules/module-sdk/README.md`](../../packages/modules/module-sdk/README.md), [`docs/design/canonical-automation-module-surface.md`](canonical-automation-module-surface.md) (sibling template)

> **Disclaimer.** Documents the as-built shape of canonical `pim` after the Phase A+B+C+D tranche. Does not allocate the canonical code (RFC-0004 did that), does not change licenses, and does not pre-commit any other canonical module's shape. The "Open work" section explicitly distinguishes "done" from "deferred" from "queued tech debt" — read it before assuming any expected surface is already shipped.

---

## 1. Summary

[RFC-0004](../rfcs/0004-canonical-pim.md) committed `pim` as the sixth canonical module under an explicit RFC-0001 §4.2 YAGNI stretch — "platform-owner-driven implementation, not speculative reservation." This document is the post-implementation surface record: what got built, where the lane boundaries with other canonicals landed, and what is queued for follow-on phases.

| Layer | β-layout location | Shipped today |
|---|---|---|
| Contracts | [`packages/modules/pim-contracts/`](../../packages/modules/pim-contracts/) | `CONTRACT_VERSION 0.1.0-alpha.1`, 6 entity-family Zod schemas (Product, Variant, AttributeSet, Attribute, Category, MediaAssetRef), create/update request schemas, response envelopes, delete envelope |
| API | [`services/api/src/modules/pim/`](../../services/api/src/modules/pim/) | `registerPimModule(app)`, 6 workspace-scoped services, read/write routes for all six entity families, 1 channel-feed job route (`POST /pim/channel-feeds/product-catalog-csv/jobs`) |
| AI tools | [`services/api/src/services/ai/tools/pim/`](../../services/api/src/services/ai/tools/pim/) | 4 read-only tools (`pim.searchProducts`, `pim.getProductDetail`, `pim.listCategories`, `pim.listAttributeSets`) registered alongside brewery + automation tools |
| Web admin | [`apps/web/app/[locale]/(pim)/`](../../apps/web/app/%5Blocale%5D/%28pim%29/) | 5 Tamagui pages (product list/create at `/en/products`, product detail at `/en/products/<id>`, categories tree at `/en/categories`, attribute-set list at `/en/attribute-sets`, attribute-set detail at `/en/attribute-sets/<id>`), `pim.*` i18n namespace (en + it). Aligned with Week-1 audit (RFC-0006 + [`web-route-group-audit.md`](web-route-group-audit.md)). |
| Persistence | [`services/api/prisma/schema.prisma`](../../services/api/prisma/schema.prisma) §pim | 6 tables under `@@schema("pim")`, multi-rooted category tree, workspace-scoped uniqueness on every workspace-owned entity, single migration `20260519224732_pim_phase_b_tables` |
| Integration test | [`services/api/src/tests/pimBreweryIntegration.test.ts`](../../services/api/src/tests/pimBreweryIntegration.test.ts) | Option-B test proving module composition + reference-not-copy semantics; Option-A queued in §"Open work" |

L2 cross-workspace isolation coverage: read-route coverage across products, variants, attribute sets, and categories, plus Phase E write/read-gap coverage for all six entity families, all green in the targeted PIM API test run.

---

## 2. Problem statement

Three concerns must not collapse:

1. **Master product data** must be canonical for any platform consumer (e.g. brewery recipes referencing a finished-good "Pale Ale 500ml bottle", future commerce channels listing the same SKU, MRP/WMS planning the same physical unit).
2. **Attribute modeling** (typed schemas, attribute sets per family, multi-value units, swatches, media refs) is enterprise-grade by default — collapsing this into per-vertical bespoke columns is the classic Pimcore/Akeneo replacement pattern that this project rejects.
3. **Channel feeds and storefront projections** are read-only consumers of the same master; PIM must not become "the place where every storefront contract lands" — those belong to dedicated commerce modules wired around PIM as a sibling.

Conflating these surfaces produces three failure modes well-documented in the PIM vertical:

- **Single-vertical capture**: master product knowledge gets buried inside one consumer's schema (brewery `Recipe`, or a `wms` `StockItem`), and the second consumer has to either duplicate it or reach across module boundaries.
- **Attribute drift**: each consumer defines its own attribute set, leading to "is this the same `color = red` as the other module's `color = red`?" questions across joins.
- **Storefront-bias**: PIM gets reshaped around whichever commerce channel ships first, and subsequent channels inherit the bias as load-bearing.

Canonical `pim` exists to avoid these failure modes by owning the master, the attribute-set framework, and the reference-by-id contract — and nothing else.

---

## 3. Domain scope

### 3.1 In scope (this module owns)

- **Master product identity** — `Product` (id, workspaceId, sku, name, status, optional `primaryAttributeSetId`).
- **Variant identity** — `Variant` (per-product child with its own SKU and `attributeValues`).
- **Attribute framework** — `Attribute` (typed: 8-value union covering primitives + select/multiselect + media-ref + reference), `AttributeSet` (named groupings tied to product families).
- **Category taxonomy** — `Category` (multi-rooted tree via nullable `parentId`).
- **Media reference** — `MediaAssetRef` (opaque pointer into `@umbraculum/media` with a `role` enum: `primary|gallery|swatch|document`). PIM owns the *reference*, not the binary pipeline.
- **Read/write APIs + AI tools** — list/get and `POST/PATCH/DELETE` for every entity family; AI tools remain read-only for the four primitives most likely to be composed by a conversational agent.

### 3.2 Out of scope (other canonicals or sister modules own)

| Concern | Owner | Why not here |
|---|---|---|
| Inventory levels, stock-on-hand, picking | `wms` (canonical, reserved code) | PIM is master-data; WMS is operational-state |
| Production planning, BOM expansion, work orders | `mrp` (canonical, reserved code) | Same separation: master vs operational |
| Customer-facing storefronts, cart, checkout | A future `commerce` (or vertical-specific) module | PIM master should serve N storefronts, none of which it knows about |
| Recipe authoring (brewery-vertical) | Brewery vertical routes under `services/api/src/modules/brewery/routes/`; future canonical `recipes` module if allocated | Recipe ≠ Product; a recipe *references* a PIM product, doesn't replace it. Today the link is uni-directional service-layer (no FK) — see Open work §6 |
| Binary media pipeline (uploads, transforms, CDN) | `@umbraculum/media` package | PIM only references media-asset IDs |
| Pricing rules, discount engines | Out of scope project-wide for now | Will land as a sibling canonical when needed |
| Vendor-specific channel-feed projections (Shopify, Amazon, etc.) | Future PIM Phase F or sibling commerce canonical | PIM is the source; PR7 only ships the vendor-neutral product-catalog CSV proof through RFC-0007 rendering |

### 3.3 Boundary with `automation`

PIM and `automation` are sibling canonicals with **zero shared schema**. The architectural claim PIM honors:

- An automation vessel may carry a fermenting product (in the brewery vertical, "Pale Ale 500ml bottle" pre-bottling), but the link — if any — lives in a future brewery-vertical join model, **not** as a PIM-side FK to `Vessel` and **not** as an automation-side FK to `Product`.
- Each module owns its own surface; cross-module reference is by id, validated at the consumer's boundary.

---

## 4. As-built surface — Phase A contracts

[`packages/modules/pim-contracts/`](../../packages/modules/pim-contracts/) — Zod-only contracts package, MIT-licensed, ESM+CJS dual emit per [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md) Decision C.

Public exports (six surface families):

- `CONTRACT_VERSION` + `classifyContractVersionSkew` + `parseSemVer` — version handshake primitives, semantics shared with `@umbraculum/automation-contracts` (major → refuse, minor → warn, patch → silent). Initial version `0.1.0-alpha.1`.
- `ProductSchema` / `ProductRefSchema` / `ProductStatusSchema` + create/update request schemas + response envelopes (`ProductListResponseSchema`, `ProductGetResponseSchema`).
- `VariantSchema` / `VariantRefSchema` + create/update request schemas + response envelopes. `attributeValues` is a discriminated-union map keyed by attribute code.
- `AttributeSchema` / `AttributeTypeSchema` / `AttributeValueSchema` + create/update request schemas + response envelopes. `AttributeType` is an 8-value literal union.
- `AttributeSetSchema` / `AttributeSetRefSchema` + create/update request schemas + response envelopes.
- `CategorySchema` / `CategoryTreeNodeSchema` + create/update request schemas + response envelopes. List response carries both flat `items` and built `tree`.
- `MediaAssetRefSchema` / `MediaAssetRoleSchema` + create/update request schemas + list/get response envelopes. Opaque ID-only reference into `@umbraculum/media`.
- `PimDeleteResponseSchema` — shared `{ ok: true }` delete envelope for Phase E mutation routes.

Test coverage: focused schema tests for entity responses, version skew, and Phase E write request validation. Strict-flag verification: 6/6 (strict, noImplicitOverride, noPropertyAccessFromIndexSignature, noUncheckedIndexedAccess, exactOptionalPropertyTypes, verbatimModuleSyntax) — see build-log §"Gate-skill re-verification" for the historical run record.

---

## 5. As-built surface — Phase B API + Prisma

### 5.1 Prisma schema

Added to [`services/api/prisma/schema.prisma`](../../services/api/prisma/schema.prisma):

- `datasource db.schemas` extended to `["public", "automation", "pim"]`.
- 6 models, all `@@schema("pim")`, table-mapped to snake-case (`products`, `variants`, `attribute_sets`, `attributes`, `categories`, `media_asset_refs`):
  - `PimProduct` — unique `(workspaceId, sku)`, indexed by `workspaceId`, optional FK to `PimAttributeSet`.
  - `PimVariant` — unique `(productId, sku)`, indexed by `productId`, cascade-deleted with the parent product.
  - `PimAttributeSet` — unique `(workspaceId, code)`, holds `attributeIds: String[]` (postgres array; no FK constraint, validated at service-layer for now).
  - `PimAttribute` — unique `(workspaceId, code)`, typed `type: String` (validated against the contracts-side `AttributeTypeSchema` literal union).
  - `PimCategory` — unique `(workspaceId, code)`, self-referencing tree via nullable `parentId` + `CategoryTree` relation.
  - `PimMediaAssetRef` — indexed by `productId`, cascade-deleted with the parent product.

Single migration: `services/api/prisma/migrations/20260519224732_pim_phase_b_tables/migration.sql`.

### 5.2 Service layer

[`services/api/src/modules/pim/services/`](../../services/api/src/modules/pim/services/):

- `ProductsService` — `listProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`.
- `VariantsService` — `listVariantsForProduct(workspaceId, productId)`, `getVariantById`, `createVariantForProduct`, `updateVariant`, `deleteVariant`.
- `AttributesService` — `listAttributes`, `getAttributeById`, `createAttribute`, `updateAttribute`, `deleteAttribute`.
- `AttributeSetsService` — `listAttributeSets`, `getAttributeSetById`, `createAttributeSet`, `updateAttributeSet`, `deleteAttributeSet`.
- `CategoriesService` — `listCategories` (returns both flat `items` and built `tree`), `getCategoryById`, `createCategory`, `updateCategory`, `deleteCategory`.
- `MediaAssetRefsService` — `listMediaAssetRefsForProduct`, `getMediaAssetRefById`, `createMediaAssetRefForProduct`, `updateMediaAssetRef`, `deleteMediaAssetRef`.

Every service method:

- Takes `userId, workspaceId` as the first two arguments (canonical workspace-scoping pattern).
- Calls `workspaces.assertMembership(userId, workspaceId)` before any Prisma read or write.
- Returns Zod-parsed shapes (defense in depth per [RFC-0003](../rfcs/0003-validation-library-adoption.md) Decision A — no raw Prisma rows leak past the service boundary).
- Throws `NotFoundError` from [`services/api/src/errors.ts`](../../services/api/src/errors.ts) on misses; error code is the resource-specific token (`product_not_found`, `variant_not_found`, `attribute_not_found`, `attribute_set_not_found`, `category_not_found`, `media_asset_ref_not_found`).

### 5.3 Routes

[`services/api/src/modules/pim/routes/`](../../services/api/src/modules/pim/routes/):

| Route | Method | Source file |
|---|---|---|
| `/pim/products` | GET | `productsRoutes.ts` |
| `/pim/products` | POST | `productsRoutes.ts` |
| `/pim/products/:productId` | GET | `productsRoutes.ts` |
| `/pim/products/:productId` | PATCH, DELETE | `productsRoutes.ts` |
| `/pim/products/:productId/variants` | GET | `variantsRoutes.ts` |
| `/pim/products/:productId/variants` | POST | `variantsRoutes.ts` |
| `/pim/variants/:variantId` | GET | `variantsRoutes.ts` |
| `/pim/variants/:variantId` | PATCH, DELETE | `variantsRoutes.ts` |
| `/pim/attributes` | GET, POST | `attributesRoutes.ts` |
| `/pim/attributes/:attributeId` | GET, PATCH, DELETE | `attributesRoutes.ts` |
| `/pim/attribute-sets` | GET | `attributeSetsRoutes.ts` |
| `/pim/attribute-sets` | POST | `attributeSetsRoutes.ts` |
| `/pim/attribute-sets/:setId` | GET | `attributeSetsRoutes.ts` |
| `/pim/attribute-sets/:setId` | PATCH, DELETE | `attributeSetsRoutes.ts` |
| `/pim/categories` | GET | `categoriesRoutes.ts` |
| `/pim/categories` | POST | `categoriesRoutes.ts` |
| `/pim/categories/:categoryId` | GET | `categoriesRoutes.ts` |
| `/pim/categories/:categoryId` | PATCH, DELETE | `categoriesRoutes.ts` |
| `/pim/products/:productId/media-asset-refs` | GET, POST | `mediaAssetRefsRoutes.ts` |
| `/pim/media-asset-refs/:mediaAssetRefId` | GET, PATCH, DELETE | `mediaAssetRefsRoutes.ts` |

Every route calls `requireActiveWorkspace(req)` first, parses URL params via inline Zod, and re-validates the outgoing response with the contracts-side envelope schema before returning. The route-level re-parse is the second of the three RFC-0003 §"defense-in-depth" boundary points; the third is the web-side re-parse in §6 below.

### 5.4 Module registration

[`services/api/src/modules/pim/index.ts`](../../services/api/src/modules/pim/index.ts) exports `registerPimModule(app)`, which calls `registerModule({ code: "pim", prismaSchema: "pim" })` from `@umbraculum/module-sdk` and registers all six route families.

[`services/api/src/app.ts`](../../services/api/src/app.ts) wires it alongside `registerAutomationModule(app)`:

```ts
registerAutomationModule(app);
registerPimModule(app);
```

### 5.5 Channel-feed rendering

RFC-0007 PR7 adds the first rendering-backed PIM feed:

- Document template: `pim:product-catalog-csv@v1` in [`services/api/src/modules/pim/documentTemplates.ts`](../../services/api/src/modules/pim/documentTemplates.ts).
- Submission route: `POST /pim/channel-feeds/product-catalog-csv/jobs` in [`services/api/src/modules/pim/routes/channelFeedsRoutes.ts`](../../services/api/src/modules/pim/routes/channelFeedsRoutes.ts).
- Data source: active PIM products plus their variants in the active workspace, snapshotted by [`ProductCatalogFeedService`](../../services/api/src/modules/pim/services/productCatalogFeedService.ts).
- Delivery: async `persist-to-media` rendering job using the canonical API rendering runner and the `@umbraculum/rendering` CSV adapter.

This is intentionally vendor-neutral. Google Shopping, Amazon, Shopify, and Akeneo-specific contract shapes remain future feed adapters or a commerce-module concern.

### 5.6 AI tools

[`services/api/src/services/ai/tools/pim/`](../../services/api/src/services/ai/tools/pim/): four read-only tools, each a thin wrapper over a service-layer call:

- `pim.searchProducts(query: string)` — lists products, filters by name/sku LIKE.
- `pim.getProductDetail(productId: string)` — getProductById.
- `pim.listCategories()` — categoriesService.list.
- `pim.listAttributeSets()` — attributeSetsService.list.

Registered in `app.ts` alongside brewery + automation tools — see Phase D §"integration test" for the proof that no tool-registry conflict arises.

---

## 6. As-built surface — Phase C web

[`apps/web/app/[locale]/(pim)/`](../../apps/web/app/%5Blocale%5D/%28pim%29/) — five Tamagui pages, cookie-auth via `useRequireAuth({ requireActiveWorkspace: true })`, defense-in-depth response re-parse via contracts schemas. Route group `(pim)/` contains three static sub-segments (`products/`, `categories/`, `attribute-sets/`) declared via `registerWebModule({ ownedUrlSegments: ["products", "categories", "attribute-sets"] })` and enforced at build time by `scripts/check-web-url-segments.ts`. The route group itself does not contribute a URL segment per RFC-0002 §3; URLs are flat (`/en/products`, etc.).

| Page | Route | Source |
|---|---|---|
| Product list + create draft product | `/{locale}/products` | `(pim)/products/page.tsx` |
| Product detail | `/{locale}/products/{productId}` | `(pim)/products/[productId]/page.tsx` |
| Categories tree | `/{locale}/categories` | `(pim)/categories/page.tsx` |
| Attribute-set list | `/{locale}/attribute-sets` | `(pim)/attribute-sets/page.tsx` |
| Attribute-set detail | `/{locale}/attribute-sets/{setId}` | `(pim)/attribute-sets/[setId]/page.tsx` |

i18n namespace: `pim.*` in [`packages/platform/i18n/src/en.json`](../../packages/platform/i18n/src/en.json) and [`packages/platform/i18n/src/it.json`](../../packages/platform/i18n/src/it.json), dist artifacts rebuilt.

**Closed (Week 1 audit) — route-group layout aligned.** The original directory was `pim/` (URL-axis) rather than the canonical `(pim)/` route-group convention. Both that and the `(automation)/` reference's group-root `page.tsx` collision were resolved by the Week-1 audit ([`web-route-group-audit.md`](web-route-group-audit.md)) + [RFC-0006](../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md). Current state: PIM lives at `(pim)/` with three static sub-segments owned via `registerWebModule({ ownedUrlSegments: ["products", "categories", "attribute-sets"] })`; automation lives at `(automation)/vessels/` (no group-root page, no group-root dynamic segment) with `ownedUrlSegments: ["vessels"]`. The two β disciplines (no `(<code>)/page.tsx`, no `(<code>)/[<dynamic>]/page.tsx` at the group root) are enforced by `scripts/check-web-url-segments.ts` in CI.

---

## 7. As-built surface — Phase D integration

[`services/api/src/tests/pimBreweryIntegration.test.ts`](../../services/api/src/tests/pimBreweryIntegration.test.ts) — two cross-module assertions per the "Option B" pattern locked down before execution (see §"Open work" §6 for the rejected Option A and its queued tech debt):

1. **Module composition** — `GET /recipes` (brewery vertical route, now registered from `services/api/src/modules/brewery/`) and `GET /pim/products` (canonical β-layout) both return 200 in the same Fastify app instance, proving registration of `registerPimModule(app)` alongside `registerBreweryModule(app)` produces no route conflict.
2. **Reference-not-copy semantics** — read a PIM product via the public HTTP surface, mutate it directly through Prisma (write APIs are out of scope for this tranche), re-read via the public HTTP surface; the new name appears immediately, proving no cached projection blocks freshness.

The test bypasses the brewery schema entirely (it does not create a brewery `Recipe` that references the PIM product). That is by design — the architectural claim being demonstrated is module composition + reference semantics, not cross-module FK linkage, which is queued as Option A.

---

## 8. Open work — what is deferred, what is tech debt

### 8.1 Option A — real brewery↔PIM FK integration (tech debt, "when possible")

The Phase D integration test uses **Option B** (no schema change). The originally-planned **Option A** — add a nullable `pimProductId String?` field to the brewery `Recipe` model, seed a recipe that references a PIM product, mutate the PIM product, assert the brewery-side recipe view reflects the new name through a join — is **deliberately queued** as tech debt. Set it up when:

- The brewery `Recipe` schema is being modified for adjacent reasons (zero marginal cost to add the FK column then).
- A focused cross-module integration sprint is justified (e.g. before PIM goes beyond alpha posture, or before a second canonical module wants the same shape).
- The route-group architectural audit lands and clarifies the broader cross-module layering posture.

Option A artifacts (when authored):

- One Prisma migration extending `recipes` with `pim_product_id UUID NULL` + soft FK to `pim.products(id)` (cross-schema FK; verify Prisma multi-schema supports this).
- A `pimProductId?: string` field on the contracts-side recipe schema.
- A second variant of [`pimBreweryIntegration.test.ts`](../../services/api/src/tests/pimBreweryIntegration.test.ts) that exercises the FK round-trip.
- Update of this surface doc §7 to mark Option A "shipped" and demote Option B to "first-iteration variant".

### 8.2 Write paths — CLOSED for API, partial for web UX

PIM Phase E wires `POST/PATCH/DELETE` for all six entity families and adds a minimal draft-product creation path to `/en/products`. Remaining UX and AI implications:

- AI tool registry gets `pim.proposeProduct`, `pim.proposeVariant`, etc. — proposal-only (human-in-the-loop), modeled on the automation Phase E pattern.
- Full edit/delete UI for every entity family is still deferred; only the product create flow is shipped.
- Dedicated web read pages for attributes and media-asset refs are still deferred; their API read/write surfaces are shipped.

### 8.3 Channel-feed projections

**Partially shipped by RFC-0007 PR7.** The first feed is vendor-neutral `pim:product-catalog-csv@v1`, submitted via `POST /pim/channel-feeds/product-catalog-csv/jobs` and rendered through the canonical rendering pipeline.

Vendor-specific storefront / marketplace projections are still out of scope. When they land, they belong in either a sibling commerce canonical (preferred) or a `pim-feeds/` submodule — **not** inside `packages/modules/pim-contracts/` (which must stay vendor-agnostic).

### 8.4 Nav-menu entry — CLOSED

PIM now carries a "Products" entry in [`apps/web/app/_components/PrimaryNav.tsx`](../../apps/web/app/_components/PrimaryNav.tsx) (`href: "/products"`, `label: t("pim")`) wired in by the Week-1 audit (RFC-0006 Phase 5). The audit also added the `nav.pim` translation key to `packages/platform/i18n/src/{en,it}.json`. Adding the nav entry was deferred at PIM Phase C only because the route-group shape was still in flux; with the audit closed, the entry is in place.

### 8.5 Cross-module FK columns to other canonicals

When `mrp`, `wms`, or `crm` land, they will need columns referencing `pim.products.id`. The design constraint per §3.3 is that those FKs live in the consumer's schema, not in `pim`'s. PIM exposes `ProductRefSchema` (`{ productId: string }`) as the canonical reference shape; consumers should adopt it verbatim.

### 8.6 Web route-group audit — CLOSED

[`docs/design/web-route-group-audit.md`](web-route-group-audit.md) accepted 2026-05-21. Ratified the two β disciplines (no `(<code>)/page.tsx`, no `(<code>)/[<dynamic>]/page.tsx` at the route-group root), the URL-segment registry surface in `@umbraculum/module-sdk`, and the corrective for both PIM (`pim/` → `(pim)/` with three static sub-segments) and automation (`(automation)/page.tsx` + `(automation)/[vesselCode]/page.tsx` → `(automation)/vessels/page.tsx` + `(automation)/vessels/[vesselCode]/page.tsx`). Brewery file-move pulled forward by [RFC-0006](../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) in the same tranche. PIM is fully aligned.

### 8.7 Media-asset role enum hardening

`MediaAssetRefSchema` currently accepts `role: "primary"|"gallery"|"swatch"|"document"` as a literal union. When the `@umbraculum/media` package formalizes its own role taxonomy, the PIM enum should be re-derived from the canonical media source (or paired via a contract-version handshake), not maintained in parallel.

---

## 9. Non-goals

- **PIM is not a search engine.** `pim.searchProducts` is a thin LIKE filter; full-text / vector / faceted search will live in a dedicated module if/when needed.
- **PIM does not own attribute-value units conversion.** Units are part of the typed `AttributeValue` payload; conversion between them is the consumer's concern (or a future shared `@umbraculum/units` package).
- **PIM does not enforce brand / catalog hierarchies beyond categories.** "Brand", "season", "collection" etc. are modeled as attributes inside attribute sets, not as first-class hierarchies.
- **PIM does not implement i18n of attribute values.** `Attribute.label` is a single locale string; localized attribute labels are a Phase E concern.
- **PIM does not own the storefront contract.** Channel-feed projections (Shopify, Amazon, etc.) belong to a sibling commerce canonical, not here. See §3.2.

---

## 10. References

- [RFC-0001](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) Decision B — reserved canonical codes (six codes including `pim`).
- [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md) — β-layout for canonical modules.
- [RFC-0003](../rfcs/0003-validation-library-adoption.md) Decision A — Zod-as-canonical-validator + defense-in-depth re-parse at every boundary.
- [RFC-0004](../rfcs/0004-canonical-pim.md) — canonical PIM allocation, phasing, YAGNI-stretch rationale.
- [`docs/design/canonical-automation-module-surface.md`](canonical-automation-module-surface.md) — sibling surface doc; structural template for this one.
- [`docs/design/canonical-pim-build-log.md`](canonical-pim-build-log.md) — implementation log (executor, model, timing, gate-skill outputs, lessons learned).
- [`packages/modules/pim-contracts/`](../../packages/modules/pim-contracts/) — Phase A contracts.
- [`services/api/src/modules/pim/`](../../services/api/src/modules/pim/) — Phase B API slice.
- [`apps/web/app/[locale]/pim/`](../../apps/web/app/%5Blocale%5D/pim/) — Phase C web admin.
- [`services/api/src/tests/pimBreweryIntegration.test.ts`](../../services/api/src/tests/pimBreweryIntegration.test.ts) — Phase D integration test.
- [`docs/design/web-route-group-audit.md`](web-route-group-audit.md) — accepted 2026-05-21; closed the `pim/` vs `(pim)/` deviation and corrected the `(automation)/` group-root collisions. PIM's directory layout is fully aligned with the audit's resolution.
- [`docs/rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md`](../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) — bundles the brewery file-move acceleration with the audit outcomes (Week 1 of late-H1-2026).
