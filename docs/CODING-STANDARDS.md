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

