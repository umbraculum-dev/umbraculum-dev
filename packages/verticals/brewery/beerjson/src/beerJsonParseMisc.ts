import { isObject, parseValueWithUnit, safeNum } from "./beerJsonHelpers";
import type { EditorMiscRow } from "./editorTypes";

const VALID_MISC_TYPES = ["spice", "fining", "water_agent", "herb", "flavor", "other"] as const;

export function parseMiscRowsFromBeerJsonIngredients(ing: Record<string, unknown>): EditorMiscRow[] {
  const misc = Array.isArray(ing['miscellaneous_additions']) ? ing['miscellaneous_additions'] : [];

  return misc
    .map((mUnknown: unknown): EditorMiscRow | null => {
      if (!isObject(mUnknown)) return null;
      const m = mUnknown;

      const id = typeof m['id'] === "string" ? m['id'] : `${Date.now()}-${Math.random()}`;
      const name = typeof m['name'] === "string" ? m['name'] : "";
      if (!name) return null;

      const amt = parseValueWithUnit(m['amount']);
      const amountIsWeight = amt.unit === "kg" || amt.unit === "g";
      const amount =
        amt.unit === "kg"
          ? safeNum(amt.value, 0)
          : amt.unit === "g"
            ? safeNum(amt.value, 0) / 1000
            : amt.unit === "l"
              ? safeNum(amt.value, 0)
              : 0;

      const timing = isObject(m['timing']) ? m['timing'] : null;
      const timingUse = typeof timing?.['use'] === "string" ? timing['use'] : "";
      const use: EditorMiscRow["use"] =
        timingUse === "add_to_mash"
          ? "mash"
          : timingUse === "add_to_fermentation"
            ? "secondary"
            : timingUse === "add_to_package"
              ? "bottling"
              : "boil";

      const duration = parseValueWithUnit(timing?.['duration']);
      const timeMinutes = duration.unit === "min" ? safeNum(duration.value, 0) : null;

      const typeRaw = typeof m['type'] === "string" ? m['type'] : "other";
      const type: EditorMiscRow["type"] =
        typeRaw === "water agent"
          ? "water_agent"
          : (VALID_MISC_TYPES as readonly string[]).includes(typeRaw)
            ? (typeRaw as EditorMiscRow["type"])
            : "other";
      return {
        id,
        ingredientId: null,
        name,
        type,
        use,
        timeMinutes,
        amount,
        amountIsWeight,
        useFor: typeof m['use_for'] === "string" ? m['use_for'] : null,
        notes: typeof m['notes'] === "string" ? m['notes'] : null,
      };
    })
    .filter((r): r is EditorMiscRow => r !== null);
}
