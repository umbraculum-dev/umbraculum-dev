import { isObject, parseValueWithUnit, safeNum } from "./beerJsonHelpers";
import type { EditorYeastRow } from "./editorTypes";

export function parseYeastRowsFromBeerJsonIngredients(ing: Record<string, unknown>): EditorYeastRow[] {
  const cultures = Array.isArray(ing['culture_additions']) ? ing['culture_additions'] : [];

  return cultures
    .map((cUnknown: unknown): EditorYeastRow | null => {
      if (!isObject(cUnknown)) return null;
      const c = cUnknown;

      const id = typeof c['id'] === "string" ? c['id'] : `${Date.now()}-${Math.random()}`;
      const name = typeof c['name'] === "string" ? c['name'] : "";
      if (!name) return null;

      const attenuation = parseValueWithUnit(c['attenuation']);
      const att = attenuation.unit === "%" ? safeNum(attenuation.value, 0) : null;

      const amt = parseValueWithUnit(c['amount']);
      const amtUnit = amt.unit ?? "";
      const amtVal = amt.value;
      const amountL = amtUnit === "l" && amtVal != null && amtVal >= 0 ? amtVal : null;
      const amountKg =
        amtUnit === "kg" && amtVal != null && amtVal >= 0
          ? amtVal
          : amtUnit === "g" && amtVal != null && amtVal >= 0
            ? amtVal / 1000
            : null;

      return {
        id,
        ingredientId: null,
        name,
        lab: typeof c['producer'] === "string" ? c['producer'] : null,
        productId: typeof c['product_id'] === "string" ? c['product_id'] : null,
        attenuationMin: att,
        attenuationMax: att,
        amountL: amountL != null ? amountL : null,
        amountKg: amountKg != null ? amountKg : null,
      };
    })
    .filter((r): r is EditorYeastRow => r !== null);
}
