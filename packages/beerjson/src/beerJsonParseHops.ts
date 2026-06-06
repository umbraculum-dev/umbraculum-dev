import { isObject, parseValueWithUnit, safeNum } from "./beerJsonHelpers";
import type { EditorHopRow } from "./editorTypes";

const VALID_HOP_FORMS = ["extract", "leaf", "leaf (wet)", "pellet", "powder", "plug"] as const;

export function parseHopRowsFromBeerJsonIngredients(ing: Record<string, unknown>): EditorHopRow[] {
  const hops = Array.isArray(ing['hop_additions']) ? ing['hop_additions'] : [];

  return hops
    .map((hUnknown: unknown): EditorHopRow | null => {
      if (!isObject(hUnknown)) return null;
      const h = hUnknown;

      const id = typeof h['id'] === "string" ? h['id'] : `${Date.now()}-${Math.random()}`;
      const name = typeof h['name'] === "string" ? h['name'] : "";
      if (!name) return null;

      const formRaw = typeof h['form'] === "string" ? h['form'] : "";
      const form: EditorHopRow["form"] = (VALID_HOP_FORMS as readonly string[]).includes(formRaw)
        ? (formRaw as EditorHopRow["form"])
        : null;

      const amt = parseValueWithUnit(h['amount']);
      const amountGrams =
        amt.unit === "g" ? safeNum(amt.value, 0) : amt.unit === "kg" ? safeNum(amt.value, 0) * 1000 : 0;

      const alpha = parseValueWithUnit(h['alpha_acid']);
      const alphaAcidPercent = alpha.unit === "%" ? safeNum(alpha.value, 0) : null;

      const timing = isObject(h['timing']) ? h['timing'] : null;
      const timingUse = typeof timing?.['use'] === "string" ? timing['use'] : "";
      const savedUseRaw = typeof h['brewery_app_use'] === "string" ? h['brewery_app_use'] : "";
      const savedUse: EditorHopRow["use"] | null =
        savedUseRaw === "boil" || savedUseRaw === "whirlpool" || savedUseRaw === "dryhop" ? savedUseRaw : null;

      const use: EditorHopRow["use"] =
        timingUse === "add_to_fermentation" ? "dryhop" : savedUse != null ? savedUse : "boil";

      const duration = parseValueWithUnit(timing?.['duration']);
      const timeMinutes = duration.unit === "min" ? safeNum(duration.value, 0) : null;

      return {
        id,
        ingredientId: null,
        name,
        country: typeof h['origin'] === "string" ? h['origin'] : null,
        form,
        amountGrams,
        alphaAcidPercent,
        use,
        timeMinutes,
      };
    })
    .filter((r): r is EditorHopRow => r !== null);
}
