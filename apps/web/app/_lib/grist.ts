/**
 * Shared grist contract for `Recipe.gristJson`.
 *
 * - Stored as JSON (unknown at runtime) and parsed defensively.
 * - Keep this as a *contract* used by multiple pages; prefer `interface`.
 */

export type GristPotentialKind = "ppg" | "yieldPercent" | "sg";
export type GristPotential = { kind: GristPotentialKind; value: number } | null;

export type GristMaltClass = "base" | "crystal" | "roast" | "acid";

export interface GristRow {
  id: string;
  name: string;
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
 * Parse `Recipe.gristJson` into a well-typed list.
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
      const name = typeof o.name === "string" ? o.name : "";
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

      return { id, name, amountKg, colorLovibond, potential, maltClass } as GristRow;
    })
    .filter(Boolean);
}

