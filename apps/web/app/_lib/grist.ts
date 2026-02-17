/**
 * Shared grist-row contract for internal grist snapshots (water calculator + editor utilities).
 *
 * - Stored as JSON (unknown at runtime) and parsed defensively.
 * - Keep this as a *contract* used by multiple pages; prefer `interface`.
 */

export type GristPotentialKind = "ppg" | "yieldPercent" | "sg";
export type GristPotential = { kind: GristPotentialKind; value: number } | null;

export type GristMaltClass = "base" | "crystal" | "roast" | "acid";

export interface GristRow {
  id: string;
  /** Optional reference to a canonical fermentable ingredient record. */
  ingredientId?: string | null;
  name: string;
  /** Optional source metadata for display (does not affect calculations). */
  producer?: string | null;
  /** Optional BeerProto group (display/debug). */
  group?: string | null;
  /**
   * Distilled-water mash pH (room temp, ~20–25°C).
   * v1 mash pH model parameter; may be estimated or user-overridden.
   */
  mashDiPh?: number | null;
  /**
   * Titratable acidity to pH 5.7 (Troester-style), in mEq/kg.
   * v1 mash pH model parameter; may be estimated or user-overridden.
   */
  mashTaToPh57_mEqPerKg?: number | null;
  /**
   * For roasted malts: user override for whether the malt is dehusked/de-bittered.
   * - null/undefined: use inferred detection from canonical ingredient name/notes (if available).
   */
  mashRoastDehuskedOverride?: boolean | null;
  /**
   * Provenance for dehusked/de-bittered selection.
   * This is set by the API snapshot; UI may display it as read-only.
   */
  mashRoastDehuskedSource?: "inferred" | "override" | "unknown";
  /** How mash pH params were selected (v1). */
  mashPhModelSource?: "default" | "override" | "unknown";
  /** kilograms */
  amountKg: number;
  /** Lovibond, may be unknown */
  colorLovibond: number | null;
  potential: GristPotential;
  maltClass: GristMaltClass;
}

function newRowId() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

/**
 * Parse a persisted grist snapshot JSON into a well-typed list.
 *
 * Behavior (by design, v0):
 * - Missing/invalid `id` gets a generated ID (so the editor can keep the row).
 * - Invalid numbers default to 0 (amount) or null (color).
 * - Unknown `maltClass` defaults to `"base"`.
 */
export function parseGristJson(value: unknown): GristRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const o = (row ?? {}) as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : newRowId();
      const ingredientIdRaw = o.ingredientId;
      const ingredientId =
        ingredientIdRaw === null || ingredientIdRaw === undefined
          ? null
          : typeof ingredientIdRaw === "string"
            ? ingredientIdRaw
            : null;
      const name = typeof o.name === "string" ? o.name : "";
      const producer = typeof o.producer === "string" ? o.producer : null;
      const group = typeof o.group === "string" ? o.group : null;
      const mashDiPh = typeof o.mashDiPh === "number" && Number.isFinite(o.mashDiPh) ? o.mashDiPh : null;
      const mashTaToPh57_mEqPerKg =
        typeof o.mashTaToPh57_mEqPerKg === "number" && Number.isFinite(o.mashTaToPh57_mEqPerKg)
          ? o.mashTaToPh57_mEqPerKg
          : null;
      const mashRoastDehuskedOverride =
        typeof o.mashRoastDehuskedOverride === "boolean" ? o.mashRoastDehuskedOverride : null;
      const mashRoastDehuskedSourceRaw = o.mashRoastDehuskedSource;
      const mashRoastDehuskedSource: GristRow["mashRoastDehuskedSource"] =
        mashRoastDehuskedSourceRaw === "inferred" ||
        mashRoastDehuskedSourceRaw === "override" ||
        mashRoastDehuskedSourceRaw === "unknown"
          ? mashRoastDehuskedSourceRaw
          : "unknown";
      const mashPhModelSourceRaw = o.mashPhModelSource;
      const mashPhModelSource: GristRow["mashPhModelSource"] =
        mashPhModelSourceRaw === "default" || mashPhModelSourceRaw === "override" || mashPhModelSourceRaw === "unknown"
          ? mashPhModelSourceRaw
          : "unknown";
      const amountKg = typeof o.amountKg === "number" && Number.isFinite(o.amountKg) ? o.amountKg : 0;
      const colorLovibond =
        o.colorLovibond === null
          ? null
          : typeof o.colorLovibond === "number" && Number.isFinite(o.colorLovibond)
            ? o.colorLovibond
            : null;

      const potentialRaw = o.potential;
      let potential: GristPotential = null;
      if (potentialRaw && typeof potentialRaw === "object") {
        const p = potentialRaw as Record<string, unknown>;
        const kind = p.kind;
        const v = p.value;
        if (
          (kind === "ppg" || kind === "yieldPercent" || kind === "sg") &&
          typeof v === "number" &&
          Number.isFinite(v)
        ) {
          potential = { kind, value: v };
        }
      }

      const maltClassRaw = o.maltClass;
      const maltClass: GristMaltClass =
        maltClassRaw === "base" ||
        maltClassRaw === "crystal" ||
        maltClassRaw === "roast" ||
        maltClassRaw === "acid"
          ? maltClassRaw
          : "base";

      return {
        id,
        ingredientId,
        name,
        producer,
        group,
        mashDiPh,
        mashTaToPh57_mEqPerKg,
        mashRoastDehuskedOverride,
        mashRoastDehuskedSource,
        mashPhModelSource,
        amountKg,
        colorLovibond,
        potential,
        maltClass,
      } as GristRow;
    })
    .filter(Boolean);
}

