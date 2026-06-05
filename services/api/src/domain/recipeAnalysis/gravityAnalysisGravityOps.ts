import { isFiniteNumber, isObject } from "../../lib/typeGuards.js";
import {
  KG_TO_LB,
  L_TO_GAL,
  clamp,
  safeNum,
  type ExtractedEquipment,
  type ExtractedYeastAttenuation,
} from "./gravityAnalysisHelpers.js";
import { extractFirstRecipe } from "./gravityAnalysisExtractors.js";

export function extractEquipment(ext: unknown): ExtractedEquipment {
  const e = isObject(ext) && isObject(ext['equipment']) ? ext['equipment'] : null;
  const kettle = e && isObject(e['kettle']) ? e['kettle'] : null;
  const mash = e && isObject(e['mash']) ? e['mash'] : null;
  const misc = e && isObject(e['misc']) ? e['misc'] : null;

  const kettleCapacityLiters = safeNum(kettle?.['kettleVolumeLiters']);
  const kettleLossesLiters = safeNum(kettle?.['kettleLossesLiters']) ?? 0;
  const kettleBoilEvaporationRatePercentPerHour = safeNum(kettle?.['kettleBoilEvaporationRatePercentPerHour']) ?? 0;
  const kettleCoolingShrinkagePercent = safeNum(kettle?.['kettleCoolingShrinkagePercent']) ?? 0;
  const kettleHopsAbsorptionLitersPerGram = safeNum(kettle?.['kettleHopsAbsorptionLiters']) ?? 0;
  const mashLossesLiters = safeNum(mash?.['mashLossesLiters']) ?? 0;
  const mashGrainAbsorptionLPerKg = safeNum(mash?.['mashGrainAbsorptionLPerKg']) ?? 0;
  const mashWaterLeftoverLiters = safeNum(mash?.['mashWaterLeftoverLiters']) ?? 0;
  const mashEfficiencyPercent = safeNum(mash?.['mashEfficiencyPercent']);
  const otherLossesLiters = safeNum(misc?.['otherLossesLiters']) ?? 0;

  return {
    kettleCapacityLiters: kettleCapacityLiters != null && kettleCapacityLiters > 0 ? kettleCapacityLiters : null,
    kettleLossesLiters: Math.max(0, kettleLossesLiters),
    kettleBoilEvaporationRatePercentPerHour: clamp(kettleBoilEvaporationRatePercentPerHour, 0, 100),
    kettleCoolingShrinkagePercent: clamp(kettleCoolingShrinkagePercent, 0, 100),
    kettleHopsAbsorptionLitersPerGram: Math.max(0, kettleHopsAbsorptionLitersPerGram),
    mashLossesLiters: Math.max(0, mashLossesLiters),
    mashGrainAbsorptionLPerKg: Math.max(0, mashGrainAbsorptionLPerKg),
    mashWaterLeftoverLiters: Math.max(0, mashWaterLeftoverLiters),
    mashEfficiencyPercent:
      mashEfficiencyPercent != null && mashEfficiencyPercent >= 0 && mashEfficiencyPercent <= 100
        ? mashEfficiencyPercent
        : null,
    otherLossesLiters: Math.max(0, otherLossesLiters),
  };
}

export function extractBoilTimeHours(args: { beerJsonRecipeJson: unknown; recipeExtJson: unknown }): number {
  const override = isObject(args.recipeExtJson) ? args.recipeExtJson['boilTimeMinutesOverride'] : null;
  if (typeof override === "number" && Number.isFinite(override) && override >= 0) {
    return override / 60;
  }
  const r0 = extractFirstRecipe(args.beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0['ingredients']) ? r0['ingredients'] : null;
  const hops = ingredients?.['hop_additions'];
  const list = Array.isArray(hops) ? hops : [];
  let maxMinutes = 0;
  for (const h of list) {
    if (!isObject(h)) continue;
    const timing = isObject(h['timing']) ? h['timing'] : null;
    const use = typeof timing?.['use'] === "string" ? timing['use'] : "";
    if (use !== "add_to_boil") continue;
    const duration = isObject(timing?.['duration']) ? timing['duration'] : null;
    const minutes = duration?.['unit'] === "min" ? safeNum(duration['value']) : null;
    if (minutes != null && minutes > maxMinutes) maxMinutes = minutes;
  }
  const inferredMinutes = maxMinutes > 0 ? maxMinutes : 60;
  return inferredMinutes / 60;
}

