# Umbraculum — Platform Architecture & Vision

**Tier:** Public
**Status:** v1.1 — §1.1 process-chemistry positioning (2026-05-31)  
**Audience:** product, engineering, and architecture conversations.
**Document role:** canonical framing for the platform's architecture, module model, AI-consultant surface, and public lifecycle.

---

## 1. Purpose and audience

This is the **high-level entry point** for any discussion about the shape of Umbraculum: what the toolset is, which foundations it provides, where the system is today, and how to keep new work consistent with that direction. It is intentionally **vision-and-shape** focused — implementation specifics still live in domain documents.

### 1.1 Positioning — toolset for organizational and operational applications

Umbraculum is an **open-source toolset for building workspace-shaped organizational and operational applications**. It is meant to scale from simple internal systems — product-information management, quality-assurance workflows, issue triage, supplier records, approval flows — to complex operational suites that coordinate people, assets, inventory, production, compliance, and automation.

The word **toolset** is deliberate. Umbraculum is not a framework in the narrow sense of "install a library and write the rest yourself." It is the whole ready-made foundation for building serious applications: source code, canonical module boundaries, SDKs, contracts, web and native shells, documentation, CI gates, quality standards, and the Cursor-integrated authoring apparatus (rules, skills, and subagents) that helps contributors work inside those boundaries from day one. The deliverable is the toolbox plus the discipline for using it, not only the runtime code.

Manufacturing is not the platform boundary; it is the stress test. Few domains combine as many hard requirements at once: bills of materials, constrained resources, scheduling, traceability, quality controls, regulated records, shop-floor data, mobile/on-site workflows, and human-in-the-loop decisions. If the architecture can support process manufacturing without collapsing into one-off vertical code, it can also support simpler organizational applications without forcing unnecessary complexity on them.

This framing matters for four reasons:

1. **The addressable surface is broader than any one vertical.** A simple PIM or quality-assurance app can use the same workspace, auth, billing, AI-consultant, i18n, document-rendering, and cross-platform UI foundations as a manufacturing suite. The difference is the module set and configuration depth, not a different platform.
2. **Manufacturing proves the hardest generalizations.** MRP, CRP, WMS, automation, QA, and traceability are not isolated product ideas; they are canonical operational domains that expose whether the module model, SDK, and AI-consultant context principle hold under real complexity. The trajectory in [`docs/ROADMAP.md`](ROADMAP.md) reflects this.
3. **The AI consultant story scales with the workspace, not the industry label.** "An AI for breweries" sells one vertical. "An AI consultant for your operational workspace" can reason across product data, quality records, inventory, production schedules, equipment, customers, and vertical-specific knowledge as modules are installed.
4. **Quantitative process specifications belong in the same stack as BOMs and schedules.** Formulation-heavy operational software — food R&D, cosmetics, specialty chemicals, ag inputs, lab batch records, environmental sampling — needs **deterministic formulas**, unit-safe conversions, and **repeatable recomputation** when inputs change, not spreadsheet sidecars. The brewery showcase proves the toolset can keep that math **in-repo, typed, and test-covered** next to production data (see below).

The brewery vertical is a **showcase** — a complex working example that demonstrates the toolset's potential, not the platform's identity. It ships with brewery-specific data (BJCP styles, BeerJSON, hop bitterness math, water-chemistry models), brewery-specific prompts, and brewery-specific UI flows, but its deeper value is that it exercises the same primitives broader operational systems need: recipes as bills of materials, equipment profiles as constrained resources, brew sessions as scheduled production orders, ingredient and water inputs as process specifications, and quality/reliability checks around repeatable work.

**Process chemistry and physical quantities — proved in the showcase, transferable beyond brewing.** Umbraculum is **not** a CAD, CFD, or LIMS replacement. It **is** a workspace toolset that can embed **serious formulation and process math** inside recipes, batch records, and production workflows: water-profile libraries, ion balances, acid/base additions, derived properties (pH, alkalinity, concentrations), save/recompute flows, and unit-tested pure domain code. The brewery reference vertical demonstrates this today in [`services/api/src/domain/waterCalc/`](../services/api/src/domain/waterCalc/) (narrative: [`docs/modules/verticals/brewery/WATER-CHEM-MASH-PH-MODEL.md`](modules/verticals/brewery/WATER-CHEM-MASH-PH-MODEL.md)). The **platform pattern** — vertical-owned calculation domains, contracts at the API edge, UI that persists inputs and recomputes — is what a cosmetics, distillation, or specialty-chemical vertical reuses with different constants and rules, not a different architecture. Evaluators looking for **chemical / physical process software** should read the showcase as evidence of depth, not as a niche label on the product.

The platform-level commitment is to the **toolset surface** itself: the canonical-module set, the module SDK (§4.4), the AI-consultant context principle (§4.0), and the cross-platform infrastructure that lets one source of truth ship as a **web app**, an **iOS/Android native app**, and (via the same Tamagui web UI in a Lomiri Click Morph webapp wrapper) **Ubuntu Touch** — see [`docs/design/ubuntu-touch-shell-strategy.md`](design/ubuntu-touch-shell-strategy.md). Tamagui is the cross-platform UI primitive layer (real DOM on web, real React Native on device; one component tree, one a11y story, one design-token system; see [`docs/TAMAGUI.md`](TAMAGUI.md) for the adaptation strategy and accepted-cost discipline), React Native + Expo on the iOS/Android side (see [`docs/NATIVE-STRATEGY-AND-CI.md`](NATIVE-STRATEGY-AND-CI.md)), locale-prefixed routing, route IDs in `@umbraculum/navigation`, the universal `useT` hook, and the cookie-vs-bearer auth split with the webview bridge for cross-platform session continuity (see §3.5). That infrastructure is the durable deliverable, and it is industry-agnostic: any workspace-shaped application that benefits from one auth stack, one billing engine, one AI consultant, and a single source of truth that ships to web, native, and UT Morph webapp wrappers is a credible thing to build on top of it. Any vertical the core team ships — brewery first, possibly MRP/CRP/WMS-shaped offerings later — demonstrates the potential in a concrete configuration but does not define the platform; whether such a vertical is also operated as a managed product is a *separable* decision that may live with the core team, with a detached entity, or with third-party operators, on the same terms. Subsequent vertical configurations are expected to plug in primarily through **seed data, prompts, and configuration**, not by re-implementing the core.

### 1.1.1 Canonical modules are peer domains, not nested under one industry

The **reserved canonical-module codes** (closed set today: `automation`, `pim`, `mrp`, `crp`, `wms`, `crm`; future allocations via mini-RFC) form a **flat peer decomposition**, not a hierarchy with "manufacturing" or any other industry as a top-level umbrella that contains MRP / automation / QA / PIM / etc. as sub-modules. **Shipping status** (shipped vs alpha vs open door) is catalogued in [`MODULES.md`](MODULES.md) §3.1 — the peer shape applies to the full reserved set regardless of maturity.

This is a deliberate choice. The peer-module shape (sometimes called "SAP-style") matches how Drupal, SAP S/4HANA, Salesforce/Force.com, and Odoo decompose their domain coverage. The reasoning:

- Domain-level concerns don't naturally subordinate to a single umbrella. Production planning (`mrp`), inventory (`wms`), capacity (`crp`), customer relationships (`crm`), and automation (`automation`) are peer operational concerns. Forcing them under a "manufacturing" parent creates an arbitrary dependency on a higher-level construct that doesn't exist in practice.
- Vertical configurations consume an arbitrary subset of canonical modules. A brewery vertical consumes `automation` (shipped), read-only alpha `mrp` + `crp`, and (planned) `wms` + `crm`. A cosmetics vertical might need MRP + WMS + (compliance — future). A distillery vertical might need MRP + WMS + automation + (regulatory). Each vertical configuration picks its set; the canonical layer doesn't pre-commit a hierarchy that a vertical might not need.
- The AI consultant reasons across canonical modules at workspace scope (see §4.0). A flat peer decomposition gives the orchestrator one mental model — "what canonical modules are installed in this workspace" — instead of having to reason over both a hierarchy and a flat module-installation set.
- The canonical Drupal lesson — "one module per functionality, no parallel modules competing for the same domain" — is structurally enforced by reserved-code allocation. Hierarchy is not needed for the discipline.

**Brewery's relationship to the canonical set.** Brewery is a **tier-6 vertical configuration** consuming the canonical-module surface (and adding brewery-specific seed data: BJCP styles, BeerJSON, hop bitterness math, water chemistry, brewery-specific prompts and UI flows). Brewery is NOT a canonical module — that would be the same category mistake as building "a CRM for a hotel and calling it Hotel instead of CRM." The hotel is the vertical; the CRM is the canonical domain.

This framing is formalized in [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) (modules, tiers, governance, and automation placement) (Accepted 2026-05-18).

**Related as-built docs (not platform vision).** Cross-platform (web + native + Ubuntu Touch Morph webapp wrapper) boundaries: [`docs/CROSS-PLATFORM-BOUNDARIES.md`](CROSS-PLATFORM-BOUNDARIES.md), [`docs/design/ubuntu-touch-shell-strategy.md`](design/ubuntu-touch-shell-strategy.md). Brewery reference vertical product rules: [`docs/modules/verticals/brewery/IMPLEMENTATION-LOG.md`](modules/verticals/brewery/IMPLEMENTATION-LOG.md). Use **this document** for platform-level direction, public positioning, the module model, the AI consultant blueprint, and the monetization path.

---

## 2. Vision — horizontal platform + canonical modules + vertical configurations

**Pattern.** Umbraculum is a **horizontal platform** (auth, workspace, billing, AI, i18n, navigation, observability, integrations, rendering) hosting **canonical modules** (shipped: `automation`, `pim`; **alpha shipped** read-only: `mrp`, `crp`; **open doors**: `wms`, `crm`) and **vertical configurations** (brewery first). A canonical module owns a peer operational domain; a vertical configuration consumes one or more canonical domains and adds vertical-specific seed data, prompts, UI flows, and tier-limit slices.

**Why this pattern.** Modern operational buyers expect AI-native, multi-domain suites; legacy ERPs (SAP, Oracle, NetSuite) are bolting AI onto crusty foundations. A greenfield horizontal-platform-with-canonical-modules shape lets us:

- ship one canonical domain at a time without forking the codebase,
- let vertical configurations compose the canonical domains they need,
- reuse one billing engine, one auth stack, one AI layer, and one cross-platform shared layout across every module and vertical,
- charge per canonical module or vertical configuration as add-ons (matches modern SaaS purchasing patterns),
- treat the brewery vertical as the **first reference configuration**, not the product itself.

