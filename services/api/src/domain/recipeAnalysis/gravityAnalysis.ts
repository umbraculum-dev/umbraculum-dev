import type { GravityAnalysisResponseV1, GravityAnalysisWarningCode } from "@brewery/contracts";
import { analysisFormatHints } from "@brewery/contracts";
import type { WaterCalcDerivation } from "../waterCalc/derivation/types.js";

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
  const r0 = (beerJsonRecipeJson as any)?.beerjson?.recipes?.[0];
  const unit = typeof r0?.batch_size?.unit === "string" ? r0.batch_size.unit : "";
  const value = safeNum(r0?.batch_size?.value);
  if (value == null || !(value > 0)) return null;
  if (unit === "l") return value;
  if (unit === "ml") return value / 1000;
  return null;
}

function extractFermentablesForColor(beerJsonRecipeJson: unknown): { rows: ExtractedFermentableForColor[]; hasMissingColor: boolean } {
  const r0 = (beerJsonRecipeJson as any)?.beerjson?.recipes?.[0];
  const ferms = r0?.ingredients?.fermentable_additions;
  const list = Array.isArray(ferms) ? ferms : [];

  const rows: ExtractedFermentableForColor[] = [];
  let hasMissingColor = false;

  for (const f of list) {
    const amountKg =
      f?.amount?.unit === "kg"
        ? safeNum(f?.amount?.value)
        : f?.amount?.unit === "g"
          ? (safeNum(f?.amount?.value) ?? 0) / 1000
          : null;
    if (amountKg == null || !(amountKg > 0)) continue;

    const colorLovibond =
      f?.color?.unit === "Lovi" && typeof f?.color?.value === "number" && Number.isFinite(f.color.value) ? f.color.value : null;
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
  const ext = recipeExtJson && typeof recipeExtJson === "object" && !Array.isArray(recipeExtJson) ? (recipeExtJson as any) : null;
  const raw = ext?.hopFormOverrides;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: Record<string, HopForm> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k !== "string" || !k.trim()) continue;
    if (v === "debittered_leaf") out[k] = "debittered_leaf";
    if (v === "hop_extract") out[k] = "hop_extract";
  }
  return Object.keys(out).length ? out : null;
}

