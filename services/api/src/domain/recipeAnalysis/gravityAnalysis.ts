export interface GravityAnalysisWarning {
  code: string;
  message: string;
}

export interface GravityAnalysis {
  kettleVolumeLiters: number | null;
  preBoilVolumeLiters: number | null;
  ogEstimatedSg: number | null;
  pbgEstimatedSg: number | null;
  fgEstimatedSg: number | null;
  abvEstimatedPercent: number | null;
  attenuationEffectivePercent: number | null;
  warnings: GravityAnalysisWarning[];
}

interface ExtractedEquipment {
  kettleVolumeLiters: number | null;
  kettleLossesLiters: number;
  kettleBoilEvaporationRatePercentPerHour: number;
  kettleCoolingShrinkagePercent: number;
  kettleHopsAbsorptionLitersPerGram: number;
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

function safeNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function extractEquipment(ext: unknown): ExtractedEquipment {
  const e = ext && typeof ext === "object" && !Array.isArray(ext) ? (ext as any).equipment : null;
  const kettle = e && typeof e === "object" ? (e as any).kettle : null;
  const mash = e && typeof e === "object" ? (e as any).mash : null;
  const misc = e && typeof e === "object" ? (e as any).misc : null;

  const kettleVolumeLiters = safeNum(kettle?.kettleVolumeLiters);
  const kettleLossesLiters = safeNum(kettle?.kettleLossesLiters) ?? 0;
  const kettleBoilEvaporationRatePercentPerHour = safeNum(kettle?.kettleBoilEvaporationRatePercentPerHour) ?? 0;
  const kettleCoolingShrinkagePercent = safeNum(kettle?.kettleCoolingShrinkagePercent) ?? 0;
  const kettleHopsAbsorptionLitersPerGram = safeNum(kettle?.kettleHopsAbsorptionLiters) ?? 0;
  const mashEfficiencyPercent = safeNum(mash?.mashEfficiencyPercent);
  const otherLossesLiters = safeNum(misc?.otherLossesLiters) ?? 0;

  return {
    kettleVolumeLiters: kettleVolumeLiters != null && kettleVolumeLiters > 0 ? kettleVolumeLiters : null,
    kettleLossesLiters: Math.max(0, kettleLossesLiters),
    kettleBoilEvaporationRatePercentPerHour: clamp(kettleBoilEvaporationRatePercentPerHour, 0, 100),
    kettleCoolingShrinkagePercent: clamp(kettleCoolingShrinkagePercent, 0, 100),
    kettleHopsAbsorptionLitersPerGram: Math.max(0, kettleHopsAbsorptionLitersPerGram),
    mashEfficiencyPercent:
      mashEfficiencyPercent != null && mashEfficiencyPercent >= 0 && mashEfficiencyPercent <= 100
        ? mashEfficiencyPercent
        : null,
    otherLossesLiters: Math.max(0, otherLossesLiters),
  };
}

function extractBoilTimeHours(beerJsonRecipeJson: unknown): number {
  const r0 = (beerJsonRecipeJson as any)?.beerjson?.recipes?.[0];
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

  const overrides =
    args.recipeExtJson && typeof args.recipeExtJson === "object" && !Array.isArray(args.recipeExtJson)
      ? (args.recipeExtJson as any).yeastAttenuationOverridesPercent
      : null;

  const out: ExtractedYeastAttenuation[] = [];
  for (const c of list) {
    const id = typeof c?.id === "string" ? c.id : "";
    if (!id) continue;
    const attenuation = c?.attenuation?.unit === "%" ? safeNum(c?.attenuation?.value) : null;
    const overrideRaw = overrides && typeof overrides === "object" ? safeNum((overrides as any)[id]) : null;
    const overridePercent = overrideRaw != null ? clamp(overrideRaw, 0, 100) : null;
    out.push({
      id,
      attenuationPercent: attenuation != null ? clamp(attenuation, 0, 100) : null,
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
}): GravityAnalysis {
  const warnings: GravityAnalysisWarning[] = [];
  const equipment = extractEquipment(args.recipeExtJson);

  if (!args.beerJsonRecipeJson) {
    return {
      kettleVolumeLiters: equipment.kettleVolumeLiters,
      preBoilVolumeLiters: null,
      ogEstimatedSg: null,
      pbgEstimatedSg: null,
      fgEstimatedSg: null,
      abvEstimatedPercent: null,
      attenuationEffectivePercent: null,
      warnings: [{ code: "missing_beerjson", message: "Recipe is missing BeerJSON; cannot derive gravity estimates." }],
    };
  }

  const boilTimeHours = extractBoilTimeHours(args.beerJsonRecipeJson);
  const kettleHopMassGrams = extractKettleHopMassGrams(args.beerJsonRecipeJson);
  const kettleHopAbsorptionLiters = equipment.kettleHopsAbsorptionLitersPerGram * kettleHopMassGrams;

  const totalLossesLiters = equipment.kettleLossesLiters + kettleHopAbsorptionLiters + equipment.otherLossesLiters;

  const preBoilVolumeLiters = (() => {
    if (equipment.kettleVolumeLiters == null) return null;

    const shrink = clamp(equipment.kettleCoolingShrinkagePercent, 0, 99) / 100;
    const cooledVolumePlusLosses = equipment.kettleVolumeLiters + totalLossesLiters;
    const hotEndVolume = cooledVolumePlusLosses / (1 - shrink);

    const evapRate = clamp(equipment.kettleBoilEvaporationRatePercentPerHour, 0, 99) / 100;
    const denom = 1 - evapRate * boilTimeHours;
    if (!(denom > 0)) {
      warnings.push({
        code: "invalid_evaporation",
        message: "Boil evaporation rate/time imply zero or negative post-boil volume; check equipment inputs.",
      });
      return null;
    }
    return hotEndVolume / denom;
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
    warnings.push({ code: "missing_efficiency", message: "Missing efficiency; OG/PBG estimates require an efficiency %." });
  }

  const fermentables = extractFermentablesPpgAndPounds(args.beerJsonRecipeJson);
  if (!fermentables.length) {
    warnings.push({
      code: "missing_fermentables",
      message: "No fermentables with usable amount + yield/potential; cannot estimate OG/PBG.",
    });
  }

  const ogEstimatedSg =
    equipment.kettleVolumeLiters != null && fermentables.length && efficiencyPercent > 0
      ? estimateSgFromPpg({ fermentables, volumeLiters: equipment.kettleVolumeLiters, efficiencyPercent })
      : null;

  const pbgEstimatedSg =
    preBoilVolumeLiters != null && fermentables.length && efficiencyPercent > 0
      ? estimateSgFromPpg({ fermentables, volumeLiters: preBoilVolumeLiters, efficiencyPercent })
      : null;

  const yeasts = extractYeastAttenuations(args);
  const attenuationEffectivePercent = effectiveAttenuationPercent(yeasts);
  if (attenuationEffectivePercent == null) {
    warnings.push({
      code: "missing_attenuation",
      message: "Missing yeast attenuation; FG/ABV estimates require yeast attenuation or an override.",
    });
  }

  const fgEstimatedSg =
    ogEstimatedSg != null && attenuationEffectivePercent != null
      ? 1 + (ogEstimatedSg - 1) * (1 - attenuationEffectivePercent / 100)
      : null;

  const abvEstimatedPercent =
    ogEstimatedSg != null && fgEstimatedSg != null ? (ogEstimatedSg - fgEstimatedSg) * ABV_FACTOR : null;

  return {
    kettleVolumeLiters: equipment.kettleVolumeLiters,
    preBoilVolumeLiters,
    ogEstimatedSg,
    pbgEstimatedSg,
    fgEstimatedSg,
    abvEstimatedPercent,
    attenuationEffectivePercent,
    warnings,
  };
}

