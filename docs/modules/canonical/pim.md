# `pim` — canonical module (open door)

**Tier:** Public
**Status:** **Open door** — not implemented. Reserved code, β layout pre-committed. Working assumption: surface design doc + Phase A contracts begin in the next tranche, per [RFC-0004](../../rfcs/0004-canonical-pim.md) Resolution.
**Code:** `pim`
**Module tier:** 1 (core canonical, reserved code).
**License:** AGPLv3 (per [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5).
**Audience:** anyone evaluating Umbraculum's product-information-management roadmap or planning to extend the future PIM module.

> [!NOTE]
> Per-module page for the (not-yet-implemented) `pim` canonical module. The code is reserved by [RFC-0004](../../rfcs/0004-canonical-pim.md) (which amended the [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) reserved-code table from five to six codes); the folder shape is pre-committed by [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md). When work starts, replace this stub with a real per-module page modeled on [`automation.md`](automation.md).

---

## 1. Domain scope

Per [RFC-0004](../../rfcs/0004-canonical-pim.md) §3: **master product information** — vertical-agnostic product / variant / attribute / category / media / channel-override / locale-override primitives. The Akeneo / Pimcore / Salsify / inriver class of system.

The PIM canonical module owns the platform's "what is this SKU, what are its attributes, how does it appear on each channel and in each locale?" surface. Concretely (illustrative, refined by the future surface design doc):

- **Products and variants.** `Product` (master record) → `Variant` (per-SKU concrete realization). Variant axes are configurable via the active vertical's attribute set.
- **Attribute sets and attributes.** A typed, validated metadata layer (`string` / `number` / `boolean` / `date` / `select` / `multiselect` / `media` / `reference`). Verticals contribute their own; cross-vertical attribute sets live in the canonical default catalog.
- **Categories.** A multi-rooted, traversable category tree. A SKU can sit in `commerce.beverages.beer.IPA` AND `production.fermentation-type.ale` simultaneously.
- **Media assets.** Image / video / document references with channel-specific transformations. Consumes [`@umbraculum/media`](../../../packages/media/README.md) for the asset pipeline; PIM owns the catalog-side metadata only.
- **Channel overrides.** Per-channel divergence (Shopify storefront name, Amazon listing title, internal SKU code, native-app display name). The "one master record, many channel projections" Akeneo pattern.
- **Locale overrides.** Per-locale divergence for any localizable attribute. Consumes [`@umbraculum/i18n`](../../../packages/i18n/README.md) for UI strings; PIM owns the product-catalog locale-override surface as a *data* layer.
- **Inbound feeds.** Vendor feeds, supplier catalogs, manual CSV / Excel import. Validation, dedup, normalization to the canonical attribute set.
- **Outbound feeds.** Channel publication contracts (Shopify Product feed, Amazon Listing feed, Magento Catalog feed). Read-side projections that downstream systems pin.

---

## 2. Why it exists separately from `wms` / `mrp` / `crm`

[RFC-0004](../../rfcs/0004-canonical-pim.md) §2.1 + §3.3 are explicit: PIM / WMS / MRP / CRM / CRP / `automation` are *peer* canonical concerns, not nested under a single "commerce" or "manufacturing" umbrella. PIM owns *what a SKU is*; WMS owns *physical-state-attached-to-the-SKU*; MRP owns *production-planning-against-the-SKU*; CRM owns *customer-orders-of-the-SKU*. Each is its own canonical module with its own AI tools, tier limits, and Postgres schema. Verticals consume an arbitrary subset.

The Akeneo / Pimcore comparison set is the structural reference: those systems are vertical-agnostic by design and sit upstream of commerce platforms / ERPs / channel surfaces. PIM in Umbraculum occupies the same lane, with the canonical guarantee that no parallel competing implementation will ship inside another module.

---

## 3. Expected slices (β layout from [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md))

When implementation lands, the module materializes as four coordinated paths:

| Slice | Path (when shipped) |
|---|---|
| API | `services/api/src/modules/pim/` |
| Web | `apps/web/app/[locale]/(pim)/` |
| Native | `apps/native/src/modules/pim/` |
| Contracts | `packages/pim-contracts/` → `@umbraculum/pim-contracts` |

Postgres schema name: `pim` (per [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md) convention 4).

---

## 4. Expected dependencies on other canonical modules

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
| AI orchestrator | Consume — PIM contributes AI tools via `registerAiTools` (e.g. `pim.searchProducts`, `pim.suggestAttributes`, `pim.detectDuplicates`). |

Full consumption-contract checklist: [RFC-0004 §4](../../rfcs/0004-canonical-pim.md).

---

## 6. Boundary with the brewery vertical (today's only consumer)

Brewery's recipe-as-product flow promotes to PIM the same way brewery's brew-session-as-production-order flow promotes to MRP (per [`PLATFORM-ARCHITECTURE.md §5.2`](../../PLATFORM-ARCHITECTURE.md)). Concretely:

- Brewery contributes brewery-shaped **attribute sets** (BJCP style, ABV, IBU, SRM, fermentation method, package format).
- Brewery contributes brewery-shaped **categories** (beer-style hierarchy, package-format hierarchy).
- The canonical PIM provides the Product / Variant / AttributeSet / Category primitives that brewery's contributions instantiate.

Brewery does NOT ship a parallel product-catalog implementation once PIM ships. That would re-create the Decision F WordPress-hell shape ([RFC-0001 §8](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md)).

---

## 7. What needs to happen before this stub becomes a real page

Per [`contribute/canonical-module.md`](../contribute/canonical-module.md) §4 step 4, the code is allocated by RFC-0004; implementation follows the normal phase rhythm:

1. **Surface design doc** under `docs/design/canonical-pim-module-surface.md`, modeled on [`canonical-automation-module-surface.md`](../../design/canonical-automation-module-surface.md). Resolves the data model, AI tool surface, tier-limit fields, phasing, and the pricing-locus question deferred from [RFC-0004 §3.2](../../rfcs/0004-canonical-pim.md).
2. **Phase A — contracts.** Create `packages/pim-contracts/`, ship `ProductSchema` / `VariantSchema` / `AttributeSetSchema` / `CategorySchema` / `MediaAssetRefSchema` / `ChannelOverrideSchema` plus `ProductRef` / `VariantRef` (the cross-module shared types). Built on Zod v4 per [RFC-0003](../../rfcs/0003-validation-library-adoption.md). Ship `CONTRACT_VERSION`.
3. **Phase B — read path.** Land `services/api/src/modules/pim/` skeleton, register via `@umbraculum/module-sdk`, ship initial read routes (list / get / search) and AI tools.
4. **Phase C — write path + channel-feeds.** Inbound feed ingestion, outbound channel publication, the full Akeneo-shaped surface.
5. **Brewery vertical integration.** Brewery's recipe-as-product surface migrates to PIM primitives. Timing tied to the brewery β migration ([RFC-0002 §3 Decision D](../../rfcs/0002-canonical-module-physical-layout.md), H1 2027).

---

## 8. Cross-references

- [RFC-0004](../../rfcs/0004-canonical-pim.md) — the mini-RFC that allocated this code.
- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4 (reserved-code table, extended from five to six by RFC-0004), §7 (canonical-module placement principle), §8 (consumption contract).
- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §3–§4 (β layout, naming conventions).
- [RFC-0003](../../rfcs/0003-validation-library-adoption.md) — Zod v4 standard `@umbraculum/pim-contracts` will adopt from Phase A.
- [`canonical-automation-module-surface.md`](../../design/canonical-automation-module-surface.md) — template for what the eventual `canonical-pim-module-surface.md` will look like.
- [`automation.md`](automation.md) — template for what this page will look like once `pim` ships its Phase B read path.
- [`docs/MODULES.md`](../../MODULES.md) §3.1 — ecosystem entry page; canonical-modules catalog.
- [`docs/PLATFORM-ARCHITECTURE.md`](../../PLATFORM-ARCHITECTURE.md) §1.1.1 — canonical-set positioning.
