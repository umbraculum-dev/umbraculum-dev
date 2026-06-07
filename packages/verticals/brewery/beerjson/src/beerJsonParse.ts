import { isObject } from "./beerJsonHelpers";
import { parseGristRowsFromBeerJsonIngredients } from "./beerJsonParseGrist";
import { parseHopRowsFromBeerJsonIngredients } from "./beerJsonParseHops";
import { parseMashFromBeerJsonRecipeRoot } from "./beerJsonParseMash";
import { parseMiscRowsFromBeerJsonIngredients } from "./beerJsonParseMisc";
import { parseYeastRowsFromBeerJsonIngredients } from "./beerJsonParseYeast";
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

  const gristRows = parseGristRowsFromBeerJsonIngredients(ing);
  const hopsRows = parseHopRowsFromBeerJsonIngredients(ing);
  const yeastRows = parseYeastRowsFromBeerJsonIngredients(ing);
  const miscRows = parseMiscRowsFromBeerJsonIngredients(ing);
  const mash = parseMashFromBeerJsonRecipeRoot(r0);

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
