# `brewery` — vertical configuration (reference)

**Tier:** Public
**Status:** **Shipped — reference vertical.** Flat layout today (`services/api/src/routes/*.ts`, `apps/web/app/[locale]/{recipes,equipment,inventory,...}/`); β migration deferred to H1 2027 per [RFC-0002 Decision D](../../rfcs/0002-canonical-module-physical-layout.md).
**Code:** `brewery`
**Module tier:** 6 (vertical configuration — permissionless, but this bundle is core-team-maintained alongside the canonical set).
**License:** AGPLv3 (this bundle, alongside the core; third-party brewery-shaped verticals follow the author's choice — see [LICENSING.md](../../LICENSING.md)).
**Audience:** anyone building a vertical configuration on Umbraculum (the brewery vertical is the worked example), or evaluating the platform's "process-manufacturing platform, brewery-configured by default" positioning.

> [!NOTE]
> Per-vertical-configuration page for `brewery` — the **reference** Tier 6 configuration. Future verticals (distillery, kombucha, cosmetics, food-batch, fragrance) follow this shape ([PLATFORM-ARCHITECTURE.md §1.1](../../PLATFORM-ARCHITECTURE.md)). This page documents the vertical as it exists *today* (flat layout) and the β shape it migrates *to* (H1 2027). When the H1 2027 migration ships, the "Today" tables update to reflect the new paths; the rest of the page stays valid.

---

## 1. What a vertical configuration is

A **vertical configuration** is a non-canonical module ([Tier 6 in RFC-0001 §5](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md)). Same physical β shape as a canonical module (API + web + native + contracts slices sharing a code), but the `code` is *not* in the reserved canonical set. Permissionless: anyone can ship one.

A vertical configuration **consumes** the canonical-module surface and adds:

- vertical-specific seed data (for brewery: BJCP styles, BeerJSON, default fermentables / hops / yeast catalogs, water-chemistry models, hop bitterness math),
- vertical-specific AI prompts and knowledge sources (brew-day templates, recipe-style guidelines),
- vertical-specific UI flows and routes (the recipe editor, the brewing-process visualizations),
- vertical-specific i18n strings under a vertical-prefixed namespace,
- vertical-specific tier-limit slices (for brewery: `maxRecipesPerWorkspace`).

What a vertical configuration **does NOT** ship: parallel implementations of canonical-domain semantics. The brewery vertical does *not* implement its own production-planning logic — once `mrp` ships, brewery brew-sessions flow into MRP primitives. The brewery vertical does *not* implement its own inventory model — once `wms` ships, brewery's ingredients/inventory surface flows into WMS. See [RFC-0001 §5](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) (the Tier 6 row).

---

## 2. The category mistake to avoid

Per [PLATFORM-ARCHITECTURE.md §1.1.1](../../PLATFORM-ARCHITECTURE.md) and [RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md):

> "Treating brewery as a canonical module would be the category mistake of building a CRM for a hotel and calling it Hotel instead of CRM. The hotel is the vertical; the CRM is the canonical domain."

For brewery: the brewery is the vertical; production planning (`mrp`), inventory (`wms`), capacity (`crp`), customer relationships (`crm`), and automation (`automation`) are the canonical domains. This page documents the *vertical*, not any canonical domain.

---

## 3. Today's surface (flat, pre-H1 2027)

### 3.1 API — brewery-vertical flat routes ([`services/api/src/routes/`](../../../services/api/src/routes/))

| Route file | What it owns |
|---|---|
| `recipes.ts` | Brewery recipe CRUD (BeerJSON-shaped). |
| `recipesImport.ts` / `recipesExport.ts` | Import / export round-trip (BeerJSON-first per [BEERJSON-FIRST.md](../../BEERJSON-FIRST.md)). |
| `recipeWaterSettings.ts` / `recipeWaterHubSummary.ts` / `recipeWaterComputeAndSave.ts` | Water-chemistry math per recipe ([WATER-CHEM-MASH-PH-MODEL.md](../../WATER-CHEM-MASH-PH-MODEL.md)). |
| `waterCalc.ts` / `waterProfiles.ts` | Water-profile library and calculation endpoint. |
| `brewSessions.ts` / `brewdaySettings.ts` | Brew-session lifecycle (future MRP production-order surface — [§4 below](#4-canonical-module-consumption-today-and-planned)). |
| `equipmentProfiles.ts` | Brewery equipment profiles (cross-link target for `automation.Vessel.equipmentProfileId` per [canonical-automation-module-surface.md §4](../../design/canonical-automation-module-surface.md)). |
| `ingredients.ts` / `styles.ts` / `inventory.ts` | Brewery ingredient catalogs, BJCP styles, on-hand inventory. |
| `integrationsTilt.ts` / `integrationsTiltIngest.ts` / `integrationsReveal.ts` | Brewing-device integrations through the platform integrations framework. |

These migrate to `services/api/src/modules/brewery/` in the H1 2027 tranche.

### 3.2 Web — brewery-vertical flat segments ([`apps/web/app/[locale]/`](../../../apps/web/app/[locale]/))

| Segment | What it owns |
|---|---|
| `recipes/` | Recipe library, recipe edit, water-step pages, yeast page. |
| `equipment/` | Equipment-profile editor. |
| `water-profiles/` | Water-profile library editor. |
| `brewday-steps-settings/` | Brewday step configuration. |
| `ferm-data-integration/` | Fermentation integration setup (Tilt / iSpindel / RAPT). |
| `inventory/` | On-hand inventory view. |

These migrate to `apps/web/app/[locale]/(brewery)/` (Next.js route group — no URL change) in the H1 2027 tranche.

### 3.3 Native — brewery screens ([`apps/native/src/screens/`](../../../apps/native/src/screens/))

Today brewery screens are flat under `apps/native/src/screens/` (`RecipesListScreen`, `RecipeEditScreen`, `WaterMashScreen`, `YeastScreen`, `BrewSessionsListScreen`, etc.). They migrate to `apps/native/src/modules/brewery/` in the H1 2027 tranche.

### 3.4 Brewery-vertical packages

| Package (current name) | End-state name | Role |
|---|---|---|
| `@umbraculum/brewery-core` ([`packages/core/`](../../../packages/core/)) | (already renamed — slot 6 done) | Brewing math: gravity, water chemistry, unit conversions. |
| `@brewery/beerjson` ([`packages/beerjson/`](../../../packages/beerjson/README.md)) | `@umbraculum/brewery-beerjson` (slot 12 pending) | BeerJSON spec layer. |
| `@brewery/recipes-ui` ([`packages/recipes-ui/`](../../../packages/recipes-ui/README.md)) | `@umbraculum/brewery-recipes-ui` (slot 13 pending) | Recipe / mash / water / yeast UI components. |

The `@umbraculum/brewery-<name>` scope prefix is the [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md) convention for vertical-flavored packages — distinguishes them from horizontal packages (`@umbraculum/i18n`, `@umbraculum/ui`, …) at a glance.

### 3.5 Brewery-vertical i18n namespace

Brewery strings live under brewery-specific namespaces inside [`packages/i18n/src/en.json`](../../../packages/i18n/src/en.json) (e.g. `recipes.*`, `waterHub.*`, `math.*`). The package itself is platform-neutral; the *content* is brewery-flavored. A content split (extracting brewery strings into a separate `brewery-locales` bundle) is deferred per [sub-plan #9 plan doc §1.4](../../design/brewery-scope-migration-plan.md).

### 3.6 Brewery-vertical domain docs

Brewery-specific modeling and analytical references live under `docs/` today (will move into a `brewery/` module documentation set with the H1 2027 reframe):

- [BEERJSON-FIRST.md](../../BEERJSON-FIRST.md) — BeerJSON-first data model.
- [EQUIPMENT-AND-GRAVITY-ANALYSIS.md](../../EQUIPMENT-AND-GRAVITY-ANALYSIS.md) — efficiency, losses, yields.
- [WATER-CHEM-MASH-PH-MODEL.md](../../WATER-CHEM-MASH-PH-MODEL.md) — water chemistry, mash pH.
- [YEAST-MATH.md](../../YEAST-MATH.md) — pitching, propagation math.
- [RAW-MATERIALS-SEEDABLE-SOURCES.md](../../RAW-MATERIALS-SEEDABLE-SOURCES.md) — seed data sources.

---

## 4. Canonical-module consumption — today and planned

The brewery vertical's role is to **consume** canonical modules, not to compete with them. Mapping each canonical concern to the brewery surface:

| Canonical module | Status | How brewery uses it |
|---|---|---|
| `automation` | **Shipped (Phase B)** | The `(automation)/` shell shows brewery vessels (fermenters, kettles); brewery's `EquipmentProfile.id` is the planned cross-schema reference target for `automation.Vessel.equipmentProfileId` ([surface design §12.3](../../design/canonical-automation-module-surface.md)). Phase C lands the `brewery.openplc.v1` adapter — the brewery-specific Modbus implementation against the canonical adapter contract. |
| `mrp` | Open door (H1 2027) | Brew sessions become production orders; recipes become bills of materials. Coordinated migration per [PLATFORM-ARCHITECTURE.md §5.2](../../PLATFORM-ARCHITECTURE.md). |
| `wms` | Open door (H2 2027) | Brewery ingredients become catalog SKUs; the on-hand inventory becomes WMS stock-on-hand. |
| `crp` | Open door (H1 2027) | Vessels-as-resources, brew-session scheduling — co-designed with `mrp` per [crp.md](../canonical/crp.md). |
| `crm` | Open door (no firm horizon) | Brewery is currently CRM-light; a brewery configuration that needs distributor relationships would be the first concrete demand signal. |

---

## 5. The H1 2027 β migration — concrete folder moves

Per [RFC-0002 §11.2](../../rfcs/0002-canonical-module-physical-layout.md), the brewery flat surface migrates to β when the second canonical module ships:

| From (today) | To (β target) |
|---|---|
| `services/api/src/routes/recipes.ts` (+ siblings) | `services/api/src/modules/brewery/routes/recipes.ts` (file split refined in the migration PR) |
| `apps/web/app/[locale]/recipes/**` | `apps/web/app/[locale]/(brewery)/recipes/**` (route group — no URL change) |
| `apps/web/app/[locale]/inventory/**`, `.../equipment/**`, etc. | `apps/web/app/[locale]/(brewery)/...` |
| `apps/native/src/screens/Recipe*Screen.tsx` (+ siblings) | `apps/native/src/modules/brewery/...` |
| `services/api/src/app.ts` flat `register` calls | `registerModule({ code: "brewery", ... })` via `@umbraculum/module-sdk` |
| `@brewery/*` workspace names | `@umbraculum/*` (horizontal) + `@umbraculum/brewery-*` (vertical-flavored) per [sub-plan #9](../../design/brewery-scope-migration-plan.md) |

Brewery tables in Postgres stay in `public` for the H1 2027 migration; a separate follow-on migration may eventually split a `brewery` schema ([RFC-0002 §11.4](../../rfcs/0002-canonical-module-physical-layout.md)).

---

## 6. How to build your own vertical configuration

The brewery vertical is the worked example for `distillery`, `kombucha`, `cosmetics`, `food-batch`, and any other vertical configuration. To bootstrap a new one:

1. **Pick a code** — lowercase, no prefix, not in the reserved canonical set (those are `mrp`, `wms`, `crm`, `crp`, `automation`). Vertical codes are permissionless.
2. **Decide which canonical modules you consume** — at minimum `automation` if you have physical equipment, likely `mrp` + `wms` once those ship. You may also build without any canonical (a pure config layer).
3. **Scaffold the β four slices** — `services/api/src/modules/<your-code>/`, `apps/web/app/[locale]/(<your-code>)/`, `apps/native/src/modules/<your-code>/`, `packages/<your-code>-contracts/`. The brewery vertical's H1 2027 target shape (see §5 above) is the template.
4. **Vertical-flavored packages** carry `@umbraculum/<your-code>-<name>` prefixes (mirror `@umbraculum/brewery-core`, `@umbraculum/brewery-beerjson`, etc.).
5. **Respect the consumption contract** — never reimplement auth, billing, AI, observability, integrations, i18n, UI primitives, secrets, HTTP, DB. Use the platform's. See [RFC-0001 §8](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) for the per-service obligation table.
6. **Register via `@umbraculum/module-sdk`** — `registerModule({ code: "<your-code>", ... })`. Collision with a reserved canonical code is a boot error.
7. **Ship**. Tier 6 is permissionless — no mini-RFC required.

If your vertical wants to be **bundled** with the platform's hosted offering (the way `brewery` is bundled today), that's a separate conversation with the core team and is not part of the technical contribution path.

---

## 7. Cross-references

- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5 (Tier 6 row), §8 (consumption contract).
- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §3 (β layout), §6 (Decision D — brewery sequencing), §11.2 (concrete migration table).
- [PLATFORM-ARCHITECTURE.md](../../PLATFORM-ARCHITECTURE.md) §1.1 (platform-not-brewery framing), §1.1.1 (peer-canonical decomposition), §5.2 (H1 2027 restructure).
- [`docs/design/brewery-scope-migration-plan.md`](../../design/brewery-scope-migration-plan.md) — sub-plan #9 plan doc (npm scope rename).
- [`docs/design/brewery-scope-migration-per-package-handoff.md`](../../design/brewery-scope-migration-per-package-handoff.md) — per-slot execution checklist.
- [`docs/MODULES.md`](../../MODULES.md) — ecosystem entry page.
- [`canonical/automation.md`](../canonical/automation.md) — the canonical module brewery consumes today.
