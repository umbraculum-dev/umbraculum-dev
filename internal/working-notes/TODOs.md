# TODOs (living)

This file tracks near-term implementation tasks and “migration reminders” as we bootstrap the product.


**Proposed next step**: Mash acidification manual entry mode (BrunWater parity) or extend BeerXML style parsing.

## Tamagui migration (in progress)

- **Edit Recipe sections nav**: While migrating to Tamagui, the "active section" highlight in the recipe edit sidebar was intentionally removed and is flagged for permanent removal. It is not needed for the core workflow.

## Native readiness: buildable packages + shared UI (MANDATORY before starting `apps/native`)

- [x] Make native-consumed packages **runtime-safe** (ship `dist/**/*.js` + `dist/**/*.d.ts`) and stop exporting raw TS at the package boundary:
  - `@umbraculum/i18n`
  - `@umbraculum/contracts`
  - `@brewery/api-client`
- [x] Create `@umbraculum/ui` and split Tamagui config into web vs native entrypoints:
  - web uses `@tamagui/animations-css`
  - native must not import web-only animation/CSS drivers
- [ ] Choose and document the native animation driver (Expo-friendly) for Tamagui animations (e.g. reanimated/moti), then wire it into `@umbraculum/ui` native config.
- [ ] Add initial `apps/native` bootstrap (Expo) once the above is stable.

## Native login gate (MANDATORY before React Native auth)

Before implementing native app login, complete these items.

### Must complete first
- [x] **Shared parsers**: Move `parseWaterComputeAndSave` and `parseGravityAnalysis` into `@umbraculum/contracts` so web + native use the same runtime validation.
- [x] **Format hints consistency**: Apply `formatHints` consistently across all native-ready endpoints (water hub, compute-and-save, analysis).
- [x] **Web auth hardening check**: Assess whether current cookie-based auth needs hardening (CSRF, secure flags, session cleanup) before adding token-based native auth. See `docs/AUTH-HARDENING-ASSESSMENT.md`.
- [x] **Native login strategy**: Implemented (opaque session token via `POST /auth/login/native`). See `docs/AUTH-STRATEGY.md`.

### Can defer (but track)
- [ ] Full "result + derivation" unification beyond water.
- [ ] Explicit `version` field on every native-ready payload.
- [ ] Density mode / design tokens (web-only for now).

## Native beta readiness (nice-to-have, not required)

- [ ] Centralize formatting metadata (precision/rounding hints) so web/native render numbers consistently.
- [ ] Version derivations/DTOs more explicitly (endpoint versioning and/or payload `version` field) to reduce upgrade risk for native.
- [ ] Unify the “result + derivation” pattern beyond water (e.g. Analysis: OG/FG/ABV/IBU) so all clients can render explainable math consistently.

## Water calculator (high priority)

- [x] **Units i18n namespace**: Add `units` namespace (L, g, mL, kg, ppm, ppmAsCaCO3, tsp, pH) and replace hardcoded unit strings in water hub, mash, sparge, boil pages.
- [ ] **Units i18n follow-ups** (natural next steps):
  - [x] Localize form labels that embed units (e.g. "Starting alkalinity (ppm as CaCO3)") via i18n keys or `tUnits` where appropriate.
  - [x] Extend `tUnits` to **equipment** and other pages that display unit suffixes.
  - [x] Add locale-specific variants for `tsp` (e.g. Italian "cucch. da tè") if desired.
  - [x] Consider `math.derivation` body strings: introduce placeholders (e.g. `{ppmAsCaCO3}`) in bodyWithValues so derivation prose can use localized units.
- [x] **Sparge salts vs sparge pH**: ensure sparge salt additions influence sparge acidification (Ca/Mg effective-alkalinity heuristic), without requiring a manual “calculate salts” step first.
- [x] **Deprecate mash pH v0**: remove v0 endpoints/logic and UI naming; keep a single canonical mash pH estimator that supports back-compat inputs.
- [x] Implement **late extract additions** (kettle): ensure fermentables added at kettle are excluded from mash grist for water calc. Boil water chemistry is implemented at `/water/boil`.
- [x] Add a bfr-like **final recap**: show **recipe residual alkalinity (RA)** vs **style expected RA** (heuristic), alongside predicted mash pH and a clear “this is a rule-of-thumb” explanation.
- [x] Add a dedicated **“Kettle/Boil add-on water”** page for preparing water additions used at boil/kettle (separate from mash water).