export function extractKettleHopMassGrams(beerJsonRecipeJson: unknown): number {
  const r0 = extractFirstRecipe(beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0['ingredients']) ? r0['ingredients'] : null;
  const hops = ingredients?.['hop_additions'];
  const list = Array.isArray(hops) ? hops : [];
  let totalGrams = 0;
  for (const h of list) {
    if (!isObject(h)) continue;
    const timing = isObject(h['timing']) ? h['timing'] : null;
    const use = typeof timing?.['use'] === "string" ? timing['use'] : "";
    if (use !== "add_to_boil") continue;
    const amount = isObject(h['amount']) ? h['amount'] : null;
    const unit = typeof amount?.['unit'] === "string" ? amount['unit'] : "";
    const value = safeNum(amount?.['value']);
    if (value == null || !(value > 0)) continue;
    if (unit === "g") totalGrams += value;
    if (unit === "kg") totalGrams += value * 1000;
  }
  return Math.max(0, totalGrams);
}
export function extractFermentablesPpgAndPounds(beerJsonRecipeJson: unknown): Array<{ ppg: number; pounds: number }> {
  const r0 = extractFirstRecipe(beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0['ingredients']) ? r0['ingredients'] : null;
  const ferms = ingredients?.['fermentable_additions'];
  const list = Array.isArray(ferms) ? ferms : [];
  const out: Array<{ ppg: number; pounds: number }> = [];

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

    const yieldObj = isObject(f['yield']) ? f['yield'] : null;
    const potential = isObject(yieldObj?.['potential']) ? yieldObj['potential'] : null;
    const fineGrind = isObject(yieldObj?.['fine_grind']) ? yieldObj['fine_grind'] : null;
    const potentialSg = potential?.['unit'] === "sg" ? safeNum(potential['value']) : null;
    const yieldPercent = fineGrind?.['unit'] === "%" ? safeNum(fineGrind['value']) : null;

    let ppg: number | null = null;
    if (potentialSg != null && potentialSg > 1) {
      ppg = (potentialSg - 1) * 1000;
    } else if (yieldPercent != null && yieldPercent > 0) {
      ppg = 46 * (yieldPercent / 100);
    }
    if (ppg == null || !(ppg > 0)) continue;

    out.push({ ppg, pounds: amountKg * KG_TO_LB });
  }

  return out;
}

export function estimateSgFromPpg(args: { fermentables: Array<{ ppg: number; pounds: number }>; volumeLiters: number; efficiencyPercent: number }): number | null {
  if (!(args.volumeLiters > 0)) return null;
  const gallons = args.volumeLiters * L_TO_GAL;
  if (!(gallons > 0)) return null;

  const eff = clamp(args.efficiencyPercent, 0, 100) / 100;
  const totalPpgPounds = args.fermentables.reduce((a, row) => a + row.ppg * row.pounds, 0);
  if (!(totalPpgPounds > 0)) return null;

  const points = (totalPpgPounds / gallons) * eff;
  return 1 + points / 1000;
}

export function extractYeastAttenuations(args: { beerJsonRecipeJson: unknown; recipeExtJson: unknown }): ExtractedYeastAttenuation[] {
  const r0 = extractFirstRecipe(args.beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0['ingredients']) ? r0['ingredients'] : null;
  const cultures = ingredients?.['culture_additions'];
  const list = Array.isArray(cultures) ? cultures : [];

  const ext = isObject(args.recipeExtJson) ? args.recipeExtJson : null;
  const overrides = isObject(ext?.['yeastAttenuationOverridesPercent']) ? ext['yeastAttenuationOverridesPercent'] : null;
  const rangeMap = isObject(ext?.['yeastAttenuationRange']) ? ext['yeastAttenuationRange'] : null;

  const out: ExtractedYeastAttenuation[] = [];
  for (const c of list) {
    if (!isObject(c)) continue;
    const id = typeof c['id'] === "string" ? c['id'] : "";
    if (!id) continue;
    const attenuation = isObject(c['attenuation']) ? c['attenuation'] : null;
    const beerJsonAtt = attenuation?.['unit'] === "%" ? safeNum(attenuation['value']) : null;
    const rangeEntry = rangeMap && isObject(rangeMap[id]) ? rangeMap[id] : null;
    const rangeMin = isFiniteNumber(rangeEntry?.['min']) ? rangeEntry['min'] : null;
    const rangeMax = isFiniteNumber(rangeEntry?.['max']) ? rangeEntry['max'] : null;
    const rangeAvg =
      rangeMin != null && rangeMax != null ? (rangeMin + rangeMax) / 2 : null;
    const attenuationPercent =
      beerJsonAtt != null ? clamp(beerJsonAtt, 0, 100) : rangeAvg != null ? clamp(rangeAvg, 0, 100) : null;
    const overrideRaw = overrides ? safeNum(overrides[id]) : null;
    const overridePercent = overrideRaw != null ? clamp(overrideRaw, 0, 100) : null;
    out.push({
      id,
      attenuationPercent,
      overridePercent,
    });
  }
  return out;
}

export function effectiveAttenuationPercent(yeasts: ExtractedYeastAttenuation[]): number | null {
  const effective = yeasts
    .map((y) => y.overridePercent ?? y.attenuationPercent)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (!effective.length) return null;
  const sorted = [...effective].sort((a, b) => b - a);
  const top = sorted.slice(0, 2);
  return top.reduce((a, v) => a + v, 0) / top.length;
}
