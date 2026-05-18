import type {
  GravityAnalysisDerivationKind,
  GravityAnalysisResponseV1,
  GravityAnalysisWarningCode,
  WaterCalcDerivation,
} from "@brewery/contracts";
import { analysisFormatHints } from "@brewery/contracts";
import { isFiniteNumber, isObject } from "../../lib/typeGuards.js";

/**
 * Phase 3 helper: walk the canonical `{ beerjson: { recipes: [recipe0, ...] } }`
 * Prisma JSON shape and return the first recipe object (or null). Replaces
 * ~7 repeated `(beerJsonRecipeJson as any)?.beerjson?.recipes?.[0]` accesses.
 */
function extractFirstRecipe(beerJsonRecipeJson: unknown): Record<string, unknown> | null {
  if (!isObject(beerJsonRecipeJson)) return null;
  if (!isObject(beerJsonRecipeJson.beerjson)) return null;
  const recipes = beerJsonRecipeJson.beerjson.recipes;
  if (!Array.isArray(recipes)) return null;
  const first: unknown = recipes[0];
  return isObject(first) ? first : null;
}

export interface GravityAnalysisWarning {
  code: GravityAnalysisWarningCode;
  message?: string;
}

export interface GravityAnalysis {
  boilTimeMinutes: number | null;
  kettleVolumeLiters: number | null;
  preBoilVolumeLiters: number | null;
  ogEstimatedSg: number | null;
  pbgEstimatedSg: number | null;
  ibuTinsethEstimated: number | null;
  ibuRagerEstimated: number | null;
  buGuRatio: number | null;
  colorSrmMoreyEstimated: number | null;
  colorSrmDanielsEstimated: number | null;
  fgEstimatedSg: number | null;
  abvEstimatedPercent: number | null;
  attenuationEffectivePercent: number | null;
  warnings: GravityAnalysisWarning[];
}

interface ExtractedEquipment {
  kettleCapacityLiters: number | null;
  kettleLossesLiters: number;
  kettleBoilEvaporationRatePercentPerHour: number;
  kettleCoolingShrinkagePercent: number;
  kettleHopsAbsorptionLitersPerGram: number;
  mashLossesLiters: number;
  mashGrainAbsorptionLPerKg: number;
  mashWaterLeftoverLiters: number;
  mashEfficiencyPercent: number | null;
  otherLossesLiters: number;
}

interface ExtractedYeastAttenuation {
  id: string;
  attenuationPercent: number | null;
  overridePercent: number | null;
}

const KG_TO_LB = 2.204_622_621_8;
const L_TO_GAL = 0.264_172_052_4;
const ABV_FACTOR = 131.25;
const WHIRLPOOL_UTILIZATION_MULTIPLIER = 0.5;

function safeNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

type HopUse = "boil" | "whirlpool" | "dryhop";

type HopForm = "extract" | "leaf" | "leaf (wet)" | "pellet" | "powder" | "plug" | "debittered_leaf" | "hop_extract";

interface ExtractedHopAddition {
  id: string | null;
  name: string | null;
  form: HopForm | null;
  use: HopUse;
  timeMinutes: number | null;
  amountGrams: number | null;
  alphaAcidPercent: number | null;
}

interface ExtractedFermentableForColor {
  pounds: number;
  lovibond: number;
}

function extractBatchSizeLiters(beerJsonRecipeJson: unknown): number | null {
  const r0 = extractFirstRecipe(beerJsonRecipeJson);
  if (!r0 || !isObject(r0.batch_size)) return null;
  const unit = typeof r0.batch_size.unit === "string" ? r0.batch_size.unit : "";
  const value = safeNum(r0.batch_size.value);
  if (value == null || !(value > 0)) return null;
  if (unit === "l") return value;
  if (unit === "ml") return value / 1000;
  return null;
}

function extractFermentablesForColor(beerJsonRecipeJson: unknown): { rows: ExtractedFermentableForColor[]; hasMissingColor: boolean } {
  const r0 = extractFirstRecipe(beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0.ingredients) ? r0.ingredients : null;
  const ferms = ingredients?.fermentable_additions;
  const list = Array.isArray(ferms) ? ferms : [];

  const rows: ExtractedFermentableForColor[] = [];
  let hasMissingColor = false;

  for (const f of list) {
    if (!isObject(f)) continue;
    const amount = isObject(f.amount) ? f.amount : null;
    const amountKg =
      amount?.unit === "kg"
        ? safeNum(amount.value)
        : amount?.unit === "g"
          ? (safeNum(amount.value) ?? 0) / 1000
          : null;
    if (amountKg == null || !(amountKg > 0)) continue;

    const color = isObject(f.color) ? f.color : null;
    const colorLovibond =
      color?.unit === "Lovi" && isFiniteNumber(color.value) ? color.value : null;
    if (colorLovibond == null) {
      hasMissingColor = true;
      continue;
    }

    rows.push({ pounds: amountKg * KG_TO_LB, lovibond: Math.max(0, colorLovibond) });
  }

  return { rows, hasMissingColor };
}