## Recipes / templates

- [x] **Recipe import/export v1** (BeerXML + BeerJSON) implemented as BeerJSON-first canonical storage.
  - Implemented endpoints:
    - Single import: `POST /recipes/import/preview`, `POST /recipes/import`
    - Bulk import: `POST /recipes/import/bulk/preview`, `POST /recipes/import/bulk`
    - Strict export (single): `GET /recipes/:id/export/beerjson`
    - Strict export (bulk): `GET /recipes/export/beerjson`
  - Web UI:
    - `/[locale]/recipes/import` has **Import single recipe** (manual style, default Custom) and **Bulk import** (BJCP 2021 style match name→code, else Custom).
    - `/[locale]/recipes` has pagination (20/page), export selected/all, and delete-with-confirm.
  - See `RECIPES-IMPORT-TODO.md` for remaining improvements and constraints.
- [x] **Platform-admin full Import/Export**: allow platform admins to import/export recipes with **all columns** (including internal/customized fields) in the superadmin backend; assign recipes to any organization on import.
- [x] Add upload/paste size limits (API) and show clear “file too large” errors.
- [ ] Add optional “paste content” import UX (secondary to file upload) if desired.
- [x] Extend BeerXML (bfr-style) handling to preserve more data where possible (primarily **mash steps**); verify what is importable and reflect it in our BeerJSON + `recipeExtJson` model.
- [ ] Extend style parsing for imports (BeerXML and likely BeerJSON): some exporters may split style/classification over multiple fields/lines (e.g. BeerXML `<CATEGORY>English Pale Ale</CATEGORY>` + `<CATEGORY_NUMBER>8</CATEGORY_NUMBER>` + `<STYLE_LETTER>B</STYLE_LETTER>` + `<STYLE_GUIDE>BJCP</STYLE_GUIDE>` + `<TYPE>Ale</TYPE>`). Consider this when extracting style name/code candidates for BJCP matching.
- [x] Add recipe **Other ingredients** editor (BeerJSON-aligned) and persist canonically in `Recipe.beerJsonRecipeJson`.
- [ ] Assess whether the Recipe Edit sidebar “Sections” nav is still useful now that recipe sections default-collapsed (especially on mobile/touch).
- [ ] **Edit recipe page, Brew section**: (a) Disable the "Brew the current recipe" button for 5 seconds after click to avoid session duplication; show "Creating new brewing session...." while disabled. (b) Improve the note above the button to clarify that this action creates a new brewing session (does not start it); the session can be started later from the brew session detail page.

## Raw materials DB + collaboration (high priority)

- [x] Add a single **Contributing** hub page (`/[locale]/contributing`) with two collapsed sections:
  - “Help translate (i18n contributing)”
  - “Help improve raw materials database”
- [x] Add "Found a missing or incorrect raw material?" CTAs in the recipe editor:
  - Fermentables / Hops / Yeast / Other ingredients → link to `contributing?topic=raw-materials`
- [x] Add the same CTA on **Water profiles** page (and later salts/acids pages when they exist).
- [ ] Add **Contributing** to primary nav — only when the target repository (Weblate, raw-materials issue template) is set up and contributions are actually possible. Not urgent but desired.
- [ ] Multi-source ingredients strategy (BeerProto-first, but allow enrichment):
  - keep `ingredient_source_map` + provenance/staging as the backbone
  - support multiple seed sources feeding a single canonical `fermentable/hop/yeast/...` table with confidence + provenance
  - add a “merge/crosswalk” workflow for maintainers to reconcile duplicates across sources
- [ ] Add a collaboration entrypoint for ingredients:
  - initial: GitHub issue template (Raw materials)
  - later: in-app structured suggestion form + moderation/approval workflow

## Gravity / ABV analysis + equipment

