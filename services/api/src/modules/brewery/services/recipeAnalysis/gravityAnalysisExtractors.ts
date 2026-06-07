import { isFiniteNumber, isObject } from "../../../../lib/typeGuards.js";
import {
  safeNum,
  type ExtractedFermentableForColor,
  type ExtractedHopAddition,
  type HopForm,
  type HopUse,
  KG_TO_LB,
} from "./gravityAnalysisHelpers.js";

export function extractFirstRecipe(beerJsonRecipeJson: unknown): Record<string, unknown> | null {
  if (!isObject(beerJsonRecipeJson)) return null;
  if (!isObject(beerJsonRecipeJson['beerjson'])) return null;
  const recipes = beerJsonRecipeJson['beerjson']['recipes'];
  if (!Array.isArray(recipes)) return null;
  const first: unknown = recipes[0];
  return isObject(first) ? first : null;
}

export function extractBatchSizeLiters(beerJsonRecipeJson: unknown): number | null {
  const r0 = extractFirstRecipe(beerJsonRecipeJson);
  if (!r0 || !isObject(r0['batch_size'])) return null;
  const unit = typeof r0['batch_size']['unit'] === "string" ? r0['batch_size']['unit'] : "";
  const value = safeNum(r0['batch_size']['value']);
  if (value == null || !(value > 0)) return null;
  if (unit === "l") return value;
  if (unit === "ml") return value / 1000;
  return null;
}

export function extractFermentablesForColor(beerJsonRecipeJson: unknown): { rows: ExtractedFermentableForColor[]; hasMissingColor: boolean } {
  const r0 = extractFirstRecipe(beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0['ingredients']) ? r0['ingredients'] : null;
  const ferms = ingredients?.['fermentable_additions'];
  const list = Array.isArray(ferms) ? ferms : [];

  const rows: ExtractedFermentableForColor[] = [];
  let hasMissingColor = false;

  for (const f of list) {
    if (!isObject(f)) continue;
    const amount = isObject(f['amount']) ? f['amount'] : null;
    const amountKg =
      amount?.['unit'] === "kg"
        ? safeNum(amount['value'])
        : amount?.['unit'] === "g"
          ? (safeNum(amount['value']) ?? 0) / 1000
          : null;
    if (amountKg == null || !(amountKg > 0)) continue;

    const color = isObject(f['color']) ? f['color'] : null;
    const colorLovibond =
      color?.['unit'] === "Lovi" && isFiniteNumber(color['value']) ? color['value'] : null;
    if (colorLovibond == null) {
      hasMissingColor = true;
      continue;
    }

    rows.push({ pounds: amountKg * KG_TO_LB, lovibond: Math.max(0, colorLovibond) });
  }

  return { rows, hasMissingColor };
}

function extractHopFormOverrides(recipeExtJson: unknown): Record<string, HopForm> | null {
  if (!isObject(recipeExtJson)) return null;
  const raw = recipeExtJson['hopFormOverrides'];
  if (!isObject(raw)) return null;
  const out: Record<string, HopForm> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof k !== "string" || !k.trim()) continue;
    if (v === "debittered_leaf") out[k] = "debittered_leaf";
    if (v === "hop_extract") out[k] = "hop_extract";
  }
  return Object.keys(out).length ? out : null;
}

export function extractHopAdditions(beerJsonRecipeJson: unknown, recipeExtJson: unknown): ExtractedHopAddition[] {
  const r0 = extractFirstRecipe(beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0['ingredients']) ? r0['ingredients'] : null;
  const hops = ingredients?.['hop_additions'];
  const list = Array.isArray(hops) ? hops : [];
  const overrides = extractHopFormOverrides(recipeExtJson);

  const out: ExtractedHopAddition[] = [];
  for (const h of list) {
    if (!isObject(h)) continue;
    const id = typeof h['id'] === "string" ? h['id'] : null;
    const name = typeof h['name'] === "string" ? h['name'] : null;
    const override = id && overrides ? overrides[id] : null;
    const formRaw = typeof h['form'] === "string" ? h['form'] : "";
    const formFromBeerJson: HopForm | null =
      formRaw === "extract" || formRaw === "leaf" || formRaw === "leaf (wet)" || formRaw === "pellet" || formRaw === "powder" || formRaw === "plug"
        ? (formRaw)
        : null;
    const form: HopForm | null = override ?? formFromBeerJson;

    const timing = isObject(h['timing']) ? h['timing'] : null;
    const timingUse = typeof timing?.['use'] === "string" ? timing['use'] : "";
    const savedUseRaw = typeof h['brewery_app_use'] === "string" ? h['brewery_app_use'] : "";
    const savedUse: HopUse | null =
      savedUseRaw === "boil" || savedUseRaw === "whirlpool" || savedUseRaw === "dryhop" ? savedUseRaw : null;
    const use: HopUse =
      timingUse === "add_to_fermentation"
        ? "dryhop"
        : savedUse != null
          ? savedUse
          : "boil";

    const duration = isObject(timing?.['duration']) ? timing['duration'] : null;
    const timeMinutes = duration?.['unit'] === "min" ? safeNum(duration['value']) : null;

    const amount = isObject(h['amount']) ? h['amount'] : null;
    const amountUnit = typeof amount?.['unit'] === "string" ? amount['unit'] : "";
    const amountValue = safeNum(amount?.['value']);
    const amountGrams =
      amountValue != null && amountValue >= 0
        ? amountUnit === "g"
          ? amountValue
          : amountUnit === "kg"
            ? amountValue * 1000
            : null
        : null;

    const alphaAcid = isObject(h['alpha_acid']) ? h['alpha_acid'] : null;
    const alphaAcidPercent = alphaAcid?.['unit'] === "%" ? safeNum(alphaAcid['value']) : null;

    out.push({
      id,
      name,
      form,
      use,
      timeMinutes,
      amountGrams,
      alphaAcidPercent,
    });
  }

  return out;
}

export function extractTotalGrainKg(beerJsonRecipeJson: unknown): number {
  const r0 = extractFirstRecipe(beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0['ingredients']) ? r0['ingredients'] : null;
  const ferms = ingredients?.['fermentable_additions'];
  const list = Array.isArray(ferms) ? ferms : [];
  let totalKg = 0;
  for (const f of list) {
    if (!isObject(f)) continue;
    const type = typeof f['type'] === "string" ? f['type'].trim().toLowerCase() : "";
    if (type !== "grain") continue;
    const amount = isObject(f['amount']) ? f['amount'] : null;
    const unit = typeof amount?.['unit'] === "string" ? amount['unit'] : "";
    const value = safeNum(amount?.['value']);
    if (value == null || !(value > 0)) continue;
    if (unit === "kg") totalKg += value;
    if (unit === "g") totalKg += value / 1000;
  }
  return Math.max(0, totalKg);
}
