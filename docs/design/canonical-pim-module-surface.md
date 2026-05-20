# Canonical `pim` module surface — design

**Tier:** Public  
**Status:** As-built post-implementation 2026-05-20 (Phase A + B + C + D-integration-test-Option-B landed in one tranche per [`docs/design/canonical-pim-build-log.md`](canonical-pim-build-log.md); core team approval implicit via solo-dev internal-alpha project posture per [`MANIFESTO.md`](../MANIFESTO.md) §1.2)  
**Audience:** core team, PIM-vertical maintainers, future commerce / channel-feed implementors, module SDK authors  
**Resolves:** [RFC-0004](../rfcs/0004-canonical-pim.md) §7 ("Phase A delivers contracts; Phase B delivers read path; Phase C delivers web admin; surface doc lands post-implementation")  
**Builds on:** [RFC-0001](../rfcs/0001-modules-tiers-governance-and-automation-placement.md), [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md), [RFC-0003](../rfcs/0003-validation-library-adoption.md), [RFC-0004](../rfcs/0004-canonical-pim.md), [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.4, §6, [`packages/module-sdk/README.md`](../../packages/module-sdk/README.md), [`docs/design/canonical-automation-module-surface.md`](canonical-automation-module-surface.md) (sibling template)

> **Disclaimer.** Documents the as-built shape of canonical `pim` after the Phase A+B+C+D tranche. Does not allocate the canonical code (RFC-0004 did that), does not change licenses, and does not pre-commit any other canonical module's shape. The "Open work" section explicitly distinguishes "done" from "deferred" from "queued tech debt" — read it before assuming any expected surface is already shipped.

---

## 1. Summary

[RFC-0004](../rfcs/0004-canonical-pim.md) committed `pim` as the sixth canonical module under an explicit RFC-0001 §4.2 YAGNI stretch — "platform-owner-driven implementation, not speculative reservation." This document is the post-implementation surface record: what got built, where the lane boundaries with other canonicals landed, and what is queued for follow-on phases.

| Layer | β-layout location | Shipped today |
|---|---|---|
| Contracts | [`packages/pim-contracts/`](../../packages/pim-contracts/) | `CONTRACT_VERSION 0.1.0-alpha.1`, 6 entity-family Zod schemas (Product, Variant, AttributeSet, Attribute, Category, MediaAssetRef), response envelopes |
| API | [`services/api/src/modules/pim/`](../../services/api/src/modules/pim/) | `registerPimModule(app)`, 4 read-only services, 8 read routes (`GET /pim/{products,variants,attribute-sets,categories}` ± by-id) |
| AI tools | [`services/api/src/services/ai/tools/pim/`](../../services/api/src/services/ai/tools/pim/) | 4 read-only tools (`pim.searchProducts`, `pim.getProductDetail`, `pim.listCategories`, `pim.listAttributeSets`) registered alongside brewery + automation tools |
| Web admin | [`apps/web/app/[locale]/pim/`](../../apps/web/app/%5Blocale%5D/pim/) | 5 Tamagui pages (product list, product detail, categories tree, attribute-set list, attribute-set detail), `pim.*` i18n namespace (en + it) |
| Persistence | [`services/api/prisma/schema.prisma`](../../services/api/prisma/schema.prisma) §pim | 6 tables under `@@schema("pim")`, multi-rooted category tree, workspace-scoped uniqueness on every workspace-owned entity, single migration `20260519224732_pim_phase_b_tables` |
| Integration test | [`services/api/src/tests/pimBreweryIntegration.test.ts`](../../services/api/src/tests/pimBreweryIntegration.test.ts) | Option-B test proving module composition + reference-not-copy semantics; Option-A queued in §"Open work" |

L2 cross-workspace isolation coverage: 32 axis-tests across 4 route files (products, variants, attribute sets, categories), all green.

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
- **Read APIs + AI tools** — list/get for every entity; AI tools for the four read primitives most likely to be composed by a conversational agent.

### 3.2 Out of scope (other canonicals or sister modules own)

| Concern | Owner | Why not here |
|---|---|---|
| Inventory levels, stock-on-hand, picking | `wms` (canonical, reserved code) | PIM is master-data; WMS is operational-state |
| Production planning, BOM expansion, work orders | `mrp` (canonical, reserved code) | Same separation: master vs operational |
| Customer-facing storefronts, cart, checkout | A future `commerce` (or vertical-specific) module | PIM master should serve N storefronts, none of which it knows about |
| Recipe authoring (brewery-vertical) | Brewery flat routes (`services/api/src/routes/recipes.ts`); future canonical `recipes` module (reserved code) | Recipe ≠ Product; a recipe *references* a PIM product, doesn't replace it. Today the link is uni-directional service-layer (no FK) — see Open work §6 |
| Binary media pipeline (uploads, transforms, CDN) | `@umbraculum/media` package | PIM only references media-asset IDs |
| Pricing rules, discount engines | Out of scope project-wide for now | Will land as a sibling canonical when needed |
| Channel-feed projections (Shopify, Amazon, etc.) | Future PIM Phase F | PIM is the source; the projection adapters are downstream and out of scope for the alpha tranche |

### 3.3 Boundary with `automation`

PIM and `automation` are sibling canonicals with **zero shared schema**. The architectural claim PIM honors:

- An automation vessel may carry a fermenting product (in the brewery vertical, "Pale Ale 500ml bottle" pre-bottling), but the link — if any — lives in a future brewery-vertical join model, **not** as a PIM-side FK to `Vessel` and **not** as an automation-side FK to `Product`.
- Each module owns its own surface; cross-module reference is by id, validated at the consumer's boundary.

---

## 4. As-built surface — Phase A contracts

[`packages/pim-contracts/`](../../packages/pim-contracts/) — Zod-only contracts package, MIT-licensed, ESM+CJS dual emit per [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md) Decision C.

Public exports (six surface families):

- `CONTRACT_VERSION` + `classifyContractVersionSkew` + `parseSemVer` — version handshake primitives, semantics shared with `@umbraculum/automation-contracts` (major → refuse, minor → warn, patch → silent). Initial version `0.1.0-alpha.1`.
- `ProductSchema` / `ProductRefSchema` / `ProductStatusSchema` + response envelopes (`ProductListResponseSchema`, `ProductGetResponseSchema`).
- `VariantSchema` / `VariantRefSchema` + response envelopes. `attributeValues` is a discriminated-union map keyed by attribute code.
- `AttributeSchema` / `AttributeTypeSchema` / `AttributeValueSchema` + response envelopes. `AttributeType` is an 8-value literal union.
- `AttributeSetSchema` / `AttributeSetRefSchema` + response envelopes.
- `CategorySchema` / `CategoryTreeNodeSchema` + response envelopes. List response carries both flat `items` and built `tree`.
- `MediaAssetRefSchema` / `MediaAssetRoleSchema` + list response. Opaque ID-only reference into `@umbraculum/media`.

Test coverage: 4 Vitest files, 7 tests, all green. Strict-flag verification: 6/6 (strict, noImplicitOverride, noPropertyAccessFromIndexSignature, noUncheckedIndexedAccess, exactOptionalPropertyTypes, verbatimModuleSyntax) — see build-log §"Gate-skill re-verification" for the run record.

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

- `ProductsService` — `listProducts`, `getProductById`.
- `VariantsService` — `listVariantsForProduct(workspaceId, productId)`, `getVariantById`.
- `AttributeSetsService` — `listAttributeSets`, `getAttributeSetById`.
- `CategoriesService` — `listCategories` (returns both flat `items` and built `tree`), `getCategoryById`.

Every service method:

- Takes `userId, workspaceId` as the first two arguments (canonical workspace-scoping pattern).
- Calls `workspaces.assertMembership(userId, workspaceId)` before any Prisma read.
- Returns Zod-parsed shapes (defense in depth per [RFC-0003](../rfcs/0003-validation-library-adoption.md) Decision A — no raw Prisma rows leak past the service boundary).
- Throws `NotFoundError` from [`services/api/src/errors.ts`](../../services/api/src/errors.ts) on misses; error code is the resource-specific token (`product_not_found`, `variant_not_found`, `attribute_set_not_found`, `category_not_found`).

### 5.3 Routes

[`services/api/src/modules/pim/routes/`](../../services/api/src/modules/pim/routes/):

| Route | Method | Source file |
|---|---|---|
| `/pim/products` | GET | `productsRoutes.ts` |
| `/pim/products/:productId` | GET | `productsRoutes.ts` |
| `/pim/products/:productId/variants` | GET | `variantsRoutes.ts` |
| `/pim/variants/:variantId` | GET | `variantsRoutes.ts` |
| `/pim/attribute-sets` | GET | `attributeSetsRoutes.ts` |
| `/pim/attribute-sets/:setId` | GET | `attributeSetsRoutes.ts` |
| `/pim/categories` | GET | `categoriesRoutes.ts` |
| `/pim/categories/:categoryId` | GET | `categoriesRoutes.ts` |

Every route calls `requireActiveWorkspace(req)` first, parses URL params via inline Zod, and re-validates the outgoing response with the contracts-side envelope schema before returning. The route-level re-parse is the second of the three RFC-0003 §"defense-in-depth" boundary points; the third is the web-side re-parse in §6 below.

### 5.4 Module registration

[`services/api/src/modules/pim/index.ts`](../../services/api/src/modules/pim/index.ts) exports `registerPimModule(app)`, which calls `registerModule({ code: "pim", prismaSchema: "pim" })` from `@umbraculum/module-sdk` and registers all four route families.

[`services/api/src/app.ts`](../../services/api/src/app.ts) wires it alongside `registerAutomationModule(app)`:

```ts
registerAutomationModule(app);
registerPimModule(app);
```

### 5.5 AI tools

[`services/api/src/services/ai/tools/pim/`](../../services/api/src/services/ai/tools/pim/): four read-only tools, each a thin wrapper over a service-layer call:

- `pim.searchProducts(query: string)` — lists products, filters by name/sku LIKE.
- `pim.getProductDetail(productId: string)` — getProductById.
- `pim.listCategories()` — categoriesService.list.
- `pim.listAttributeSets()` — attributeSetsService.list.

Registered in `app.ts` alongside brewery + automation tools — see Phase D §"integration test" for the proof that no tool-registry conflict arises.

---

## 6. As-built surface — Phase C web

[`apps/web/app/[locale]/pim/`](../../apps/web/app/%5Blocale%5D/pim/) — five Tamagui pages, cookie-auth via `useRequireAuth({ requireActiveWorkspace: true })`, defense-in-depth response re-parse via contracts schemas.

| Page | Route | Source |
|---|---|---|
| Product list | `/{locale}/pim` | `page.tsx` |
| Product detail | `/{locale}/pim/{productId}` | `[productId]/page.tsx` |
| Categories tree | `/{locale}/pim/categories` | `categories/page.tsx` |
| Attribute-set list | `/{locale}/pim/attribute-sets` | `attribute-sets/page.tsx` |
| Attribute-set detail | `/{locale}/pim/attribute-sets/{setId}` | `attribute-sets/[setId]/page.tsx` |

i18n namespace: `pim.*` in [`packages/i18n/src/en.json`](../../packages/i18n/src/en.json) and [`packages/i18n/src/it.json`](../../packages/i18n/src/it.json), dist artifacts rebuilt.

**Important caveat — route-group layout deviation:** the directory is `pim/` rather than the canonical `(pim)/` route-group convention used by the sibling `(automation)/` module. The deviation works (`/en/pim` returns the list page; all five sub-pages reachable) and was retained pending the in-flight architectural audit of route-group conventions (`docs/design/web-route-group-audit.md`, forthcoming). The `(automation)/` reference itself has a routing collision with `[locale]/page.tsx` that makes the vessels list at `/en/automation` unreachable, so the canonical pattern is itself in question. PIM's directory layout will be revisited as part of that audit's resolution.

---

## 7. As-built surface — Phase D integration

[`services/api/src/tests/pimBreweryIntegration.test.ts`](../../services/api/src/tests/pimBreweryIntegration.test.ts) — two cross-module assertions per the "Option B" pattern locked down before execution (see §"Open work" §6 for the rejected Option A and its queued tech debt):

1. **Module composition** — `GET /recipes` (brewery flat-route, pre-RFC-0002) and `GET /pim/products` (canonical β-layout) both return 200 in the same Fastify app instance, proving registration of `registerPimModule(app)` alongside `recipesRoutes` and the brewery tool family produces no route conflict.
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

### 8.2 Write paths (PIM Phase E equivalent)

`POST/PATCH/DELETE` for all six entity families are not yet wired. Surface design implications when they land:

- AI tool registry gets `pim.proposeProduct`, `pim.proposeVariant`, etc. — proposal-only (human-in-the-loop), modeled on the automation Phase E pattern.
- Contracts package gets `*WriteSchema` siblings for each `*Schema`.
- L2 isolation axes for write routes (8 additional axes per the `l2-cross-workspace-isolation-test` skill template).

### 8.3 Channel-feed projections

Read-only feed projections for storefront / marketplace consumers are out of scope. When they land, they belong in either a sibling commerce canonical (preferred) or a `pim-feeds/` submodule — **not** inside `packages/pim-contracts/` (which must stay vendor-agnostic).

### 8.4 Nav-menu entry

[`apps/web/app/[locale]/layout.tsx`](../../apps/web/app/%5Blocale%5D/layout.tsx) does not yet carry a "PIM" entry in the top nav. The build-log records this as a deliberate stop-and-confirm deferral per the original plan §6 — adding it requires a layout edit that should happen alongside the route-group audit resolution.

### 8.5 Cross-module FK columns to other canonicals

When `mrp`, `wms`, or `crm` land, they will need columns referencing `pim.products.id`. The design constraint per §3.3 is that those FKs live in the consumer's schema, not in `pim`'s. PIM exposes `ProductRefSchema` (`{ productId: string }`) as the canonical reference shape; consumers should adopt it verbatim.

### 8.6 Web route-group audit

[`docs/design/web-route-group-audit.md`](web-route-group-audit.md) (forthcoming) — separate audit triggered by the `pim/` vs `(pim)/` discussion. Will revisit the directory layout of every `apps/web/app/[locale]/<name>/` and `apps/web/app/[locale]/(<name>)/` folder, the unreachable `/en/automation` vessels list page, and the canonical convention going forward. PIM's directory layout will be aligned with the audit's resolution.

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
- [`packages/pim-contracts/`](../../packages/pim-contracts/) — Phase A contracts.
- [`services/api/src/modules/pim/`](../../services/api/src/modules/pim/) — Phase B API slice.
- [`apps/web/app/[locale]/pim/`](../../apps/web/app/%5Blocale%5D/pim/) — Phase C web admin.
- [`services/api/src/tests/pimBreweryIntegration.test.ts`](../../services/api/src/tests/pimBreweryIntegration.test.ts) — Phase D integration test.
- [`docs/design/web-route-group-audit.md`](web-route-group-audit.md) (forthcoming) — separate audit for web route-group conventions.