function extractHopAdditions(beerJsonRecipeJson: unknown, recipeExtJson: unknown): ExtractedHopAddition[] {
  const r0 = (beerJsonRecipeJson as any)?.beerjson?.recipes?.[0];
  const hops = r0?.ingredients?.hop_additions;
  const list = Array.isArray(hops) ? hops : [];
  const overrides = extractHopFormOverrides(recipeExtJson);

  const out: ExtractedHopAddition[] = [];
  for (const h of list) {
    const id = typeof h?.id === "string" ? h.id : null;
    const name = typeof h?.name === "string" ? h.name : null;
    const override = id && overrides ? overrides[id] : null;
    const formRaw = typeof h?.form === "string" ? h.form : "";
    const formFromBeerJson: HopForm | null =
      formRaw === "extract" || formRaw === "leaf" || formRaw === "leaf (wet)" || formRaw === "pellet" || formRaw === "powder" || formRaw === "plug"
        ? (formRaw as HopForm)
        : null;
    const form: HopForm | null = override ?? formFromBeerJson;

    const timingUse = typeof h?.timing?.use === "string" ? h.timing.use : "";
    const savedUseRaw = typeof h?.brewery_app_use === "string" ? h.brewery_app_use : "";
    const savedUse: HopUse | null =
      savedUseRaw === "boil" || savedUseRaw === "whirlpool" || savedUseRaw === "dryhop" ? savedUseRaw : null;
    const use: HopUse =
      timingUse === "add_to_fermentation"
        ? "dryhop"
        : savedUse != null
          ? savedUse
          : "boil";

    const timeMinutes = h?.timing?.duration?.unit === "min" ? safeNum(h?.timing?.duration?.value) : null;

    const amountUnit = typeof h?.amount?.unit === "string" ? h.amount.unit : "";
    const amountValue = safeNum(h?.amount?.value);
    const amountGrams =
      amountValue != null && amountValue >= 0
        ? amountUnit === "g"
          ? amountValue
          : amountUnit === "kg"
            ? amountValue * 1000
            : null
        : null;

    const alphaAcidPercent = h?.alpha_acid?.unit === "%" ? safeNum(h?.alpha_acid?.value) : null;

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
  const e = ext && typeof ext === "object" && !Array.isArray(ext) ? (ext as any).equipment : null;
  const kettle = e && typeof e === "object" ? (e as any).kettle : null;
  const mash = e && typeof e === "object" ? (e as any).mash : null;
  const misc = e && typeof e === "object" ? (e as any).misc : null;

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
  const override =
    args.recipeExtJson && typeof args.recipeExtJson === "object" && !Array.isArray(args.recipeExtJson)
      ? (args.recipeExtJson as any).boilTimeMinutesOverride
      : null;
  if (typeof override === "number" && Number.isFinite(override) && override >= 0) {
    return override / 60;
  }
  const r0 = (args.beerJsonRecipeJson as any)?.beerjson?.recipes?.[0];
  const hops = r0?.ingredients?.hop_additions;
  const list = Array.isArray(hops) ? hops : [];
  let maxMinutes = 0;
  for (const h of list) {
    const use = typeof h?.timing?.use === "string" ? h.timing.use : "";
    if (use !== "add_to_boil") continue;
    const minutes = h?.timing?.duration?.unit === "min" ? safeNum(h?.timing?.duration?.value) : null;
    if (minutes != null && minutes > maxMinutes) maxMinutes = minutes;
  }
  const inferredMinutes = maxMinutes > 0 ? maxMinutes : 60;
  return inferredMinutes / 60;
}

function extractKettleHopMassGrams(beerJsonRecipeJson: unknown): number {
  const r0 = (beerJsonRecipeJson as any)?.beerjson?.recipes?.[0];
  const hops = r0?.ingredients?.hop_additions;
  const list = Array.isArray(hops) ? hops : [];
  let totalGrams = 0;
  for (const h of list) {
    const use = typeof h?.timing?.use === "string" ? h.timing.use : "";
    if (use !== "add_to_boil") continue;
    const unit = typeof h?.amount?.unit === "string" ? h.amount.unit : "";
    const value = safeNum(h?.amount?.value);
    if (value == null || !(value > 0)) continue;
    if (unit === "g") totalGrams += value;
    if (unit === "kg") totalGrams += value * 1000;
  }
  return Math.max(0, totalGrams);
}

function extractTotalGrainKg(beerJsonRecipeJson: unknown): number {
  const r0 = (beerJsonRecipeJson as any)?.beerjson?.recipes?.[0];
  const ferms = r0?.ingredients?.fermentable_additions;
  const list = Array.isArray(ferms) ? ferms : [];
  let totalKg = 0;
  for (const f of list) {
    const type = typeof f?.type === "string" ? f.type.trim().toLowerCase() : "";
    if (type !== "grain") continue;
    const unit = typeof f?.amount?.unit === "string" ? f.amount.unit : "";
    const value = safeNum(f?.amount?.value);
    if (value == null || !(value > 0)) continue;
    if (unit === "kg") totalKg += value;
    if (unit === "g") totalKg += value / 1000;
  }
  return Math.max(0, totalKg);
}

function extractFermentablesPpgAndPounds(beerJsonRecipeJson: unknown): Array<{ ppg: number; pounds: number }> {
  const r0 = (beerJsonRecipeJson as any)?.beerjson?.recipes?.[0];
  const ferms = r0?.ingredients?.fermentable_additions;
  const list = Array.isArray(ferms) ? ferms : [];
  const out: Array<{ ppg: number; pounds: number }> = [];

  for (const f of list) {
    const amountKg =
      f?.amount?.unit === "kg"
        ? safeNum(f?.amount?.value)
        : f?.amount?.unit === "g"
          ? (safeNum(f?.amount?.value) ?? 0) / 1000
          : null;
    if (amountKg == null || !(amountKg > 0)) continue;

    const potentialSg = f?.yield?.potential?.unit === "sg" ? safeNum(f?.yield?.potential?.value) : null;
    const yieldPercent = f?.yield?.fine_grind?.unit === "%" ? safeNum(f?.yield?.fine_grind?.value) : null;

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
  const r0 = (args.beerJsonRecipeJson as any)?.beerjson?.recipes?.[0];
  const cultures = r0?.ingredients?.culture_additions;
  const list = Array.isArray(cultures) ? cultures : [];

  const ext =
    args.recipeExtJson && typeof args.recipeExtJson === "object" && !Array.isArray(args.recipeExtJson)
      ? (args.recipeExtJson as Record<string, unknown>)
      : null;
  const overrides = ext?.yeastAttenuationOverridesPercent;
  const rangeMap = ext?.yeastAttenuationRange;

  const out: ExtractedYeastAttenuation[] = [];
  for (const c of list) {
    const id = typeof c?.id === "string" ? c.id : "";
    if (!id) continue;
    const beerJsonAtt = c?.attenuation?.unit === "%" ? safeNum(c?.attenuation?.value) : null;
    const rangeEntry =
      rangeMap && typeof rangeMap === "object" && !Array.isArray(rangeMap) ? (rangeMap as Record<string, unknown>)[id] : null;
    const rangeMin =
      rangeEntry && typeof rangeEntry === "object" && !Array.isArray(rangeEntry) && typeof (rangeEntry as any).min === "number" && Number.isFinite((rangeEntry as any).min)
        ? (rangeEntry as any).min
        : null;
    const rangeMax =
      rangeEntry && typeof rangeEntry === "object" && !Array.isArray(rangeEntry) && typeof (rangeEntry as any).max === "number" && Number.isFinite((rangeEntry as any).max)
        ? (rangeEntry as any).max
        : null;
    const rangeAvg =
      rangeMin != null && rangeMax != null ? (rangeMin + rangeMax) / 2 : null;
    const attenuationPercent =
      beerJsonAtt != null ? clamp(beerJsonAtt, 0, 100) : rangeAvg != null ? clamp(rangeAvg, 0, 100) : null;
    const overrideRaw = overrides && typeof overrides === "object" ? safeNum((overrides as any)[id]) : null;
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

  const water = args.recipeWaterSettings && typeof args.recipeWaterSettings === "object" && !Array.isArray(args.recipeWaterSettings)
    ? (args.recipeWaterSettings as any)
    : null;

  const mashWaterVolumeLiters = typeof water?.mashWaterVolumeLiters === "number" && Number.isFinite(water.mashWaterVolumeLiters)
    ? water.mashWaterVolumeLiters
    : null;
  const spargeVolumeLiters = typeof water?.spargeVolumeLiters === "number" && Number.isFinite(water.spargeVolumeLiters)
    ? water.spargeVolumeLiters
    : null;
  const boilWaterVolumeLiters = typeof water?.boilWaterVolumeLiters === "number" && Number.isFinite(water.boilWaterVolumeLiters)
    ? water.boilWaterVolumeLiters
    : 0;

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
    (args.recipeExtJson && typeof args.recipeExtJson === "object" && !Array.isArray(args.recipeExtJson)
      ? safeNum((args.recipeExtJson as any).brewhouseEfficiencyPercent)
      : null) ??
    (() => {
      const r0 = (args.beerJsonRecipeJson as any)?.beerjson?.recipes?.[0];
      const eff = r0?.efficiency?.brewhouse?.unit === "%" ? safeNum(r0?.efficiency?.brewhouse?.value) : null;
      return eff;
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

  const derivations: Record<string, WaterCalcDerivation> = {};

  if (preBoilVolumeLiters != null && mashWaterVolumeLiters != null && spargeVolumeLiters != null) {
    derivations["analysis.pre_boil_volume"] = {
      kind: "analysis.pre_boil_volume" as any,
      version: 1,
      formulaId: "analysis.pre_boil_volume.v1",
      inputs: [
        { id: "mashWaterVolumeLiters", value: { kind: "number", value: mashWaterVolumeLiters, unit: "L" } },
        { id: "spargeVolumeLiters", value: { kind: "number", value: spargeVolumeLiters, unit: "L" } },
        { id: "boilWaterVolumeLiters", value: { kind: "number", value: boilWaterVolumeLiters, unit: "L" } },
        { id: "mashLossesLiters", value: { kind: "number", value: equipment.mashLossesLiters, unit: "L" } },
        { id: "mashWaterLeftoverLiters", value: { kind: "number", value: equipment.mashWaterLeftoverLiters, unit: "L" } },
        { id: "mashGrainAbsorptionLPerKg", value: { kind: "number", value: equipment.mashGrainAbsorptionLPerKg, unit: "L_per_kg" as any } },
      ],
      intermediates: [{ id: "preBoilVolumeLiters", value: { kind: "number", value: preBoilVolumeLiters, unit: "L" } }],
    };
  }

  if (kettleVolumeLiters != null && preBoilVolumeLiters != null) {
    derivations["analysis.kettle_volume"] = {
      kind: "analysis.kettle_volume" as any,
      version: 1,
      formulaId: "analysis.kettle_volume.v1",
      inputs: [
        { id: "preBoilVolumeLiters", value: { kind: "number", value: preBoilVolumeLiters, unit: "L" } },
        { id: "boilTimeHours", value: { kind: "number", value: boilTimeHours, unit: "h" as any } },
        { id: "evaporationRatePercentPerHour", value: { kind: "number", value: equipment.kettleBoilEvaporationRatePercentPerHour, unit: "percent_per_hour" as any } },
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
      kind: "analysis.og" as any,
      version: 1,
      formulaId: "analysis.og.v1",
      inputs: [
        { id: "kettleVolumeLiters", value: { kind: "number", value: kettleVolumeLiters, unit: "L" } },
        { id: "efficiencyPercent", value: { kind: "number", value: efficiencyPercent, unit: "percent" } },
      ],
      intermediates: [{ id: "ogEstimatedSg", value: { kind: "number", value: ogEstimatedSg, unit: "sg" as any } }],
    };
  }

  if (pbgEstimatedSg != null && preBoilVolumeLiters != null) {
    derivations["analysis.pbg"] = {
      kind: "analysis.pbg" as any,
      version: 1,
      formulaId: "analysis.pbg.v1",
      inputs: [
        { id: "preBoilVolumeLiters", value: { kind: "number", value: preBoilVolumeLiters, unit: "L" } },
        { id: "efficiencyPercent", value: { kind: "number", value: efficiencyPercent, unit: "percent" } },
      ],
      intermediates: [{ id: "pbgEstimatedSg", value: { kind: "number", value: pbgEstimatedSg, unit: "sg" as any } }],
    };
  }

  if (attenuationEffectivePercent != null) {
    derivations["analysis.attenuation"] = {
      kind: "analysis.attenuation" as any,
      version: 1,
      formulaId: "analysis.attenuation.v1",
      inputs: [],
      intermediates: [{ id: "attenuationEffectivePercent", value: { kind: "number", value: attenuationEffectivePercent, unit: "percent" } }],
    };
  }

  if (fgEstimatedSg != null && ogEstimatedSg != null && attenuationEffectivePercent != null) {
    derivations["analysis.fg"] = {
      kind: "analysis.fg" as any,
      version: 1,
      formulaId: "analysis.fg.v1",
      inputs: [
        { id: "ogEstimatedSg", value: { kind: "number", value: ogEstimatedSg, unit: "sg" as any } },
        { id: "attenuationEffectivePercent", value: { kind: "number", value: attenuationEffectivePercent, unit: "percent" } },
      ],
      intermediates: [{ id: "fgEstimatedSg", value: { kind: "number", value: fgEstimatedSg, unit: "sg" as any } }],
    };
  }

  if (abvEstimatedPercent != null && ogEstimatedSg != null && fgEstimatedSg != null) {
    derivations["analysis.abv"] = {
      kind: "analysis.abv" as any,
      version: 1,
      formulaId: "analysis.abv.v1",
      inputs: [
        { id: "ogEstimatedSg", value: { kind: "number", value: ogEstimatedSg, unit: "sg" as any } },
        { id: "fgEstimatedSg", value: { kind: "number", value: fgEstimatedSg, unit: "sg" as any } },
      ],
      intermediates: [{ id: "abvEstimatedPercent", value: { kind: "number", value: abvEstimatedPercent, unit: "percent" } }],
    };
  }

  if (ibuTinsethEstimated != null && ibuVolumeLiters != null && ibuGravitySg != null) {
    derivations["analysis.ibu_tinseth"] = {
      kind: "analysis.ibu_tinseth" as any,
      version: 1,
      formulaId: "analysis.ibu_tinseth.v1",
      inputs: [
        { id: "postBoilVolumeLiters", value: { kind: "number", value: ibuVolumeLiters, unit: "L" } },
        { id: "boilGravitySg", value: { kind: "number", value: ibuGravitySg, unit: "sg" as any } },
      ],
      intermediates: [{ id: "ibuTinsethEstimated", value: { kind: "number", value: ibuTinsethEstimated, unit: "ibu" as any } }],
    };
  }

  if (ibuRagerEstimated != null && ibuVolumeLiters != null && ibuGravitySg != null) {
    derivations["analysis.ibu_rager"] = {
      kind: "analysis.ibu_rager" as any,
      version: 1,
      formulaId: "analysis.ibu_rager.v1",
      inputs: [
        { id: "postBoilVolumeLiters", value: { kind: "number", value: ibuVolumeLiters, unit: "L" } },
        { id: "boilGravitySg", value: { kind: "number", value: ibuGravitySg, unit: "sg" as any } },
      ],
      intermediates: [{ id: "ibuRagerEstimated", value: { kind: "number", value: ibuRagerEstimated, unit: "ibu" as any } }],
    };
  }

  if (colorMcuEstimated != null && kettleVolumeLiters != null) {
    derivations["analysis.mcu"] = {
      kind: "analysis.mcu" as any,
      version: 1,
      formulaId: "analysis.mcu.v1",
      inputs: [{ id: "postBoilVolumeLiters", value: { kind: "number", value: kettleVolumeLiters, unit: "L" } }],
      intermediates: [{ id: "mcu", value: { kind: "number", value: colorMcuEstimated, unit: "mcu" as any } }],
    };
  }

  if (colorSrmMoreyEstimated != null && colorMcuEstimated != null) {
    derivations["analysis.srm_morey"] = {
      kind: "analysis.srm_morey" as any,
      version: 1,
      formulaId: "analysis.srm_morey.v1",
      inputs: [{ id: "mcu", value: { kind: "number", value: colorMcuEstimated, unit: "mcu" as any } }],
      intermediates: [{ id: "colorSrmMoreyEstimated", value: { kind: "number", value: colorSrmMoreyEstimated, unit: "srm" as any } }],
    };
  }

  if (colorSrmDanielsEstimated != null && colorMcuEstimated != null) {
    derivations["analysis.srm_daniels"] = {
      kind: "analysis.srm_daniels" as any,
      version: 1,
      formulaId: "analysis.srm_daniels.v1",
      inputs: [{ id: "mcu", value: { kind: "number", value: colorMcuEstimated, unit: "mcu" as any } }],
      intermediates: [{ id: "colorSrmDanielsEstimated", value: { kind: "number", value: colorSrmDanielsEstimated, unit: "srm" as any } }],
    };
  }

  return {
    ok: true,
    version: 1,
    canonicalModels: { ibu: "tinseth", srm: "morey" },
    result,
    derivations: derivations as any,
    formatHints: analysisFormatHints,
  };
}

