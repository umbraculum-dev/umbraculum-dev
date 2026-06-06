# `brewery` — vertical configuration (reference)

**Tier:** Public
**Status:** **Shipped — reference vertical.** β file relocation accelerated by [RFC-0006](../../../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md): API, web, and native brewery slices now live under module-shaped paths. Prisma `brewery.*` schema split shipped under [RFC-0010](../../../rfcs/0010-platform-brewery-postgres-schema-split.md) (2026-05-28); horizontal platform tables live in `platform.*`.
**Code:** `brewery`
**Module tier:** 6 (vertical configuration — permissionless, but this bundle is core-team-maintained alongside the canonical set).
**License:** AGPLv3 (this bundle, alongside the core; third-party brewery-shaped verticals follow the author's choice — see [LICENSING.md](../../../LICENSING.md)).
**Audience:** anyone building a vertical configuration on Umbraculum (the brewery vertical is the worked example), or evaluating how a complex reference vertical exercises the platform's operational-application toolset.

> [!NOTE]
> Per-vertical-configuration page for `brewery` — the **reference** Tier 6 configuration. Future verticals (distillery, kombucha, cosmetics, food-batch, fragrance) follow this shape ([PLATFORM-ARCHITECTURE.md §1.1](../../../PLATFORM-ARCHITECTURE.md)). This page documents the vertical as a vertical: brewery-specific data, prompts, UI flows, and domain references live here, not beside platform-core docs.

---

## 1. What a vertical configuration is

A **vertical configuration** is a non-canonical module ([Tier 6 in RFC-0001 §5](../../../rfcs/0001-modules-tiers-governance-and-automation-placement.md)). Same physical β shape as a canonical module (API + web + native + contracts slices sharing a code), but the `code` is *not* in the reserved canonical set. Permissionless: anyone can ship one.

A vertical configuration **consumes** the canonical-module surface and adds:

- vertical-specific seed data (for brewery: BJCP styles, BeerJSON, default fermentables / hops / yeast catalogs, water-chemistry models, hop bitterness math),
- vertical-specific AI prompts and knowledge sources (brew-day templates, recipe-style guidelines),
- vertical-specific UI flows and routes (the recipe editor, the brewing-process visualizations),
- vertical-specific i18n strings under a vertical-prefixed namespace,
- vertical-specific tier-limit slices (for brewery: `maxRecipesPerWorkspace`).

What a vertical configuration **does NOT** ship: parallel implementations of canonical-domain semantics. The brewery vertical does *not* implement its own production-planning logic — once `mrp` ships, brewery brew-sessions flow into MRP primitives. The brewery vertical does *not* implement its own inventory model — once `wms` ships, brewery's ingredients/inventory surface flows into WMS. See [RFC-0001 §5](../../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) (the Tier 6 row).

---

## 2. The category mistake to avoid

Per [PLATFORM-ARCHITECTURE.md §1.1.1](../../../PLATFORM-ARCHITECTURE.md) and [RFC-0001 §4](../../../rfcs/0001-modules-tiers-governance-and-automation-placement.md):

> "Treating brewery as a canonical module would be the category mistake of building a CRM for a hotel and calling it Hotel instead of CRM. The hotel is the vertical; the CRM is the canonical domain."

For brewery: the brewery is the vertical; production planning (`mrp`), inventory (`wms`), capacity (`crp`), customer relationships (`crm`), and automation (`automation`) are the canonical domains. This page documents the *vertical*, not any canonical domain.

---

## 3. Today's surface (β file layout, `brewery.*` schema shipped)

### 3.1 API — brewery-vertical routes ([`services/api/src/modules/brewery/`](../../../../services/api/src/modules/brewery/))

| Route file | What it owns |
|---|---|
| `recipes.ts` | Brewery recipe CRUD (BeerJSON-shaped). |
| `recipesImport.ts` / `recipesExport.ts` | Import / export round-trip (BeerJSON-first per [BEERJSON-FIRST.md](BEERJSON-FIRST.md)). |
| `recipeWaterSettings.ts` / `recipeWaterHubSummary.ts` / `recipeWaterComputeAndSave.ts` | Water-chemistry math per recipe ([WATER-CHEM-MASH-PH-MODEL.md](WATER-CHEM-MASH-PH-MODEL.md)). |
| `waterCalc.ts` / `waterProfiles.ts` | Water-profile library and calculation endpoint. |
| `brewSessions.ts` / `brewdaySettings.ts` | Brew-session lifecycle (future MRP production-order surface — [§4 below](#4-canonical-module-consumption--today-and-planned)). |
| `equipmentProfiles.ts` | Brewery equipment profiles (cross-link target for `automation.Vessel.equipmentProfileId` per [canonical-automation-module-surface.md §4](../../../design/canonical-automation-module-surface.md)). |
| `ingredients.ts` / `styles.ts` / `inventory.ts` | Brewery ingredient catalogs, BJCP styles, on-hand inventory. |
| `integrationsTilt.ts` / `integrationsTiltIngest.ts` / `integrationsReveal.ts` | Brewing-device integrations through the platform integrations framework. |

Routes are registered from [`services/api/src/modules/brewery/index.ts`](../../../../services/api/src/modules/brewery/index.ts). Brewery domain tables live in the Prisma `brewery` schema (`registerModule({ code: "brewery", prismaSchema: "brewery" })` per [RFC-0010](../../../rfcs/0010-platform-brewery-postgres-schema-split.md)).

### 3.2 Web — brewery-vertical route group ([`apps/web/app/[locale]/(brewery)/`](../../../../apps/web/app/[locale]/(brewery)/))

| Segment | What it owns |
|---|---|
| `recipes/` | Recipe library (`page.tsx`), import, edit (`[id]/edit/`), water steps (`[id]/water/{mash,sparge,boil}`), yeast (`[id]/yeast/`), brew sessions (`[id]/brew-sessions/`), versions (`[id]/versions/`). Shared helpers: `recipes/_components/`, `recipes/_lib/`. |
| `equipment/` | Equipment-profile editor. |
| `water-profiles/` | Water-profile library editor. |
| `brewday-steps-settings/` | Brewday step configuration. |
| `ferm-data-integration/` | Fermentation integration setup (Tilt / iSpindel / RAPT). |
| `inventory/` | On-hand inventory view. |

The `(brewery)/` route group is structural only; URLs remain `/en/recipes`, `/en/inventory`, `/en/equipment`, etc. The URL-segment registry prevents another module from claiming those paths.

### 3.3 Native — brewery screens ([`apps/native/src/modules/brewery/`](../../../../apps/native/src/modules/brewery/))

Brewery screens live under `apps/native/src/modules/brewery/screens/` (`RecipesListScreen`, `RecipeEditScreen`, `WaterMashScreen`, `YeastScreen`, `BrewSessionsListScreen`, etc.). Native route registration is recorded via `registerNativeModule({ code: "brewery", ... })` at app bootstrap ([`registerPlatformNativeModules.ts`](../../../../apps/native/src/navigation/registerPlatformNativeModules.ts)); React Navigation wiring remains in [`AppNavigator.tsx`](../../../../apps/native/src/navigation/AppNavigator.tsx).

**Brew-day only on native.** MRP/CRP read models, AI planning advisor tools, and RFC-0007 document exports are **web-first** (see §4 below and [`canonical-native-platform-surface.md`](../../../design/canonical-native-platform-surface.md)). Operators who need inventory or planning on a phone today use **Open on web** (whitelisted `inventory` route) or the web app in a browser—not native screens for `productionOrders`, `capacity`, etc.

**Ubuntu Touch** uses the **web slice** in a Lomiri Click webapp (online-first). Brew-day offline logging remains **iOS/Android native only** — see [`ubuntu-touch-shell-strategy.md`](../../../design/ubuntu-touch-shell-strategy.md).

### 3.4 Brewery-vertical packages

| Package | Sub-plan #9 slot | Role |
|---|---|---|
| `@umbraculum/brewery-core` ([`packages/core/`](../../../../packages/core/)) | slot 6 (done) | Brewing math: gravity, water chemistry, unit conversions. |
| `@umbraculum/brewery-beerjson` ([`packages/beerjson/`](../../../../packages/beerjson/README.md)) | slot 12 (done) | BeerJSON spec layer. |
| `@umbraculum/brewery-recipes-ui` ([`packages/recipes-ui/`](../../../../packages/recipes-ui/README.md)) | slot 13 (done) | Recipe / mash / water / yeast UI components. |

The `@umbraculum/brewery-<name>` scope prefix is the [RFC-0002 §4](../../../rfcs/0002-canonical-module-physical-layout.md) convention for vertical-flavored packages — distinguishes them from horizontal packages (`@umbraculum/i18n`, `@umbraculum/ui`, …) at a glance.

### 3.5 Brewery-vertical i18n namespace

Brewery strings live under brewery-specific namespaces inside [`packages/i18n/src/en.json`](../../../../packages/i18n/src/en.json) (e.g. `recipes.*`, `waterHub.*`, `math.*`). The package itself is platform-neutral; the *content* is brewery-flavored. A content split (extracting brewery strings into a separate `brewery-locales` bundle) is deferred per [sub-plan #9 plan doc §1.4](../../../design/brewery-scope-migration-plan.md).

### 3.6 Brewery-vertical domain docs

Brewery-specific modeling and analytical references live beside this overview so the docs site presents them under the brewery reference vertical, not beside platform-core docs:

- [BEERJSON-FIRST.md](BEERJSON-FIRST.md) — BeerJSON-first data model.
- [EQUIPMENT-AND-GRAVITY-ANALYSIS.md](EQUIPMENT-AND-GRAVITY-ANALYSIS.md) — efficiency, losses, yields.
- [WATER-CHEM-MASH-PH-MODEL.md](WATER-CHEM-MASH-PH-MODEL.md) — water chemistry, mash pH.
- [YEAST-MATH.md](YEAST-MATH.md) — pitching, propagation math.
- [RAW-MATERIALS-SEEDABLE-SOURCES.md](RAW-MATERIALS-SEEDABLE-SOURCES.md) — seed data sources.

### 3.7 Sister repos — the OpenPLC PLC slice

The brewery vertical's surface is not exclusively TypeScript. A substantial code asset lives in a **sister repository** alongside this monorepo: the **OpenPLC project** that owns the brewery's safety-validated PLC ladder logic (alarm interlocks, pump priority, low/high level sensors, runtime upload bundle).

Conceptually that sister repo IS part of the brewery vertical — it is the brewery-specific implementation of the [`automation`](../../canonical/automation.md) canonical's adapter contract at the PLC layer (the `brewery.openplc.v1` adapter, Phase C pending). It is co-owned and co-versioned with the platform-side brewery code via the `integrated_release_tag` discipline.

#### 3.7.1 What lives in the sister repo

Per [canonical-automation-module-surface.md §5.1](../../../design/canonical-automation-module-surface.md):

- **Safety-validated alarm ladder / interlocks** — the frozen `2.0.1-dev` baseline. Owned by the sister repo, not duplicated in TypeScript.
- **OpenPLC Editor artifacts** — serialized `.xml`, compiled `.st`, bench vs field profile configurations.
- **Runtime upload bundle** — `prepare_openplc_runtime_upload.py` and its output, the canonical artifact uploaded to the OpenPLC runtime (bench Linux runtime, port 502) or the CONTROLLINO MEGA Pure (field, Modbus RTU over USB-Serial).
- **`PI_*` Modbus mailbox source of truth** — the address map for every coil and holding register exchanged between the PLC and the platform.
- **Pi sidecar (field UI)** — the FastAPI + Jinja application that gives operators on-site a controller UI when the platform cloud is unreachable.

#### 3.7.2 Why the physical separation is correct (and durable)

The sister-repo arrangement is not accidental colocation drift — it is the *result* of four binding boundary conditions, all of which still hold:

1. **Validation boundary.** The alarm ladder is safety-validated PLC code subject to its own validation regime. Co-locating with TypeScript invites "let me just tweak this" edits that break the validation chain. The frozen `2.0.1-dev` baseline depends on the separation.
2. **Runtime asymmetry.** PLC code runs on a CONTROLLINO MEGA Pure (field profile — Modbus RTU over USB-Serial) or on a Linux-hosted OpenPLC Runtime (bench profile — Modbus TCP on port 502). The `PI_*` map is identical across both profiles; only the transport changes. Platform code runs in Node.js / web — entirely different deploy targets, different release cadences. (Bench-vs-field profile discipline is owned by the OpenPLC sister repo's own contribution rules.)
3. **Toolchain isolation.** OpenPLC Editor uses serialized XML and Structured Text (`.st`); mixing with TypeScript tooling helps no one and creates accidental coupling.
4. **Lifecycle independence.** PLC releases follow sister-repo validation discipline; the platform ships on normal API / web cadence. Coupling by repo would force one cadence on the other.

This is the standard "multi-runtime module with a versioned interface contract" pattern — same shape as a mobile SDK + backend, or a hardware driver + control plane.

#### 3.7.3 The contract layer — `PI_*` mailbox + `CONTRACT_VERSION` + integrated release tag

The two repos are joined by an explicit, versioned contract:

- **`PI_*` Modbus mailbox spec** — sister repo is the source of truth; platform mirrors via a script-generated artifact (`PI_*.json` / `.ts`) checked into [`packages/automation-contracts/`](../../../../packages/automation-contracts/README.md) via PR. Drift is visible in PR diffs rather than at runtime. Per [canonical-automation-module-surface.md §12.2](../../../design/canonical-automation-module-surface.md).
- **`CONTRACT_VERSION` handshake** — major-version mismatch refuses connection; minor mismatch warns and continues. Pinned in `@umbraculum/automation-contracts`.
- **`integrated_release_tag`** — the PLC version + sidecar version + contract_version + API version move together as one coordinated baseline. (The integrated-release-versioning discipline is documented and enforced in the OpenPLC sister repo; the discipline is what lets the two repos evolve independently without diverging out of compatibility silently.)

#### 3.7.4 Navigational pointer

The OpenPLC sister repo's location, branding, and public URL are out of scope for this page (and per-developer for now). For now, the binding source-of-truth pointer is [canonical-automation-module-surface.md §5](../../../design/canonical-automation-module-surface.md) + [§12.2 (B1 — mailbox SoT)](../../../design/canonical-automation-module-surface.md), which the surface-design doc maintainers keep current. The audience line of that doc explicitly lists "OpenPLC sister-repo maintainers" — the two doc sets are designed to stay in sync.

#### 3.7.5 What this means for contributors

- A contributor working on the brewery vertical's **platform side** (TypeScript, Prisma, AI tools, UI) operates entirely in this monorepo and consumes the mirrored mailbox spec from `@umbraculum/automation-contracts`.
- A contributor working on the brewery vertical's **PLC side** (alarm ladder, runtime, mailbox additions) operates in the sister repo, follows its validation discipline, and proposes mailbox changes there first; the platform mirror updates by PR after.
- A contributor adding a **new mailbox entry** opens a PR in the sister repo first (it is the SoT), then opens a paired PR in this monorepo to update the `@umbraculum/automation-contracts` mirror. Both PRs land under one `integrated_release_tag` bump.

---

## 4. Canonical-module consumption — today and planned

The brewery vertical's role is to **consume** canonical modules, not to compete with them. Mapping each canonical concern to the brewery surface:

| Canonical module | Status | How brewery uses it |
|---|---|---|
| `automation` | **Shipped (Phase B)** | The `(automation)/` shell shows brewery vessels (fermenters, kettles); brewery's `EquipmentProfile.id` is the planned cross-schema reference target for `automation.Vessel.equipmentProfileId` ([surface design §12.3](../../../design/canonical-automation-module-surface.md)). Phase C lands the `brewery.openplc.v1` adapter — the brewery-specific Modbus implementation against the canonical adapter contract. |
| `mrp` | **H2 2026 alpha shipped** (Waves 1–6 + demo closure); human walkthrough sign-off + write workflows → [ROADMAP § H2 2026 MRP/CRP](../../../ROADMAP.md#h2-2026--first-class-mrpcrp-alpha--platform-repositioning); mature scope → H1 2027 | Brew sessions project as production orders, recipes as BOMs, session steps as operations, and recipe ingredients as assumption-only material requirements through canonical MRP read routes, web pages, AI advisor tools, and browser-triggered RFC-0007 exports (work-order PDF, route card, material-requirements XLSX, order-list CSV). Read-time projection only: brewery remains source of truth; no MRP write workflow is implied. |
| `wms` | Open door (H2 2027) | Brewery ingredients become catalog SKUs; the on-hand inventory becomes WMS stock-on-hand. |
| `crp` | **H2 2026 alpha shipped** (Waves 1–6 + demo closure); human walkthrough sign-off + write workflows → [ROADMAP § H2 2026 MRP/CRP](../../../ROADMAP.md#h2-2026--first-class-mrpcrp-alpha--platform-repositioning); mature scope → H1 2027 | Automation vessels project as CRP resources, equipment profiles as work centers, and timed brew-session steps as scheduled operations/load/conflicts through canonical CRP read routes, web pages, AI advisor tools, and browser-triggered RFC-0007 exports (capacity-load XLSX, schedule PDF, conflict report, resource calendar CSV). Read-time projection only: brewery/automation remain source of truth; no CRP write workflow or optimizer is implied. |
| `crm` | Open door (no firm horizon) | Brewery is currently CRM-light; a brewery configuration that needs distributor relationships would be the first concrete demand signal. |

---

## 5. β relocation status — what moved and what remains

Per [RFC-0006](../../../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md), the brewery file relocation moved ahead of the original H1 2027 window after PIM shipped and the web URL-segment registry made the boundary cheap to enforce. The current state:

| Surface | Status |
|---|---|
| API route files | **Moved** to `services/api/src/modules/brewery/routes/`. |
| Web route segments | **Moved** to `apps/web/app/[locale]/(brewery)/` with no URL change. |
| Native screens | **Moved** to `apps/native/src/modules/brewery/screens/`. |
| Module registration | **Moved** behind `registerBreweryModule()` / `registerModule({ code: "brewery", ... })` via `@umbraculum/module-sdk`. |
| Workspace package names | **Moved** to `@umbraculum/*` for horizontal packages and `@umbraculum/brewery-*` for vertical-flavored packages per [sub-plan #9](../../../design/brewery-scope-migration-plan.md). |
| Brewery domain docs | **Moved in this docs pass** to `docs/modules/verticals/brewery/` so the docs site renders them under the reference vertical. |
| Prisma schema | **Shipped** — brewery domain tables in `brewery.*`; horizontal tenancy/auth/billing/integrations in `platform.*` ([RFC-0010](../../../rfcs/0010-platform-brewery-postgres-schema-split.md); runbook [`platform-brewery-postgres-schema-split.md`](../../../design/platform-brewery-postgres-schema-split.md)). |

The file-move and schema split were sequenced separately on purpose: RFC-0006 accelerated filesystem relocation; RFC-0010 landed the data-layer split before the July 2026 public seed.

---

## 6. How to build your own vertical configuration

The brewery vertical is the worked example for `distillery`, `kombucha`, `cosmetics`, `food-batch`, and any other vertical configuration. To bootstrap a new one:

1. **Pick a code** — lowercase, no prefix, not in the reserved canonical set (those are `mrp`, `wms`, `crm`, `crp`, `automation`). Vertical codes are permissionless.
2. **Decide which canonical modules you consume** — at minimum `automation` if you have physical equipment, likely `mrp` + `wms` once those ship. You may also build without any canonical (a pure config layer).
3. **Scaffold the β four slices** — `services/api/src/modules/<your-code>/`, `apps/web/app/[locale]/(<your-code>)/`, `apps/native/src/modules/<your-code>/`, `packages/<your-code>-contracts/`. The brewery vertical's current shape (see §5 above) is the template.
4. **Vertical-flavored packages** carry `@umbraculum/<your-code>-<name>` prefixes (mirror `@umbraculum/brewery-core`, `@umbraculum/brewery-beerjson`, etc.).
5. **Respect the consumption contract** — never reimplement auth, billing, AI, observability, integrations, i18n, UI primitives, secrets, HTTP, DB. Use the platform's. See [RFC-0001 §8](../../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) for the per-service obligation table.
6. **Register via `@umbraculum/module-sdk`** — `registerModule({ code: "<your-code>", ... })`. Collision with a reserved canonical code is a boot error.
7. **Ship**. Tier 6 is permissionless — no mini-RFC required.

If your vertical wants to be **bundled** with the platform's hosted offering (the way `brewery` is bundled today), that's a separate conversation with the core team and is not part of the technical contribution path.

**Omitting brewery when building product X:** deploy profile + workspace add-ons — [`BUILDING-YOUR-VERTICAL.md`](../../../BUILDING-YOUR-VERTICAL.md), [`design/platform-module-profile.md`](../../../design/platform-module-profile.md).

### OpenAPI (brewery tag)

Brewery HTTP routes migrated to `zodApp` + `schema.tags: ['brewery']` appear in the **optional add-on spec** [`services/api/openapi/brewery.json`](../../../../services/api/openapi/brewery.json) (**55 paths / 70 operations** as of 2026-05-31 Phase C: styles, equipment, inventory, brewday settings, recipes, BeerJSON export/import, ingredients, brew sessions, water profiles/settings/calc). They are **not** in the platform catalog [`openapi.json`](../../../../services/api/openapi/openapi.json). Index: [`API-OPENAPI.md`](../../../API-OPENAPI.md).

---

## 7. Cross-references

- [`IMPLEMENTATION-LOG.md`](IMPLEMENTATION-LOG.md) — brewery vertical product rules, offline/sync intent, water/recipe constraints, living engineering constraints.
- [`CROSS-PLATFORM-BOUNDARIES.md`](../../../CROSS-PLATFORM-BOUNDARIES.md) — web/native as-built boundaries (route IDs, auth, webview bridge).
- [`design/ubuntu-touch-shell-strategy.md`](../../../design/ubuntu-touch-shell-strategy.md) — Ubuntu Touch webapp shell (web workflows; no offline brew-day).
- [`design/platform-module-profile.md`](../../../design/platform-module-profile.md) — F-mod deploy profile (`reference` vs `platform`).
- [`API-OPENAPI.md`](../../../API-OPENAPI.md) — platform catalog + brewery add-on OpenAPI specs
- [RFC-0002](../../../rfcs/0002-canonical-module-physical-layout.md) §3 (β layout), §6 (Decision D — brewery sequencing), §11.2 (concrete migration table).
- [RFC-0006](../../../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) — accelerated brewery file relocation.
- [PLATFORM-ARCHITECTURE.md](../../../PLATFORM-ARCHITECTURE.md) §1.1 (platform-not-brewery framing), §1.1.1 (peer-canonical decomposition), §5.2 (module/vertical restructure).
- [`docs/design/brewery-scope-migration-plan.md`](../../../design/brewery-scope-migration-plan.md) — sub-plan #9 plan doc (npm scope rename).
- [`docs/design/brewery-scope-migration-per-package-handoff.md`](../../../design/brewery-scope-migration-per-package-handoff.md) — per-slot execution checklist.
- [`docs/MODULES.md`](../../../MODULES.md) — ecosystem entry page.
- [`canonical/automation.md`](../../canonical/automation.md) — the canonical module brewery consumes today.
