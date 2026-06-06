## Coding standards (TypeScript / React)

This repo is **TypeScript-first**. The goal is clarity + safe refactors (including AI-assisted code changes).

**Why these standards exist.** The standards in this document are the code-level expression of the Total Quality lineage stated in [`MANIFESTO.md`](../MANIFESTO.md) §1.1 (Galgano / Deming / Toyota / Kaizen). They are the *poka-yoke* — mistake-proofing applied to TypeScript/React — that the manifesto names as the project's process-level defect-prevention apparatus. Read alongside [`LINTING.md`](LINTING.md), [`TESTING.md`](TESTING.md), [`TYPING.md`](TYPING.md) (the foundation-docs trio) and the umbraculum-toolset plugin guardrails, the apparatus is what makes "we care about quality" land in code.

### Native-ready packages: buildable workspaces (MANDATORY)
We are intentionally building toward **React Native (Expo)**. Metro is much less forgiving than Next.js about consuming raw TypeScript from monorepo workspaces.

Rule:
- Any package that will be imported by a native app MUST be **runtime-safe** at the package boundary:
  - runtime entrypoints must be **plain JS** (`dist/**/*.js`)
  - type entrypoints must be **`.d.ts`** (`dist/**/*.d.ts`)
  - app code must import from the package **exports**, not from `packages/*/src/**`

Current buildable packages (native-consumed):
- `packages/i18n` (`@umbraculum/i18n`)
- `packages/i18n-react` (`@umbraculum/i18n-react`)
- `packages/navigation` (`@umbraculum/navigation`)
- `packages/contracts` (`@umbraculum/contracts`)
- `packages/api-client` (`@umbraculum/api-client`)
- `packages/ui` (`@umbraculum/ui`)
- `packages/recipes-ui` (`@umbraculum/brewery-recipes-ui`)

Build workflow:
- When you change any of the packages above, rebuild `dist/` and commit the updated `dist/` outputs.
  - We intentionally commit `packages/*/dist/**` so:
    - Docker can mount shared packages read-only (`docker-compose.yml` `:ro`) and still run from a fresh checkout.
    - Expo/Metro can consume runtime JS without “transpile external workspace TS” bootstrapping during early native kickoff.

- Do not run `npm` on the host in this repo. Use the container-only scripts (from repo root):
  - Build: `./scripts/build-packages-in-docker.sh`
  - Verify `dist` is up to date: `./scripts/check-packages-dist-up-to-date.sh`

Why we commit `dist/`:
- Our Docker dev stack mounts shared packages read-only (`docker-compose.yml` `:ro`), so containers must be able to consume prebuilt outputs.
- It reduces Metro/Expo kickoff risk by avoiding “transpile external workspace TS” configuration during early native bootstrapping.

#### `@umbraculum/ui` import rules (important for native safety)
- The root entrypoint `@umbraculum/ui` is intentionally **platform-neutral** (may be empty).
- Import Tamagui configs via explicit subpaths:
  - Web: `@umbraculum/ui/tamagui-config-web` (uses `@tamagui/animations-css`)
  - Native: `@umbraculum/ui/tamagui-config-native` (native-safe)

#### UI layering (mandatory for scalability)

- **Generic primitives** (buttons, inputs, selects, cards, collapsibles): `@umbraculum/ui`
- **Domain feature UI** (recipe editors, water/yeast widgets): `@umbraculum/brewery-recipes-ui`
- **Adapters** (Next.js routing, cookie-session fetch, native bearer auth, media rendering): stay in `apps/web/**` and `apps/native/**`

Rule of thumb:
- If a component needs Next.js, `next-intl`, React Navigation, Expo, or app-specific auth, it is **not** shared UI; keep it as an app-level adapter and pass callbacks/props into the shared component instead.

#### `@umbraculum/i18n-react` import rules (web vs native)
- Shared/native: import `useT` from `@umbraculum/i18n-react`.
- Web-only adapter: import `useT` from `@umbraculum/i18n-react/next-intl` (Next.js only).

### Strict code placement rule (MANDATORY): if it might be reused, it must be shared
Decision rule:
- If code has a plausible path to reuse in native (UI components, domain logic, DTOs/parsers, formatting, validation, i18n helpers, API clients), it MUST be implemented under `packages/**` first and then imported by `apps/web/**` (and later `apps/native/**`).

Non-goal:
- Do not implement something in `apps/web/**` and plan to “port it later” by copy/paste. That creates drift and makes native harder.

Allowed in `apps/web/**`:
- Next.js-only wiring (routing/layouts, server components, web-only providers)
- web-only CSS and DOM-specific code
- thin integration wrappers around shared UI (e.g. Tamagui provider wiring)

