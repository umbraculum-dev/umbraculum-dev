# Roadmap (living)

**Tier:** Public

This roadmap captures the agreed “direction of travel” for the product so implementation stays coherent and we avoid rework.

## Big picture

- Platform vision (horizontal-platform-with-vertical-modules + AI consultant + add-on pricing): `docs/PLATFORM-ARCHITECTURE.md`
- Licensing posture and rationale (AGPLv3 core + MIT SDK + commercial dual license): `docs/LICENSING.md`
- Source of truth (brewery-vertical implementation log): `docs/architechture-Rev02.md`
- Accessibility hard constraint: `docs/DEVELOPMENT-ACCESSIBILITY.md`
- Seed data sources + licensing notes: `docs/RAW-MATERIALS-SEEDABLE-SOURCES.md`
- Full doc index: `docs/README.md`

## Trajectory (12–30 months)

This is the agreed direction of travel at the platform level. It is intentionally short on implementation detail and long on sequencing — implementation specifics land in domain docs and per-quarter planning. The trajectory exists to keep parallel work coherent and to make explicit which decisions need to happen *before* the second vertical lands.

### H2 2026 — AI consultant as cross-module connective tissue

Goal: ship the smallest AI consultant that demonstrably provides value across the brewery vertical, with the architecture intentionally platform-shaped from day one (not brewery-shaped with platform aspirations).

- **Architecture**: AI platform backbone per `docs/PLATFORM-ARCHITECTURE.md` §4.3 and §5.3 — orchestrator, brewery tool registry, usage ledger, encrypted BYOK settings, workspace memory, Anthropic-only v0 provider path, and future-ready seams for managed AI.
- **Tools layer first** (`Layer A`): roughly 80% of value, lowest risk. Read-only, ACL-aware, deterministic. Brewery tools are the v0 surface.
- **Per-workspace operational memory store** stood up alongside the tool layer. This is the moat investment (`docs/PLATFORM-ARCHITECTURE.md` §4.3, §6.5) — the AI's recall of seasonal patterns, supplier quirks, and recurring failure modes compounds over time and is not transferable to a competitor.
- **Write-action drafts with human-in-the-loop confirmation** from the first AI feature that touches mutable state. No autonomous writes in v0 or v1.
- **License + governance** as a parallel track: publish `docs/LICENSING.md` publicly, adopt DCO sign-off on contributions, write the contributor README, and pick the AGPLv3 + MIT SDK split intentionally before the first community contribution arrives (much harder to retrofit after).

Resolved in this phase (recorded in `docs/PLATFORM-ARCHITECTURE.md` §8): BYOK + paid tier unlock, Anthropic-only v0, opt-in workspace enablement, no per-user role gate, water + recipe coach scope, per-workspace memory, and no net-new Stripe surface for v0 AI.

### H1 2027 — Brewery production planning is promoted to first-class MRP/CRP, and the platform is repositioned

Goal: realize the §1.1 reframe in code and in market positioning. Same product, much larger addressable market.