function computeMcu(args: { fermentables: ExtractedFermentableForColor[]; postBoilVolumeLiters: number }): number | null {
  if (!(args.postBoilVolumeLiters > 0)) return null;
  const gallons = args.postBoilVolumeLiters * L_TO_GAL;
  if (!(gallons > 0)) return null;
  const numerator = args.fermentables.reduce((acc, r) => acc + r.pounds * r.lovibond, 0);
  if (!(numerator >= 0)) return null;
  return numerator / gallons;
}

function srmMoreyFromMcu(mcu: number): number {
  return 1.4922 * Math.pow(Math.max(0, mcu), 0.6859);
}

function srmDanielsFromMcu(mcu: number): number {
  return 0.2 * Math.max(0, mcu) + 8.4;
}

const WET_HOPS_DRY_EQUIVALENT_WEIGHT_FACTOR = 4.5;

const HOP_FORM_FACTOR: Record<HopForm, number> = {
  pellet: 1,
  leaf: 0.9,
  plug: 0.9,
  "leaf (wet)": 1 / WET_HOPS_DRY_EQUIVALENT_WEIGHT_FACTOR,
  powder: 1,
  extract: 1,
  hop_extract: 1,
  debittered_leaf: 0.5,
};

function extractHopFormOverrides(recipeExtJson: unknown): Record<string, HopForm> | null {
  if (!isObject(recipeExtJson)) return null;
  const raw = recipeExtJson.hopFormOverrides;
  if (!isObject(raw)) return null;
  const out: Record<string, HopForm> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof k !== "string" || !k.trim()) continue;
    if (v === "debittered_leaf") out[k] = "debittered_leaf";
    if (v === "hop_extract") out[k] = "hop_extract";
  }
  return Object.keys(out).length ? out : null;
}