```mermaid
flowchart TB
  subgraph horizontal [Horizontal Platform Layer]
    auth[Auth + Sessions]
    workspace[Workspace + Membership]
    billing[Billing + Add-ons]
    aiplat[AI Platform: Orchestrator, Tools, Ledger, RAG]
    i18nNav[i18n + Navigation + UI primitives]
    obs[Observability]
    integ[Integrations Framework]
    rendering[Document / File Rendering]
  end
  subgraph canonical [Canonical Modules]
    automation[Automation]
    pim[PIM]
    wms[WMS]
    crm[CRM]
    mrp[MRP]
    crp[CRP]
  end
  subgraph verticals [Vertical Configurations]
    brewery[Brewery: recipes, water, brew sessions]
  end
  verticals --> canonical
  canonical --> horizontal
```

Brewery is the **shipped reference vertical configuration**. **`automation` and `pim`** are production canonical modules; **`mrp` and `crp`** are **alpha-shipped** read-only canonical modules (H2 2026 proof — API, web, AI tools, RFC-0007 exports); **`wms` and `crm`** remain **open canonical doors** — codes reserved and anticipated in the architecture, not yet implemented. Authoritative per-module status: [`MODULES.md`](MODULES.md) §3.1.

### 2.1 Distribution & business model

Umbraculum is **open source** by design — not as a marketing tactic, but as the structural foundation for long-term sustainability with a small team, trust with operational customers, and a defensible position against hyperscaler capture.

> **From practice, not theory.** The AGPL/MIT split below is backed by license analysis in [`LICENSING.md`](LICENSING.md), but the *conviction* comes from years building and maintaining **proprietary vertical ERPs** before this project. We watched customer after customer move — not only to the software house across the street, but to **different products entirely** (Magento Open Source vs Shopify today; the same pattern as ERP X vs ERP Y or MRP A vs MRP B). When that happens, **years of locked code do not travel with the relationship**. The durable moat was never the binary library; it was demos, domain fit, support, relationships, and marketing — which means you win by **building what the client needs**, not by hoarding syntax. We always saw **limited value** in locking platform code; **AI-assisted greenfield** work makes hiding source even harder to justify. Umbraculum keeps the **backbone open** so integrators and module authors invest in domain logic, operations, and trust — assets that survive a platform swap — rather than in opaque lock-in.

**License posture** (rationale in [`docs/LICENSING.md`](LICENSING.md)):

- **Core platform**: AGPLv3.
- **SDK / contracts / public interface packages** (the surface third-party modules depend on): MIT.
- **Commercial dual license** available for enterprises whose policies cannot accommodate AGPLv3 (same source, alternative terms).

**Revenue lines** (target: bread-and-butter sustainability for a small team, not venture-scale exit):

1. **Managed hosting of the toolset** — Umbraculum operated as a service for workspaces that consume the canonical-module set and one or more vertical configurations. The dominant revenue line; pairs with the AGPL stance because hyperscaler imitation is structurally deterred. Critically, this is hosting of the *toolset and its module surface*, not a single branded vertical SaaS: vertical-product operation (brewery-as-a-service today, MRP/CRP/WMS-shaped offerings tomorrow, anything else the cross-platform web-and-native infrastructure makes credible — see §1.1) is a **separable concern** that may be operated by the core team, by a detached entity, or by third-party operators. The platform serves all three on the same terms.
2. **AI value-layer subscription** — the AI consultant is unlocked through existing paid workspace tiers (`premium`, `pro`, `pro_plus`) while customers bring their own provider key for token spend (see §7).
3. **Enterprise support contracts** — for self-hosters and hosted customers that need SLAs, dedicated infrastructure, or operator support.
4. **Future managed-AI credits** — optional hosted convenience path, added only after BYOK + subscription proves demand.
5. **Optional commercial license** (§6.3 of [`docs/LICENSING.md`](LICENSING.md)) — for enterprises whose legal teams cannot adopt AGPLv3.

**Self-host posture (first-class, not an afterthought).** The platform must be installable on commodity Postgres + Node + a single VPS; no AWS-specific or other cloud-vendor-specific dependencies in the core. Every external service (AI providers, Stripe, RevenueCat, S3-compatible storage, error reporting) is configured via environment variables and can be swapped or omitted. Self-hosters bring their own keys.

**AI provider integration — BYOK first, managed AI later.** The H2 2026 backbone ships the lowest-risk monetized path: workspace admins bring their own Anthropic key, and the platform sells the value layer around that call — orchestration, tools, memory, usage visibility, safety limits, and concierge onboarding — by unlocking AI on existing paid workspace tiers. A future managed-AI / resold-credit mode can reuse the same orchestrator and ledger, but it is deliberately not part of v0.

**What is *not* in the business model:**

- No closed-source replacement of public modules.
- No enterprise-only paywall on bug fixes or security patches.
- No future-dated re-licensing of existing source code.

These are explicit commitments documented in [`docs/LICENSING.md`](LICENSING.md) §9, changeable only via the public RFC process there.

### 2.2 Governance & community

The single biggest determinant of an open-source project's long-term health is **how welcome contributors feel** — not the license, not the technology, not the marketing. The Magento → Mage-OS history makes this concrete: Adobe inherited a permissive license and a thriving community, and lost the community by making contribution unwelcome — practitioner narrative: [`design/ecosystem-case-study-adobe-magento.md`](design/ecosystem-case-study-adobe-magento.md). A complementary lesson from **proprietary ERP practice** — good product, ecosystem never formed — is documented in [`design/ecosystem-case-study-omnis.md`](design/ecosystem-case-study-omnis.md); §2.1 above cites the same experience for why the **open backbone** is non-negotiable here. A second ERP lesson — **large partner ecosystem, opaque external API surface** — is in [`design/ecosystem-case-study-business-central.md`](design/ecosystem-case-study-business-central.md): integrators should not need a BC partner badge to learn which API to call. A third cluster — **repositioning in hard times** ([`design/ecosystem-case-study-sap.md`](design/ecosystem-case-study-sap.md), [`design/ecosystem-case-study-teamsystem.md`](design/ecosystem-case-study-teamsystem.md); partial positive [`design/ecosystem-case-study-odoo.md`](design/ecosystem-case-study-odoo.md)) — is why **free try** and **no certification gate** are load-bearing: learners can approach vertical builders with real expertise, not credentials.

Governance principles, in priority order:

1. **Public contribution from day one.** All meaningful changes go through public PRs with public review, including changes made by founders and core maintainers. The "private fork that occasionally pushes large drops" pattern is not used.
2. **RFC process for breaking changes.** Public-comment RFCs (minimum 30 days) for any change that affects: license terms, governance, the module SDK's public surface, the AI tool contract, billing model, or anything else that downstream depends on. RFC process is the same one used for license changes ([`docs/LICENSING.md`](LICENSING.md) §10).
3. **No CLA that grants unilateral re-licensing rights.** Contributors retain their copyright; the project signs commits via Developer Certificate of Origin (DCO). This is a deliberate constraint against the failure mode that enabled the HashiCorp / Elastic re-licensings.
4. **Code of conduct from the first public release.** Modeled on Contributor Covenant.
5. **Decision transparency.** Major decisions are recorded — in RFCs for changes, in this document for architectural direction, in [`ROADMAP.md`](ROADMAP.md) for trajectory. New contributors should be able to read why something is the way it is, not just *that* it is.
6. **Trademark protection separate from license.** The platform name and logo remain commercial property of the founding entity (eventually possibly a foundation); the source license does not include trademark rights. This is the same separation used by WordPress, Linux Foundation projects, and Plausible.

The aim is to be **honest about commercial realities** (this is a project that pays for groceries, not a foundation-only effort) while keeping community contribution genuinely first-class — the opposite of the open-core trap that fragmented the Magento ecosystem.

---

## 3. Where we are today — audit (read-only snapshot)

Honest inventory of what is already platform-shaped versus what is brewery-coupled. File references are deliberately concrete so this doc remains trustworthy without re-reading the codebase.

### 3.1 Backend — `services/api/`

**Already horizontal:**

- All cross-cutting plugins under [`services/api/src/plugins/`](../services/api/src/plugins/): `prismaPlugin`, `redisClientPlugin`, `sessionAuthPlugin`, `requestContextPlugin`, `errorHandlerPlugin`, `webhookRawBodyPlugin`.
- Authentication and session management: [`services/api/src/routes/auth.ts`](../services/api/src/routes/auth.ts).
- Workspace + membership: [`services/api/src/routes/workspaces.ts`](../services/api/src/routes/workspaces.ts).
- Billing intents and workspace billing summary: [`services/api/src/routes/billing.ts`](../services/api/src/routes/billing.ts).
- Stripe + RevenueCat webhook ingestion: `webhooksStripe.ts`, `webhooksRevenuecat.ts`.
- AI routes and services: chat, settings, usage ledger, encrypted BYOK key storage, tool registry, prompt composition, and per-workspace memory.
- Health: `health.ts`.

**Brewery-vertical (fine for now, but flagged):**

- `recipes.ts`, `recipesImport.ts`, `recipesExport.ts`, `platformRecipes.ts`.
- `waterCalc.ts`, `waterProfiles.ts`, `recipeWaterSettings.ts`, `recipeWaterHubSummary.ts`, `recipeWaterComputeAndSave.ts`.
- `equipmentProfiles.ts`, `brewdaySettings.ts`, `brewSessions.ts`.
- `ingredients.ts`, `styles.ts`, `inventory.ts`.
- Brewing-device integrations: `integrationsTilt.ts`, `integrationsTiltIngest.ts`, `integrationsReveal.ts`, `integrationsGeneric.ts`.
- Ads: `ads.ts`, `platformAds.ts` (the framework is reusable, the placements are brewery-flavored).

**Cross-cutting today (module-aware tier limits — scaffold shipped):**

- [`services/api/src/services/tierLimitsService.ts`](../services/api/src/services/tierLimitsService.ts) owns the platform slice (`aiEnabled` only). Brewery and automation contribute `tierLimits(tier)` slices via `registerModule()`; the SDK merges them at boot through `composeModuleTierLimitSlices()`. Future modules (WMS, CRM, …) add their own keys; collision with platform-reserved keys or another module's keys is a boot error. Route enforcement for automation caps remains Phase C; recipe/version caps still gate in `recipesService`.

**Registration shape:**

- [`services/api/src/app.ts`](../services/api/src/app.ts) registers every route group flat — no module-bundle pattern yet. This is a **gap, but cheap to add later** because Fastify is already plugin-composed and the route groups are already isolated.

### 3.2 Frontend — `apps/web/app/[locale]/`

**Horizontal:**

- `(auth)`, `about`, `contact`, `accessibility`, `i18n-contributing`, `contributing`, `platform`.

**Brewery-vertical:**

- `recipes`, `inventory`, `equipment`, `water-profiles`, `brewday-steps-settings`, `ferm-data-integration`.