- [x] Add account-level **Equipment templates** (admin-managed) and allow recipes to snapshot-select one into `recipeExtJson` (kettle + mash + misc losses).
- [x] Add a product-facing **Analysis** section (OG/FG/ABV/PBG + volumes + attenuation) driven by derived estimates (null when insufficient data).
- [x] Allow per-yeast **custom attenuation % override** (stored by yeast row ID in `recipeExtJson`) and use it for FG/ABV estimate.
- [ ] Clarify semantics and units in docs: which volumes are “hot-side” vs “cold-side” today; add fermenter volume stage later.
- [x] Persist yeast attenuation **min/max range** in `recipeExtJson` (`yeastAttenuationRange` keyed by row ID; BeerJSON stores single value).
- [ ] Add equipment template UX improvements: inline validation, preset suggestions, and import/export.

## Authentication (real, production-ready)

- [x] Email/password **signup** + **login**
- [x] **DB-backed sessions** with `sid` httpOnly cookie
- [x] Add a scheduled cleanup job: `DELETE FROM "Session" WHERE "expiresAt" < now()` to prevent unbounded growth (indexed by `expiresAt`). Job exists (`job:session-cleanup`); scheduling documented in `docs/AUTH-STRATEGY.md`.
- [x] Persist `preferredLocale` from login/signup, and ensure locale-prefixed routes work for auth pages (`/en/...`, `/it/...`)
- [x] “Active workspace” selection after login when user has multiple workspaces
- [ ] Add “i18n contributing” flow/tooling (recommended: Weblate) and keep translation catalogs maintained.

## Authentication (dev shortcuts)

- [x] Remove dev-only header auth (`X-User-Id` / `X-Account-Id`). All environments use cookie-backed sessions.

## Tenancy + ACL (always enforce)

- [ ] All domain tables must include `workspace_id` (or `workspaceId`) and be scoped server-side.
- [ ] Enforce membership/role checks centrally (service layer), not ad-hoc in routes.
- [ ] Keep “active workspace” explicit (`activeWorkspaceId`), never implicit.
- [ ] **Tenancy isolation hardening (prevent cross-workspace leaks)**:
  - Why: a single missed `workspaceId` filter (or missing membership check) can leak another workspace’s inventory/recipes/etc. This is a high-severity privacy + security issue.
  - Review rule of thumb:
    - Every workspace-scoped request must derive scope from session `activeWorkspaceId` (not from user input).
    - Every workspace-scoped service method must enforce access (at least `WorkspacesService.assertMembership`) and ensure every Prisma query includes `where: { workspaceId: activeWorkspaceId, ... }`.
    - For ID-based operations (update/delete/get-by-id), avoid `findUnique({ where: { id } })` unless you additionally constrain by `workspaceId` (e.g. `findFirst({ where: { id, workspaceId } })`).
  - Follow-up: add targeted tests that create data in two workspaces and assert it is never readable/mutable across workspace boundaries.
- [ ] **System-wide ACL gaps (workspace roles)**:
  - Today most endpoints are effectively “member of workspace” gated (or only check active workspace), but **role-based authorization is not consistently enforced**.
  - We should define a clear policy (suggested baseline):
    - **viewer**: read-only
    - **member**: create/update domain data (recipes, brew sessions, inventory, profiles)
    - **brewery_admin**: workspace settings + admin-only operations (e.g. branding)
  - Missing/partial enforcement areas (non-exhaustive):
    - `services/api/src/routes/recipes.ts`: create/update/delete/duplicate should require at least **member**
    - `services/api/src/routes/brewSessions.ts`: create/start/pause/stop + step edits should require at least **member**
    - `services/api/src/routes/inventory.ts`: CRUD should require at least **member**
    - `services/api/src/routes/equipmentProfiles.ts`: create/update/delete should require at least **member**
    - `services/api/src/routes/waterProfiles.ts`: create/update/delete (workspace-scoped) should require at least **member**
    - `services/api/src/routes/brewdaySettings.ts`: update should require at least **brewery_admin** (or a decided policy)
    - Ensure platform-admin routes remain guarded by `user.isPlatformAdmin` and are not workspace-role dependent
  - Follow-up: centralize these checks via `services/api/src/services/acl.ts` and apply consistently in service methods.

## Near-term milestones

- [ ] Core schema: `User`, `Workspace`, `WorkspaceMember` (+ roles)
- [ ] Minimal endpoints: `/me`, `/workspaces` (GET/POST)
- [ ] Web thin shell: workspace list + create workspace (dev only)

