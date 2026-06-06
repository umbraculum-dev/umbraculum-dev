import { isObject, parseValueWithUnit, safeNum } from "./beerJsonHelpers";
import type { EditorGristRow } from "./editorTypes";

export function parseGristRowsFromBeerJsonIngredients(ing: Record<string, unknown>): EditorGristRow[] {
  const fermentables = Array.isArray(ing['fermentable_additions']) ? ing['fermentable_additions'] : [];

  return fermentables
    .map((fUnknown: unknown): EditorGristRow | null => {
      if (!isObject(fUnknown)) return null;
      const f = fUnknown;

      const id = typeof f['id'] === "string" ? f['id'] : `${Date.now()}-${Math.random()}`;
      const name = typeof f['name'] === "string" ? f['name'] : "";
      if (!name) return null;

      const amt = parseValueWithUnit(f['amount']);
      const amountKg =
        amt.unit === "kg" ? safeNum(amt.value, 0) : amt.unit === "g" ? safeNum(amt.value, 0) / 1000 : 0;

      const color = parseValueWithUnit(f['color']);
      const colorLovibond =
        color.unit === "Lovi" && color.value != null && color.value >= 0 ? color.value : null;

      const yieldObj = isObject(f['yield']) ? f['yield'] : null;
      const yieldPotential = parseValueWithUnit(yieldObj?.['potential']);
      const yieldFineGrind = parseValueWithUnit(yieldObj?.['fine_grind']);
      const potential: EditorGristRow["potential"] =
        yieldPotential.unit === "sg" && yieldPotential.value != null
          ? { kind: "sg", value: yieldPotential.value }
          : yieldFineGrind.unit === "%" && yieldFineGrind.value != null
            ? { kind: "yieldPercent", value: yieldFineGrind.value }
            : null;

      const grainGroup = typeof f['grain_group'] === "string" ? f['grain_group'] : "";
      const maltClass: EditorGristRow["maltClass"] =
        grainGroup === "roasted" ? "roast" : grainGroup === "caramel" ? "crystal" : "base";

      const timing = isObject(f['timing']) ? f['timing'] : null;
      const timingUseRaw = typeof timing?.['use'] === "string" ? timing['use'] : "";
      const timingUse: EditorGristRow["timingUse"] =
        timingUseRaw === "add_to_boil" || timingUseRaw === "add_to_fermentation" || timingUseRaw === "add_to_package"
          ? "add_to_boil"
          : "add_to_mash";

      const lateAddition = f['brewery_app_late_addition'] === true;

      return {
        id,
        ingredientId: null,
        name,
        producer: typeof f['producer'] === "string" ? f['producer'] : null,
        group: grainGroup || null,
        mashDiPh: null,
        mashTaToPh57_mEqPerKg: null,
        mashRoastDehuskedOverride: null,
        amountKg,
        colorLovibond,
        potential,
        maltClass,
        timingUse,
        lateAddition,
      };
    })
    .filter((r): r is EditorGristRow => r !== null);
}
