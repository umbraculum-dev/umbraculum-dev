/**
 * Shared misc/other-ingredients contract for `Recipe.miscJson`.
 *
 * - Stored as JSON (unknown at runtime) and parsed defensively.
 * - Keep this as a *contract* used by multiple pages; prefer `interface`.
 */

export type MiscType = "spice" | "fining" | "water_agent" | "herb" | "flavor" | "other";
export type MiscUse = "boil" | "mash" | "primary" | "secondary" | "bottling";

export interface MiscRow {
  id: string;
  /** Optional reference to a future canonical misc ingredient record. */
  ingredientId?: string | null;
  name: string;
  type: MiscType;
  use: MiscUse;
  timeMinutes: number | null;
  /** If amountIsWeight=true: kilograms. If false: liters. */
  amount: number;
  amountIsWeight: boolean;
  useFor?: string | null;
  notes?: string | null;
}

function newRowId() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

/**
 * Parse `Recipe.miscJson` into a well-typed list.
 *
 * Behavior (by design, v0):
 * - Missing/invalid `id` gets a generated ID (so the editor can keep the row).
 * - Invalid numbers default to 0 (amount) or null (time).
 * - Unknown `type`/`use` fall back to stable defaults.
 */
export function parseMiscJson(value: unknown): MiscRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const o = (row ?? {}) as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : newRowId();
      const ingredientIdRaw = o.ingredientId;
      const ingredientId =
        ingredientIdRaw === undefined
          ? undefined
          : ingredientIdRaw === null
            ? null
            : typeof ingredientIdRaw === "string"
              ? ingredientIdRaw
              : null;
      const name = typeof o.name === "string" ? o.name : "";
      const typeRaw = o.type;
      const type: MiscRow["type"] =
        typeRaw === "spice" ||
        typeRaw === "fining" ||
        typeRaw === "water_agent" ||
        typeRaw === "herb" ||
        typeRaw === "flavor" ||
        typeRaw === "other"
          ? typeRaw
          : "other";
      const useRaw = o.use;
      const use: MiscRow["use"] =
        useRaw === "boil" || useRaw === "mash" || useRaw === "primary" || useRaw === "secondary" || useRaw === "bottling"
          ? useRaw
          : "boil";
      const timeMinutes =
        typeof o.timeMinutes === "number" && Number.isFinite(o.timeMinutes) ? o.timeMinutes : null;
      const amount = typeof o.amount === "number" && Number.isFinite(o.amount) ? o.amount : 0;
      const amountIsWeight = typeof o.amountIsWeight === "boolean" ? o.amountIsWeight : true;
      const useFor = typeof o.useFor === "string" ? o.useFor : null;
      const notes = typeof o.notes === "string" ? o.notes : null;

      const out: MiscRow = {
        id,
        name,
        type,
        use,
        timeMinutes,
        amount,
        amountIsWeight,
      };
      if (ingredientIdRaw !== undefined) out.ingredientId = ingredientId;
      if (useFor) out.useFor = useFor;
      if (notes) out.notes = notes;
      return out;
    })
    .filter(Boolean);
}

