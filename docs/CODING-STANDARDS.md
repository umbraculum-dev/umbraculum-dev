## Coding standards (TypeScript / React)

This repo is **TypeScript-first**. The goal is clarity + safe refactors (including AI-assisted code changes).

### TypeScript: `interface` vs `type`
- **Use `interface` for object contracts**:
  - API DTOs (our API responses and requests)
  - external API response shapes (but see runtime validation below)
  - component props for reusable components
  - service inputs/outputs and other “contracts” shared across modules
- **Use `type` for unions and compositions**:
  - string-literal unions (modes, statuses)
  - discriminated unions
  - intersections, mapped/conditional types, utility-type compositions (`Partial`, `Omit`, etc.)

This matches the guidance in the referenced Medium guide and tends to be the most readable during refactors.

### External API responses (mandatory runtime validation)
TypeScript types do **not** validate network payloads. Treat all network JSON as `unknown`.

Standard:
- Define an `interface` for the expected payload shape.
- Parse/validate `unknown` at runtime before using it.
- Do not do `const x = (await res.json()) as SomeType` for external APIs.

Minimal pattern (no dependencies):

```ts
export interface MaltApiResponse {
  id: string;
  name: string;
  lovibond: number | null;
}

export function parseMaltApiResponse(x: unknown): MaltApiResponse {
  const o = (x ?? {}) as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const name = typeof o.name === "string" ? o.name : "";
  const lovibond =
    o.lovibond === null ? null : typeof o.lovibond === "number" && Number.isFinite(o.lovibond) ? o.lovibond : null;
  if (!id || !name) throw new Error("Invalid MaltApiResponse");
  return { id, name, lovibond };
}
```

If/when we add schema validation (e.g. Zod), keep the same rule: **validate external responses**.

### JSDoc (use where it adds meaning)
We do not blanket-document everything, but we require JSDoc on exported/shared contracts where meaning isn’t obvious:
- **units** (ppm, mg/L, liters, kg, °L, pH 0–14)
- **ranges** and invariants (e.g. `ph` is 0–14, `volumeLiters > 0`)
- **behavioral contracts** (e.g. parsers that clamp/default/drop rows)

Example:

```ts
/** ppm (as HCO3) */
export interface WaterProfile {
  bicarbonate: number;
}
```

### Naming and scope
- Prefer descriptive names (`WaterProfilesResponse`, `GristRow`) over generic globals (`Props`, `Data`, `State`).
- Keep contracts focused (single responsibility).
- Model `null` vs `undefined` explicitly, especially in DTOs.

### Shared logic over copying (MANDATORY for functionalities)
Duplicating code for similar functionalities is generally bad practice. It reduces maintainability: a fix or improvement must be applied in multiple places, increasing the risk of drift and bugs.

- **Avoid copying logic**: When adding a new flow that resembles an existing one, extract common logic into shared services, modules, or components. Multiple callers should import and use the same implementation. One modification then reflects in all consumers.
- **Prefer shared modules**: Whenever possible, extract common logic into shared services, modules, or components. Do not copy-paste and tweak.
- **Naming**: Use descriptive names for modules and classes (e.g. `RecipesImportService`, `BeerJsonExport`). Avoid generic suffixes like "helpers" in actual class/module names; use names that describe the domain or responsibility.

### UI CTAs: Draft vs Snapshot vs Preview (MANDATORY)
This app persists both **inputs** and **computed results**. CTAs must make it obvious which one a button affects.

Definitions:
- **Draft**: saves user inputs only (no computation implied).
- **Snapshot**: saves computed results (the “last calculated” payload/timestamp JSON fields we use for recap + debugging).
- **Preview**: computes and shows results, but does **not** save them.

Button verb rules:
- **Save … draft**: persist inputs only.
- **Calculate & save … snapshot**: compute and persist a computed result.
- **Estimate & save … snapshot**: same as above, but for manual/iterative estimation modes.
- **Preview …**: compute-only (no persistence).

Examples (water pages):
- “Save mash draft” vs “Calculate & save snapshot”
- “Save salts draft” vs “Calculate & save salts snapshot”
- “Preview overall” vs “Calculate & save overall snapshot”

### API centralization guardrails (MANDATORY when moving logic server-side)
When we centralize calculations/formatting in the API (Fastify), we intentionally shift work away from clients (web/native) and into server-side compute. This reduces drift and makes native reuse safer, but it must be done with guardrails so we don’t accidentally overload the API or bloat persistence.

