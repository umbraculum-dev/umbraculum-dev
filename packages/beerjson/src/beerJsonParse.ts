import { isObject, parseMashFromBeerJson, parseValueWithUnit, safeNum } from "./beerJsonHelpers";
import type {
  EditorGristRow,
  EditorHopRow,
  EditorMash,
  EditorMiscRow,
  EditorYeastRow,
} from "./editorTypes";

export function editorStateFromBeerJson(doc: unknown): {
  gristRows: EditorGristRow[];
  hopsRows: EditorHopRow[];
  yeastRows: EditorYeastRow[];
  miscRows: EditorMiscRow[];
  mash: EditorMash;
} {
  const d = isObject(doc) ? doc : {};
  const beerjson = isObject(d['beerjson']) ? d['beerjson'] : {};
  const recipesArr = Array.isArray(beerjson['recipes']) ? beerjson['recipes'] : [];
  const r0 = isObject(recipesArr[0]) ? recipesArr[0] : {};
  const ing = isObject(r0['ingredients']) ? r0['ingredients'] : {};

  const fermentables = Array.isArray(ing['fermentable_additions']) ? ing['fermentable_additions'] : [];
  const hops = Array.isArray(ing['hop_additions']) ? ing['hop_additions'] : [];
  const cultures = Array.isArray(ing['culture_additions']) ? ing['culture_additions'] : [];
  const misc = Array.isArray(ing['miscellaneous_additions']) ? ing['miscellaneous_additions'] : [];

  const gristRows: EditorGristRow[] = fermentables
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

  const VALID_HOP_FORMS = ["extract", "leaf", "leaf (wet)", "pellet", "powder", "plug"] as const;
  const hopsRows: EditorHopRow[] = hops
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

  const yeastRows: EditorYeastRow[] = cultures
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

  const VALID_MISC_TYPES = ["spice", "fining", "water_agent", "herb", "flavor", "other"] as const;
  const miscRows: EditorMiscRow[] = misc
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

  const mash = parseMashFromBeerJson(r0);

  return { gristRows, hopsRows, yeastRows, miscRows, mash };
}

/**
 * Merges yeastAttenuationRange from recipeExtJson into yeast rows.
 * When the lab provides min/max, we persist them in recipeExtJson; this restores them on load.
 */
export function mergeYeastAttenuationRangeFromExt(
  yeastRows: EditorYeastRow[],
  recipeExtJson: unknown,
): EditorYeastRow[] {
  const ext =
    recipeExtJson && typeof recipeExtJson === "object" && !Array.isArray(recipeExtJson)
      ? (recipeExtJson as Record<string, unknown>)
      : null;
  const range = ext?.['yeastAttenuationRange'];
  if (!range || typeof range !== "object" || Array.isArray(range)) return yeastRows;
  const rangeObj = range as Record<string, unknown>;
  return yeastRows.map((row) => {
    const entry = rangeObj[row.id];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return row;
    const e = entry as Record<string, unknown>;
    const min =
      typeof e['min'] === "number" && Number.isFinite(e['min']) && e['min'] >= 0 && e['min'] <= 100 ? e['min'] : null;
    const max =
      typeof e['max'] === "number" && Number.isFinite(e['max']) && e['max'] >= 0 && e['max'] <= 100 ? e['max'] : null;
    if (min == null && max == null) return row;
    return {
      ...row,
      attenuationMin: min ?? row.attenuationMin,
      attenuationMax: max ?? row.attenuationMax,
    };
  });
}