- Generalize the brewery production-planning subsystem (recipes-as-BOMs, equipment profiles as constrained resources, brew sessions as scheduled production orders) into platform-level MRP and CRP capabilities. The brewery vertical becomes a configuration of these capabilities rather than a private implementation.
- AI consultant demonstrably reasons across recipe planning + production scheduling + capacity load.
- Platform repositioned externally: "process-manufacturing platform, brewery-configured by default". Brand and copy reflect this on public surfaces (marketing site, documentation, App Store listings).
- `@brewery/*` horizontal packages renamed to a neutral platform scope (`docs/PLATFORM-ARCHITECTURE.md` §3.3, §5.2). This is the one-way structural move that should not be deferred past this phase.
- Module SDK published as a public artifact (`docs/PLATFORM-ARCHITECTURE.md` §4.4). Third-party module developers can build modules in their own repositories.
- `WorkspaceBillingAddon` model + Stripe subscription-item flow + RevenueCat consumables shipped — the prerequisite for selling per-module entitlements and optional managed-AI credits cleanly.
- **Foundation hardening pass (lint, types, tests) — ESLint slice landed in May 2026, ~12 months ahead of the H1 2027 milestone.** Both **HIGH-staged ESLint** (`no-explicit-any` + `no-unused-vars` to `error` repo-wide; warning-free monorepo under the current rule set) and **HIGH-full** (12 type-aware rules at `error` — 7 promise-correctness rules `**/*.{ts,tsx}` + 5 `no-unsafe-*` rules across `services/api/**`, `apps/web/**`, and `apps/native/**`; `no-empty-object-type: error`; `--max-warnings 0` is the single CI gate) completed on 2026-05-16 in a single intensive day across 25 commits. The originally-feared "1,671 type-aware warnings, Tamagui wall, 44s lint cost" measurement decomposed into much smaller real fixes once it was investigated: the apps/web "Tamagui wall" was a phantom (95% of the 290+ apps/web `no-unsafe-*` warnings traced to a single stale `account → workspace` field rename in commit `87876d0` that missed four UI consumers — fixing the lint also restored a long-broken UI feature where workspace water profiles silently never appeared in dropdowns); the apps/native surface was 3 warnings in 1 file; the services/api surface was real but tractable Prisma + Fastify + AI-tool boundary tightening. The IDE-cost objection was avoided by structural design — the editor-config split (`eslint.config.editor.mjs` + `.vscode/settings.json.example` + the upstream `23a-eslint-fixall-discipline.mdc` cursor rule) keeps editor inline lint at ~7s wall (essentially unchanged) while CI gets the full ~42s type-aware pass. Phase 7 (the runtime-validation library question — Zod / Valibot / TypeBox) was tracked separately in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) with explicit per-criterion trigger conditions; first scheduled audit on 2026-05-16 confirmed 0/6 criteria met → "stay on hand-rolled" re-confirmed. **Tests slice (cheapest-test-layer coverage gaps) kicked off 2026-05-17** — Phase 1 (L1 contract parser coverage) landed the same day, bringing the contract-parser test count from 5/8 to 8/8 (70 unit tests across 5 suites). Phase 2 (L4 BeerJSON contract snapshots) **complete 2026-05-18, all three sub-phases landed in one day** — `/water-profiles` keystone Phase 4b regression-pin, the full water-calc surface (`/water-settings`, `/water-hub-summary`, mash/sparge/boil `compute-and-save`), brew-sessions (POST create, GET list, GET detail), equipment-profiles, and ingredients (fermentables/hops/yeasts). L4 coverage 2/15 → 15/15 native-consumed endpoints; 7 contract suites with 16 tests total. **Phase 3 (L5 Playwright regression pins for Phase 4b + Phase 5g) landed 2026-05-18.** Phase 3a: `apps/web/e2e/smoke/water-profiles.spec.ts` asserts the seeded "E2E Tap Water" workspace profile appears in the `/en/water-profiles` table + asserts `/api/water-profiles` carries `body.workspace` (not `.account`); 2 tests. Phase 3b: `apps/web/e2e/smoke/select-workspace.spec.ts` asserts the multi-workspace login redirect, the picker UI shows both seeded workspaces, and `POST /api/auth/active-workspace` mutates the session correctly; 3 tests; required adding the `e2e-multi-admin` persona + secondary workspace `E2E Side Brewery` (without which the SelectWorkspace route was a dead E2E branch). Smoke suite: 13 → 18 specs, all green. **The Phase 4b regression-pin trio is now complete across L1 + L4 + L5; the Phase 5g L5 web pin is complete (apps/native side deferred until apps/native gets a test runner — tracked in TESTING.md non-goals).** Remaining: Phase 4 (L2 integration coverage audit), Phase 5 (optional `packages/core` L1 audit). The audit explicitly traces the two latent UI bugs the lint slice surfaced (Phase 4b `account → workspace` stale-consumer drift; Phase 5g untyped render-prop) to the test layers that should have caught them (L4 BeerJSON contract snapshots for Phase 4b; L5 Playwright spec for Phase 5g). See [`docs/TESTING.md`](TESTING.md) → "Coverage audit + hardening pass" for the full phase log. **Remaining slices — types (per-workspace `tsc --noEmit` baselines) and docs (public-flip-quality module READMEs) — remain on the H1 2027 timeline.** See [`docs/LINTING.md`](LINTING.md) for the full ESLint phase log and [`docs/TAMAGUI.md`](TAMAGUI.md) for the Tamagui-specific adaptation strategy. The intent stands: a contributor reading the codebase for the first time sees a clean lint surface, descriptive docs about known type-system caveats, and CI gates that prevent regression.

### H2 2027 — WMS as second native-mandatory vertical; federation decision

Goal: validate the "modules expand by config and SDK, not by core rewrite" promise, and decide native packaging strategy with evidence.

- Spike Re.Pack module federation against the platform shell (expecting roughly 30 months of post-MF-release tooling hardening by this point). Decision gate: if the Expo + Re.Pack story is genuinely smooth, federate WMS as the second native module in the same shell; if not, ship WMS as web + PWA + a thin native scanner companion. Either way, the AI consultant sees both modules.
- Brewery + WMS overlap on tooling, packaging, and AI tool registry — the strongest test of whether the platform shape genuinely supports multi-module operation or whether brewery still leaks across boundaries.
- First third-party-built vertical configuration accepted (likely distillery or kombucha) — the proof that the SDK is a public contract, not a private convention.