Guardrails:
- **Do not recompute on every keystroke**:
  - Never bind compute endpoints to raw text input changes.
  - Prefer explicit CTAs (Preview / Calculate & save snapshot) as the default UX.
  - If “live preview” is ever added, it must be debounced and must cancel/ignore stale in-flight requests.
- **Keep persistence bounded by default**:
  - “Snapshot” persistence should overwrite the existing “last snapshot” JSON fields (no unbounded history) unless we explicitly design a history feature.
  - Do not persist large debug payloads (e.g. derivation trees) unless required; store only what the UI needs for recap/debug and keep sizes predictable.
- **Clients render; clients do not re-implement canonical formulas**:
  - For server-centralized domains (water, later analysis), the API is the source of truth.
  - Web/native should consume `result` + `derivation` and render it, with runtime parsing of network payloads (`unknown` → `parseXxx()`).

### Shared contracts (`@brewery/contracts`) + versioning (MANDATORY for native-ready endpoints)
We treat `@brewery/contracts` (`/home/rf/dkprojects/rfapps/brewery-app/packages/contracts/`) as the **single source of DTO truth** for endpoints that must stay stable across **web + native**.

Standards:
- **Type-only imports** for TS safety without runtime coupling:
  - API/services and web clients import DTOs as `import type { ... } from "@brewery/contracts"`.
- **Every canonical/native-ready response is versioned**:
  - top-level `ok: true`
  - top-level `version: 1` (or higher later)
  - nested discriminators (`kind`) for unions (example: compute-and-save `acid.kind`).
- **Runtime parsing is mandatory in clients**:
  - treat network JSON as `unknown`
  - parse/validate into contracts types before use.
- **Runtime parsers** for water compute-and-save and gravity analysis live in `@brewery/contracts` (e.g. `parseMashComputeAndSaveResponse`, `parseGravityAnalysisResponseV1`).
- **Water hub and compute-and-save** endpoints return `formatHints` (unit-keyed: L, pH, ppm_as_CaCO3, ppm, g, mL, kg) for consistent web/native number rendering.

Current canonical “native beta” Water endpoints (v1):
- `GET /recipes/:id/water-hub-summary`
- `POST /recipes/:id/water-settings/{mash|sparge|boil}/compute-and-save`

Current Analysis (v1) standard:
- `GET /recipes/:id` returns `recipe.analysis` as a versioned object `{ ok:true, version:1, result, derivations, formatHints }`.

### Math popovers (“Show math”) must explain *how* (DERIVATIONS)
When “Show math” is enabled, popovers must explain **how** a value/table is derived (formula + inputs + key intermediate values).

Non-goal:
- Do not restate the same values already visible in an expanded computed box/table (that becomes duplicative and adds noise).

Standard approach (canonical):
- **The API is canonical for calculations**.
- Water-calc endpoints return both:
  - `result`: numeric outputs (what the UI tables/fields display)
  - `derivation`: a bounded, machine-readable explanation payload for rendering

Derivation contract:
- **Types**: `services/api/src/domain/waterCalc/derivation/types.ts`
- **Shape (high level)**:
  - `kind` + `formulaId` (versioned, stable)
  - `inputs[]`: `{ id, value }`
  - `intermediates[]`: `{ id, value }`
  - `breakdowns[]` (optional): `{ id, rows[] }`
  - `notes[]` (optional): machine-readable note codes
- **No user-facing strings in API derivations**:
  - derivation line IDs are stable
  - the web (and future native app) maps IDs → localized labels via i18n keys

Web rendering rules:
- Use `apps/web/app/recipes/[id]/water/_lib/mathBodies.ts` as the shared renderer.
- Labels/copy live under:
  - `apps/web/messages/en.json` → `math.derivation.*`
  - `apps/web/messages/it.json` → `math.derivation.*`
- Prefer showing:
  - the formula skeleton (from `derivation.formulas.<formulaId>`)
  - the minimal inputs + intermediates needed to follow the computation
  - capped breakdown rows (e.g. per-salt contributions)

Capping (readability-first):
- Cap breakdown rows to keep popovers readable (current standard: 10 rows).
- If data is omitted, include a short “(+N more…)” indicator.

Adding a new “math topic” end-to-end:
- Add/extend the API response to include `derivation` (and keep numeric `result` unchanged).
- Add required i18n keys under `math.derivation.*` (EN + IT).
- Wire the popover to pass the correct `*Derivation` object into `buildWaterMathBody(...)`.