## Web SEO / SSR assessment

- [ ] Assess SEO with the current Next.js App Router usage (client components, hydration, view-source). If pages aren’t SEO-friendly, reassess what must become SSR/server components + metadata strategy.
  - Notes / approach: `docs/SEO.md`

## Web UI accessibility settings

- [ ] **Make density mode more effective**: gradually replace hard-coded inline paddings/margins in web UI with shared CSS variables/tokens (so `compact/comfortable` affects more of the app consistently).

## Water calculator UX: Surface math (explainability)

- [ ] **Surface math (v1)** ships “meaning/notes” popovers, not full formulas/derivations. Consider a later enhancement:
  - Add a second mode like **“Show math +”** to reveal *real formulas*, unit conventions, and (optionally) substituted values for debugging.
  - Keep it opt-in to avoid clutter; ensure keyboard + screen reader behavior remains correct.

## Water calculator (BrunWater parity)

- [ ] Mash acidification: add “manual entry” mode (user inputs acid addition amount; app estimates resulting alkalinity/pH and stores both input + calculated snapshot).
- [ ] If/when we add an overall brew-day water summary/profile, it must incorporate **sparge** salts + sparge acid ion contributions (not just mash).

## Documentation gaps

- [ ] **Comprehensive developer-onboarding doc** — walk a new contributor from "Ubuntu laptop, nothing installed" to "first commit landing with the apparatus running". Should cover: Ubuntu prerequisites, Cursor + plugins setup, Docker / Node / pnpm versions, repo bootstrap, where rules / skills / agents live, how to verify the apparatus is engaged, first PR walkthrough. Tracked because [`MANIFESTO.md`](../../MANIFESTO.md) §1.4 explicitly names this as the missing mechanism for its claims. Closest current substitutes: [`DEVELOPMENT.md`](../../DEVELOPMENT.md), [`DEVELOPMENT-LOCAL.md`](../../DEVELOPMENT-LOCAL.md), [`CONTRIBUTING.md`](../../CONTRIBUTING.md), [`docs/modules/contribute/`](../../docs/modules/contribute/) — but none of these is the end-to-end onboarding doc the MANIFESTO claims.

- [ ] **Comprehensive open-source-dependencies page** (working title: `docs/OPEN-SOURCE-STACK.md`) — the exhaustive companion to [`MANIFESTO.md`](../../MANIFESTO.md) §1.4's *representative* dependency list. For each load-bearing dependency: (a) what role it plays in the discipline-apparatus, (b) why it was picked over the proprietary alternative, (c) what reach of the apparatus would shrink if it were swapped for a closed-source equivalent. Minimum coverage list (extend as appropriate):
  - **OS / runtime layer**: Linux (Ubuntu), Docker, Node.js, Python (for sister-repo tooling).
  - **Data layer**: Postgres, pgpool, Redis.
  - **Backend layer**: Fastify, Prisma, Pino, tsx.
  - **Frontend layer (web)**: Next.js, React, Tamagui, Turbopack.
  - **Frontend layer (native)**: React Native, Expo, Tamagui (native config).
  - **Validation + types**: Zod, TypeScript.
  - **Test layer**: Vitest, Playwright.
  - **Lint / format / quality**: ESLint, Prettier-equivalent if any, `eslint-plugin-boundaries`.
  - **Industrial automation**: OpenPLC (Editor + Runtime), the FastAPI sidecar stack.
  - **Build orchestration**: npm workspaces (today; turbo / nx alternatives noted).
  - **Brewery-domain libraries**: BeerJSON.
  - **Docs / observability / CI**: GitHub Actions stack, Markdown, mermaid (if used).
  - Plus anything else in the workspace package.json files at the time of writing.
  Page should be Tier: Public, follow [`docs/DOCS-README-STANDARDS.md`](../../docs/DOCS-README-STANDARDS.md), and be linked from both [`MANIFESTO.md`](../../MANIFESTO.md) §1.4 (replacing the "representative not exhaustive" framing) and [`docs/README.md`](../../docs/README.md) (a new "Stack & dependencies" section, or under the existing "Architecture" group).

