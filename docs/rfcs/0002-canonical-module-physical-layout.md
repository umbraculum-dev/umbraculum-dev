# RFC-0002 — Canonical-module physical layout

**Tier:** Public
**Status:** Accepted 2026-05-19 (core team approval recorded; this is a living RFC — see §12 Resolution for the change procedure)
**Audience:** prospective contributors, self-hosters, third-party module developers, hosted-service customers, and anyone evaluating Umbraculum's module folder conventions as a long-term operational dependency.
**Document role:** canonical physical-layout commitment for modules, contracts packages, and SDK placement.

> **Disclaimer.** This RFC sets physical-layout commitments for Umbraculum's canonical-module ecosystem. It is a public-readable artifact intended to outlive any single maintainer; the commitments here are durable but not unchangeable — the change procedure mirrors [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §13 and [`docs/LICENSING.md`](../LICENSING.md) §10.

---

## 1. Summary

This RFC commits to four decisions and defers one cluster of implementation work:

- **Decision A — Physical-layout shape: β (three-tree distribution).** Canonical-module surface is distributed across three runtime trees plus one contracts package per code: API slice in `services/api/src/modules/<code>/`; web slice in `apps/web/app/[locale]/(<code>)/`; native slice in `apps/native/src/modules/<code>/`; shared types and registration contracts in `packages/<code>-contracts/` (published as `@umbraculum/<code>-contracts`). Rejects α (single tree under `packages/modules/<code>/`) and γ (status-quo flat layout).
- **Decision B — Naming conventions.** Folder name = canonical code (lowercase, no `module-` prefix). Web route group = `(<code>)/` (no URL change). Contracts package = `@umbraculum/<code>-contracts`. Prisma `multiSchema` namespace = canonical code for new modules.
- **Decision C — `registerModule()` helper location.** The public `registerModule()` API and its TypeScript types live in `packages/module-sdk/` (npm scope `@umbraculum/module-sdk`, MIT per [`docs/LICENSING.md`](../LICENSING.md) §6.2). A parallel web-side module registry lives in the same package (or a thin `@umbraculum/module-sdk-web` re-export if the web bundler requires a split — the boundary is an implementation detail; the RFC commits to one logical SDK surface).
- **Decision D — Brewery-as-first-vertical migration sequencing.** Brewery does NOT pre-migrate as a no-op restructure. The flat brewery surface migrates to the β layout at H1 2027 alongside the second canonical module landing, validating the convention against a real cross-module workspace. The `@brewery/*` → `@umbraculum/*` package-scope migration (sub-plan #9) happens in the same window.

The deferred cluster (§7) covers three implementation-boundary questions that β does not resolve: tier-6 vertical-configuration folder shape, contracts-package contents vs in-module `contracts.ts`, and cross-module shared types. Those belong to sub-plan #9 (`@brewery/*` package scope migration), not to this RFC.

---

## 2. Motivation

[RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) committed the conceptual module model — canonical-module rule, reserved codes, tier model, governance, consumption contract — and explicitly deferred physical layout to a post-RFC follow-on (RFC-0001 §9.2 non-goal #1). We are now at the point where that deferral costs more than it saves: the second canonical module (`wms` or `automation`, per [`docs/ROADMAP.md`](../ROADMAP.md)) needs a folder convention before its first route lands, and contributors need a single answer to "where does my module's code go?" without re-litigating the shape per PR.

Two failure modes motivate committing layout now:

**Folder churn cascading into import-graph churn.** Without a pinned convention, each new module PR invents its own folder shape (`lib/wms/`, `features/wms/`, `packages/wms/`). Renaming later forces wide import-path updates, breaks git blame, and makes code review harder because reviewers cannot rely on muscle memory. The cost is not the rename itself — it is the review fatigue and the temptation to leave inconsistent shapes in place "because migration is painful."

**Review pain from ambiguous ownership.** When API routes, web pages, and shared DTOs live in unrelated trees with no naming link, reviewers cannot tell whether a change belongs to the module or to platform infrastructure. β makes ownership visible: if it is under `services/api/src/modules/wms/`, it is WMS module code; if it is under `apps/web/app/[locale]/(wms)/`, it is WMS web surface. Platform cross-cutting code stays outside those trees.

**Why now, not at H1 2027.** [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §5.2 already sketches the H1 2027 restructure (route groups, `multiSchema`, `registerModule()`). RFC-0002 ratifies that sketch as the authoritative layout decision so implementers of `registerModule()` (§5.3 net-new) and the first non-brewery canonical module build against one target, not against an informal migration map.

Named precedents for β-shaped distribution (not identical, but directionally aligned):

- **Drupal** — `modules/contrib/<name>/` for module-owned PHP; themes and routing are separate trees but linked by module name.
- **SAP S/4HANA** — functional modules ship as deployable units with API, UI, and data slices that share a module identifier.
- **Salesforce** — `force-app/main/default/` packages group metadata by concern; the module (package) name is the stable key across API and UI artifacts.

---

## 3. Decision A — Physical-layout shape: β (three-tree distribution) (commit)

**Canonical modules use β: three runtime trees plus one contracts package per reserved code.**

| Slice | Path (monorepo) | Owns |
|---|---|---|
| API | `services/api/src/modules/<code>/` | Fastify route plugins, services, Prisma models for this module's schema, AI tool handlers, module-local tests |
| Web | `apps/web/app/[locale]/(<code>)/` | Next.js App Router pages and layouts for this module (route group — no URL prefix change) |
| Native | `apps/native/src/modules/<code>/` | Screens, navigation entries, module-local components for React Native |
| Contracts | `packages/<code>-contracts/` → `@umbraculum/<code>-contracts` | DTO types, route IDs, `registerModule()` slot declarations consumed by API, web, native, and third-party repos |

**Platform infrastructure stays outside module trees.** Auth, workspaces, billing, health, generic integrations, webhooks, and cross-module AI orchestration remain in their current locations (`services/api/src/routes/{auth,workspaces,billing,...}.ts`, `apps/web/app/[locale]/(auth)/`, etc.) until a future RFC proposes a `platform/` module tree. RFC-0002 does not move platform code.

**Tier-6 vertical configurations use the same β shape with the vertical code as `<code>`.** Brewery (tier 6 per RFC-0001 Decision C) migrates to `(brewery)/` on web, `services/api/src/modules/brewery/`, `apps/native/src/modules/brewery/`, and `@umbraculum/brewery-contracts` — not to a reserved canonical code folder. The physical shape is identical; governance differs (permissionless tier 6 vs gated tier 1).

**Why β over α (single tree).** α — everything under `packages/modules/<code>/` with `api/`, `web/`, `contracts/` subfolders — is attractive for greenfield monorepos and for third-party modules built in external repos. It fails for Umbraculum's current stack:

- **Fastify and Next.js have established entrypoints.** The API app's composition root is `services/api/src/app.ts`; the web app's routing root is `apps/web/app/`. Moving route registration into a distant package tree either breaks framework conventions or requires indirection layers that obscure boot order.
- **Deploy boundaries differ.** API, web, and native ship as separate artifacts today. A single package tree encourages accidental cross-imports (web importing API internals) that β's directory boundaries make visible in review.
- **The MIT SDK story still works.** Third-party modules in external repos depend on `@umbraculum/module-sdk` and `@umbraculum/<code>-contracts`; they implement β-shaped folders in *their* repo without requiring Umbraculum's monorepo to use α.

**Why β over γ (status quo).** γ — keep flat `services/api/src/routes/recipes.ts` and `apps/web/app/[locale]/recipes/` with no module prefix — was the right choice for a single-vertical MVP. It does not scale to five canonical modules plus tier-6 verticals: route file count in `app.ts` becomes unreviewable, and there is no place to hang per-module lint boundaries (RFC-0001 Decision F §8.3, post-RFC follow-on). γ is explicitly rejected as the long-term shape; brewery's file-move was pulled forward by [RFC-0006](0006-amend-rfc-0002-brewery-file-move-acceleration.md) — see §6 below as amended.

**Two β disciplines (added by the Week-1 audit, 2026-05-21).** RFC-0002's β shape is necessary but not sufficient — the Week-1 web-route audit ([`docs/design/web-route-group-audit.md`](../design/web-route-group-audit.md)) discovered two physical-layout anti-patterns that β does not forbid by itself, and that produced silent runtime breakage in the pre-audit `(automation)/` web slice:

- **Discipline 1 — no `(<code>)/page.tsx` at the route-group root.** A `page.tsx` directly inside a route group at `[locale]/` collides with `[locale]/page.tsx` (the Dashboard / locale-root home). Both files resolve to `/en`; Next.js silently picks one and drops the other.
- **Discipline 2 — no `(<code>)/[<dynamic>]/page.tsx` at the route-group root.** A dynamic segment at the route-group root matches `/en/anything`, shadowing every other module's static segments and platform pages.

Both disciplines are enforced at build time by `scripts/check-web-url-segments.ts` (wired in `.github/workflows/check-web-url-segments.yml`). The canonical β shape is therefore: route group `(<code>)/` contains ONLY static sub-segment folders (`(<code>)/<segment>/page.tsx`), each registered via `@umbraculum/module-sdk`'s `registerWebModule({ ownedUrlSegments })`. The `(auth)/` platform-grouping route group is the canonical good example (sub-segments only: `login/`, `signup/`, `select-workspace/`, `select-account/`).

**Prisma alignment.** New canonical modules get a dedicated Postgres schema via Prisma `multiSchema` preview when the second module ships ([`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.5 option 2, §5.2). The schema name equals the canonical code (`wms`, `automation`, …). Legacy brewery tables remain in `public` until a separate migration RFC authorizes `brewery.*` schema split (RFC-0006 deferred the Prisma split independently of the file-move acceleration).

---

## 4. Decision B — Naming conventions (commit)

Four conventions, applied consistently across all β slices:

1. **Folder / directory name = canonical code.** Lowercase, no `module-` prefix, no `umbraculum-` prefix in the path. Examples: `wms/`, `automation/`, `brewery/` (tier 6). Reserved canonical codes are exactly those in [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) Decision B; tier-6 verticals use their vertical code.

2. **Web route group = `(<code>)/`.** Next.js route groups do not affect URLs. `apps/web/app/[locale]/(wms)/stock/page.tsx` serves the same URL path as today's flat structure would after routes move — only the filesystem path changes. Platform routes keep existing groups: `(auth)/`, and top-level segments like `platform/` that are not module-owned.

3. **Contracts package = `@umbraculum/<code>-contracts`.** Monorepo path `packages/<code>-contracts/`. The package exports stable DTOs, route ID constants, and module-registration type slices third parties may pin. It does NOT export server-only implementations or Prisma client wrappers.

4. **Postgres schema namespace = canonical code** (new modules only). Prisma `@@schema("wms")` (or equivalent `multiSchema` configuration) matches the folder code. Existing `public` brewery tables are exempt until a dedicated migration.

**Module README.** Each `services/api/src/modules/<code>/README.md` (and optional sibling under `packages/<code>-contracts/`) follows [`docs/DOCS-README-STANDARDS.md`](../DOCS-README-STANDARDS.md) — overview, config surfaces, logging, API entrypoints. This is documentation discipline, not a fifth naming convention.

---

## 5. Decision C — `registerModule()` helper location: `packages/module-sdk/` (commit)

**The public `registerModule()` contract lives in `packages/module-sdk/`, published as `@umbraculum/module-sdk` (MIT).**

Rationale:

- **RFC-0001 already names this package** as tier-2 bundled SDK ([`docs/LICENSING.md`](../LICENSING.md) §6.2; RFC-0001 §5 tier table). Physical layout should match the license and consumption story: module developers depend on npm packages, not on deep imports from `services/api/src/`.
- **Boot composition stays in the API app.** `services/api/src/app.ts` (or a thin `services/api/src/modules/registry.ts`) calls `registerModule()` from the SDK for each installed module. The SDK defines the shape; the API app performs registration. Web and native apps call a parallel `registerWebModule()` / `registerNativeModule()` exported from the same package (or a documented subpath) so route metadata, AI overlays, and tier-limit slices stay symmetric.
- **Net-new per PLATFORM-ARCHITECTURE.md §5.3.** The helper does not exist in the repo today. RFC-0002 commits *where* it will be created, not an implementation schedule. Implementation lands before or with the second canonical module.

**What the SDK exports (minimum surface, not an implementation spec):**

- `registerModule(options)` — server-side registration (routes, prisma schema name, `registerAiTools`, tierLimits, addonCodes) per [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.4 sketch.
- Types: `ModuleCode`, `RegisterModuleOptions`, `TierLimitsSlice`, extension-point declarations.
- Re-exports of `@umbraculum/ai-tool-sdk` types where module authors register tools.

**What the SDK does NOT own.** Prisma schema files remain in `services/api/prisma/` (or split per §4.5 option 3 long-term). UI components remain in `@umbraculum/ui` and module-local folders. The SDK is contract-only plus thin registration helpers.

---

## 6. Decision D — Brewery-as-first-vertical sequencing: wait for 2nd canonical module (commit, AMENDED by RFC-0006)

> **Amendment status (2026-05-21):** This decision was AMENDED by [RFC-0006](0006-amend-rfc-0002-brewery-file-move-acceleration.md). The original text is preserved below as a historical record per [`docs/LICENSING.md`](../LICENSING.md) §10 forward-only amendment principle; RFC-0006 is the authoritative interpretation going forward.
>
> **Summary of the amendment:** brewery's file-move from the flat `services/api/src/routes/*.ts` + `apps/web/app/[locale]/<segment>/` layout to the β shape (`services/api/src/modules/brewery/` + `apps/web/app/[locale]/(brewery)/`) was pulled forward from H1 2027 to Week 1 of the late-H1-2026 tranche (2026-05-20 → 2026-05-26), bundled with the web-route-shape audit ([`docs/design/web-route-group-audit.md`](../design/web-route-group-audit.md)). The acceleration trigger was the second canonical module landing (`automation` Phase B-1 in early 2026, `pim` Phase A in mid-2026) PLUS the web-route audit's need for a uniform layout across all three modules to exercise the new URL-segment-collision CI gate. The Prisma `brewery.*` schema split remains deferred (RFC-0006 §4 — only the TypeScript file-move was accelerated; the schema move is a separate, higher-risk migration).
>
> The original-text Rationale block below remains useful as historical context — it captures the trade-off the amendment had to revisit and explains why the original "wait for 2nd canonical module" position was correct for the pre-audit world.

**Brewery does NOT pre-migrate to β before the second canonical module ships.** (Original text, superseded by RFC-0006.)

Rationale:

- **No-op restructure teaches nothing.** Moving brewery alone into `(brewery)/` and `services/api/src/modules/brewery/` without a second module does not validate cross-module import boundaries, `multiSchema` coexistence, or `tierLimitsService` composition — it only churns paths.
- **PLATFORM-ARCHITECTURE.md §5.2 already pairs the moves.** Route-group wrap, `registerModule()` adoption, `@brewery/*` scope split, and module-aware tier limits are one H1 2027 tranche. RFC-0002 aligns with that tranche rather than inventing a brewery-only early migration.
- **RFC-0001 pins brewery as tier 6, not tier 1.** The migration validates β for both canonical and vertical-configuration codes in one pass: the second canonical module (e.g. `wms`) lands in `modules/wms/` from day one; brewery moves from flat routes into `modules/brewery/` in the same release window.

**Working assumption:** H1 2027 per [`docs/ROADMAP.md`](../ROADMAP.md) and [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §5.2. If the second module ships earlier, the migration moves with it; Decision D is about sequencing principle, not a fixed calendar date. (Calendar superseded by RFC-0006 — Week 1 of late-H1-2026.)

---

## 7. What this RFC defers (open questions for sub-plan #9)

β commits the *shape*; three *boundaries* remain for the `@brewery/*` package scope migration sub-plan:

**1. Tier-6 vertical-configuration API folder depth.** Does brewery tier-6 use the full β API tree (`services/api/src/modules/brewery/`) from the first migration, or only web `(brewery)/` initially with API routes moved in a second pass? RFC-0002 recommends full β for brewery in the same H1 2027 tranche so one convention applies everywhere; the sub-plan may refine if incremental migration reduces risk.

**2. `@umbraculum/<code>-contracts` package boundary.** What belongs in `packages/wms-contracts/` vs `services/api/src/modules/wms/types.ts`? Rule of thumb for the sub-plan: anything a third-party module or native client must pin goes in contracts; anything server-only stays in the API module tree. RFC-0002 does not draw the exhaustive list.

**3. Cross-module shared types.** When `automation` and `mrp` both need a shared concept (e.g. equipment identity), does Umbraculum add `packages/platform-equipment-contracts/`, extend `@umbraculum/module-sdk`, or duplicate minimal DTOs per module until a promotion mini-RFC allocates a shared package? Deferred until two canonical modules expose a concrete conflict — YAGNI until then.

---

## 8. Cross-references and non-goals

### 8.1 What this RFC builds on (and does NOT relitigate)

- **[RFC-0001](0001-modules-tiers-governance-and-automation-placement.md).** Canonical-module rule, reserved codes, tier model, governance, consumption contract — committed; RFC-0002 is the mechanical layout follow-on RFC-0001 §9.2 named.
- **[`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.4, §4.5, §5.2, §5.3.** Module registration sketch, Prisma schema strategy, H1 2027 restructure catalog, net-new `registerModule()` — RFC-0002 ratifies β as the layout implied by §5.2.
- **[`docs/LICENSING.md`](../LICENSING.md) §6.2.** MIT SDK packages including `@umbraculum/module-sdk`.
- **[`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md).** Lint and typing slices inform post-layout `eslint-plugin-boundaries` work (RFC-0001 §8.3 layer 2); RFC-0002 does not duplicate that runbook.
- **[`docs/DOCS-README-STANDARDS.md`](../DOCS-README-STANDARDS.md).** Per-module README expectations under Decision B.

### 8.2 What this RFC explicitly does NOT do (non-goals)

- **Lint enforcement of module import boundaries.** `eslint-plugin-boundaries` banned-import lists per `modules/<code>/` — post-RFC follow-on once folders exist (RFC-0001 §9.2).
- **Mechanical `@brewery/*` migration.** Package renames and `package.json` workspace updates — sub-plan #9; listed in §11 migration plan as same window, not same RFC. Scoping pass done 2026-05-19; see [`docs/design/brewery-scope-migration-plan.md`](../design/brewery-scope-migration-plan.md) (L1 plan with mis-classification audit + verification recipe) + [`docs/design/brewery-scope-migration-per-package-handoff.md`](../design/brewery-scope-migration-per-package-handoff.md) (per-slot execution checklist; 14 slots; worked example landed).
- **Prisma `multiSchema` activation.** Configuration and migration of the first non-`public` schema — implementation work bundled with second module; RFC-0002 only commits naming (`schema name = code`).
- **Canonical `automation` surface design.** RFC-0001 Decision E §7.2 — separate sub-plan.
- **Accepting this RFC.** Status remains Draft until core-team review (§12).

---

## 9. Alternatives considered

For each commit decision, the rejected alternative(s) and why.

### 9.1 Decision A — alternative considered: α (single tree under `packages/modules/<code>/`)

All module artifacts — `api/`, `web/`, `native/`, `contracts/`, optional `prisma/` — live under one package directory per code.

**Rejected for Umbraculum's monorepo.** Framework entrypoints (`services/api/src/app.ts`, `apps/web/app/`) already own boot and routing. α either duplicates those roots or forces indirection that hides registration order. Deploy artifacts (API container vs web container vs native app) remain separate; α's unity is mostly illusory without a monolithic deploy, which Umbraculum does not use. α remains a valid shape for **external** third-party module repos that consume `@umbraculum/module-sdk`.

### 9.2 Decision A — alternative considered: γ (status-quo flat layout)

Keep `services/api/src/routes/recipes.ts` and `apps/web/app/[locale]/recipes/` with no `modules/` or `(code)/` grouping; add only naming prefixes in filenames.

**Rejected.** γ was correct for single-vertical MVP but does not scale to five canonical modules: `app.ts` registration list becomes unbounded, per-module ownership is invisible in review, and lint boundaries cannot attach to folders. H1 2027 restructure per PLATFORM-ARCHITECTURE.md §5.2 already assumes route groups and `registerModule()` — γ contradicts that direction.

### 9.3 Decision B — alternative considered: prefixed folder names (`module-wms/`, `umbraculum-wms/`)

**Rejected.** Redundant with path context (`services/api/src/modules/` already signals module scope). Extra prefix length harms tab-completion and duplicates the brand namespace reserved for npm packages (`@umbraculum/wms-contracts`).

### 9.4 Decision C — alternative considered: `registerModule()` implemented only inside `services/api/src/`

**Rejected.** In-repo-only registration blocks the tier-2 SDK story (RFC-0001 §11.3, PLATFORM-ARCHITECTURE.md §4.4). Third-party modules in external repos must depend on a published MIT package, not on copying types from server internals.

### 9.5 Decision D — alternative considered: pre-migrate brewery to β immediately (2026)

**Rejected.** Churn without validation; does not exercise `multiSchema` or cross-module tier limits; splits contributor attention from second-module delivery. PLATFORM-ARCHITECTURE.md §5.2 already bundles brewery moves with second module.

---

## 10. Impact across audiences

Per [`docs/LICENSING.md`](../LICENSING.md) §10's standard impact section structure.

### 10.1 Contributors

Contributors gain a single checklist for new module work: create four paths under β, add `packages/<code>-contracts/`, register via `@umbraculum/module-sdk`. Code review becomes faster because module ownership is path-derived. Short-term cost: H1 2027 migration PR will touch many brewery files — planned as one coordinated change, not drive-by renames.

### 10.2 Self-hosters

No immediate impact until migration ships. Self-hosted deployments that cherry-pick modules will see clearer separation between platform routes and module routes in logs and stack traces after β lands.

### 10.3 Module developers

The MIT SDK (`@umbraculum/module-sdk`, `@umbraculum/<code>-contracts`) is the stable dependency surface. External repos should mirror β folder names for familiarity; monorepo paths in this RFC are documented as **examples** of the canonical layout. Module developers do not need write access to `services/api/src/app.ts` if registration is plugin-driven via installed module packages (future packaging detail; not committed here).

### 10.4 Hosted customers

No immediate impact. Long-term, coherent module folders support faster incident triage and feature rollout per module.

### 10.5 Enterprises

Enterprises auditing codebase structure for acquisitions or compliance reviews get explicit module boundaries aligned with RFC-0001 governance tiers. AGPL tier-1 canonical code paths are identifiable under `services/api/src/modules/{mrp,wms,...}/`.

---

## 11. Migration plan

### 11.1 Today's flat brewery surface (unchanged until H1 2027 tranche)

**API routes (flat `services/api/src/routes/`):** brewery-vertical handlers include `brewdaySettings.ts`, `brewSessions.ts`, `equipmentProfiles.ts`, `ingredients.ts`, `inventory.ts`, `recipes.ts`, `recipesExport.ts`, `recipesImport.ts`, `recipeWaterComputeAndSave.ts`, `recipeWaterHubSummary.ts`, `recipeWaterSettings.ts`, `styles.ts`, `waterCalc.ts`, `waterProfiles.ts` — registered from `services/api/src/app.ts`.

**Platform routes (stay flat through migration):** `auth.ts`, `billing.ts`, `workspaces.ts`, `ai.ts`, `health.ts`, `integrationsGeneric.ts`, `integrationsReveal.ts`, `integrationsTilt.ts`, `integrationsTiltIngest.ts`, `webhooksStripe.ts`, `webhooksRevenuecat.ts`, `platformAds.ts`, `platformRecipes.ts`, `ads.ts`.

**Web routes (flat `apps/web/app/[locale]/`):** brewery-vertical segments include `recipes/`, `inventory/`, `equipment/`, `water-profiles/`, `brewday-steps-settings/`, `ferm-data-integration/`, plus supporting segments `about/`, `contact/`, `contributing/`, `i18n-contributing/`. Platform/auth segments: `(auth)/`, `platform/`, `ai/`, `accessibility/`.

**Native (`apps/native/src/`):** screens and navigation today are not grouped by module folder; migration creates `apps/native/src/modules/brewery/` and moves brewery screens there in the H1 2027 tranche.

**Packages:** horizontal and brewery-vertical packages remain under current `@brewery/*` scopes until sub-plan #9.

### 11.2 H1 2027 restructure — concrete folder moves (β target)

When the second canonical module (example: `wms`) ships:

| From (today) | To (β target) |
|---|---|
| `services/api/src/routes/recipes.ts` (and sibling brewery route files) | `services/api/src/modules/brewery/routes/recipes.ts` (grouped; exact file split is implementation detail) |
| `services/api/src/routes/{auth,billing,workspaces,...}.ts` | Unchanged (platform) |
| New `wms` routes (greenfield) | `services/api/src/modules/wms/routes/*.ts` |
| `apps/web/app/[locale]/recipes/**` | `apps/web/app/[locale]/(brewery)/recipes/**` |
| `apps/web/app/[locale]/inventory/**` | `apps/web/app/[locale]/(brewery)/inventory/**` |
| (same pattern for equipment, water-profiles, brewday-steps-settings, ferm-data-integration) | Under `(brewery)/` |
| New `wms` pages | `apps/web/app/[locale]/(wms)/**` |
| Native brewery screens (today under `apps/native/src/screens/` etc.) | `apps/native/src/modules/brewery/**` |
| New contracts (greenfield) | `packages/wms-contracts/`, `packages/brewery-contracts/` (brewery contracts may start as re-export of existing `@brewery/*` types during migration) |
| `services/api/src/app.ts` flat `register` calls | `registerModule()` per installed module |
| `@umbraculum/i18n`, `@umbraculum/ui`, … | `@umbraculum/*` horizontal; `@umbraculum/brewery-*` or equivalent for vertical packages (sub-plan #9) |

**Prisma:** new module schema `wms` (example); brewery tables remain `public` until a follow-on migration authorizes `brewery` schema.

**`registerModule()`:** create `packages/module-sdk/` and wire `services/api/src/app.ts` to register `brewery` and `wms` (and any other installed modules).

### 11.3 Per-future-canonical-module shape

Each of `mrp`, `crm`, `crp`, `automation` (RFC-0001 Decision B) lands directly in β paths from its first PR — no flat interim. Surface design for each module remains its own RFC or design artifact; RFC-0002 only supplies the folder convention.

### 11.4 What stays deferred after H1 2027

- Full `brewery` Postgres schema split from `public` (PLATFORM-ARCHITECTURE.md §4.5 option 3).
- Lint import boundaries (RFC-0001 §8.3).
- External-repo packaging format for installable third-party modules.

---

## 12. Resolution

**Status: Accepted 2026-05-19.** Decision D AMENDED 2026-05-21 by RFC-0006.

Decisions A, B, C are committed; Decision D is committed as amended by [RFC-0006](0006-amend-rfc-0002-brewery-file-move-acceleration.md). Implementers MUST treat β as the authoritative layout for new design docs, and MUST follow the two β disciplines added by the Week-1 audit (no `(<code>)/page.tsx`, no `(<code>)/[<dynamic>]/page.tsx` at the route-group root — see §3 as amended). Brewery's file-move is no longer deferred (RFC-0006 acceleration); the Prisma schema split remains deferred (RFC-0006 §4).

The 30-day public-comment period in [`docs/LICENSING.md`](../LICENSING.md) §10 applies post-public-alpha (target: July 2026 per [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1). Until then, solo author drafts → core team reviews → core team approves; this RFC was written as if it WILL be public-readable so the public alpha re-publishes without rewrite.

Post-public-flip, if the core team chooses to run a retroactive 30-day public-comment period for foundational RFCs (RFC-0002 included), the Resolution section may be amended at that time; the original Accepted date (2026-05-19) remains the canonical commitment date.

**Change procedure for this RFC.** Successor RFC at `docs/rfcs/NNNN-<title>.md` with motivation, alternatives, impact, migration plan. Amendments that change Decision A (physical shape) are particularly consequential and expected to be rare.

---

## 13. Touched docs (sweep summary)

Documentation cross-reference sweep for RFC-0002 (applied on acceptance, 2026-05-19):

- **NEW**: `docs/rfcs/0002-canonical-module-physical-layout.md` (this file).
- **Substantive cross-ref**: [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §5.2 — forward pointer to RFC-0002 as the authoritative physical-layout decision.
- **One-line pointer**: [`docs/ROADMAP.md`](../ROADMAP.md) — H1 2027 restructure references RFC-0002.
- **Index**: [`docs/README.md`](../README.md) — Governance (RFCs) section lists RFC-0001 and RFC-0002.
- **Cross-ref amendment**: [`docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md`](0001-modules-tiers-governance-and-automation-placement.md) §9.2 — module folder layout non-goal now points to RFC-0002.
- **Namespace update**: `@umbraculum` npm org claimed 2026-05-19.
- **No-change-with-reason**: [`docs/LICENSING.md`](../LICENSING.md) (no license change); [`MANIFESTO.md`](../../MANIFESTO.md) (values unchanged); [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) (orthogonal); [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) (runtime validation strategy unchanged).

---

*RFC-0002 is part of the Umbraculum platform's governance documentation set. See [`docs/README.md`](../README.md) for the full doc index, [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) for the platform vision, [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) for module governance this layout implements, [`docs/LICENSING.md`](../LICENSING.md) for license posture and the RFC process, and [`MANIFESTO.md`](../../MANIFESTO.md) for project values.*
