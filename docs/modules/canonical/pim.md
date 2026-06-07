# `pim` — canonical module

**Tier:** Public
**Status:** **Shipped — Phase A + B + C + D-integration-test-Option-B + RFC-0007 PR7 channel-feed proof** (read path, web admin, 4 AI tools, cross-module composition proof, vendor-neutral product-catalog CSV render job). Phase E write paths, vendor-specific feed adapters, and Option-A real-FK cross-module integration deferred — see [`canonical-pim-module-surface.md`](../../design/canonical-pim-module-surface.md) §"Open work".
**Code:** `pim`
**Module tier:** 1 (core canonical, reserved code).
**License:** AGPLv3 (per [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5).
**Audience:** anyone evaluating Umbraculum's product-information-management surface, integrating PIM master data into another module, or planning Phase E+ work.

> [!NOTE]
> Per-module page for the canonical `pim` module. Code reserved by [RFC-0004](../../rfcs/0004-canonical-pim.md) (which amended the [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) reserved-code table from five to six codes). Folder shape per [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md). Phase A+B+C+D-Option-B landed 2026-05-20; build record at [`docs/design/canonical-pim-build-log.md`](../../design/canonical-pim-build-log.md). For the as-built surface details and what's queued, see the surface design doc: [`docs/design/canonical-pim-module-surface.md`](../../design/canonical-pim-module-surface.md).

---

## 1. Domain scope

Per [RFC-0004](../../rfcs/0004-canonical-pim.md) §3: **master product information** — vertical-agnostic product / variant / attribute / category / media / channel-override / locale-override primitives. The Akeneo / Pimcore / Salsify / inriver class of system.

The PIM canonical module owns the platform's "what is this SKU, what are its attributes, how does it appear on each channel and in each locale?" surface. Concretely (illustrative, refined by the future surface design doc):

- **Products and variants.** `Product` (master record) → `Variant` (per-SKU concrete realization). Variant axes are configurable via the active vertical's attribute set.
- **Attribute sets and attributes.** A typed, validated metadata layer (`string` / `number` / `boolean` / `date` / `select` / `multiselect` / `media` / `reference`). Verticals contribute their own; cross-vertical attribute sets live in the canonical default catalog.
- **Categories.** A multi-rooted, traversable category tree. A SKU can sit in `commerce.beverages.beer.IPA` AND `production.fermentation-type.ale` simultaneously.
- **Media assets.** Image / video / document references with channel-specific transformations. Consumes [`@umbraculum/media`](../../../packages/platform/media/README.md) for the asset pipeline; PIM owns the catalog-side metadata only.
- **Channel overrides.** Per-channel divergence (Shopify storefront name, Amazon listing title, internal SKU code, native-app display name). The "one master record, many channel projections" Akeneo pattern.
- **Locale overrides.** Per-locale divergence for any localizable attribute. Consumes [`@umbraculum/i18n`](../../../packages/platform/i18n/README.md) for UI strings; PIM owns the product-catalog locale-override surface as a *data* layer.
- **Inbound feeds.** Vendor feeds, supplier catalogs, manual CSV / Excel import. Validation, dedup, normalization to the canonical attribute set.
- **Outbound feeds.** Channel publication contracts (Shopify Product feed, Amazon Listing feed, Magento Catalog feed). Read-side projections that downstream systems pin.

---

## 2. Why it exists separately from `wms` / `mrp` / `crm`

[RFC-0004](../../rfcs/0004-canonical-pim.md) §2.1 + §3.3 are explicit: PIM / WMS / MRP / CRM / CRP / `automation` are *peer* canonical concerns, not nested under a single "commerce" or "manufacturing" umbrella. PIM owns *what a SKU is*; WMS owns *physical-state-attached-to-the-SKU*; MRP owns *production-planning-against-the-SKU*; CRM owns *customer-orders-of-the-SKU*. Each is its own canonical module with its own AI tools, tier limits, and Postgres schema. Verticals consume an arbitrary subset.

The Akeneo / Pimcore comparison set is the structural reference: those systems are vertical-agnostic by design and sit upstream of commerce platforms / ERPs / channel surfaces. PIM in Umbraculum occupies the same lane, with the canonical guarantee that no parallel competing implementation will ship inside another module.

---

## 3. As-built slices (β layout from [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md))

| Slice | Path | Status |
|---|---|---|
| API | [`services/api/src/modules/pim/`](../../../services/api/src/modules/pim/) | Shipped — 4 read services, 8 GET routes, 4 AI tools via `registerAiTools`, 1 channel-feed job route (`POST /pim/channel-feeds/product-catalog-csv/jobs`), `registerPimModule(app)` wired in [`app.ts`](../../../services/api/src/app.ts) alongside `registerAutomationModule` |
| Web | [`apps/web/app/[locale]/(pim)/`](../../../apps/web/app/%5Blocale%5D/%28pim%29/) | Shipped — 5 Tamagui pages, `pim.*` i18n (en + it). **Aligned per Week-1 audit:** route group `(pim)/` contains static sub-segments `products/`, `categories/`, `attribute-sets/` with no group-root `page.tsx` (Discipline 1) and no group-root dynamic segment (Discipline 2). URLs are `/en/products`, `/en/products/<id>`, `/en/categories`, `/en/attribute-sets`, `/en/attribute-sets/<id>` — owned segments declared via `registerWebModule({ ownedUrlSegments: ["products", "categories", "attribute-sets"] })`. See [`docs/design/web-route-group-audit.md`](../../design/web-route-group-audit.md) + [RFC-0006](../../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md). |
| Native | `apps/native/src/modules/pim/` | Not started — deferred to a follow-on tranche |
| Contracts | [`packages/modules/pim-contracts/`](../../../packages/modules/pim-contracts/) → `@umbraculum/pim-contracts` | Shipped — `CONTRACT_VERSION 0.1.0-alpha.1`, 6 schema families, 7/7 tests green, dist artifacts emitted |
| Persistence | [`services/api/prisma/schema.prisma`](../../../services/api/prisma/schema.prisma) §pim + `migrations/20260519224732_pim_phase_b_tables/` | Shipped — 6 tables under `@@schema("pim")`, single migration |
| Integration test | [`services/api/src/tests/pimBreweryIntegration.test.ts`](../../../services/api/src/tests/pimBreweryIntegration.test.ts) | Shipped (Option B — module composition + reference-not-copy semantics). Option A (real brewery↔PIM FK) **queued as tech debt** — set up when possible per [`canonical-pim-module-surface.md`](../../design/canonical-pim-module-surface.md) §"Open work" §8.1 |

Postgres schema name: `pim` (per [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md) convention 4).

**OpenAPI:** PIM HTTP routes with Zod schemas appear under tag `pim` in the alpha partial spec — [`API-OPENAPI.md`](../../API-OPENAPI.md); route tables in [`canonical-pim-module-surface.md`](../../design/canonical-pim-module-surface.md).

| Module | Relationship |
|---|---|
| `wms` | Strong reference (WMS rows reference PIM `productId` / `variantId`). PIM owns *identity*; WMS owns *physical-state-attached-to-identity*. Triggers the `@umbraculum/pim-contracts` `ProductRef` / `VariantRef` cross-module shared-type extraction (analogous to the `@umbraculum/equipment-contracts` extraction planned in [`canonical-automation-module-surface.md`](../../design/canonical-automation-module-surface.md) §4 for `crp` ↔ `automation`). |
| `mrp` | Strong reference (BOM nodes reference PIM `productId` / `variantId`; production-order output is a PIM `variantId`). PIM owns *what we make*; MRP owns *when and how we plan to make it*. |
| `crm` | Strong reference (CRM order lines reference PIM `variantId`). PIM owns *what we sell*; CRM owns *who we sell it to and on what terms*. |
| `crp` | Loose — CRP consumes WMS / MRP state that references PIM, but does not directly reference PIM. |
| `automation` | Loose — a production order's `variantId` may surface in the live `(automation)/` shell as "what is currently being made on this line," but the link is mediated via MRP, not direct. |

---

## 5. Expected dependencies on horizontal platform services

| Service | Relationship |
|---|---|
| `@umbraculum/media` | Consume — asset pipeline (upload, transform, CDN). PIM owns catalog-side metadata only. |
| `@umbraculum/i18n` | Consume — cross-platform UI strings. PIM owns the product-catalog locale-override surface as a *data* layer. |
| Auth / workspace / billing | Consume — standard pattern; addon codes declared (`pim_advanced`, `pim_unlimited_skus` — illustrative). |
| AI orchestrator | Consume — PIM contributes today's read tools via `registerAiTools` (`pim.searchProducts`, `pim.getProductDetail`, `pim.listCategories`, `pim.listAttributeSets`). Future proposal/deduplication tools remain Phase E+ work. |

Full consumption-contract checklist: [RFC-0004 §4](../../rfcs/0004-canonical-pim.md).

---

## 6. Boundary with the brewery vertical (today's only consumer)

Brewery's recipe-as-product flow promotes to PIM the same way brewery's brew-session-as-production-order flow promotes to MRP (per [`PLATFORM-ARCHITECTURE.md §5.2`](../../PLATFORM-ARCHITECTURE.md)). Concretely:

- Brewery contributes brewery-shaped **attribute sets** (BJCP style, ABV, IBU, SRM, fermentation method, package format).
- Brewery contributes brewery-shaped **categories** (beer-style hierarchy, package-format hierarchy).
- The canonical PIM provides the Product / Variant / AttributeSet / Category primitives that brewery's contributions instantiate.

Brewery does NOT ship a parallel product-catalog implementation once PIM ships. That would re-create the Decision F WordPress-hell shape ([RFC-0001 §8](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md)).

---

## 7. Phase roadmap — what shipped, what's queued

| Phase | Status | Notes |
|---|---|---|
| Surface design doc | **Shipped** | [`docs/design/canonical-pim-module-surface.md`](../../design/canonical-pim-module-surface.md) (post-implementation — landed alongside Phase A+B+C, per RFC-0004 §7 note). |
| Phase A — contracts | **Shipped** | [`packages/modules/pim-contracts/`](../../../packages/modules/pim-contracts/). 6 Zod schema families, `CONTRACT_VERSION 0.1.0-alpha.1`, 7/7 tests green. |
| Phase B — read path | **Shipped** | 4 services, 8 GET routes, 4 AI tools, 32 L2 isolation tests across 4 route test files. |
| Phase C — web admin | **Shipped — aligned per Week-1 audit** | 5 Tamagui pages, `pim.*` i18n. Web slice now uses `(pim)/` route group with three static sub-segments (`products/`, `categories/`, `attribute-sets/`); URLs are `/en/products/*`, `/en/categories`, `/en/attribute-sets/*`. The pre-audit `pim/` (URL-axis) layout was an architectural-axis confusion corrected by [RFC-0006](../../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) + [`docs/design/web-route-group-audit.md`](../../design/web-route-group-audit.md). |
| Phase D — cross-module integration | **Shipped (Option B)** | [`services/api/src/tests/pimBreweryIntegration.test.ts`](../../../services/api/src/tests/pimBreweryIntegration.test.ts) — module composition + reference-not-copy semantics. **Option A (real brewery↔PIM FK) is queued as tech debt** — set up when possible per surface doc §"Open work" §8.1. |
| Phase E — write paths + channel feeds | Partially shipped | RFC-0007 PR7 shipped the vendor-neutral `pim:product-catalog-csv@v1` async render job. `POST/PATCH/DELETE` across all 6 entity families, inbound feed ingestion, and vendor-specific outbound publication remain deferred. |
| Brewery vertical integration | Not started | Brewery's recipe-as-product surface migrates to PIM primitives. Brewery's β file move has already landed under [RFC-0006](../../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md); the real FK/projection integration remains queued per the surface doc's Open work. |

For the complete "Open work" inventory (with the explicit Option-A queue, write-path implications, channel-feed scoping, nav-menu entry deferral, cross-module FK column placement, web route-group audit, and media-asset role-enum hardening), read [`canonical-pim-module-surface.md`](../../design/canonical-pim-module-surface.md) §8. **Anyone contributing the next tranche of PIM work should start there.**

---

## 8. Cross-references

- [`docs/design/canonical-pim-module-surface.md`](../../design/canonical-pim-module-surface.md) — **as-built surface design** (the load-bearing doc for Phase E+ contributors and for the Option-A tech-debt queue).
- [`docs/design/canonical-pim-build-log.md`](../../design/canonical-pim-build-log.md) — implementation log (executor model + timing + gate-skill outputs + lessons learned).
- [RFC-0004](../../rfcs/0004-canonical-pim.md) — the mini-RFC that allocated this code.
- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4 (reserved-code table, extended from five to six by RFC-0004), §7 (canonical-module placement principle), §8 (consumption contract).
- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §3–§4 (β layout, naming conventions).
- [RFC-0003](../../rfcs/0003-validation-library-adoption.md) — Zod-as-canonical-validator + defense-in-depth re-parse at every boundary; `@umbraculum/pim-contracts` adopts this throughout.
- [`canonical-automation-module-surface.md`](../../design/canonical-automation-module-surface.md) — sibling canonical's surface doc; structural template for the PIM one.
- [`automation.md`](automation.md) — sibling canonical's per-module page; structural template for this one.
- [`docs/MODULES.md`](../../MODULES.md) §3.1 — ecosystem entry page; canonical-modules catalog.
- [`docs/PLATFORM-ARCHITECTURE.md`](../../PLATFORM-ARCHITECTURE.md) §1.1.1 — canonical-set positioning.
- [`docs/design/web-route-group-audit.md`](../../design/web-route-group-audit.md) — accepted 2026-05-21. Decision-of-record for the web route shape audit; the `pim/` → `(pim)/` corrective is one of its three module-aligned outcomes alongside the `(automation)/` β-discipline fix and the brewery file-move acceleration (RFC-0006).