### Number formatting hints (Medium-ROI; general standard)
We do **not** ship localized numeric strings from the API. Values remain numeric. To keep rendering consistent across web/native, the API may include **format hints** (non-localized) alongside results.

Standard:
- Use `@brewery/contracts` `NumberFormatHintV1` (`packages/contracts/src/format/numberFormat.ts`).
- Hints must be **optional** and safe to ignore by older clients.
- Clients apply hints when present; otherwise use existing local formatting defaults.

Example usage:
- `sg` values: 3 decimals
- `percent` values (ABV): 2 decimals
- `L` values: 2 decimals
- `ibu` values: 1 decimal

### Units of measurement (canonical + normalization) (MANDATORY)
This app is designed to support multiple client platforms (web now; native soon). To avoid subtle drift and duplicated formulas:

- The **API + storage** use a single canonical unit system (metric + SG).
- Clients may **display and accept input** in other unit systems, but must convert to canonical for persistence and computation.

#### Canonical unit system (v1)
Canonical means: what is stored in DB BeerJSON / `recipeExtJson`, what calculations use, and what API endpoints expect after normalization.

- **Mass**: `kg` (fermentables, most misc-by-weight) and `g` (hops) are canonical targets.
- **Volume**: `l` is canonical target.
- **Specific gravity**: `sg` is canonical target.
- **Temperature**: (not yet standardized; do not add ad-hoc °F support without a shared conversion + policy).

#### Allowed non-canonical inputs (v1)
We accept a small, explicit set of US customary inputs at the API boundary and normalize them into canonical units:

- **Mass (US)**: `lb`, `oz`
- **Volume (US)**: `gal`, `qt`, `pt`, `fl_oz`

If an input uses a unit outside this list, we either:
- normalize it only if we explicitly add support, or
- reject it with a clear error (do not “guess” units).

#### Where normalization happens (single source of truth)
Normalization must happen in exactly one place:

- **API boundary normalization**: the API converts incoming BeerJSON amounts into canonical units **before** domain validation/persistence.
  - This enables BeerJSON imports and future native clients to send US customary values without changing the stored canonical representation.
- **Shared conversion library**: conversion factors and rounding helpers live in `packages/core/src/units/` and are reused by API + web (and later native).

#### Canonical targets per BeerJSON field (v1)
When normalizing BeerJSON recipes, enforce these canonical targets:

- `beerjson.recipes[0].batch_size`: always `l`
- `beerjson.recipes[0].ingredients.fermentable_additions[*].amount`: always `kg`
- `beerjson.recipes[0].ingredients.hop_additions[*].amount`: always `g`
- `beerjson.recipes[0].ingredients.miscellaneous_additions[*].amount`:
  - if amount is a **mass**: always `kg`
  - if amount is a **volume**: always `l`

#### Precision + rounding policy (prevents “5.0 gal → 4.999 gal”)
We must avoid UX regressions caused by floating point conversions:

- **Never round canonical values** during conversion/normalization.
  - Store canonical numeric values as full JS numbers (IEEE 754 doubles).
- **Round only for display**, using a single shared helper.
  - The UI should apply format hints/decimals consistently; if it converts liters → gallons for display, it must round to the chosen decimals at render time.
- **Never use formatted UI strings as compute inputs**.
  - Always convert the user’s numeric input to canonical, store it, and compute from canonical.

Recommended display decimals (v1 defaults; can be tuned later):
- `gal`, `qt`, `pt`: 2 decimals
- `fl_oz`: 1–2 decimals
- `lb`: 2 decimals
- `oz`: 1 decimal
- `l`: 2 decimals; `ml`: 0 decimals
- `kg`: 3 decimals; `g`: 0 decimals
- `sg`: 3 decimals

#### Don’t duplicate formulas
- If a formula is expressed in imperial units in brewing literature, the **API** may convert canonical metric inputs to imperial **internally** as part of the calculation (example: lb/gal based MCU), but clients must not re-implement the formula.
- Web/native clients should render API outputs; they may only convert for display and for input capture.

### Analysis derivations (Medium-ROI; unified “result + derivation” pattern)
The “result + derivation” pattern is not water-only.

Standards:
- Analysis computations (OG/FG/ABV/IBU/volumes/attenuation/PBG) should expose a **bounded derivation** object per field.
- Analysis warnings are **code-first**:
  - API returns warning `code`s
  - clients localize `code` → user-facing text via i18n.

