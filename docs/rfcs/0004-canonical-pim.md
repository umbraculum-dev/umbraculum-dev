# RFC-0004 — Canonical-code allocation: `pim`

**Tier:** Public
**Status:** Accepted 2026-05-19 (mini-RFC under [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §6 Decision D; pre-public-flip solo-author + core-team approval per RFC-0001 §13 change procedure)
**Audience:** prospective contributors, self-hosters, third-party module developers, hosted-service customers, and anyone evaluating Umbraculum's product-information-management posture as a long-term operational dependency.

> **Disclaimer.** This RFC allocates a sixth reserved canonical code (`pim`) to the set committed by [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §4 Decision B (initially five: `mrp` / `wms` / `crm` / `crp` / `automation`). It is the first canonical-code allocation since RFC-0001's initial set. The §4.2 YAGNI clause is explicitly addressed in §2 (Motivation) — this RFC stretches "reference implementation underway" to "platform-owner committed to start in this tranche", and §2.3 records why that stretch is principled rather than precedent-eroding. The change procedure mirrors [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §13.

---

## 1. Summary

This RFC commits one decision and prescribes the cross-doc updates that land in the same PR:

- **Decision A — Allocate `pim` as a sixth reserved canonical code.** Domain scope: master product information (products, variants, attribute sets, attributes, categories, media assets, channel overrides, locale overrides). Vertical-agnostic by construction — the Akeneo / Pimcore / Salsify class of system. Peer to `crm` / `mrp` / `wms` / `crp` / `automation`, not a sub-concern of any of them.

The canonical code `pim` lands in [`packages/sdk/module-sdk/src/reservedCodes.ts`](../../packages/sdk/module-sdk/src/reservedCodes.ts)'s `RESERVED_CANONICAL_MODULE_CODES` tuple in the same PR as this RFC. Cross-doc references (RFC-0001 §4 reserved-code table, [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §1.1.1 canonical-set sentence, [`docs/MODULES.md`](../MODULES.md) §3.1 catalog, [`docs/modules/contribute/canonical-module.md`](../modules/contribute/canonical-module.md) §0 already-allocated list, [`docs/modules/canonical/pim.md`](../modules/canonical/pim.md) new open-door stub, [`docs/modules/README.md`](../modules/README.md) "What's here today" table) are updated in the same PR per [`contribute/canonical-module.md`](../modules/contribute/canonical-module.md) §4 step 3.

The implementation phasing (surface design doc → Phase A contracts → Phase B read path → …) is OUT of scope of this RFC; this RFC allocates the code, not the surface. The surface design lands in a separate `docs/design/canonical-pim-module-surface.md` artifact later — same trajectory `automation` followed.

---

## 2. Motivation

### 2.1 Why `pim` is structurally canonical-shaped

Product information management — master records for products, variants, attribute sets, categories, media, and channel / locale overrides — is an **enterprise-software domain category** in the same shape as CRM, MRP, WMS, CRP, and the automation surface. The external comparison set is **Akeneo, Pimcore, Salsify, inriver**: vertical-agnostic master-product-data systems that sit upstream of commerce platforms, ERPs, and channel surfaces (Shopify / Amazon / Magento / D2C web / native catalog) and downstream of supplier data feeds. None of those systems is brewery-shaped, distillery-shaped, or cosmetics-shaped; the primitives (Product, Variant, AttributeSet, Attribute, Category, MediaAsset, ChannelOverride) are vertical-agnostic by design. That is precisely the canonical-module shape [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §4.1 defends — flat peer decomposition of vertical-agnostic enterprise-software domains.

The vertical-agnosticism matters because [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §4.1's anti-umbrella reasoning runs in both directions:

- A `pim` canonical module is **not** "Akeneo for breweries" — that would be a vertical configuration's surface, not a canonical one. The brewery vertical consumes `pim` (with brewery-shaped attribute sets, brewery-shaped media taxonomies) the same way the cosmetics vertical will consume `pim` (with cosmetics-shaped attribute sets, cosmetics-shaped media taxonomies). The vertical-prefixed configuration layer (`@umbraculum/brewery-*`, eventually `@umbraculum/cosmetics-*`) sits *on top of* the canonical PIM primitives.
- A `pim` canonical module is **not** absorbable into `wms` or `mrp`. PIM owns *what a SKU is*; WMS owns *where the SKU is right now*; MRP owns *what we will make from the SKU*. These are three different lanes against the same identifier (the `productId` / `variantId` reference). Forcing them under a single code would re-create the umbrella-anti-pattern §4.1 rejects.

### 2.2 The §4.2 YAGNI clause and why this RFC stretches it

[RFC-0001 §4.2](0001-modules-tiers-governance-and-automation-placement.md) writes:

> *"We pin the initial set at five and treat further allocation as YAGNI: a code is added when there is concrete demand and a reference implementation underway, not on speculation."*

And [`contribute/canonical-module.md`](../modules/contribute/canonical-module.md) §2 lists four preconditions for a canonical-code mini-RFC. At the time of this RFC's drafting:

| Precondition | Status |
|---|---|
| Cross-vertical applicability is demonstrated (≥2 verticals want the same primitives) | **Partial** — only the brewery vertical exists today, but the design is vertical-agnostic by construction (the Akeneo posture). The roadmap in [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §1.1 names distillery / kombucha / cosmetics / food-batch / fragrance as anticipated verticals, each of which is structurally a PIM consumer. |
| A reference implementation is underway at Tier 3 or Tier 4 | **Not yet — starts in this same tranche.** This RFC commits the platform owner to begin Phase A (`packages/canonical/pim/contracts/`) immediately after merge. |
| Consumption-contract satisfiable (no parallel auth / billing / AI / etc.) | **Yes** — see §4 below for the per-row checklist. |
| Peer-level domain, not a sub-concern of an existing canonical | **Yes** — see §2.1 above for the boundary argument. |

Two of four are unambiguously met (consumption contract; peer-level). Two are stretched: cross-vertical applicability is structural rather than empirically demonstrated (only one vertical exists), and the reference implementation begins in this tranche rather than predating the RFC.

### 2.3 Why the stretch is principled

The §4.2 YAGNI clause exists to prevent two specific failure modes, neither of which this allocation triggers:

- **Speculative pre-allocation of hypothetical third-party-owned canonicals.** The §4.2 wording — "added when there is concrete demand and a reference implementation underway" — is calibrated to the [`third-party-module.md`](../modules/contribute/third-party-module.md) §6 Tier 3 → Tier 1 promotion trajectory: third parties propose, third parties implement, the platform ratifies. That trajectory must require a working reference implementation before allocation, because the platform should not reserve codes for promises. This allocation is structurally different: the platform owner is committing to *build* the canonical, not promote a third-party module. The initial five codes in [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §4 were allocated by platform-owner fiat under exactly this shape — `mrp`, `wms`, `crm`, `crp` all remain "open door" stubs ([`docs/modules/canonical/`](../modules/canonical/)) with no reference implementation, and §4 records that as the deliberate initial state, not a YAGNI violation.

- **Pre-allocation that creates a category of debt.** §4.2's closing sentence: *"pre-allocation is a category of debt the project does not need to take on now."* The debt §4.2 names is the open-door-stub maintenance burden — the canonical-page tax, the cross-reference tax, the "is this code going to ship or not" reader-question tax. This RFC takes that debt on consciously: PIM is the next-shipping canonical, so the open-door stub period is bounded (months, not years), and the debt is paid by the same hand that authors it. The debt §4.2 warns against is open-ended speculation; this is a near-term commitment.

So §4.2's spirit is preserved (no third-party reservation without an implementation; no open-ended speculative debt), and §4.2's letter is stretched in the one dimension where the platform-owner-allocation pattern was always the implicit exception. This RFC names the stretch out loud rather than smuggling it in, and §6 below adds a non-substantive amendment-footer to RFC-0001 §4 that records the allocation event and links here.

### 2.4 Why now, not later

The cost asymmetry [RFC-0003](0003-validation-library-adoption.md) §2 argues for the validation-library adoption applies in reverse here: every line of product-related code written between today and `pim`'s eventual allocation is a line that may need to be relocated *from* a non-canonical home (under the brewery vertical, or under a `pim-prototype` Tier 3/4 package) *to* the canonical surface once allocated. Allocating now lets the very first lines of PIM code land at `services/api/src/modules/pim/` and `packages/canonical/pim/contracts/` — the canonical paths from day one, no rename pass, no consumer-side breakage when the canonical promotion happens.

The cost of the alternative (Tier 3/4 prototype + later promotion) is real and well-modeled: it's exactly the pattern [RFC-0003](0003-validation-library-adoption.md) §2 quantified for the validation-library question, where deferring to H1 2027 cost ~3× the focused pre-trajectory work. The PIM-specific factor is smaller because PIM has fewer existing consumers than validation does, but the same cost-asymmetry shape applies.

---

## 3. Domain scope

### 3.1 In scope

The canonical surface, as the surface design doc will eventually formalize:

- **Products and variants.** `Product` (master record) → `Variant` (per-SKU concrete realization). Variant axes are configurable (size, color, package format, ABV bracket, allergen profile — whatever the active vertical's `AttributeSet` allows).
- **Attribute sets and attributes.** A typed, validated metadata layer (typed `string` / `number` / `boolean` / `date` / `select` / `multiselect` / `media` / `reference`). Verticals contribute their own attribute sets; cross-vertical attribute sets live in the canonical default catalog.
- **Categories.** A traversable category tree. Multi-rooted by design (a SKU can sit in `commerce.beverages.beer.IPA` AND `production.fermentation-type.ale` simultaneously).
- **Media assets.** Image / video / document references with channel-specific transformations (Akeneo-shaped). Consumes [`@umbraculum/media`](../../packages/platform/media/README.md) for the asset-pipeline primitives; owns the catalog-side metadata.
- **Channel overrides.** Per-channel divergence (Shopify storefront name, Amazon listing title, internal SKU code, native-app display name). The "one master record, many channel projections" Akeneo pattern.
- **Locale overrides.** Per-locale divergence for any localizable attribute. Consumes [`@umbraculum/i18n`](../../packages/platform/i18n/README.md) infrastructure; owns the product-catalog-side translation surface.
- **Data feeds (inbound).** Vendor feeds, supplier catalogs, manual CSV / Excel import. Validation, dedup, normalization to the canonical attribute set.
- **Data feeds (outbound).** Channel publication contracts (Shopify Product feed, Amazon Listing feed, Magento Catalog feed). Read-side projections that downstream systems pin.

### 3.2 Out of scope

- **Physical stock state** — owned by `wms`. PIM does not track on-hand quantity, location, lot, or serial. PIM publishes the `productId` / `variantId`; WMS attaches state to that identifier.
- **Production planning** — owned by `mrp`. PIM does not track production orders or BOMs. MRP's BOM nodes reference PIM `productId`s; the BOM structure itself is MRP's surface.
- **Customer-facing orders** — owned by `crm`. PIM does not track customer accounts, opportunities, or sales orders. CRM order lines reference PIM `productId`s.
- **Capacity / scheduling** — owned by `crp`. No overlap.
- **Live equipment state** — owned by `automation`. No overlap.
- **Pricing logic** — explicitly **deferred** to the surface design doc. Pricing may live on `pim` (Akeneo-style price-per-channel attribute) or on a future `commerce` canonical (Shopify-style separate price catalog). The decision is not load-bearing on this allocation.

### 3.3 Boundaries with the other five canonicals

| Other canonical | Relationship |
|---|---|
| `wms` | Strong reference (WMS rows reference PIM `productId` / `variantId`). PIM owns *identity*; WMS owns *physical-state-attached-to-identity*. The cross-module shared type (`@umbraculum/pim-contracts` `ProductRef` / `VariantRef`) is the second-consumer trigger for an extracted reference type, analogous to the `@umbraculum/equipment-contracts` extraction planned in [`canonical-automation-module-surface.md`](../design/canonical-automation-module-surface.md) §4. |
| `mrp` | Strong reference (BOM nodes reference PIM `productId` / `variantId`; production-order output is a PIM `variantId`). PIM owns *what we make*; MRP owns *when and how we plan to make it*. |
| `crm` | Strong reference (CRM order lines reference PIM `variantId`). PIM owns *what we sell*; CRM owns *who we sell it to and on what terms*. |
| `crp` | Loose (CRP may consume `wms` capacity inputs that reference PIM, but CRP itself does not directly reference PIM). |
| `automation` | Loose (a production order's `variantId` may surface in the live `(automation)/` shell as "what is currently being made on this line" — but the link is via MRP, not direct). |

### 3.4 Boundaries with horizontal platform services

| Horizontal service | Relationship |
|---|---|
| `@umbraculum/media` | PIM consumes; PIM owns catalog-side metadata only. Asset pipeline (upload, transform, CDN, derivation) stays in `@umbraculum/media`. |
| `@umbraculum/i18n` | PIM consumes; PIM owns product-catalog locale-override surface only. Cross-platform message catalog (web + native UI strings) stays in `@umbraculum/i18n`. |
| Auth / workspace / billing | PIM consumes (workspace-scoped, like every other canonical). |
| AI orchestrator | PIM contributes AI tools via the SDK's `registerAiTools` slot (e.g. `pim.searchProducts`, `pim.suggestAttributes`, `pim.detectDuplicates`). |

### 3.5 Boundaries with the brewery vertical (today's only consumer)

Brewery's recipe-as-product flow promotes to PIM the way brewery's brew-session-as-production-order flow promotes to MRP (per [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §5.2): the brewery vertical contributes brewery-shaped attribute sets (BJCP style, ABV, IBU, SRM, fermentation method, package format) and brewery-shaped categories (beer-style hierarchy, package-format hierarchy); the canonical PIM provides the Product / Variant / AttributeSet / Category primitives that brewery's contributions instantiate. The brewery vertical does not own a parallel product-catalog implementation once PIM ships — that would re-create the Decision F WordPress-hell shape ([RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §8).

---

## 4. Consumption-contract checklist

Per [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §8.2 / Decision F. PIM consumes each horizontal platform service and does NOT ship a parallel implementation:

| Service | PIM's posture | Extension points used (if any) |
|---|---|---|
| Auth (cookie web + bearer native) | Consume | None — standard auth middleware. |
| Tenancy (workspace scoping) | Consume | None — `prismaSchema: "pim"` rows carry `workspaceId`. |
| ACL (workspace + role) | Consume | Standard `requireWorkspaceRole` middleware. |
| Billing (Stripe web + RevenueCat native) | Consume | Declares addon codes (`pim_advanced`, `pim_unlimited_skus` — illustrative). Does NOT integrate with Stripe / RevenueCat directly. |
| AI (orchestrator + tool registry) | Consume | `registerAiTools` slot (per-module AI tool contributions). |
| Observability (logging, metrics, tracing) | Consume | None — standard logger / OTel hooks. |
| i18n (cross-platform message catalog) | Consume | `@umbraculum/i18n` for UI strings; PIM owns the product-catalog locale-override surface as a *data* layer, not a parallel i18n stack. |
| UI (Tamagui design system) | Consume | `@umbraculum/ui` primitives. |
| Secrets | Consume | Standard secrets provider; no parallel secret store. |
| Integrations framework (read-mostly devices and feeds) | Consume | Inbound vendor feeds register through the integrations framework, not a parallel ingestion path. |
| HTTP framework (Fastify on API, Next.js on web, Expo Router on native) | Consume | Standard route registration via `registerModule({ routes })`. |
| DB (Prisma) | Consume | Own Postgres schema `pim` (per [RFC-0002](0002-canonical-module-physical-layout.md) §4 convention 4). No parallel ORM. |

This checklist is the same shape Decision F demands of every canonical module. PIM passes cleanly — no row triggers the "but we want to own X" pattern [`contribute/canonical-module.md`](../modules/contribute/canonical-module.md) §7 names as the single most common allocation-failure cause.

---

## 5. Alternatives considered

### 5.1 Build PIM features inside the brewery vertical (Path A — Tier 6)

Build product-master-data primitives inside `services/api/src/modules/brewery/` (eventually, post-β migration) as brewery-vertical features. No canonical reservation. Cross-vertical extraction happens later when a second vertical asks.

**Why not chosen.** PIM's vertical-agnostic primitives (`Product`, `Variant`, `AttributeSet`, `Category`) would be designed with brewery-shaped assumptions baked in (recipe-as-product, BJCP style as a categorial axis) and pay an extraction tax when the second vertical lands. The cost-asymmetry argument in §2.4 applies; the brewery-shaped design is also a category mistake — PIM is no more brewery-shaped than CRM is brewery-shaped, and we did not put CRM inside the brewery vertical.

### 5.2 Tier 3/4 prototype, promote later (Path B — third-party-module trajectory)

Build a separate `pim-prototype` Tier 3/4 module, mature it, file a future mini-RFC to promote per [`third-party-module.md`](../modules/contribute/third-party-module.md) §6.

**Why not chosen.** Same cost-asymmetry as 5.1, plus a procedural inversion: the third-party-module trajectory is designed for *external* contributors who must demonstrate stable surfaces and cross-vertical adoption *before* canonical allocation, because the platform should not reserve codes for promises the platform cannot enforce. The platform owner committing to build PIM is a different shape of evidence — the commitment IS the demonstration. This RFC names that distinction out loud (§2.3) rather than performing the Tier 3/4 trajectory as ceremony.

### 5.3 Defer the allocation; add `pim` to the §4.2 watch list only

Update [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §4.2 to include `pim` in the informational watch list (alongside `quality`, `maintenance`, `procurement`, `docs`, `hr`, `finance`). No canonical allocation today. Wait for a second-vertical consumer.

**Why not chosen.** This is the strictest reading of §4.2 YAGNI and was the recommendation that preceded the platform owner's decision to allocate now. The watch-list-only path defers all the cost-asymmetry benefits in §2.4 to a future PR that will need to do the same allocation work plus a rename pass. The watch-list path is the right shape for codes whose timing is genuinely uncertain (`quality`, `maintenance`, etc.); it is the wrong shape for a code the platform owner has already committed to build.

### 5.4 Amend RFC-0001 §4 Decision B to expand the initial set from five to six (instead of filing a mini-RFC)

Treat this as an RFC-0001 amendment rather than a Decision D mini-RFC: edit RFC-0001 §4 to say "the authoritative initial set is six peer codes", document the addition in RFC-0001's own change log, no separate RFC artifact.

**Why not chosen.** [`contribute/canonical-module.md`](../modules/contribute/canonical-module.md) §3 step 1 prescribes the mini-RFC artifact (`docs/rfcs/NNNN-canonical-<code>.md`) as the documented path. RFC-0001 §4.2 + §6 Decision D commit the mini-RFC procedure for *all* allocations beyond the initial five. Editing RFC-0001 §4 to re-define what "initial" means would be a Decision-B amendment ([RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §13 names Decision-B amendments as "particularly consequential and we expect them to be rare"). The mini-RFC path is lower-ceremony, more honest about what's happening (a new allocation, not a re-definition of history), and uses the procedure the project documents. The body of RFC-0001 §4 still says "the authoritative initial set is five peer codes" because that is the historical truth; the new amendment footer at the end of §4 records this RFC's allocation event without rewriting history.

---

## 6. Impact across audiences

### 6.1 Contributors

- One more canonical code to be aware of. `pim` shows up in [`docs/MODULES.md`](../MODULES.md) §3.1, [`docs/modules/canonical/pim.md`](../modules/canonical/pim.md) (open-door stub), and [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §4 reserved-code table.
- No new contributor process. The mini-RFC procedure is the same one [`contribute/canonical-module.md`](../modules/contribute/canonical-module.md) already documents; this RFC is an instance of it.
- The next canonical-code allocation proposal can cite this RFC as the precedent for platform-owner-allocated codes (§2.3 framing).

### 6.2 Self-hosters

- Zero immediate impact (no PIM implementation ships in this PR).
- Forward expectation: a future `services/api/src/modules/pim/` and a future Postgres schema named `pim` will land in subsequent PRs. Self-hosters running migrations will see a new schema appear on the timeline indicated by the surface design doc (not yet written).

### 6.3 Third-party module developers

- The pre-public-flip third-party-module audience is empty; once the public flip happens, third-party developers gain a sixth canonical to target. Adapter-style extensions (e.g. "Shopify Channel adapter for PIM" or "Akeneo connector that imports into PIM") become a valid Tier 3/4 shape.
- The cross-module shared type (`@umbraculum/pim-contracts` exports of `ProductRef` / `VariantRef`) becomes one of the surfaces a third-party WMS / MRP / CRM extension may pin once those canonicals ship.

### 6.4 Hosted-service customers

- Zero immediate impact. Forward expectation: PIM features will be addon-gated through the standard billing surface ([RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §8.2 billing row) once Phase B ships.

### 6.5 Enterprises evaluating Umbraculum

- A more complete canonical-module map. PIM's allocation closes a visible gap relative to the SAP / Odoo / Salsify-class comparison set, where "where does master product data live" is the third question an evaluator asks after "what's your CRM" and "what's your inventory model."
- The fact that the allocation is documented in a public mini-RFC (this artifact) rather than buried in a commit message is the relevant signal of governance maturity.

---

## 7. Migration plan

No migration. PIM is net-new code; nothing exists today to be moved. The path forward (out of scope of this RFC, named here only for completeness):

1. **Surface design doc** — `docs/design/canonical-pim-module-surface.md`. Modeled on [`canonical-automation-module-surface.md`](../design/canonical-automation-module-surface.md). Resolves the data model, AI tool surface, tier-limit fields, phasing, and the pricing-locus question deferred from §3.2.
2. **Phase A — contracts.** `packages/canonical/pim/contracts/` → `@umbraculum/pim-contracts`. Ships `ProductSchema`, `VariantSchema`, `AttributeSetSchema`, `CategorySchema`, `MediaAssetRefSchema`, `ChannelOverrideSchema`, plus `ProductRef` / `VariantRef` (the cross-module shared types). Built on Zod v4 per [RFC-0003](0003-validation-library-adoption.md). Carries `CONTRACT_VERSION`.
3. **Phase B — read path.** `services/api/src/modules/pim/` skeleton with `registerModule({ code: "pim", ... })`. Read routes (list / get / search), AI tools (search / suggest / detect-duplicates), workspace-scoped data model.
4. **Phase C — write path + channel-feeds.** Inbound feed ingestion, outbound channel publication, the full Akeneo-shaped surface.
5. **Brewery vertical integration.** Brewery's recipe-as-product surface migrates to PIM primitives. Calendar note: the brewery β file move was later accelerated by [RFC-0006](0006-amend-rfc-0002-brewery-file-move-acceleration.md); the real brewery↔PIM FK/projection integration remains future work.

The reference-pamphlet update of [RFC-0003](0003-validation-library-adoption.md)'s "five upcoming contracts packages" count becomes six with Phase A; no in-place edit to RFC-0003 is required — RFC-0003's count was a snapshot at its acceptance and remains historically accurate. The accurate forward count lives in [`docs/MODULES.md`](../MODULES.md) §3.1, which this PR updates.

---

## 8. Resolution

Accepted 2026-05-19 under [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §6 Decision D's mini-RFC procedure and §13 pre-public-flip change procedure (solo author + core team approval, both held by the platform owner pre-public-flip).

**Cross-doc updates landing in the same PR** (per [`contribute/canonical-module.md`](../modules/contribute/canonical-module.md) §4 step 3):

- [`packages/sdk/module-sdk/src/reservedCodes.ts`](../../packages/sdk/module-sdk/src/reservedCodes.ts) — `pim` added to `RESERVED_CANONICAL_MODULE_CODES`.
- [`packages/sdk/module-sdk/dist/`](../../packages/sdk/module-sdk/dist/) — rebuilt via `npm run build` in the workspace's module-sdk container.
- [RFC-0001 §4](0001-modules-tiers-governance-and-automation-placement.md) — reserved-code table extended; `pim` added to §4's bulleted enumeration; amendment footer recording this RFC's allocation event.
- [RFC-0001 §5 Tier 1 row](0001-modules-tiers-governance-and-automation-placement.md) — example column includes `pim`.
- [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §1.1.1 — canonical-set inventory sentence includes `pim`.
- [`docs/MODULES.md`](../MODULES.md) §3.1 — open-door row for `pim`; glossary "reserved canonical code" enumeration includes `pim`.
- [`docs/modules/contribute/canonical-module.md`](../modules/contribute/canonical-module.md) §0 — already-allocated list includes `pim`.
- [`docs/modules/canonical/pim.md`](../modules/canonical/pim.md) — new open-door stub modeled on [`mrp.md`](../modules/canonical/mrp.md) / [`crp.md`](../modules/canonical/crp.md).
- [`docs/modules/README.md`](../modules/README.md) — "What's here today" table includes the new `canonical/pim.md` row.
- [`services/api/src/modules/automation/README.md`](../../services/api/src/modules/automation/README.md) — "alongside" list of other reserved codes includes `pim`.
- [`DEVELOPMENT-LOCAL.md`](../../DEVELOPMENT-LOCAL.md) §RFCs — reserved-code enumeration includes `pim`.

**Out of scope of this PR** (subsequent work, called out for clarity):

- Surface design doc (`docs/design/canonical-pim-module-surface.md`).
- Phase A contracts package (`packages/canonical/pim/contracts/`).
- Phase B read path (`services/api/src/modules/pim/`).

**Change procedure for this RFC.** Future amendments follow the same RFC process documented in [`docs/LICENSING.md`](../LICENSING.md) §10 and [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §13. De-allocation of `pim` (the reverse operation) requires a successor RFC explicitly named as a de-allocation, following [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §6 step 5's forward-only rule.

---

## 9. Cross-references

- [RFC-0001 §4](0001-modules-tiers-governance-and-automation-placement.md) — reserved canonical codes (Decision B), the set this RFC extends.
- [RFC-0001 §4.2](0001-modules-tiers-governance-and-automation-placement.md) — YAGNI clause this RFC explicitly stretches (§2.2, §2.3 above).
- [RFC-0001 §6](0001-modules-tiers-governance-and-automation-placement.md) — Decision D governance (mini-RFC procedure this RFC instantiates).
- [RFC-0001 §8](0001-modules-tiers-governance-and-automation-placement.md) — Decision F consumption contract (§4 checklist above).
- [RFC-0002](0002-canonical-module-physical-layout.md) §3–§4 — canonical-module β layout `pim` will follow when implementation begins.
- [RFC-0003](0003-validation-library-adoption.md) — Zod v4 standard `@umbraculum/pim-contracts` will adopt from Phase A.
- [`docs/modules/contribute/canonical-module.md`](../modules/contribute/canonical-module.md) — the contributor-facing path this RFC instantiates.
- [`docs/modules/canonical/pim.md`](../modules/canonical/pim.md) — the open-door stub landed by this RFC.
- [`docs/design/canonical-automation-module-surface.md`](../design/canonical-automation-module-surface.md) — the worked-example template the eventual `canonical-pim-module-surface.md` will follow.
- [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §1.1, §1.1.1, §5.2 — platform-level positioning of the canonical set and the brewery-vertical migration trajectory PIM participates in.
