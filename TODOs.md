# TODOs (living)

This file tracks near-term implementation tasks and “migration reminders” as we bootstrap the product.

## Native login gate (MANDATORY before React Native auth)

Before implementing native app login, complete these items.

### Must complete first
- [x] **Shared parsers**: Move `parseWaterComputeAndSave` and `parseGravityAnalysis` into `@brewery/contracts` so web + native use the same runtime validation.
- [x] **Format hints consistency**: Apply `formatHints` consistently across all native-ready endpoints (water hub, compute-and-save, analysis).
- [ ] **Web auth hardening check**: Assess whether current cookie-based auth needs hardening (CSRF, secure flags, session cleanup) before adding token-based native auth.
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
  - [ ] Localize form labels that embed units (e.g. "Starting alkalinity (ppm as CaCO3)") via i18n keys or `tUnits` where appropriate.
  - [ ] Extend `tUnits` to **equipment** and other pages that display unit suffixes.
  - [ ] Add locale-specific variants for `tsp` (e.g. Italian "cucch. da tè") if desired.
  - [ ] Consider `math.derivation` body strings: introduce placeholders (e.g. `{ppmAsCaCO3}`) in bodyWithValues so derivation prose can use localized units.
- [x] **Sparge salts vs sparge pH**: ensure sparge salt additions influence sparge acidification (Ca/Mg effective-alkalinity heuristic), without requiring a manual “calculate salts” step first.
- [x] **Deprecate mash pH v0**: remove v0 endpoints/logic and UI naming; keep a single canonical mash pH estimator that supports back-compat inputs.
- [ ] Implement how recipes manage **late additions** and **boil additions** (separate from mash), since they do not contribute to mash calculations.
- [x] Add a BrewersFriend-like **final recap**: show **recipe residual alkalinity (RA)** vs **style expected RA** (heuristic), alongside predicted mash pH and a clear “this is a rule-of-thumb” explanation.
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
- [ ] **Owner-only full Import/Export**: allow the app owner to import/export recipes with **all columns**, including internal/customized fields (not strict/interoperability mode).
- [ ] Add upload/paste size limits (API) and show clear “file too large” errors.
- [ ] Add optional “paste content” import UX (secondary to file upload) if desired.
- [ ] Extend BeerXML (BrewersFriend-style) handling to preserve more data where possible (primarily **mash steps**); verify what is importable and reflect it in our BeerJSON + `recipeExtJson` model.
- [ ] Extend style parsing for imports (BeerXML and likely BeerJSON): some exporters may split style/classification over multiple fields/lines (e.g. BeerXML `<CATEGORY>English Pale Ale</CATEGORY>` + `<CATEGORY_NUMBER>8</CATEGORY_NUMBER>` + `<STYLE_LETTER>B</STYLE_LETTER>` + `<STYLE_GUIDE>BJCP</STYLE_GUIDE>` + `<TYPE>Ale</TYPE>`). Consider this when extracting style name/code candidates for BJCP matching.
- [x] Add recipe **Other ingredients** editor (BeerJSON-aligned) and persist canonically in `Recipe.beerJsonRecipeJson`.
- [ ] Assess whether the Recipe Edit sidebar “Sections” nav is still useful now that recipe sections default-collapsed (especially on mobile/touch).

## Raw materials DB + collaboration (high priority)

- [ ] Add a single **Contributing** hub page (`/[locale]/contributing`) with two collapsed sections:
  - “Help translate (i18n contributing)”
  - “Help improve raw materials database”
- [ ] Add “Found a missing or incorrect raw material?” CTAs in the recipe editor:
  - Fermentables / Hops / Yeast / Other ingredients → link to `contributing?topic=raw-materials`
- [ ] Add the same CTA on **Water profiles** page (and later salts/acids pages when they exist).
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
- [ ] Consider persisting yeast attenuation **min/max range** in `recipeExtJson` (BeerJSON currently stores a single attenuation value).
- [ ] Add equipment template UX improvements: inline validation, preset suggestions, and import/export.

## Authentication (real, production-ready)

- [x] Email/password **signup** + **login**
- [x] **DB-backed sessions** with `sid` httpOnly cookie
- [ ] Add a scheduled cleanup job: `DELETE FROM "Session" WHERE "expiresAt" < now()` to prevent unbounded growth (indexed by `expiresAt`).
- [x] Persist `preferredLocale` from login/signup, and ensure locale-prefixed routes work for auth pages (`/en/...`, `/it/...`)
- [x] “Active account” selection after login when user has multiple accounts
- [ ] Add “i18n contributing” flow/tooling (recommended: Weblate) and keep translation catalogs maintained.

## Authentication (dev shortcuts)

- [x] Remove dev-only header auth (`X-User-Id` / `X-Account-Id`). All environments use cookie-backed sessions.

## Tenancy + ACL (always enforce)

- [ ] All domain tables must include `account_id` (or `accountId`) and be scoped server-side.
- [ ] Enforce membership/role checks centrally (service layer), not ad-hoc in routes.
- [ ] Keep “active account” explicit (`activeAccountId`), never implicit.

## Near-term milestones

- [ ] Core schema: `User`, `Account`, `AccountMember` (+ roles)
- [ ] Minimal endpoints: `/me`, `/accounts` (GET/POST)
- [ ] Web thin shell: account list + create account (dev only)

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