### Cursor rules/skills upstream backlog (process)
When we discover a reusable Cursor Rule/Skill improvement while evolving this repo (for example, a buildable-packages runbook or a Metro monorepo pitfall), capture it in:

- `internal/working-notes/CURSOR-RULES-SKILLS-TODO.md`

This file is intentionally “upstream-ready” so it can be periodically ported into the canonical rules/skills repo (outside this project) or a Cursor plugin.

### Styling: avoid inline styles
Avoid inline styles where you can. In this codebase **Tamagui props and components are the preferred replacement** for layout, spacing, colors, borders, and typography. Use `className` with CSS classes when Tamagui does not apply (e.g. native `<select>`, `<table>`, `<details>`/`<summary>`).

**Form field rows:** For horizontal rows of label+input fields, use `ai="flex-end"` on the row `XStack` so inputs stay horizontally aligned when labels wrap.

### Native `<details>/<summary>` (required pattern)
When using the native HTML `<details>` element, always ensure the **first child is a real `<summary>` element**.

Why:
- If there is no valid `<summary>`, browsers render a built-in fallback label (often “Details”), which **does not follow our app locale** and cannot be translated via `next-intl`.

Standard in this repo:
- Use `RecipeEditSummary` (`apps/web/app/_components/recipe-edit/RecipeEditSummary.tsx`) as the summary element.
- Do not rely on “fake summary” patterns like a `<div as="summary">…</div>`—verify in DevTools that the DOM contains `<summary>`.

### CSS structure (web app)
The web app uses two CSS sources: `apps/web/app/globals.css` (imports) and `apps/web/public/tamagui.generated.css` (Tamagui). `globals.css` imports three files:

- **variables.css** — `:root` tokens and theme presets (`data-theme`, `data-brand`, `data-density`, `data-font-scale`)
- **layout.css** — Reset, base elements (html/body, a, button/input/select/textarea), `:focus-visible`, reduced-motion, and layout classes (`.brew-app-shell`, `.brew-panel`, `.brew-code-block`)
- **components.css** — App-specific component classes (`.brew-error-box`, `.brew-muted`, `.brew-recipe-edit-select`, `.brew-field-block`, etc.)

**Naming:** All custom classes use the `brew-` prefix (e.g. `brew-panel`, `brew-recipe-edit-select`) to avoid clashes with Tamagui and third-party styles.

**Where to add new styles:** Variables → `variables.css`; layout/shell → `layout.css`; component classes → `components.css`.

### Shared media assets (MANDATORY)
All shared images and media must live in `packages/media` (`@umbraculum/media`). Do not commit duplicates under `apps/web/public/` or app-local folders.

- **Folder conventions**: `packages/media/assets/<domain>/...` (e.g. `assets/yeast/`, `assets/hops/`).
- **Web**: reference assets as `/media/<domain>/<filename>` (e.g. `/media/yeast/dilution-1-100.png`). The sync script (`apps/web/scripts/sync-media.mjs`) copies from `packages/media/assets/**` into `apps/web/public/media/**` before dev/build/start.
- **Native (future)**: when a React Native / Expo app exists, import assets from `@umbraculum/media` (e.g. `require('@umbraculum/media/assets/yeast/dilution-1-100.png')` or equivalent bundler support). Do not duplicate assets in app-local folders.

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

### Shared contracts (`@umbraculum/contracts`) + versioning (MANDATORY for native-ready endpoints)
We treat `@umbraculum/contracts` (`$REPO_ROOT/packages/contracts/`) as the **single source of DTO truth** for endpoints that must stay stable across **web + native**.

Standards:
- **Type-only imports** for TS safety without runtime coupling:
  - API/services and web clients import DTOs as `import type { ... } from "@umbraculum/contracts"`.
- **Every canonical/native-ready response is versioned**:
  - top-level `ok: true`
  - top-level `version: 1` (or higher later)
  - nested discriminators (`kind`) for unions (example: compute-and-save `acid.kind`).
- **Runtime parsing is mandatory in clients**:
  - treat network JSON as `unknown`
  - parse/validate into contracts types before use.
- **Runtime parsers** for water compute-and-save and gravity analysis live in `@umbraculum/contracts` (e.g. `parseMashComputeAndSaveResponse`, `parseGravityAnalysisResponseV1`).
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
- Use `apps/web/app/[locale]/(brewery)/recipes/[id]/water/_lib/mathBodies.ts` as the shared renderer.
- Labels/copy live under:
  - `packages/i18n/src/en.json` → `math.derivation.*`
  - `packages/i18n/src/it.json` → `math.derivation.*`
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
- Use `@umbraculum/contracts` `NumberFormatHintV1` (`packages/contracts/src/format/numberFormat.ts`).
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
- `beerjson.recipes[0].ingredients.culture_additions[*].amount` (dry yeast mass): always `kg`

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