function extractHopAdditions(beerJsonRecipeJson: unknown, recipeExtJson: unknown): ExtractedHopAddition[] {
  const r0 = extractFirstRecipe(beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0.ingredients) ? r0.ingredients : null;
  const hops = ingredients?.hop_additions;
  const list = Array.isArray(hops) ? hops : [];
  const overrides = extractHopFormOverrides(recipeExtJson);

  const out: ExtractedHopAddition[] = [];
  for (const h of list) {
    if (!isObject(h)) continue;
    const id = typeof h.id === "string" ? h.id : null;
    const name = typeof h.name === "string" ? h.name : null;
    const override = id && overrides ? overrides[id] : null;
    const formRaw = typeof h.form === "string" ? h.form : "";
    const formFromBeerJson: HopForm | null =
      formRaw === "extract" || formRaw === "leaf" || formRaw === "leaf (wet)" || formRaw === "pellet" || formRaw === "powder" || formRaw === "plug"
        ? (formRaw)
        : null;
    const form: HopForm | null = override ?? formFromBeerJson;

    const timing = isObject(h.timing) ? h.timing : null;
    const timingUse = typeof timing?.use === "string" ? timing.use : "";
    const savedUseRaw = typeof h.brewery_app_use === "string" ? h.brewery_app_use : "";
    const savedUse: HopUse | null =
      savedUseRaw === "boil" || savedUseRaw === "whirlpool" || savedUseRaw === "dryhop" ? savedUseRaw : null;
    const use: HopUse =
      timingUse === "add_to_fermentation"
        ? "dryhop"
        : savedUse != null
          ? savedUse
          : "boil";

    const duration = isObject(timing?.duration) ? timing.duration : null;
    const timeMinutes = duration?.unit === "min" ? safeNum(duration.value) : null;

    const amount = isObject(h.amount) ? h.amount : null;
    const amountUnit = typeof amount?.unit === "string" ? amount.unit : "";
    const amountValue = safeNum(amount?.value);
    const amountGrams =
      amountValue != null && amountValue >= 0
        ? amountUnit === "g"
          ? amountValue
          : amountUnit === "kg"
            ? amountValue * 1000
            : null
        : null;

    const alphaAcid = isObject(h.alpha_acid) ? h.alpha_acid : null;
    const alphaAcidPercent = alphaAcid?.unit === "%" ? safeNum(alphaAcid.value) : null;

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

function tinsethUtilization(args: { boilTimeMinutes: number; boilGravitySg: number }): number {
  const t = Math.max(0, args.boilTimeMinutes);
  const g = Math.max(1, args.boilGravitySg);
  const bigness = 1.65 * Math.pow(0.000125, g - 1);
  const timeFactor = (1 - Math.exp(-0.04 * t)) / 4.15;
  return Math.max(0, bigness * timeFactor);
}

function ragerUtilizationFraction(args: { boilTimeMinutes: number; boilGravitySg: number }): number {
  const t = Math.max(0, args.boilTimeMinutes);
  const g = Math.max(1, args.boilGravitySg);

  const utilPercent = 18.11 + 13.86 * Math.tanh((t - 31.32) / 18.27);
  const utilPercentClamped = clamp(utilPercent, 0, 30);

  const gravityAdjustment = g > 1.05 ? (g - 1.05) / 0.2 : 0;
  const adjusted = utilPercentClamped / (1 + gravityAdjustment);
  return clamp(adjusted / 100, 0, 1);
}

function computeIbuTinseth(args: {
  hops: ExtractedHopAddition[];
  boilGravitySg: number;
  postBoilVolumeLiters: number;
  warnings: GravityAnalysisWarning[];
}): number | null {
  if (!(args.postBoilVolumeLiters > 0)) return null;
  if (!(args.boilGravitySg > 0)) return null;

  let total = 0;
  let anyUsed = false;

  for (const h of args.hops) {
    if (h.use !== "boil" && h.use !== "whirlpool") continue;
    if (!(h.amountGrams != null && h.amountGrams > 0)) continue;
    if (!(h.alphaAcidPercent != null && h.alphaAcidPercent > 0)) continue;
    if (!(h.timeMinutes != null && h.timeMinutes >= 0)) continue;

    anyUsed = true;
    const aaFrac = h.alphaAcidPercent / 100;
    let u = tinsethUtilization({ boilTimeMinutes: h.timeMinutes, boilGravitySg: args.boilGravitySg });
    if (h.use === "whirlpool") u *= WHIRLPOOL_UTILIZATION_MULTIPLIER;
    if (h.form) u *= HOP_FORM_FACTOR[h.form];

    total += (h.amountGrams * aaFrac * u * 1000) / args.postBoilVolumeLiters;
  }

  if (!anyUsed) {
    args.warnings.push({
      code: "missing_ibu_inputs",
      message: "No usable hop boil/whirlpool additions with amount, alpha acid %, and time; cannot estimate IBU.",
    });
    return null;
  }

  return total;
}

function computeIbuRager(args: {
  hops: ExtractedHopAddition[];
  boilGravitySg: number;
  postBoilVolumeLiters: number;
  warnings: GravityAnalysisWarning[];
}): number | null {
  if (!(args.postBoilVolumeLiters > 0)) return null;
  if (!(args.boilGravitySg > 0)) return null;

  let total = 0;
  let anyUsed = false;

  for (const h of args.hops) {
    if (h.use !== "boil" && h.use !== "whirlpool") continue;
    if (!(h.amountGrams != null && h.amountGrams > 0)) continue;
    if (!(h.alphaAcidPercent != null && h.alphaAcidPercent > 0)) continue;
    if (!(h.timeMinutes != null && h.timeMinutes >= 0)) continue;

    anyUsed = true;
    const aaFrac = h.alphaAcidPercent / 100;
    let u = ragerUtilizationFraction({ boilTimeMinutes: h.timeMinutes, boilGravitySg: args.boilGravitySg });
    if (h.use === "whirlpool") u *= WHIRLPOOL_UTILIZATION_MULTIPLIER;
    if (h.form) u *= HOP_FORM_FACTOR[h.form];

    total += (h.amountGrams * aaFrac * u * 1000) / args.postBoilVolumeLiters;
  }

  if (!anyUsed) {
    args.warnings.push({
      code: "missing_ibu_inputs",
      message: "No usable hop boil/whirlpool additions with amount, alpha acid %, and time; cannot estimate IBU.",
    });
    return null;
  }

  return total;
}

function extractEquipment(ext: unknown): ExtractedEquipment {
  const e = isObject(ext) && isObject(ext.equipment) ? ext.equipment : null;
  const kettle = e && isObject(e.kettle) ? e.kettle : null;
  const mash = e && isObject(e.mash) ? e.mash : null;
  const misc = e && isObject(e.misc) ? e.misc : null;

  const kettleCapacityLiters = safeNum(kettle?.kettleVolumeLiters);
  const kettleLossesLiters = safeNum(kettle?.kettleLossesLiters) ?? 0;
  const kettleBoilEvaporationRatePercentPerHour = safeNum(kettle?.kettleBoilEvaporationRatePercentPerHour) ?? 0;
  const kettleCoolingShrinkagePercent = safeNum(kettle?.kettleCoolingShrinkagePercent) ?? 0;
  const kettleHopsAbsorptionLitersPerGram = safeNum(kettle?.kettleHopsAbsorptionLiters) ?? 0;
  const mashLossesLiters = safeNum(mash?.mashLossesLiters) ?? 0;
  const mashGrainAbsorptionLPerKg = safeNum(mash?.mashGrainAbsorptionLPerKg) ?? 0;
  const mashWaterLeftoverLiters = safeNum(mash?.mashWaterLeftoverLiters) ?? 0;
  const mashEfficiencyPercent = safeNum(mash?.mashEfficiencyPercent);
  const otherLossesLiters = safeNum(misc?.otherLossesLiters) ?? 0;

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

function extractBoilTimeHours(args: { beerJsonRecipeJson: unknown; recipeExtJson: unknown }): number {
  const override = isObject(args.recipeExtJson) ? args.recipeExtJson.boilTimeMinutesOverride : null;
  if (typeof override === "number" && Number.isFinite(override) && override >= 0) {
    return override / 60;
  }
  const r0 = extractFirstRecipe(args.beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0.ingredients) ? r0.ingredients : null;
  const hops = ingredients?.hop_additions;
  const list = Array.isArray(hops) ? hops : [];
  let maxMinutes = 0;
  for (const h of list) {
    if (!isObject(h)) continue;
    const timing = isObject(h.timing) ? h.timing : null;
    const use = typeof timing?.use === "string" ? timing.use : "";
    if (use !== "add_to_boil") continue;
    const duration = isObject(timing?.duration) ? timing.duration : null;
    const minutes = duration?.unit === "min" ? safeNum(duration.value) : null;
    if (minutes != null && minutes > maxMinutes) maxMinutes = minutes;
  }
  const inferredMinutes = maxMinutes > 0 ? maxMinutes : 60;
  return inferredMinutes / 60;
}

function extractKettleHopMassGrams(beerJsonRecipeJson: unknown): number {
  const r0 = extractFirstRecipe(beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0.ingredients) ? r0.ingredients : null;
  const hops = ingredients?.hop_additions;
  const list = Array.isArray(hops) ? hops : [];
  let totalGrams = 0;
  for (const h of list) {
    if (!isObject(h)) continue;
    const timing = isObject(h.timing) ? h.timing : null;
    const use = typeof timing?.use === "string" ? timing.use : "";
    if (use !== "add_to_boil") continue;
    const amount = isObject(h.amount) ? h.amount : null;
    const unit = typeof amount?.unit === "string" ? amount.unit : "";
    const value = safeNum(amount?.value);
    if (value == null || !(value > 0)) continue;
    if (unit === "g") totalGrams += value;
    if (unit === "kg") totalGrams += value * 1000;
  }
  return Math.max(0, totalGrams);
}

function extractTotalGrainKg(beerJsonRecipeJson: unknown): number {
  const r0 = extractFirstRecipe(beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0.ingredients) ? r0.ingredients : null;
  const ferms = ingredients?.fermentable_additions;
  const list = Array.isArray(ferms) ? ferms : [];
  let totalKg = 0;
  for (const f of list) {
    if (!isObject(f)) continue;
    const type = typeof f.type === "string" ? f.type.trim().toLowerCase() : "";
    if (type !== "grain") continue;
    const amount = isObject(f.amount) ? f.amount : null;
    const unit = typeof amount?.unit === "string" ? amount.unit : "";
    const value = safeNum(amount?.value);
    if (value == null || !(value > 0)) continue;
    if (unit === "kg") totalKg += value;
    if (unit === "g") totalKg += value / 1000;
  }
  return Math.max(0, totalKg);
}

function extractFermentablesPpgAndPounds(beerJsonRecipeJson: unknown): Array<{ ppg: number; pounds: number }> {
  const r0 = extractFirstRecipe(beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0.ingredients) ? r0.ingredients : null;
  const ferms = ingredients?.fermentable_additions;
  const list = Array.isArray(ferms) ? ferms : [];
  const out: Array<{ ppg: number; pounds: number }> = [];

  for (const f of list) {
    if (!isObject(f)) continue;
    const amount = isObject(f.amount) ? f.amount : null;
    const amountKg =
      amount?.unit === "kg"
        ? safeNum(amount.value)
        : amount?.unit === "g"
          ? (safeNum(amount.value) ?? 0) / 1000
          : null;
    if (amountKg == null || !(amountKg > 0)) continue;

    const yieldObj = isObject(f.yield) ? f.yield : null;
    const potential = isObject(yieldObj?.potential) ? yieldObj.potential : null;
    const fineGrind = isObject(yieldObj?.fine_grind) ? yieldObj.fine_grind : null;
    const potentialSg = potential?.unit === "sg" ? safeNum(potential.value) : null;
    const yieldPercent = fineGrind?.unit === "%" ? safeNum(fineGrind.value) : null;

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

function estimateSgFromPpg(args: { fermentables: Array<{ ppg: number; pounds: number }>; volumeLiters: number; efficiencyPercent: number }): number | null {
  if (!(args.volumeLiters > 0)) return null;
  const gallons = args.volumeLiters * L_TO_GAL;
  if (!(gallons > 0)) return null;

  const eff = clamp(args.efficiencyPercent, 0, 100) / 100;
  const totalPpgPounds = args.fermentables.reduce((a, row) => a + row.ppg * row.pounds, 0);
  if (!(totalPpgPounds > 0)) return null;

  const points = (totalPpgPounds / gallons) * eff;
  return 1 + points / 1000;
}

function extractYeastAttenuations(args: { beerJsonRecipeJson: unknown; recipeExtJson: unknown }): ExtractedYeastAttenuation[] {
  const r0 = extractFirstRecipe(args.beerJsonRecipeJson);
  const ingredients = r0 && isObject(r0.ingredients) ? r0.ingredients : null;
  const cultures = ingredients?.culture_additions;
  const list = Array.isArray(cultures) ? cultures : [];

  const ext = isObject(args.recipeExtJson) ? args.recipeExtJson : null;
  const overrides = isObject(ext?.yeastAttenuationOverridesPercent) ? ext.yeastAttenuationOverridesPercent : null;
  const rangeMap = isObject(ext?.yeastAttenuationRange) ? ext.yeastAttenuationRange : null;

  const out: ExtractedYeastAttenuation[] = [];
  for (const c of list) {
    if (!isObject(c)) continue;
    const id = typeof c.id === "string" ? c.id : "";
    if (!id) continue;
    const attenuation = isObject(c.attenuation) ? c.attenuation : null;
    const beerJsonAtt = attenuation?.unit === "%" ? safeNum(attenuation.value) : null;
    const rangeEntry = rangeMap && isObject(rangeMap[id]) ? rangeMap[id] : null;
    const rangeMin = isFiniteNumber(rangeEntry?.min) ? rangeEntry.min : null;
    const rangeMax = isFiniteNumber(rangeEntry?.max) ? rangeEntry.max : null;
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

function effectiveAttenuationPercent(yeasts: ExtractedYeastAttenuation[]): number | null {
  const effective = yeasts
    .map((y) => y.overridePercent ?? y.attenuationPercent)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (!effective.length) return null;
  const sorted = [...effective].sort((a, b) => b - a);
  const top = sorted.slice(0, 2);
  return top.reduce((a, v) => a + v, 0) / top.length;
}

export function computeRecipeGravityAnalysis(args: {
  beerJsonRecipeJson: unknown;
  recipeExtJson: unknown;
  recipeWaterSettings: unknown;
}): GravityAnalysisResponseV1 {
  const warnings: GravityAnalysisWarning[] = [];
  const equipment = extractEquipment(args.recipeExtJson);

  if (!args.beerJsonRecipeJson) {
    const result: GravityAnalysis = {
      boilTimeMinutes: null,
      kettleVolumeLiters: null,
      preBoilVolumeLiters: null,
      ogEstimatedSg: null,
      pbgEstimatedSg: null,
      ibuTinsethEstimated: null,
      ibuRagerEstimated: null,
      buGuRatio: null,
      colorSrmMoreyEstimated: null,
      colorSrmDanielsEstimated: null,
      fgEstimatedSg: null,
      abvEstimatedPercent: null,
      attenuationEffectivePercent: null,
      warnings: [{ code: "missing_beerjson" }],
    };
    return {
      ok: true,
      version: 1,
      canonicalModels: { ibu: "tinseth", srm: "morey" },
      result,
      derivations: {},
      formatHints: analysisFormatHints,
    };
  }

  const water = isObject(args.recipeWaterSettings) ? args.recipeWaterSettings : null;

  const mashWaterVolumeLiters = isFiniteNumber(water?.mashWaterVolumeLiters) ? water.mashWaterVolumeLiters : null;
  const spargeVolumeLiters = isFiniteNumber(water?.spargeVolumeLiters) ? water.spargeVolumeLiters : null;
  const boilWaterVolumeLiters = isFiniteNumber(water?.boilWaterVolumeLiters) ? water.boilWaterVolumeLiters : 0;

  const boilTimeHours = extractBoilTimeHours({
    beerJsonRecipeJson: args.beerJsonRecipeJson,
    recipeExtJson: args.recipeExtJson,
  });
  const kettleHopMassGrams = extractKettleHopMassGrams(args.beerJsonRecipeJson);
  const kettleHopAbsorptionLiters = equipment.kettleHopsAbsorptionLitersPerGram * kettleHopMassGrams;

  const preBoilVolumeLiters = (() => {
    if (!water) {
      warnings.push({ code: "missing_water_settings" });
      return null;
    }
    if (mashWaterVolumeLiters == null || spargeVolumeLiters == null) {
      warnings.push({ code: "missing_water_volumes" });
      return null;
    }
    const totalGrainKg = extractTotalGrainKg(args.beerJsonRecipeJson);
    const grainAbsorptionLiters = equipment.mashGrainAbsorptionLPerKg * totalGrainKg;
    const runoffLiters =
      mashWaterVolumeLiters +
      spargeVolumeLiters -
      grainAbsorptionLiters -
      equipment.mashLossesLiters -
      equipment.mashWaterLeftoverLiters;

    if (!(runoffLiters > 0)) {
      warnings.push({ code: "invalid_runoff_volume" });
      return null;
    }

    const preBoil = runoffLiters + Math.max(0, boilWaterVolumeLiters);
    return preBoil > 0 ? preBoil : null;
  })();

  const kettleVolumeLiters = (() => {
    if (preBoilVolumeLiters == null) return null;

    const evapRate = clamp(equipment.kettleBoilEvaporationRatePercentPerHour, 0, 99) / 100;
    const denom = 1 - evapRate * boilTimeHours;
    if (!(denom > 0)) {
      warnings.push({
        code: "invalid_evaporation",
      });
      return null;
    }

    const postBoilHotVolume = preBoilVolumeLiters * denom;
    const shrink = clamp(equipment.kettleCoolingShrinkagePercent, 0, 99) / 100;
    const cooledVolume = postBoilHotVolume * (1 - shrink);

    const totalKettleLossesLiters = equipment.kettleLossesLiters + kettleHopAbsorptionLiters + equipment.otherLossesLiters;
    const out = cooledVolume - totalKettleLossesLiters;
    if (!(out > 0)) {
      warnings.push({ code: "invalid_kettle_volume" });
      return null;
    }

    if (equipment.kettleCapacityLiters != null && out > equipment.kettleCapacityLiters) {
      warnings.push({
        code: "exceeds_kettle_capacity",
      });
    }

    return out;
  })();

  const efficiencyPercent =
    equipment.mashEfficiencyPercent ??
    (isObject(args.recipeExtJson) ? safeNum(args.recipeExtJson.brewhouseEfficiencyPercent) : null) ??
    (() => {
      const r0 = extractFirstRecipe(args.beerJsonRecipeJson);
      const efficiency = r0 && isObject(r0.efficiency) ? r0.efficiency : null;
      const brewhouse = isObject(efficiency?.brewhouse) ? efficiency.brewhouse : null;
      return brewhouse?.unit === "%" ? safeNum(brewhouse.value) : null;
    })() ??
    0;

  if (!(efficiencyPercent > 0)) {
    warnings.push({ code: "missing_efficiency" });
  }

  const fermentables = extractFermentablesPpgAndPounds(args.beerJsonRecipeJson);
  if (!fermentables.length) {
    warnings.push({
      code: "missing_fermentables",
    });
  }

  const ogEstimatedSg =
    kettleVolumeLiters != null && fermentables.length && efficiencyPercent > 0
      ? estimateSgFromPpg({ fermentables, volumeLiters: kettleVolumeLiters, efficiencyPercent })
      : null;

  const pbgEstimatedSg =
    preBoilVolumeLiters != null && fermentables.length && efficiencyPercent > 0
      ? estimateSgFromPpg({ fermentables, volumeLiters: preBoilVolumeLiters, efficiencyPercent })
      : null;

  const hops = extractHopAdditions(args.beerJsonRecipeJson, args.recipeExtJson);

  const ibuVolumeLiters =
    kettleVolumeLiters ??
    (() => {
      const batchSize = extractBatchSizeLiters(args.beerJsonRecipeJson);
      if (batchSize != null) {
        warnings.push({
          code: "used_batch_size_volume",
        });
      }
      return batchSize;
    })();

  const ibuGravitySg = pbgEstimatedSg ?? ogEstimatedSg;
  if (ibuGravitySg == null) {
    warnings.push({
      code: "missing_ibu_gravity",
    });
  }

  const ibuTinsethEstimated =
    ibuVolumeLiters != null && ibuGravitySg != null
      ? computeIbuTinseth({ hops, boilGravitySg: ibuGravitySg, postBoilVolumeLiters: ibuVolumeLiters, warnings })
      : null;
  const ibuRagerEstimated =
    ibuVolumeLiters != null && ibuGravitySg != null
      ? computeIbuRager({ hops, boilGravitySg: ibuGravitySg, postBoilVolumeLiters: ibuVolumeLiters, warnings })
      : null;
  const ibuForBuGu = ibuTinsethEstimated ?? ibuRagerEstimated ?? null;
  const buGuRatio =
    ibuForBuGu != null && ogEstimatedSg != null && ogEstimatedSg > 1
      ? ibuForBuGu / ((ogEstimatedSg - 1) * 1000)
      : null;

  const colorFermentables = extractFermentablesForColor(args.beerJsonRecipeJson);
  let colorMcuEstimated: number | null = null;
  let colorSrmMoreyEstimated: number | null = null;
  let colorSrmDanielsEstimated: number | null = null;

  if (kettleVolumeLiters == null) {
    warnings.push({ code: "missing_color_volume" });
  } else if (colorFermentables.hasMissingColor) {
    warnings.push({ code: "missing_fermentable_colors" });
  } else if (!colorFermentables.rows.length) {
    if (!warnings.some((w) => w.code === "missing_fermentables")) {
      warnings.push({ code: "missing_fermentables" });
    }
  } else {
    colorMcuEstimated = computeMcu({ fermentables: colorFermentables.rows, postBoilVolumeLiters: kettleVolumeLiters });
    if (colorMcuEstimated != null) {
      colorSrmMoreyEstimated = srmMoreyFromMcu(colorMcuEstimated);
      colorSrmDanielsEstimated = srmDanielsFromMcu(colorMcuEstimated);
    }
  }

  const yeasts = extractYeastAttenuations(args);
  const attenuationEffectivePercent = effectiveAttenuationPercent(yeasts);
  if (attenuationEffectivePercent == null) {
    warnings.push({
      code: "missing_attenuation",
    });
  }

  const fgEstimatedSg =
    ogEstimatedSg != null && attenuationEffectivePercent != null
      ? 1 + (ogEstimatedSg - 1) * (1 - attenuationEffectivePercent / 100)
      : null;

  const abvEstimatedPercent =
    ogEstimatedSg != null && fgEstimatedSg != null ? (ogEstimatedSg - fgEstimatedSg) * ABV_FACTOR : null;

  const boilTimeMinutes = Math.round(boilTimeHours * 60);

  const result: GravityAnalysis = {
    boilTimeMinutes,
    kettleVolumeLiters,
    preBoilVolumeLiters,
    ogEstimatedSg,
    pbgEstimatedSg,
    ibuTinsethEstimated,
    ibuRagerEstimated,
    buGuRatio,
    colorSrmMoreyEstimated,
    colorSrmDanielsEstimated,
    fgEstimatedSg,
    abvEstimatedPercent,
    attenuationEffectivePercent,
    warnings,
  };

  const derivations: Partial<Record<GravityAnalysisDerivationKind, WaterCalcDerivation>> = {};

  if (preBoilVolumeLiters != null && mashWaterVolumeLiters != null && spargeVolumeLiters != null) {
    derivations["analysis.pre_boil_volume"] = {
      kind: "analysis.pre_boil_volume",
      version: 1,
      formulaId: "analysis.pre_boil_volume.v1",
      inputs: [
        { id: "mashWaterVolumeLiters", value: { kind: "number", value: mashWaterVolumeLiters, unit: "L" } },
        { id: "spargeVolumeLiters", value: { kind: "number", value: spargeVolumeLiters, unit: "L" } },
        { id: "boilWaterVolumeLiters", value: { kind: "number", value: boilWaterVolumeLiters, unit: "L" } },
        { id: "mashLossesLiters", value: { kind: "number", value: equipment.mashLossesLiters, unit: "L" } },
        { id: "mashWaterLeftoverLiters", value: { kind: "number", value: equipment.mashWaterLeftoverLiters, unit: "L" } },
        { id: "mashGrainAbsorptionLPerKg", value: { kind: "number", value: equipment.mashGrainAbsorptionLPerKg, unit: "L_per_kg" } },
      ],
      intermediates: [{ id: "preBoilVolumeLiters", value: { kind: "number", value: preBoilVolumeLiters, unit: "L" } }],
    };
  }

  if (kettleVolumeLiters != null && preBoilVolumeLiters != null) {
    derivations["analysis.kettle_volume"] = {
      kind: "analysis.kettle_volume",
      version: 1,
      formulaId: "analysis.kettle_volume.v1",
      inputs: [
        { id: "preBoilVolumeLiters", value: { kind: "number", value: preBoilVolumeLiters, unit: "L" } },
        { id: "boilTimeHours", value: { kind: "number", value: boilTimeHours, unit: "h" } },
        { id: "evaporationRatePercentPerHour", value: { kind: "number", value: equipment.kettleBoilEvaporationRatePercentPerHour, unit: "percent_per_hour" } },
        { id: "coolingShrinkagePercent", value: { kind: "number", value: equipment.kettleCoolingShrinkagePercent, unit: "percent" } },
        { id: "kettleLossesLiters", value: { kind: "number", value: equipment.kettleLossesLiters, unit: "L" } },
        { id: "otherLossesLiters", value: { kind: "number", value: equipment.otherLossesLiters, unit: "L" } },
        { id: "kettleHopAbsorptionLiters", value: { kind: "number", value: kettleHopAbsorptionLiters, unit: "L" } },
      ],
      intermediates: [{ id: "kettleVolumeLiters", value: { kind: "number", value: kettleVolumeLiters, unit: "L" } }],
    };
  }

  if (ogEstimatedSg != null && kettleVolumeLiters != null) {
    derivations["analysis.og"] = {
      kind: "analysis.og",
      version: 1,
      formulaId: "analysis.og.v1",
      inputs: [
        { id: "kettleVolumeLiters", value: { kind: "number", value: kettleVolumeLiters, unit: "L" } },
        { id: "efficiencyPercent", value: { kind: "number", value: efficiencyPercent, unit: "percent" } },
      ],
      intermediates: [{ id: "ogEstimatedSg", value: { kind: "number", value: ogEstimatedSg, unit: "sg" } }],
    };
  }

  if (pbgEstimatedSg != null && preBoilVolumeLiters != null) {
    derivations["analysis.pbg"] = {
      kind: "analysis.pbg",
      version: 1,
      formulaId: "analysis.pbg.v1",
      inputs: [
        { id: "preBoilVolumeLiters", value: { kind: "number", value: preBoilVolumeLiters, unit: "L" } },
        { id: "efficiencyPercent", value: { kind: "number", value: efficiencyPercent, unit: "percent" } },
      ],
      intermediates: [{ id: "pbgEstimatedSg", value: { kind: "number", value: pbgEstimatedSg, unit: "sg" } }],
    };
  }

  if (attenuationEffectivePercent != null) {
    derivations["analysis.attenuation"] = {
      kind: "analysis.attenuation",
      version: 1,
      formulaId: "analysis.attenuation.v1",
      inputs: [],
      intermediates: [{ id: "attenuationEffectivePercent", value: { kind: "number", value: attenuationEffectivePercent, unit: "percent" } }],
    };
  }

  if (fgEstimatedSg != null && ogEstimatedSg != null && attenuationEffectivePercent != null) {
    derivations["analysis.fg"] = {
      kind: "analysis.fg",
      version: 1,
      formulaId: "analysis.fg.v1",
      inputs: [
        { id: "ogEstimatedSg", value: { kind: "number", value: ogEstimatedSg, unit: "sg" } },
        { id: "attenuationEffectivePercent", value: { kind: "number", value: attenuationEffectivePercent, unit: "percent" } },
      ],
      intermediates: [{ id: "fgEstimatedSg", value: { kind: "number", value: fgEstimatedSg, unit: "sg" } }],
    };
  }

  if (abvEstimatedPercent != null && ogEstimatedSg != null && fgEstimatedSg != null) {
    derivations["analysis.abv"] = {
      kind: "analysis.abv",
      version: 1,
      formulaId: "analysis.abv.v1",
      inputs: [
        { id: "ogEstimatedSg", value: { kind: "number", value: ogEstimatedSg, unit: "sg" } },
        { id: "fgEstimatedSg", value: { kind: "number", value: fgEstimatedSg, unit: "sg" } },
      ],
      intermediates: [{ id: "abvEstimatedPercent", value: { kind: "number", value: abvEstimatedPercent, unit: "percent" } }],
    };
  }

  if (ibuTinsethEstimated != null && ibuVolumeLiters != null && ibuGravitySg != null) {
    derivations["analysis.ibu_tinseth"] = {
      kind: "analysis.ibu_tinseth",
      version: 1,
      formulaId: "analysis.ibu_tinseth.v1",
      inputs: [
        { id: "postBoilVolumeLiters", value: { kind: "number", value: ibuVolumeLiters, unit: "L" } },
        { id: "boilGravitySg", value: { kind: "number", value: ibuGravitySg, unit: "sg" } },
      ],
      intermediates: [{ id: "ibuTinsethEstimated", value: { kind: "number", value: ibuTinsethEstimated, unit: "ibu" } }],
    };
  }

  if (ibuRagerEstimated != null && ibuVolumeLiters != null && ibuGravitySg != null) {
    derivations["analysis.ibu_rager"] = {
      kind: "analysis.ibu_rager",
      version: 1,
      formulaId: "analysis.ibu_rager.v1",
      inputs: [
        { id: "postBoilVolumeLiters", value: { kind: "number", value: ibuVolumeLiters, unit: "L" } },
        { id: "boilGravitySg", value: { kind: "number", value: ibuGravitySg, unit: "sg" } },
      ],
      intermediates: [{ id: "ibuRagerEstimated", value: { kind: "number", value: ibuRagerEstimated, unit: "ibu" } }],
    };
  }

  if (colorMcuEstimated != null && kettleVolumeLiters != null) {
    derivations["analysis.mcu"] = {
      kind: "analysis.mcu",
      version: 1,
      formulaId: "analysis.mcu.v1",
      inputs: [{ id: "postBoilVolumeLiters", value: { kind: "number", value: kettleVolumeLiters, unit: "L" } }],
      intermediates: [{ id: "mcu", value: { kind: "number", value: colorMcuEstimated, unit: "mcu" } }],
    };
  }

  if (colorSrmMoreyEstimated != null && colorMcuEstimated != null) {
    derivations["analysis.srm_morey"] = {
      kind: "analysis.srm_morey",
      version: 1,
      formulaId: "analysis.srm_morey.v1",
      inputs: [{ id: "mcu", value: { kind: "number", value: colorMcuEstimated, unit: "mcu" } }],
      intermediates: [{ id: "colorSrmMoreyEstimated", value: { kind: "number", value: colorSrmMoreyEstimated, unit: "srm" } }],
    };
  }

  if (colorSrmDanielsEstimated != null && colorMcuEstimated != null) {
    derivations["analysis.srm_daniels"] = {
      kind: "analysis.srm_daniels",
      version: 1,
      formulaId: "analysis.srm_daniels.v1",
      inputs: [{ id: "mcu", value: { kind: "number", value: colorMcuEstimated, unit: "mcu" } }],
      intermediates: [{ id: "colorSrmDanielsEstimated", value: { kind: "number", value: colorSrmDanielsEstimated, unit: "srm" } }],
    };
  }

  return {
    ok: true,
    version: 1,
    canonicalModels: { ibu: "tinseth", srm: "morey" },
    result,
    derivations: derivations,
    formatHints: analysisFormatHints,
  };
}