### 2028 and beyond — CRM, additional vertical configurations, foundation question

- CRM module: native-shipped only if customer ICP demand justifies it; otherwise web-only with PWA on mobile. The decision depends on the segment we actually win, not on hopes.
- Additional process-manufacturing vertical configurations onboarded primarily through **configuration and seed data**, not code (food, cosmetics, supplements, fragrance, fine chemical batch).
- Ecommerce surfaces (if pursued) are explicitly **separate apps** — different audience (shopper vs operator), different ASO, different auth model. Not added to the workspace-member app shell. Out of scope for this roadmap.
- Foundation transfer question (`docs/PLATFORM-ARCHITECTURE.md` §10.1) reopened with evidence: by this point the project either has a community large enough that foundation governance is a meaningful upgrade, or it does not, and the decision becomes much easier than speculating about it now.

### Standing principles across the whole trajectory

- **Web-first for the heavy desktop workflows.** Native apps exist only where workflows are intrinsically mobile (offline operation, BLE, scanning, push notifications, on-the-floor input).
- **One audience per app.** Workspace-member modules share one shell. Shopper-facing surfaces (if any) are separate apps.
- **AI consultant is the cross-module connective tissue.** The architectural and economic case for one shell over a "myriad of apps" rests on the AI seeing all modules in one workspace context.
- **No retroactive license changes.** Anything committed under AGPLv3 stays AGPLv3 (`docs/LICENSING.md` §9–10).
- **Invest in foundations alongside features, not at the end.** Lint, type safety, test coverage, and developer-facing documentation compound — every bit of foundation paid down now makes every future feature cheaper and safer. The opposite — accumulating debt until "later" — never goes well. Living foundation docs: `docs/LINTING.md`, `docs/TAMAGUI.md`, `docs/TESTING.md`, `docs/DEVELOPMENT-ACCESSIBILITY.md`.
- **The tone of this roadmap is honest commitment, not aspiration.** If a phase moves, the doc moves. If the underlying assumptions change, the trajectory changes openly via the same RFC process used for governance changes (`docs/LICENSING.md` §10).

## UI pillars (from Figma)

Figma exports live under `docs/figma/`:
- `dashboard.png`
- `edit-recipe.png`
- `water-calculator-and-mash-chemistry.png`

These map to three “pillars”:
1) Dashboard with simple navigation
2) Recipe editor (complex)
3) Water calculator / mash chemistry (complex)

## Agreed UI/UX decisions (important)

### Navigation (web)
- **Primary nav only** (no extra row of big buttons).
- **Dashboard** is the first/left-most nav item.
- Mobile-friendly by default (nav collapses later, but IA should not change).

### Recipe editing (v0)
- Single edit route with a left-side section list (in-page nav).
- Sections (initial):
  - Basics
  - Fermentables
  - Hops
  - Yeast (may start stubbed)
  - Other ingredients
  - Notes
  - Water chemistry (link-out)

### Water calculator
- Water calculator has its **own page** and is considered part of the recipe.
- The recipe editor should **not** embed the full water calculator; water chemistry in recipe edit is a link to the full calculator.
- UI preference: **dark grey background** (Cursor-like) is desired for recipe + water calculator UIs, **as long as** accessibility constraints are met.

### Recipe import/export (v1)
- Import/export actions live under **Recipes** (not the Dashboard).
- Import UX is split into:
  - **Import single recipe**: user selects a style (default Custom).
  - **Bulk import**: multi-recipe files; style is auto-matched to **BJCP 2021** (name-first, then code), else Custom.
- Export uses **strict BeerJSON** for interoperability (internal addition row `id` fields are stripped).

### Offline-forward constraint (future)
Even though v0 is server-backed, we want to design pages so we can later support offline drafts:
- Each page can maintain a clear “draft saved” model (local-first draft state, explicit save events).
- Avoid duplicated editable sources of truth (aligns with the architecture doc).

## Data prerequisites: seedable raw materials DB

To make recipes and water chemistry usable, we need canonical datasets for:
- Fermentables (malts, sugars, extracts, adjuncts)
- Hops
- Yeast (soon)
- Salts + acids for water correction (curated, small set)
- Water profiles (optional seed)

Approach (agreed direction):
- Start with **BeerProto dataset (MIT)** as the base seed where applicable.
- Preserve provenance for all imported records (source name/url/license/retrieved_at/source_key/raw payload).
- Use a crosswalk table (`ingredient_source_map`) so we can enrich from other sources later without losing traceability.
- Treat non-clear licensing sources as reference-only until confirmed.