### MessageBox success auto-dismiss (MANDATORY for save feedback)
The shared `MessageBox` component (`apps/web/app/_components/recipe-edit/MessageBox.tsx`) supports optional auto-dismiss for **success** messages only.

**Rule:** Errors and warnings stay visible until the user acts. Only `variant="success"` messages may auto-dismiss.

**Usage:** When showing a save-success message, pass `dismissAfter={5000}` and `onDismiss` so the message disappears after 5 seconds:

```tsx
<MessageBox
  variant="success"
  role="status"
  aria-live="polite"
  dismissAfter={5000}
  onDismiss={() => setSaveStatus(null)}
>
  {saveStatus}
</MessageBox>
```

**Rationale:** Success feedback is transient; the user has already seen the confirmation. Errors and warnings require attention and must remain until dismissed or resolved.

### Analysis derivations (Medium-ROI; unified “result + derivation” pattern)
The “result + derivation” pattern is not water-only.

Standards:
- Analysis computations (OG/FG/ABV/IBU/volumes/attenuation/PBG) should expose a **bounded derivation** object per field.
- Analysis warnings are **code-first**:
  - API returns warning `code`s
  - clients localize `code` → user-facing text via i18n.

---

## Architectural coupling (SOLID — mandatory, repo-native)

**Decision-of-record:** [solid-decoupling-audit.md](design/solid-decoupling-audit.md) (2026-06-04, SOUND). Charter: [solid-audit-charter.md](design/solid-audit-charter.md). Implementation epic **landed 2026-06-04** (Tier A + B).

SOLID is expressed as **concrete boundaries**, not abstract OOP dogma. Treat the rules below as **merge-blocking** for new code in the scoped surfaces — same bar as lint and types.

| Principle | Rule of thumb |
|-----------|---------------|
| **S** — Single responsibility | One reason to change per route/service/package; routes = parse → service → schema |
| **O** — Open/closed | Extend via `registerModule()` / new packages; version DTOs as `*V1` |
| **L** — Liskov | Wire shapes are Zod contracts; substitutes must pass the same parse |
| **I** — Segregation | Import `*-contracts` / narrow hooks — not server services from apps |
| **D** — Inversion | Dependency direction: backbone → module → app (never reverse) |

### Worked example — Single Responsibility in UI (debuggable vertical surface)

Shopify optimises for **store uptime when an extension fails**; Umbraculum optimises for **legible, maintainable code shape** on core and modules — including vertical UI. **S** is the first lever: one file, one concern, one obvious place to debug.

The brewery yeast editor [`apps/web/app/[locale]/(brewery)/recipes/_components/yeastEditor/`](../../apps/web/app/[locale]/(brewery)/recipes/_components/yeastEditor/) demonstrates the pattern:

- **`YeastEditorRow`** — composes one ingredient row from parts; no single mega-render function.
- **`YeastEditorRowIdentity`**, **`YeastEditorRowAttenuation`**, **`YeastEditorRowPitch`**, **`YeastEditorRowManualCount`** — each owns one field group; a newcomer adjusts pitch or attenuation without reading the whole editor.
- **`YeastEditorEditable`** / **`YeastEditorReadOnly`** — mode split at the container boundary.
- **`yeastEditorTypes.ts`** — shared props/context types only.

Canonical modules follow the same **S** at the API layer (routes thin, services own logic, contracts wire-only) — e.g. [`services/api/src/modules/automation/`](../../services/api/src/modules/automation/). Narrative context (Shopify contrast, priesthood failure): [`design/ecosystem-case-study-custom-vertical-code.md`](design/ecosystem-case-study-custom-vertical-code.md) §4.3–§4.4.

**Dependency direction:** [application-surfaces-vs-platform-backbone.md](design/application-surfaces-vs-platform-backbone.md), [DATA-ACCESS-BOUNDARIES.md](DATA-ACCESS-BOUNDARIES.md).

**Must not:** sibling canonical module imports (P0 — enforced by `eslint-plugin-boundaries` at **`error`** on `services/api/src/modules/**`); business logic or raw `app.prisma` in route handlers; `services/api` or `@prisma/*` from apps.

**When coupling is intentional**, use `@arch-boundary` at the site (Reason, Revisit, Owner) and mirror in module README § Known couplings. See charter for the full convention.

**Drift signals:** `npm run audit:solid-inventory` (report-only inventory). **CI enforcement:** `boundaries/element-types` — see [LINTING.md](LINTING.md) § Canonical module boundaries. **Agent rule:** `03-layering-and-coupling-discipline.mdc` (platform plugin).