**No Next.js route grouping by module today.** All paths sit at the top level under `[locale]`. Adopting `(brewery)/recipes`, `(wms)/stock`, etc. is a zero-URL-change reorganization (Next.js route groups don't appear in URLs), worth doing once a second module ships.

### 3.3 Shared packages — `packages/*`

Packages share the npm scope `@umbraculum/*` (renamed from `@brewery/*` under sub-plan #9, closed 2026-05-19 across 14 slots — see [`docs/design/brewery-scope-migration-plan.md`](design/brewery-scope-migration-plan.md)). Functionally they split into two groups:

**Already horizontal (will become "platform" packages):**

- `@umbraculum/i18n` — locales + shared messages.
- `@umbraculum/i18n-react` — universal `useT` hook (web + native).
- `@umbraculum/navigation` — route IDs + cross-platform routing policy (renamed from `@brewery/navigation` 2026-05-19 as sub-plan #9 slot 3; current route IDs include brewery routes pending content-split deferred to second-vertical landing).
- `@umbraculum/api-client` — fetch boundary + auth (cookie web, bearer native).
- `@umbraculum/ui` — Tamagui primitives.
- `@umbraculum/media` — shared image assets + manifest (renamed from `@brewery/media` 2026-05-19 as sub-plan #9 slot 2; current asset content remains brewery-flavored pending content split deferred to second-vertical landing).
- `@umbraculum/contracts` — wire-shape DTOs / shared types.
- `@umbraculum/ai-tool-sdk` — library-agnostic AI-tool SDK contract (`AiTool<I, O>`, `AiToolContext`, `AiToolScope`, `AiToolRegistry`, `AiToolDefinition`). Extracted from `@umbraculum/contracts` on 2026-05-21 to realize the published-SDK commitment in §4.4 as a peer of `@umbraculum/module-sdk`.
- `@umbraculum/i18n-keys` — module message-root and `nav.*` label-key conventions (`ModuleNavLabelKey`, `moduleMessageRoot`, `RESERVED_PLATFORM_MESSAGE_ROOTS`). Greenfield package landed 2026-05-27; locale JSON stays in `@umbraculum/i18n`.
- `@umbraculum/test-mcp` — testing tools server (renamed from `@brewery/test-mcp` 2026-05-19 as sub-plan #9 slot 1 worked example).

**Brewery-vertical (will become "module" packages):**

- `@umbraculum/brewery-core` — brewing calculations and unit conversions.
- `@umbraculum/brewery-recipes-ui` — domain UI for recipes, water, yeast.
- `@umbraculum/brewery-beerjson` — BeerJSON schema layer.

The `@brewery/*` scope was a **historical artifact** of starting with the brewery vertical. The migration to the neutral platform scope `@umbraculum/*` (with brewery-vertical packages re-scoped under `@umbraculum/brewery-*` per the §1.3 TRAP-avoidance discipline) closed 2026-05-19 under sub-plan #9 — see [`docs/design/brewery-scope-migration-plan.md`](design/brewery-scope-migration-plan.md).

### 3.4 Prisma schema

[`services/api/prisma/schema.prisma`](../services/api/prisma/schema.prisma) uses Prisma `multiSchema` with Postgres namespaces committed by [RFC-0010](rfcs/0010-platform-brewery-postgres-schema-split.md) (2026-05-28). As-built allocation: [`design/platform-brewery-postgres-schema-split.md`](design/platform-brewery-postgres-schema-split.md).

**`platform.*` — horizontal models:**

`User`, `Workspace`, `WorkspaceMember`, `Session`, `WebviewExchangeCode`, `EmailVerificationToken`, `Ad`, `WorkspaceBilling`, `BillingPurchaseIntent`, `BillingUserWorkspaceBinding`, `BillingEvent`, `WorkspaceAiSettings`, `WorkspaceAiMemory`, `AiUsageLedger`, `AiProposal`, `Integration*` (the framework — devices/attachments/readings).

**`brewery.*` — brewery-vertical models:**

`Recipe`, `BrewSession`, `BrewSessionStep`, `BrewSessionLog`, `BrewdaySettings`, `BeerStyle`, `BeerStyleAlias`, `RecipeWaterSettings`, `WaterProfile`, `EquipmentProfile`, `Fermentable`, `Hop`, `Yeast`, `IngredientSource`, `IngredientImportRun`, `IngredientStagingRow`, `IngredientSourceMap`, `InventoryItem`.

**Other Prisma-managed schemas:** `automation`, `pim`, `mrp`, `crp`, `rendering` (canonical modules). Legacy `public` holds only `_prisma_migrations`. SQL-only schemas (`ai`, `reporting`) remain outside Prisma `datasource.schemas`.

### 3.5 Cross-platform boundaries

This is the strongest part of the current architecture and the part that makes the multi-module vision realistic without a rewrite. See [`docs/CROSS-PLATFORM-BOUNDARIES.md`](CROSS-PLATFORM-BOUNDARIES.md) and [`docs/design/ubuntu-touch-shell-strategy.md`](design/ubuntu-touch-shell-strategy.md) for full detail. Summary:

- **Locale-prefixed routing** is enforced by middleware; default locale `en`.
- **Route IDs + typed params** in `@umbraculum/navigation` (no Next.js / Expo Router leakage into shared screens).
- **Universal `useT` hook** in `@umbraculum/i18n-react` (web uses next-intl adapter; native uses ICU directly).
- **Auth split**: web uses cookie sessions, native uses bearer tokens; the API client picks the right strategy via injection.
- **Webview bridge**: short-lived single-use exchange codes mint a cookie session for "Continue on web" flows from native.
- **Ubuntu Touch shell**: Lomiri **Click webapp** wrapping `apps/web` (Tamagui unchanged); online-first on UT; OpenStore distributable — not a Qt/QML port.
- **Database routing foundation**: pgpool-II in front of primary + hot standby; auto-degrade to primary-only when the replica lags. Prisma uses `directUrl` for migrations to bypass the pool.

These boundaries mean: a new vertical module (WMS, CRM, …) can be added without touching the routing/i18n/UI layers — they just plug in. Web-shipped module routes are simultaneously Ubuntu Touch webapp candidates without a second UI tree.

### 3.6 Billing + tier model

- `WorkspaceBilling` + `BillingTier` (`free | premium | pro | pro_plus`) + `BillingPurchaseIntent` + `WorkspaceBillingService` is **workspace-scoped** — exactly the right shape for a multi-module suite, since each module's value applies to a workspace.
- Tier limits live in [`services/api/src/services/tierLimitsService.ts`](../services/api/src/services/tierLimitsService.ts). The platform owns `aiEnabled` (`free=false`, `premium | pro | pro_plus=true`); modules contribute slices merged at runtime (`maxRecipesPerWorkspace` / `maxVersionsPerRecipe` from brewery; `maxVessels` / `maxAdaptersConnected` / `automationAiToolsEnabled` from automation). Billing returns the composed object as opaque `limits`.
- The H2 AI backbone intentionally reuses existing `WorkspaceBilling` infrastructure. A free workspace upgrades through the existing billing-intent flow; after Stripe webhook processing moves the workspace to `premium` or above, AI is unlocked.
- **Add-on shape is still missing in persistence.** There is no `WorkspaceBillingAddon` model yet ([RFC-0009](rfcs/0009-workspace-billing-addons-and-entitlements.md) commits the shape; H1 2027 implementation). Modules already declare `addonCodes`; `EntitlementsService` runs in `tier_only` mode for public α.

### 3.7 Verdict

**Strong foundations (keep as-is):**

- Workspace tenancy, plugin-composed Fastify, billing service with proper `brewery_admin`-only purchasing, cross-platform boundary packages, Redis cache pattern with Postgres fallback, accessibility-first UI policy.

**Open doors (no migration needed yet, just discipline):**

- Fastify is plugin-composed and `registerModule()` now records module metadata/routes/tool hooks → adding the next module is an extension of the existing pattern, not a core rewrite.
- Web routes are wrapped in `(brewery)` / `(automation)` / `(pim)` route groups with URL-segment ownership checks; future modules follow the same collision-checked route-shape discipline.
- Postgres supports multiple schemas; Prisma `multiSchema` preview is stable.
- **DONE (scaffold):** tier limits are module-aware — platform `aiEnabled` + `composeModuleTierLimitSlices()` at boot; see [`packages/sdk/module-sdk/README.md`](../packages/sdk/module-sdk/README.md) §"Tier-limit registration".

**Real gaps to plan for (catalog, not commit):**

- Flat Prisma namespace will hurt around 80–100 models.
- ~~Brewery-shaped `tierLimitsService` needs a module-aware shape before any second module's limits can be expressed.~~ **Shipped (scaffold):** platform owns `aiEnabled`; modules contribute `tierLimits` slices merged at runtime via `composeModuleTierLimitSlices()` — see [`services/api/src/services/tierLimitsService.ts`](../services/api/src/services/tierLimitsService.ts).
- Module registration exists for routes, URL segments, document templates, add-on codes, and AI-tool hooks; remaining registry gaps are richer prompt overlays, knowledge-source registration, ~~tier-limit composition~~, install/entitlement semantics, and external third-party module loading.
- AI platform v0 exists and has expanded beyond brewery: paid-tier unlock, usage ledger, workspace memory, module-owned tools for brewery / automation / PIM / MRP / CRP, platform-owned `render_document`, **propose-write** (preview apply), **reporting DSL MVP** (Layer B), **RAG D1** (Layer C over public product docs via pgvector), and **multi-provider BYOK routing** (Anthropic + OpenAI) are shipped post-α H2. Remaining gaps: managed-AI credits, RAG D2–D3 (per-workspace activity timelines + memory unification), richer module knowledge-source registration, and future WMS/CRM tool surfaces.
- No `WorkspaceBillingAddon` → cannot sell managed-AI credits or per-module entitlements.
- **Postgres runtime for AI:** dev and CI use `pgvector/pgvector:pg16` (not stock `postgres:16`) so the `vector` extension is available for `ai.doc_chunks`. See [`docs/design/canonical-ai-rag-surface.md`](design/canonical-ai-rag-surface.md) §2 and [`docs/POSTGRES-REPLICATION-ARCHITECTURE.md`](POSTGRES-REPLICATION-ARCHITECTURE.md) §"pgvector image".
- Per-workspace operational memory is shipped; **product-doc RAG (D1)** is shipped (`platform.searchProductDocs`, pgvector index). **Activity-timeline RAG (D2)** and unified memory writer (D3) remain deferred.
- Centralized document / file rendering is now implemented per [RFC-0007](rfcs/0007-canonical-document-rendering.md): `@umbraculum/rendering`, SDK-owned `DocumentTemplate<TData>` registration, engine adapters, BullMQ-on-Redis async jobs, API-owned rendering artifact persistence, sync BeerJSON export, platform-owned `render_document`, and the first async PIM channel-feed consumer. Remaining rendering gaps are downstream product surfaces, not the core platform pipeline: vendor-specific PIM feeds, media-layer artifact handoff once `@umbraculum/media` exposes the needed persistence surface, billing/add-on policy, and UI affordances.
- No general notifications / outbound-delivery service exists yet. [RFC-0008](rfcs/0008-notifications-outbound-delivery.md) commits the boundary before public alpha: RFC-0007's eta + MJML support means email composition, not SMTP/provider transport; modules may contribute notification intents/templates/triggers, but delivery transport, recipient policy, unsubscribe/compliance, audit logs, and abuse/rate limits are horizontal platform concerns.

---

## 4. Target architecture

### 4.0 AI-consultant context principle (cornerstone)

Several decisions in §4 — the horizontal/module split (§§4.1–4.2), the AI sub-system shape (§4.3), the module SDK surface (§4.4), the Prisma multi-schema strategy (§4.5) — look like independent architectural choices but flow from a single principle that drives all of them. Stating it explicitly so the rest of §4 reads as one coherent shape rather than five accidentally-aligned ones.

> **The AI consultant operates at workspace scope, not module scope.** For the consultant to give competent operational advice, it must see all installed canonical modules, all vertical configurations active in the workspace, all integration data, and all domain entities in **one coherent context**. A federated/microservice architecture where each module owned its own context — its own AI registry, its own auth, its own session, its own per-module orchestrator — would lose this story. The AI's quality is a function of how *coherent* its view of the workspace is.

Concrete consequences (the principle drives all of these; none are independent decisions):

- **Monorepo workspace** (over polyrepo per-module). All modules live in one workspace context the AI orchestrator can reason over end-to-end. Polyrepo would force RAG-via-cross-repo-fetch, latency penalties on tool registration, and a fragmented mental model.
- **One native shell hosting federated modules** (ROADMAP standing principles, H2 2027 Re.Pack spike). The user does not interact with five disconnected apps; the AI does not interact with five disconnected per-app contexts.
- **Single platform AI orchestrator** (§4.3). Every module's AI tools, prompts, and knowledge sources land in the *same* registry that the *same* orchestrator iterates. Per-module orchestrators would lose cross-module reasoning ("does my brewery have stock for tomorrow's brew?" crosses brewery + WMS + MRP + CRM).
- **Horizontal-platform-services consumption contract** (umbrella plan §9; RFC-0001 Decision F). Identity, tenancy, ACL, billing, AI, observability, i18n, UI, secrets, integrations, HTTP, DB, rendering, and notifications / outbound delivery are platform-owned. Modules that fork these into per-module variants destroy the AI's coherent view at the cross-cutting level.
- **Canonical-module discipline** ("one module per functionality"; umbrella plan §1; RFC-0001 Decision A). The AI must not be asked to reason over two competing CRMs, two competing auth flows, or two competing AI tool registries.
- **Standard-shape vertical configurations** (§1.1, §1.1.1). Brewery as a tier-6 vertical configuration consumes the same canonical-module surface a future cosmetics or distillery vertical configuration will consume. The AI's mental model of "what a workspace is" doesn't fork per vertical.

The cornerstone, in one line: **structural decisions in this document that look like independent architectural choices (monorepo, one shell, consumption contract, canonical discipline, peer-module decomposition, vertical-configuration tier) are all consequences of one principle — the AI consultant must see the workspace as one coherent thing.** Read the rest of §4 with that principle in mind; it's how the platform stops being a federation of disconnected products and becomes a coherent operational tool.

A worked illustration: when a brewery operator's AI is asked *"do I have stock for tomorrow's brew?"*, the answer crosses **brewery** (recipe BoM derived from BeerJSON), **wms** (stock-on-hand for the BoM ingredients), **mrp** (planned consumption for in-flight production orders), **crm** (committed customer orders that affect inventory commitments), and possibly **automation** (current tank states — is the fermenter free?). A federated/microservice architecture where each module owned its own context would lose this story; cross-module questions would have to be re-asked per-module-AI and stitched together by the operator. Workspace-scope context with one orchestrator + one tool registry + one prompt-composition pipeline is what makes the answer competent.

### 4.1 Horizontal platform layer

The horizontal layer owns everything that does not change when a new vertical is added:

- **Identity & sessions**: auth, magic-link / email verification, webview bridge, role-based access at the workspace boundary.
- **Tenancy**: Workspace + WorkspaceMember + role enforcement. Contributor guide: [`TENANCY-AND-ACL.md`](TENANCY-AND-ACL.md). Data-access boundary (Prisma vs API): [`DATA-ACCESS-BOUNDARIES.md`](DATA-ACCESS-BOUNDARIES.md).
- **Billing & entitlements**: tier subscription, **add-ons**, Stripe + RevenueCat adapters, source-of-truth in Postgres.
- **AI platform**: orchestrator, tool registry, usage ledger, encrypted BYOK settings, workspace memory, provider adapters (Anthropic / OpenAI / …), router, managed-AI pricebook, RAG store.
- **Internationalization**: locales, messages, ICU formatting, locale-prefixed routing.
- **Cross-platform UI primitives**: Tamagui tokens + components, route IDs, universal hooks.
- **Observability**: structured logs, error reporting, usage metrics.
- **Integrations framework**: generic device/sensor ingestion (today: Tilt, Reveal; tomorrow: anything that emits readings).
- **Document / file rendering** ([RFC-0007](rfcs/0007-canonical-document-rendering.md)): `@umbraculum/rendering` — Gotenberg sidecar for HTML→PDF + DOCX/ODT→PDF; in-process exceljs / fast-csv / bwip-js / xmlbuilder2; eta + MJML template engines; async-via-BullMQ on existing Redis for heavy renders, sync `stream-response` for small ones; modules contribute typed `DocumentTemplate<TData>` definitions via `registerDocumentTemplate()` on the SDK.
- **Notifications / outbound delivery** ([RFC-0008](rfcs/0008-notifications-outbound-delivery.md)): platform-owned email-first delivery service family. Modules contribute intents/templates/triggers; the platform owns provider config, delivery queues, recipient policy, unsubscribe/compliance, audit logs, bounce/complaint handling, and abuse/rate limits. General email delivery is intentionally not implemented yet.

### 4.2 Module layer

A module owns end-to-end:

- HTTP routes (registered with a stable URL prefix).
- Service classes (business logic).
- Prisma models (eventually in their own Postgres schema).
- AI tools (read-only, ACL-aware functions exposed to the AI orchestrator).
- AI prompts (module overlay + per-route overlays).
- Knowledge sources (markdown / docs / per-workspace memory) for RAG.
- UI screens, components, and a private i18n namespace.
- Tier-limit contributions (e.g. `maxRecipesPerWorkspace` for brewery, `maxWarehouses` for WMS).
- Add-on codes (e.g. `wms_module`, `crm_module`).
- Notification intents/templates/triggers, consumed by the future platform-owned outbound-delivery service rather than by module-private SMTP/provider clients.

### 4.3 AI platform sub-system

The AI consultant is not a feature of the brewery module — it is part of the horizontal platform, and modules feed it tools and knowledge. This is a direct consequence of the §4.0 context principle: workspace-scope reasoning requires one orchestrator, one tool registry, one prompt-composition pipeline, one usage ledger.

**Three-layer model.** Build in this order; each layer multiplies the value of the previous one.

| Layer | Purpose | Mechanism | Risk | Build order |
|---|---|---|---|---|
| **A. Tools (function calling)** | Model acts on the user's actual data via your own endpoints | Read-only, ACL-aware functions. Model never sees the DB. | Low — every call goes through existing ACL. | v0 |
| **B. Semantic layer + reporting DSL tool** | Answer ad-hoc data questions ("top 10 customers last quarter") | Typed query DSL on curated reporting views (`platform.reportingQuery`). Never raw SQL. | Medium — needs row caps, statement timeouts, allowlists. | **MVP shipped** (post-α H2); expand views over time |
| **C. RAG over knowledge** | Answer "how does X work?" and "what is true about *this* workspace?" | **D1 shipped:** pgvector `ai.doc_chunks` for global public help/docs (`platform.searchProductDocs`) + workspace memory in every prompt. **D2–D3 deferred:** per-workspace activity timelines + memory/RAG unification. | Medium — PII / cross-tenant isolation discipline required (D2 must filter `workspace_id`). | memory v0, RAG D1 shipped, D2–D3 v1.5 |

**Module-pluggable status.** Tools and prompt composition are implemented: shipped domain modules register AI tools and `aiPrompts` through `registerModule`, and the orchestrator composes base + platform + module + route + memory per [`docs/design/canonical-ai-prompt-composition-surface.md`](design/canonical-ai-prompt-composition-surface.md). Post-α H2 also ships propose-write ([`canonical-ai-propose-write-surface.md`](design/canonical-ai-propose-write-surface.md)), reporting DSL MVP ([`canonical-ai-reporting-dsl-surface.md`](design/canonical-ai-reporting-dsl-surface.md)), RAG D1 ([`canonical-ai-rag-surface.md`](design/canonical-ai-rag-surface.md)), and multi-provider BYOK routing. **Managed-AI credits** remain deferred until `WorkspaceBillingAddon` (§5.3).

**System prompt composition.** Every model call is prompted with:

```
BASE                  ← "you are an ERP assistant for Umbraculum; never reveal raw IDs unless asked; …"
+ MODULE_OVERLAY      ← contributed by the active module ("WMS rules: never propose a stock write …")
+ ROUTE_OVERLAY       ← per-route hints ("user is on stock-movements; default tools to wms.lowStockItems")
+ WORKSPACE_MEMORY    ← distilled facts about this workspace ("brews lagers; weekly cadence; 2× 200L fermenters")
```

**Write-action policy.** In v0 and v1, the model can **propose** changes (drafts) but cannot apply them without explicit user confirmation. This avoids the entire class of "AI deleted my BOM" disasters that have hit early adopters of agentic ERP features.

**Provider access — shipped v0 and future managed mode.**

- **Shipped v0: workspace-supplied Anthropic key.** The workspace admin enters an API key, accepts the data-egress notice, and enables AI. The key is encrypted at rest, decrypted only inside the API process, and never returned to web or native clients. Anthropic bills the workspace directly.
- **Shipped v0 monetization: paid tier unlock.** The platform does not resell tokens in v0. Instead, AI is available only when the existing `WorkspaceBilling.tier` is `premium`, `pro`, or `pro_plus`; free workspaces get `402 ai_subscription_required` and use the existing Stripe Checkout billing-intent flow to upgrade.
- **Future managed mode: Umbraculum-managed provider key + credits.** Hosted customers may later choose a one-bill managed-AI path. That mode can reuse the same orchestrator, tools, prompt composition, memory, audit log, and usage ledger; only key selection, credit balance checks, and post-call debit logic differ.

This preserves the self-host path and avoids v0 chargeback / VAT / provider-cost risk, while still capturing margin from the value layer.

### 4.4 Module registration pattern

The SDK shape sketched below is the *mechanism*; the *governance* around it — the canonical-module rule, reserved-code allocation, tier model, mini-RFC promotion procedure, and horizontal-platform-services consumption contract — is committed in [RFC-0001 — Modules, tiers, governance, and automation placement](rfcs/0001-modules-tiers-governance-and-automation-placement.md).

Sketch (TypeScript pseudocode — not a code spec, just shape):

```ts
registerModule(app, {
  code: "wms",
  routes: [wmsStockRoutes, wmsLocationsRoutes, wmsMovementsRoutes],
  prismaSchema: "wms",
  registerAiTools(registry, app) {
    registerWmsTools(registry, app.prisma);
  },
  aiPrompts: {
    module: WMS_MODULE_OVERLAY,
    routes: {
      wmsStockMovements: WMS_STOCK_MOVEMENTS_OVERLAY,
    },
  },
  knowledgeSources: [
    "docs/wms/*.md",
  ],
  tierLimits: (tier) => ({
    maxWarehouses: { free: 1, premium: 3, pro: 10, pro_plus: 50 }[tier],
    maxSkus: { free: 100, premium: 1000, pro: 10000, pro_plus: 100000 }[tier],
  }),
  addonCodes: ["wms_module"],
});
```

The same shape now applies to the shipped brewery vertical and the `automation` / `pim` / `mrp` / `crp` canonical modules for routes, URL-segment ownership, document templates where applicable, AI-tool registration, and `aiPrompts`. **Platform-owned product-doc RAG (D1)** ingests Tier: Public markdown via [`canonical-ai-rag-surface.md`](design/canonical-ai-rag-surface.md); per-module `registerKnowledgeSource()` for large module corpora remains a future SDK slot.

**The module SDK is a first-class public artifact, not an internal convention.** A third-party developer — an indie consultancy, a vertical-specific software vendor, an in-house team at a customer — must be able to build a module **in their own repository**, depend on Umbraculum's SDK as published npm packages, and ship the module independently of platform releases. The SDK packages are licensed under MIT (see [`docs/LICENSING.md`](LICENSING.md) §6.2) precisely so module developers can license their own module's source code however they want, including proprietary, without their choice being constrained by the platform's AGPL core.

Concretely, the SDK surface includes:

- `@umbraculum/module-sdk` — the `registerModule()` contract, types, and helper utilities. **Physical package** at [`packages/sdk/module-sdk/`](../packages/sdk/module-sdk/).
- `@umbraculum/ai-tool-sdk` — the `AiTool<I, O>` interface, scope types, and `AiToolContext` definitions. **Physical package** at [`packages/sdk/ai-tool-sdk/`](../packages/sdk/ai-tool-sdk/) since 2026-05-21 (extracted from `@umbraculum/contracts` per the deferred-extraction note in [`packages/sdk/ai-tool-sdk/src/aiTool.ts`](../packages/sdk/ai-tool-sdk/src/aiTool.ts) header).
- `@umbraculum/api-client` (public types subset) — DTO types and route-ID conventions third parties can pin to. **Physical package** at [`packages/platform/api-client/`](../packages/platform/api-client/).
- `@umbraculum/i18n-keys` — namespace conventions for module-owned message keys (`ModuleNavLabelKey`, `moduleMessageRoot`, `RESERVED_PLATFORM_MESSAGE_ROOTS`). **Physical package** at [`packages/sdk/i18n-keys/`](../packages/sdk/i18n-keys/) since 2026-05-27 (greenfield SDK contract; locale **content** remains in [`@umbraculum/i18n`](../packages/platform/i18n/)). Brewery content split to a future vertical bundle is a separate deferred concern per brewery-scope-migration §1.4.

All four SDK packages listed above are physically present in `packages/` today. The npm-scope migration that landed the existing packages' Umbraculum names closed under sub-plan #9 on 2026-05-19. The MIT SDK batch is **on the public npm registry** as of 2026-05-29 (monorepo dev still uses workspace `file:` links).

**npm publication readiness (2026-05-29):** External module repos can `npm install` `@umbraculum/module-sdk`, `@umbraculum/ai-tool-sdk`, `@umbraculum/i18n-keys`, and the four canonical `*-contracts` packages at the versions in [`docs/LICENSING.md`](LICENSING.md) §6.2.1. `@umbraculum/api-client` remains deferred.

**Machine-readable API catalog (2026-05-31):** A **split partial** OpenAPI catalog is committed: platform spec [`services/api/openapi/openapi.json`](../services/api/openapi/openapi.json) (canonical modules, rendering, auth, workspaces) and optional brewery add-on [`services/api/openapi/brewery.json`](../services/api/openapi/brewery.json). Indexed in [`docs/API-OPENAPI.md`](API-OPENAPI.md). Billing, integrations, and remaining brewery routes stay on human route tables until PR3 completes. Full F1 closure is tracked in [`CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) §Follow-ups.

### 4.5 Prisma schema strategy

Three options, ranked by readiness vs cost. Status as of RFC-0010 (2026-05-28):

1. **Done for platform + brewery:** [RFC-0010](rfcs/0010-platform-brewery-postgres-schema-split.md) split horizontal models into `platform.*` and brewery-vertical models into `brewery.*`. No new Prisma-managed models land in `public` except `_prisma_migrations`.
2. **Done for canonical modules:** Prisma `multiSchema` is enabled; each shipped canonical module owns its Postgres schema (`automation`, `pim`, `mrp`, `crp`, `rendering`). Schema name equals the canonical code per [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) §4 convention 4.
3. **Future verticals / long-term:** additional vertical schemas (`wms.*`, …) and Prisma multi-file split if/when one schema file becomes unreadable. SQL-only schemas (`ai`, `reporting`) stay outside Prisma `datasource.schemas`.

Note for replication: pgpool-II + streaming replication (already in the stack — see [`docs/POSTGRES-REPLICATION-ARCHITECTURE.md`](POSTGRES-REPLICATION-ARCHITECTURE.md)) is schema-agnostic, so the multi-schema move does not affect routing.

---

## 5. Migration map (catalog of future work, not for execution now)

A planning aid: when someone asks "what would it take to add WMS?", the answer comes from these three lists.

### 5.1 Stays as-is forever

- Workspace tenancy model (`Workspace`, `WorkspaceMember`, role-based ACL).
- Plugin-composed Fastify (cross-cutting via `app.register`).
- Cross-platform boundary packages (`@umbraculum/i18n`, `@umbraculum/i18n-react`, `@umbraculum/navigation`, `@umbraculum/api-client`, `@umbraculum/ui`, `@umbraculum/media`).
- Cookie/bearer auth split (web vs native).
- Redis cache pattern with Postgres source-of-truth.
- Stripe + RevenueCat as billing providers; Fastify as billing source-of-truth.
- pgpool-II + sync replication + auto-degrade.

### 5.2 Renamed / restructured (status as of Week 1 of late-H1-2026)

Physical directory layout for canonical modules and tier-6 vertical configurations is committed in [RFC-0002 — Canonical-module physical layout](rfcs/0002-canonical-module-physical-layout.md) (β three-tree distribution: `services/api/src/modules/<code>/`, `apps/web/app/[locale]/(<code>)/`, `apps/native/src/modules/<code>/`, `packages/<code>-contracts/` → `@umbraculum/<code>-contracts`; `registerModule()` in `packages/sdk/module-sdk/`). **Coupling discipline** on those trees (no sibling module imports, thin routes, `@arch-boundary` for accepted cross-schema reads) is mandatory — see [`docs/CODING-STANDARDS.md`](CODING-STANDARDS.md) § Architectural coupling and [`docs/design/solid-audit-charter.md`](design/solid-audit-charter.md). The bullets below capture the migration tranche status; the original section heading was "Renamed / restructured when 2nd module ships" — most line items are now DONE (the file-move was accelerated by [RFC-0006](rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) from H1 2027 to Week 1 of late-H1-2026 alongside the web-route-shape audit; see [`docs/design/web-route-group-audit.md`](design/web-route-group-audit.md)).

- `@brewery/*` scope split: **DONE under sub-plan #9 (closed 2026-05-19, 14 slots)** — horizontal packages now live under the neutral platform scope `@umbraculum/*`; brewery-vertical packages re-scoped under `@umbraculum/brewery-*` per the §1.3 TRAP-avoidance discipline. See [`docs/design/brewery-scope-migration-plan.md`](design/brewery-scope-migration-plan.md) (L1 plan + slot-by-slot recaps + risk register) and [`docs/design/brewery-scope-migration-per-package-handoff.md`](design/brewery-scope-migration-per-package-handoff.md) (per-slot execution log).
- **DONE (RFC-0006 Week 1 of late-H1-2026):** Web routes wrapped in `(brewery)` Next.js route group (no URL change). Six segments — `recipes/`, `inventory/`, `equipment/`, `water-profiles/`, `brewday-steps-settings/`, `ferm-data-integration/` — moved under `apps/web/app/[locale]/(brewery)/`. The `(brewery)/` group registers all six segments via `registerWebModule({ ownedUrlSegments })`.
- **DONE (RFC-0010, 2026-05-28):** Brewery-vertical Postgres tables moved from `public` to `brewery.*`; horizontal platform tables moved to `platform.*`. `registerModule({ code: "brewery", prismaSchema: "brewery" })` is required. Runbook: [`docs/design/platform-brewery-postgres-schema-split.md`](design/platform-brewery-postgres-schema-split.md).
- **DONE:** `tierLimitsService` is module-aware — each module contributes a `tierLimits(tier)` slice; the platform composes them via `composeModuleTierLimitSlices()` in `@umbraculum/module-sdk`. Brewery recipe caps and automation §8.2 caps are registered; route enforcement for automation remains Phase C.
- **DONE (RFC-0006 Week 1):** `app.ts` flat `register` calls for brewery routes consolidated into `registerBreweryModule(app)` (`services/api/src/modules/brewery/index.ts`). 14 brewery API route files moved from `services/api/src/routes/*.ts` to `services/api/src/modules/brewery/routes/*.ts`.

### 5.3 Net-new before 2nd module ships

- `registerModule()` helper in the API and a parallel registry on the web side. **v0 scaffold landed** in `packages/sdk/module-sdk/` (`@umbraculum/module-sdk`; end-state `@umbraculum/module-sdk` per [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) Decision C). **Brewery flat routes are now also migrated** (RFC-0006 Week-1 acceleration) — every canonical module + brewery uses `registerModule()` from `services/api/src/modules/<code>/index.ts`, and `registerWebModule()` for URL-segment ownership.
- AI package surfaces:
  - **DONE:** `packages/sdk/ai-tool-sdk` owns the public tool contract (`AiTool`, `AiToolRegistry`, scope/context types).
  - **OPEN:** split broader AI DTO/provider-mode contracts only if they outgrow `@umbraculum/contracts`.
  - **OPEN:** split `packages/ai-platform-ui` only if the shared `@umbraculum/ui` AI chat panel + streaming hook surface gets too broad.
- Provider router / adapter layer beyond Anthropic-only BYOK.
- Optional managed-AI credits: `WorkspaceBillingAddon` Prisma model + service + Stripe subscription-item / top-up flow + RevenueCat consumable mapping.
- `pricebook.json` convention with `creditValueMicroUsd` and per-model multipliers for managed-AI mode only.
- **DONE (RAG D1):** pgvector-backed product-doc index (`ai.doc_chunks`, `platform.searchProductDocs`, ingest of `docs/help/**` + listed surface summaries). **OPEN (RAG D2–D3):** per-workspace activity timeline summaries + unified memory/RAG writer.
- Reporting DSL + curated reporting views (Layer B).
- One additional Postgres role (`ai_readonly`) with `SELECT`-only on the curated reporting views (only needed if/when we choose the SQL-tool variant of Layer B).

---

## 6. AI consultant blueprint

Canonical `automation` module surface (Vessel registry, adapter SDK, OpenPLC seam, automation AI tools, tier limits) is specified in the accepted design [`docs/design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md) (RFC-0001 Decision E §7.2; β layout per [RFC-0002](rfcs/0002-canonical-module-physical-layout.md)). Implementation is phased (H2 2026 read path per that doc §9); brewery flat API routes were migrated into β by [RFC-0006](rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) in Week 1 of late-H1-2026.

### 6.1 Three layers (recap with comparison)

| Aspect | Layer A: Tools | Layer B: Reporting DSL | Layer C: RAG |
|---|---|---|---|
| What it answers | "What's my mash pH?" | "Top 10 SKUs by movement last quarter" | "How does MRP work in Umbraculum?" |
| Mechanism | Function call → existing API endpoint | Typed DSL → curated views | Embedding search → context injection |
| Where the data is | Wherever the API normally reads it | Reporting replica, curated views | pgvector, separate from operational tables |
| ACL | Inherits user session | Inherits role + curated view restrictions | Per-workspace index isolation |
| Cost | Low (small JSON) | Low–medium (bounded result set) | Low (embeddings cached) |
| Hallucination risk | Very low (deterministic numbers) | Low (typed query, deterministic execution) | Medium (model paraphrases retrieved text) |
| Build order | v0 | v1 (MVP shipped) | memory v0 + **RAG D1 shipped**; D2–D3 v1.5 |

### 6.2 Module-pluggable tool registry (interface sketch)

```ts
interface AiTool<I, O> {
  name: string;                       // "wms.lowStockItems"
  description: string;                // shown to the model
  inputSchema: ZodSchema<I>;          // runtime-validated args
  outputSchema?: ZodSchema<O>;        // optional, for redaction policies
  ownerModule: ModuleCode;            // "wms", "brewery", "crm", ...
  scopes: AiToolScope[];              // ["read"], future: ["read","propose-write"]
  handler: (args: I, ctx: AiToolContext) => Promise<O>;
  // ctx carries { workspaceId, userId, sessionId, requestId } — same shape as a request
}
```

Tools never receive raw DB connections; they call existing services through the same DI/context the rest of the API uses. This is what keeps ACL inheritance free.

### 6.3 Prompt composition pipeline

```mermaid
sequenceDiagram
  autonumber
  participant UI as Web/Native UI
  participant Orch as AI Orchestrator
  participant Reg as Module Registry
  participant Tools as Module Tools (read-only, ACL-aware)
  participant Ledger as Usage Ledger
  UI->>Orch: message + routeId + workspaceContext
  Orch->>Reg: resolve module + route overlays + memory
  Orch->>Orch: compose prompt (BASE + MODULE + ROUTE + MEMORY)
  loop tool loop
    Orch->>Tools: call tool with args
    Tools-->>Orch: small JSON result
  end
  Orch-->>UI: streamed answer (SSE)
  Orch->>Ledger: tokens, cost, provider mode, tool calls
```

### 6.4 Worked example — WMS yeast question

User on the WMS "stock movements" page asks: *"Why are we constantly running out of yeast Y?"*

```
1. UI sends:
   POST /api/ai/messages
   { sessionId, content: "Why are we constantly running out of yeast Y?",
     context: { routeId: "wmsStockMovements", workspaceId, skuHint: "yeast-y" } }

2. Orchestrator:
   - Loads system prompt:
       BASE("you are an ERP assistant for Umbraculum ...")
       + MODULE_OVERLAY("wms")
       + ROUTE_OVERLAY("wmsStockMovements")
       + WORKSPACE_MEMORY("they brew lagers; 2× 200L fermenters; weekly brew cadence")
   - Router picks Haiku (cheap, simple intent).
   - Tool loop begins.

3. Model calls (autonomously):
   wms.lowStockItems({ skuFilter: "yeast-y" })
     → returns 3 rows, current stock + reorder point
   wms.stockMovementHistory({ skuId: "...", days: 90 })
     → returns weekly consumption
   mrp.getMrpRequirements({ skuId: "..." })
     → returns planned vs actual consumption
   crm.recentOrdersForSku({ skuId: "..." })   # if CRM module installed
     → seasonal demand spike

4. Model answers in natural language, with numbers from the deterministic tools:
   "Your average weekly use of yeast Y is 1.2 kg, but your reorder point is set
    to 0.5 kg with a 7-day lead time from your supplier. Three brews back-to-back
    (which happened in weeks 12, 18, and 22) drain you below safety stock before
    your replenishment arrives. Two options: (a) raise reorder point to 1.5 kg,
    (b) increase order quantity from 2 kg to 5 kg per PO. Want me to draft a
    settings change for option (a)?"

5. Ledger writes:
   AiUsageLedger { tokensIn: 4200, tokensOut: 380, model: "claude-haiku-4.5",
                   costMicroUsd: 4760, providerMode: "byok",
                   workspaceId, userId, sessionId, toolCalls: [...] }
```

**Notice what happened:**

- The model never saw the `stock_movements` table (potentially millions of rows). It saw three small JSON results.
- All numbers are deterministic — your Node code computed them, not the LLM.
- Authorization was the user's. If the user couldn't see CRM, that tool wasn't in the registry for this call.
- Cost visibility exists in the ledger, but in BYOK mode there is no platform debit: the provider bills the workspace directly, while the platform monetizes the orchestration + memory + tool layer through the paid workspace tier.
- The "draft a settings change" offer is a **future write tool** — those need a confirmation step (model proposes, user clicks "Apply"). The model never writes directly in v0/v1.

### 6.5 Safety

- **ACL inheritance**: tools execute under the user's session; the model can never see what the user can't.
- **Zero data retention provider settings** (OpenAI ZDR, Anthropic no-train) wired at the API call level, with an explicit per-workspace toggle banner before first use.
- **PII redaction at the tool-result boundary**: tools may return scrubbed views of records (e.g. customer name without email/phone) when the AI scope doesn't require PII.
- **Per-message `max_output_tokens`** (sane default; model can request more if the user asks for a long report).
- **Per-user daily token cap** as a circuit breaker, separate from per-role monthly caps and any future managed-AI credit budget.
- **Prompt-hash cache** (5–15 min TTL) for repeated identical prompts — saves money on common questions.
- **Write-action human-in-the-loop**: the model proposes a JSON patch / config diff, the UI renders it, the user confirms.
- **Audit trail**: every tool call is logged as `(workspaceId, userId, sessionId, toolName, argsHash, costMicroUsd, durationMs, providerRequestId)`. SOC2 / ISO friendly out of the box.

---

## 7. AI monetization model

### 7.1 Shipped v0 — BYOK + paid tier unlock

The H2 2026 AI backbone monetizes the value layer without reselling provider tokens:

1. **Workspace brings the provider key.** The workspace admin enters an Anthropic API key in AI settings. The key is encrypted at rest, decrypted only in the API process, and never sent to web or native clients.
2. **Workspace pays the provider directly.** Anthropic token spend is billed to the customer's Anthropic account. Umbraculum does not carry token COGS, reseller liability, provider credit risk, or token overage support in v0.
3. **Workspace pays Umbraculum for the AI value layer.** AI is unlocked through existing workspace tiers: `free=false`, `premium | pro | pro_plus=true` via `tierLimitsService.aiEnabled`. Upgrades use the existing `BillingPurchaseIntent` / Stripe Checkout flow and existing webhook lifecycle handling.
4. **Usage is visible, not billable.** `AiUsageLedger` records tokens, cost estimates, model, duration, provider request ID, and tool calls for analytics, admin visibility, caps, and future migration. It does **not** drive Stripe charges in v0.
5. **Concierge onboarding is part of the value proposition.** The AI settings and post-checkout surfaces can link to human setup help, configured by environment variable.

This is intentionally different from a free-BYOK model. The customer pays their provider for raw model calls and pays Umbraculum for the operational layer that makes those calls useful: ACL-aware tools, prompt composition, per-workspace memory, limits, auditability, cross-platform UI, and support.

### 7.2 Why v0 does not ship resold credits

Resold credits are attractive for convenience, but they add real surface area: pricebook maintenance, top-ups, refunds, VAT and sales-tax handling on usage, chargeback exposure, App Store consumable mapping, dunning, provider price-change communication, and support for "why was I charged?" questions.

BYOK + paid tier unlock gets the hard architectural work into production first while avoiding that operational burden. It also keeps self-hosting straightforward: self-hosters always bring their own provider relationship, and the same BYOK code path works for them.

The future managed-AI path should be treated as an optional hosted convenience, not as the foundation of the AI architecture.

### 7.3 Future managed-AI credits

If hosted customers want one invoice and are willing to pay for convenience, Umbraculum can add a managed-AI mode later. In that mode:

- The platform uses a Umbraculum-managed provider key.
- Usage is debited against workspace AI credits.
- Credits, not raw tokens, are the customer-facing unit.
- A versioned `pricebook.json` maps model + token usage to credits.
- Plan-included credits hard-cap at 100%; optional top-up packs provide a retail escape hatch.
- Web top-ups use Stripe; native iOS can use RevenueCat consumables if top-ups are sold inside the app.

The core orchestrator does not change. The managed mode adds a preflight credit-balance check and a post-call debit, while reusing the same tools, prompts, memory, ledger, audit trail, and safety policy.

### 7.4 Future add-on model

Managed-AI credits and second-module entitlements both need the same missing primitive: a workspace-scoped add-on model.

```ts
WorkspaceBillingAddon {
  workspaceId              String
  addonCode                String        // "managed_ai_credits_5k", "wms_module", "crm_module"
  status                   String        // "active" | "canceled" | "past_due"
  periodStart, periodEnd   DateTime
  monthlyAllowance         Json          // { credits: 5000 } for managed AI; { seats: 5 } for modules if needed
  stripeSubscriptionItemId String?
}
```

Why decoupled:

- Module entitlements should not require inventing a new base tier for every vertical.
- Managed AI should remain optional for hosted customers and irrelevant to self-hosters.
- One workspace can have one base subscription plus multiple subscription items on a single invoice.
- RevenueCat can mirror the same concept through entitlements / consumables for native purchases.

### 7.5 Margin discipline for managed AI

If managed AI ships, margin must be priced against real COGS:

```
COGS_per_request =
    sum(provider_token_cost)
  + stripe_fee_share
  + support_amortization
  + provider_price_buffer
  + optional infra_marginal_cost
```

Industry-typical AI gross margin is roughly 50–75%. Targeting extreme margin on the token line is brittle: a competitor can subsidize it, a provider can change prices, or a customer can shift the model mix. The strategic margin is in the operational layer — tools, memory, workflow integration, and support — not in pretending token resale is a moat.

---

## 8. Decisions and open questions

### 8.1 Resolved through the H2 2026 backbone

1. **v0 monetization model:** BYOK provider relationship + paid AI subscription through existing `WorkspaceBilling` / `BillingTier`. AI unlocks at `premium`, `pro`, and `pro_plus`; `free` is blocked with `402 ai_subscription_required`.
2. **Stripe surface:** zero net-new Stripe code for v0 AI. The existing billing-intent checkout flow and webhook lifecycle handling are reused.
3. **Subscription primitive:** no new `WorkspaceSubscription` model. Existing `WorkspaceBilling` remains the current subscription source of truth.
4. **Provider for v0:** Anthropic only. Multi-provider adapters are deferred until a second provider is needed.
5. **v0 tool scope (expanded post-α H2):** brewery / automation / PIM / MRP / CRP read tools, `render_document`, `platform.reportingQuery` (reporting DSL MVP), `platform.searchProductDocs` (pgvector product-doc RAG D1), and MRP/CRP **propose-write** previews. Managed-AI credits and autonomous domain writes remain deferred.
6. **AI default:** opt-in per workspace. Admin enables AI, enters the key, and accepts the data-egress notice.
7. **Per-user role gating:** no role gate. All workspace members can use AI once the workspace admin enables it; safety is enforced through per-role monthly caps, per-user daily caps, workspace opt-in, and the audit ledger.
8. **Memory + RAG:** per-workspace operational memory is part of the H2 backbone. **Product-doc RAG (D1)** is shipped (pgvector + public-doc ingest + `platform.searchProductDocs`). Per-workspace activity-timeline RAG (D2) and memory/RAG unification (D3) remain future work — see [`docs/design/canonical-ai-rag-surface.md`](design/canonical-ai-rag-surface.md).
9. **Public-launch path:** launch artifacts exist, and §10.1.1 records the decision to seed a fresh public repository after Umbraculum is chosen.

### 8.2 Still open / deferred

1. **Managed-AI credits:** whether and when to add the optional hosted one-bill mode — model reserved by [RFC-0009](rfcs/0009-workspace-billing-addons-and-entitlements.md); implementation H1 2027 (ROADMAP E-full).
2. **Refund policy for managed-AI credits:** non-refundable / pro-rata / case-by-case.
3. **EU VAT / sales-tax handling for managed-AI credits:** Stripe Tax vs separate handling.
4. **Postgres multi-schema timing:** adopt at second-module ship, or earlier as preparation.
5. **Naming:** real Umbraculum brand and npm scope decision.
6. **Model auto-routing policy:** heuristic router, always-Sonnet, or user-choice.
7. **KMS-backed key storage:** when to replace the app-secret AES-GCM key vault with cloud KMS / Vault while preserving the encrypted-blob format.

---

## 9. Glossary

> **Onboarding entry point.** Core taxonomy (*vertical configuration*, *canonical module*, *brewery reference vertical*, documentation convention): [`GLOSSARY.md`](GLOSSARY.md). This section indexes platform, AI, and billing terms used in architecture discussions.

- **Add-on** — a billable extension to a workspace (e.g. a future managed-AI credit pack or module entitlement) that is independent of the base tier.
- **ARPU (Average Revenue Per User)** — total revenue divided by paying entities per period.
- **BYOK (Bring Your Own Key)** — workspace admin enters their own provider API key; the provider bills the workspace directly for tokens.
- **COGS (Cost of Goods Sold)** — variable per-unit cost of delivering one unit of the feature; relevant to future managed-AI credits, not v0 BYOK token spend.
- **Credit** — future managed-AI unit for usage; converted from model + token usage via a pricebook.
- **Gross margin** — `(price − COGS) / price`.
- **Hard cap** — usage limit that *blocks* further use until top-up or period rollover.
- **Horizontal platform** — the layer of the system that does not change when a new vertical module is added.
- **Managed AI** — future hosted mode where Umbraculum provides the model-provider key and bills usage through credits.
- **Model basket** — assumed mix of model usage that pricing is sized against.
- **Module** — a self-contained vertical (Brewery, WMS, CRM, MRP, CRP, …) that registers routes / services / models / AI tools / prompts / knowledge / limits / add-on codes into the platform.
- **MRR (Monthly Recurring Revenue)** — sum of normalized monthly subscription revenue.
- **multiSchema** — Prisma preview feature that lets one Prisma client span multiple Postgres schemas.
- **pgvector** — Postgres extension storing vector embeddings for similarity search; powers Layer C RAG. Dev/CI Postgres images are `pgvector/pgvector:pg16` (stock `postgres:16` does not ship the extension). Operational data stays in existing schemas; embeddings live in `ai.doc_chunks` (see [`canonical-ai-rag-surface.md`](design/canonical-ai-rag-surface.md)).
- **Pricebook** — versioned mapping of model + token usage → credits.
- **RAG (Retrieval-Augmented Generation)** — injecting retrieved knowledge chunks into the prompt to ground the model's answer.
- **Retail overage** — buying more capacity above the included allowance, at posted per-unit prices (typically with volume discounts on larger packs).
- **Route group** — Next.js convention `(name)/...` that groups routes for organization without changing the URL.
- **Semantic layer** — declarative description of entities, dimensions, metrics, and joins, given to the model so it can build typed reporting queries safely.
- **Soft cap** — usage limit that *warns* but allows continued use, billing the overage.
- **System prompt overlay** — a prompt fragment contributed by a module or route, composed with the base prompt and per-workspace memory.
- **Tool call** — model-invoked function that runs in our backend (read-only, ACL-aware) and returns small JSON.
- **Vertical configuration** — a tier-6 bundle (e.g. brewery) that consumes canonical modules and adds vertical-specific seed data, prompts, and UI; **not** a canonical module (see §1.1.1).
- **Write-action** — a tool that would mutate state. In v0/v1, write-actions are *proposed* by the model and require explicit user confirmation in the UI before execution.
- **ZDR (Zero Data Retention)** — provider mode that disables training and short retention windows; configured per request or per account.

---

## 10. Document conventions and lifecycle

- **This is the entry point.** When in doubt, link here from new docs and discussions; module-implementation details belong in domain docs (e.g. [`docs/CROSS-PLATFORM-BOUNDARIES.md`](CROSS-PLATFORM-BOUNDARIES.md), [`docs/modules/verticals/brewery/IMPLEMENTATION-LOG.md`](modules/verticals/brewery/IMPLEMENTATION-LOG.md), [`docs/TIER-PRICING-ANALYSIS.md`](TIER-PRICING-ANALYSIS.md), [`docs/REDIS-ARCHITECTURE.md`](REDIS-ARCHITECTURE.md), [`docs/ORG-BILLING-STRIPE-REVENUECAT-FASTIFY.md`](ORG-BILLING-STRIPE-REVENUECAT-FASTIFY.md)).
- **Update protocol**:
  - Structural changes (sections 2, 3, 4, 7) should be reviewed before merging — they change shared assumptions.
  - Glossary additions and pricing-example numeric updates can land in normal PRs.
  - Open-questions checklist (§8) should be appended to as new questions arise; resolved questions move to the relevant section with a brief decision note.

### 10.1 Open-source lifecycle

Because Umbraculum is open source and intended to be public-facing, this document and its sibling docs have additional lifecycle obligations beyond ordinary internal documentation.

The licensing posture, governance, and foundation-question bullets below are the *architectural* expressions of the project's ethics; the *ethical* statement of those same commitments lives in [`MANIFESTO.md`](../MANIFESTO.md) §2.3 ("Open by license, open by foundation"). This subsection and the manifesto are designed to be read together: this one carries the architectural decisions and their forward-only-application discipline; the manifesto carries the conviction those decisions enforce.

- **Public-facing intent.** Treat every doc under [`docs/`](.) as potentially public-facing. The audience priority order set in [`docs/README.md`](README.md) applies: future maintainers and contributors first, self-hosting operators second, prospective module developers third. Avoid private-by-default tone, internal-only references, and unexplained jargon.
- **Toolset is the deliverable; vertical-product operation is separable.** Umbraculum's deliverable is the **toolset and SDK surface** — the canonical-module set, the module SDK (§4.4), the AI-consultant context principle (§4.0), and the cross-platform web-and-native infrastructure (Tamagui as the cross-platform UI primitive layer over React Native + Expo on device; locale-prefixed routing; route IDs in `@umbraculum/navigation`; universal `useT`; cookie-vs-bearer auth split with webview bridge — see §3.5, [`docs/TAMAGUI.md`](TAMAGUI.md), [`docs/NATIVE-STRATEGY-AND-CI.md`](NATIVE-STRATEGY-AND-CI.md)). That infrastructure is industry-agnostic by construction: it makes any workspace-shaped application that wants one auth stack, one billing engine, one AI consultant, and one source of truth shipping to both web and native a credible thing to build. Any vertical the core team ships (brewery first, possibly MRP/CRP/WMS-shaped offerings later) is a *showcase configuration* that demonstrates what the toolset enables, not the platform's identity. Whether such a vertical is also operated as a managed product is a separable concern that may live with the core team, with a detached entity, or with third-party operators — the platform serves all three on the same terms. The structural guards against the project's openness being captured as a recruitment funnel for a single branded vertical are the AGPLv3 core, the MIT SDK, the no-CLA stance (DCO sign-off only), and the no-closed-source-replacement commitment in [`docs/LICENSING.md`](LICENSING.md) §9.
- **Semver discipline at the SDK boundary.** The SDK packages described in §4.4 follow [semantic versioning](https://semver.org/). Breaking changes to the SDK go through an RFC, get a deprecation window, and ship in a major version bump. The platform core has more flexibility — but any change visible to downstream modules counts as SDK surface.
- **License-change and governance-change RFCs.** Any change to the licensing posture in [`docs/LICENSING.md`](LICENSING.md) or the governance principles in §2.2 follows the RFC process documented in [`docs/LICENSING.md`](LICENSING.md) §10 — written RFC, minimum 30-day public comment, forward-only application.
- **Deprecation policy.** Public-surface deprecations (SDK types, AI tool contracts, route IDs, prompt-overlay keys) are announced in the RFC repository, marked with a `@deprecated` tag in source, and removed no earlier than one major version after announcement. The cost of a noisy deprecation is much lower than the cost of a silent breaking change for a module developer running a small consultancy.
- **No retroactive license changes.** Source code committed under AGPLv3 stays AGPLv3. Source code committed under MIT stays MIT. License-change RFCs apply only to code committed after the change date, preserving the terms downstream users relied on.
- **Brand and trademark separate from license.** As detailed in [`docs/LICENSING.md`](LICENSING.md) §8: the Umbraculum brand is not transferred by the source license. Forks, mirrors, and modified versions must use a different name. A formal trademark policy will be published before the first stable release.
- **Foundation question is deferred, not denied.** Transferring the trademark and governance to a foundation (e.g. Linux Foundation, Software Freedom Conservancy, a dedicated Umbraculum Foundation) is a real option, with real benefits for community trust and project longevity. It is not the right move at the current stage (pre-revenue, pre-community), but the architectural decisions on this page — AGPLv3, public SDK, DCO sign-off rather than CLA, governance principles in §2.2 — are deliberately compatible with a future foundation transfer if the project reaches that scale.
- **Audience-tier convention for documentation.** Each Markdown document in the repository carries an explicit `**Tier:**` marker on its first content line. Recognized values: `Public` (default for everything in [`docs/`](.) and the repo root — surfaceable on the public flip), and reserved values `Partner-restricted` and `Customer-restricted` for future authenticated audiences. Non-public business documentation (strategy notes, competitive analysis, pricing margins) is maintained separately and is not part of the public-mirror flip when it happens; documents that are not Tier: Public are intentionally not indexed from any public-tier doc to avoid one-way information leaks on the flip. Authors of new docs in [`docs/`](.) should add the marker and stick to the Tier: Public audience expectations.

#### 10.1.1 Go-public path (decision)

This subsection records the operational decision for *when and how* this repository becomes public.

- **Current state (2026-06-26).** The monorepo lives at **`github.com/umbraculum-dev/umbraculum-dev`** under the **`umbraculum-dev` GitHub org**, visibility **private**. The sister-repo **`github.com/umbraculum-dev/umbraculum-toolset`** (Cursor plugin pack source) is also org-hosted and private. **Stage 0 org transfer ✅** (2026-05-27). **Production surfaces already live pre-flip:** [forum.umbraculum.dev](https://forum.umbraculum.dev/) (2026-06-08), [demo.umbraculum.dev](https://demo.umbraculum.dev/) (2026-06-03), [umbraculum.dev/support/](https://umbraculum.dev/support/) with Liberapay + Buy Me a Coffee (**2d ✅ 2026-06-26**), plus brochure/docs on Cloudflare (pre-flip `noindex` until Stage 2 **2c**). **MIT npm SDK publish batch ✅ 2026-05-29.** Remaining before public flip: Stage 1 hygiene sign-off ([`public-alpha-preflip-hygiene-checklist.md`](design/public-alpha-preflip-hygiene-checklist.md)), atomic GitHub visibility flip paired with `umbraculum-toolset`, remove `noindex`, and marketplace submission started same session.
- **Decision.** Target a **July 2026 public alpha** rather than the original H1 2027 public-flip horizon. The remaining prerequisites are now Stage 1 hygiene sign-off, the atomic GitHub visibility flip, brochure/docs `noindex` removal, and the umbraculum-toolset marketplace path — **not** standing up forum, demo, or donation URLs (those are already live in production). A complete second vertical is no longer a blocker for public alpha.
- **Why a fresh public seed (not a rename in place).**
  - **Keeps the public branch's git history clean of historical brewery-vertical-flavored route IDs and class names that are appropriate for brewery configuration but misleading as a public first impression of the toolset.** Those names live in the private history but should not be the public repo's first impression. (The `@brewery/*` → `@umbraculum/*` package-scope migration that previously also motivated the fresh seed already closed under sub-plan #9 on 2026-05-19, so this concern is now narrower than originally written.)
  - Gives a clean opportunity to align the codebase with the public architecture framing as a single atomic change, rather than leaving rename artifacts scattered across git history.
  - Keeps the public commit history aligned with the public framing in [§1.1](#11-positioning--toolset-for-organizational-and-operational-applications), instead of having the public audience read backwards through brewery-only history.
- **Release-window framing.**
  - June 2026 remains the preparation / earliest cutover / marketplace-submission window from [`docs/ROADMAP.md`](ROADMAP.md).
  - July 2026 is the realistic external public-alpha window because marketplace approval, DNS propagation, final hygiene checks, and public-doc smoke tests can tail beyond the cutover day.
  - "Public alpha" means source visibility, contribution surface, public docs, public toolset source, a `v0.0.1-alpha` tag, and marketplace submission/approval flow. It does **not** mean hosted-service GA or feature-complete ERP coverage.
- **Conditions that would justify a later flip.**
  - The pre-flip hygiene scan finds secrets, personal identifiers, public/internal link leaks, or license/security-doc gaps that cannot be corrected safely inside the July window.
  - The docs site, brochure site, or toolset-publication path is not reliable enough for external contributors to onboard without maintainer hand-holding.
  - A foundation-transfer conversation (see §10.1, *Foundation question*) is in flight and the public flip is best done together with the transfer rather than separately.
- **Pre-flip checklist** (kept here so the conditions are explicit, not folkloric):
  1. **Package-scope migration ✅** (2026-05-19: sub-plan #9 closed across 14 slots — all `@brewery/*` workspaces are now `@umbraculum/*` / `@umbraculum/brewery-*`; see [`docs/design/brewery-scope-migration-plan.md`](design/brewery-scope-migration-plan.md)). The remaining public-framing work — route-prefix audit, AI prompt audit, billing UI copy audit — is tracked under the post-RFC-001 follow-on sub-plans.
  2. `internal/**` audited and confirmed excluded from the public seed; cross-links from `docs/**` to `internal/**` removed.
  3. Contact email placeholders in [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md) and [`SECURITY.md`](../SECURITY.md) replaced with monitored, real addresses on the resolved `umbraculum.dev` domain.
  4. Copyright header in [`LICENSE`](../LICENSE) resolved to the final entity name (placeholder substitution complete: `Copyright (C) 2026 Umbraculum contributors`; the eventual legal-entity name — single-founder company / future foundation — substitutes here at incorporation time).
  5. A short public-launch blog post / `docs/`-hosted announcement explaining the project, the licensing posture, and how to contribute — draft: [`PUBLIC-ALPHA-ANNOUNCEMENT.md`](PUBLIC-ALPHA-ANNOUNCEMENT.md) (publish at flip).
  6. **MIT SDK npm publish batch** — **✅ pre-completed 2026-05-29** (before repo visibility flip). Seven packages on the public registry; OIDC trusted publishing for future bumps. Authoritative versions: [`docs/LICENSING.md`](LICENSING.md) §6.2.1. `@umbraculum/api-client` remains deferred.
  7. **Platform + brewery Postgres schema split ✅** (2026-05-28: [RFC-0010](rfcs/0010-platform-brewery-postgres-schema-split.md); `platform.*` + `brewery.*`; forward migration in `services/api/prisma/migrations/20260528170000_split_platform_brewery_schemas/`; as-built runbook [`design/platform-brewery-postgres-schema-split.md`](design/platform-brewery-postgres-schema-split.md)).
  8. **OpenAPI alpha artifact + docs cross-refs (recommended)** — committed partial spec at `services/api/openapi/openapi.json`, CI `openapi:check`, canonical doc [`API-OPENAPI.md`](API-OPENAPI.md), docs-site static mirror. **Not required for repo visibility flip** (distinct from item 6 npm publish); strongly recommended so integrators see machine-readable canonical-module coverage at alpha.
- **Marketplace-submission and public-alpha closure criterion.** The **three** umbraculum-toolset Cursor plugins required for umbraculum-dev contributors (`umbraculum-toolset-common`, `umbraculum-node-react-cursor-assistant`, `umbraculum-platform-tsjs-cursor-assistant`) are **submitted to the Cursor marketplace during the June cutover-prep window**. The `umbraculum-openplc-python-cursor-assistant` listing is **deferred** until the OpenPLC sister repo is public. Prerequisite for submission, and for the pre-marketplace install path being usable on flip day: the **sister-repo `github.com/umbraculum-dev/umbraculum-toolset`** — which hosts those plugins' source — flips visibility from private → public in the **same atomic moment as this repo's own public flip**. (The toolset repo is already hosted under the `umbraculum-dev` GitHub org, so no ownership transfer is needed; only its visibility flips.) [`CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) §Install documents **workspace-scoped loading** via the [`workspaceOpen` hook](https://cursor.com/docs/hooks#workspaceopen) and toolset [`WORKSPACE-PLUGIN-LOADING.md`](https://github.com/umbraculum-dev/umbraculum-toolset/blob/master/cursor-plugins/docs/WORKSPACE-PLUGIN-LOADING.md) (clone from that URL; not global rsync into `~/.cursor/plugins/local/`), and the marketplace listings point at it as the canonical source — both consumers require the URL to resolve publicly from flip day onward. The operational pairing of the two visibility flips is recorded in [`ROADMAP.md`](ROADMAP.md) §"Late H1 / July 2026" Week 3 Stage 2. The public-alpha procedure is **COMPLETE only when the three umbraculum-dev marketplace listings are live** (Cursor-side approval timing — days to weeks; outside this project's control). Until the listings publish, the hook + source install path documented in [`CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) remains canonical and [`AGENTS.md`](../AGENTS.md)'s apparatus self-check instructs new contributors via that path; once they publish, the steady-state install path flips to **marketplace per-workspace enablement** across all three docs ([`CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md), [`GETTING-STARTED.md`](GETTING-STARTED.md), [`AGENTS.md`](../AGENTS.md)) — with the hook retained for plugin HEAD development (toolset `WORKSPACE-PLUGIN-LOADING.md` §4) — and the *post-marketplace-flip*-gated upgrades — the machine-readable `.cursor/required-plugins.json` manifest, the CI parity check that pins agent-side and CI-side plugin versions in lockstep, and the [`AGENTS.md`](../AGENTS.md) version-pinned (rather than presence-only) check — are unblocked. This commitment is **a single architectural commitment**, not a marketing milestone: the umbraculum-toolset apparatus is the equalizer that keeps the contribution bar low (per [`MANIFESTO.md`](../MANIFESTO.md) §1.3 and §2.2), and "the apparatus is one-click-installable from the same marketplace every Cursor user already uses" is what *operationally* discharges that commitment. The operational date for submission and the listings-live tail-tracking discipline live in [`ROADMAP.md`](ROADMAP.md) §"Late H1 / July 2026"; the present subsection is the architectural record of the closure criterion itself.
- **Non-goals at the flip.** A coordinated marketing launch, a paid hosted service GA, or a v1.0 release are *not* required to flip the repo public. The flip is about source visibility, contribution surface, and the marketplace-submission act recorded directly above; commercial milestones can land on their own cadence afterwards.
