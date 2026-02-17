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

