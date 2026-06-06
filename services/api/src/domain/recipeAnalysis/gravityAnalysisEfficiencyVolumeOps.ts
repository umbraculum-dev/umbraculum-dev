import { isObject } from "../../lib/typeGuards.js";
import { extractFirstRecipe, extractTotalGrainKg } from "./gravityAnalysisExtractors.js";
import type { ExtractedEquipment, GravityAnalysisWarning } from "./gravityAnalysisHelpers.js";
import { clamp, safeNum } from "./gravityAnalysisHelpers.js";

export function computePreBoilVolumeLiters(args: {
  water: Record<string, unknown> | null;
  mashWaterVolumeLiters: number | null;
  spargeVolumeLiters: number | null;
  boilWaterVolumeLiters: number;
  equipment: ExtractedEquipment;
  beerJsonRecipeJson: unknown;
  warnings: GravityAnalysisWarning[];
}): number | null {
  if (!args.water) {
    args.warnings.push({ code: "missing_water_settings" });
    return null;
  }
  if (args.mashWaterVolumeLiters == null || args.spargeVolumeLiters == null) {
    args.warnings.push({ code: "missing_water_volumes" });
    return null;
  }
  const totalGrainKg = extractTotalGrainKg(args.beerJsonRecipeJson);
  const grainAbsorptionLiters = args.equipment.mashGrainAbsorptionLPerKg * totalGrainKg;
  const runoffLiters =
    args.mashWaterVolumeLiters +
    args.spargeVolumeLiters -
    grainAbsorptionLiters -
    args.equipment.mashLossesLiters -
    args.equipment.mashWaterLeftoverLiters;

  if (!(runoffLiters > 0)) {
    args.warnings.push({ code: "invalid_runoff_volume" });
    return null;
  }

  const preBoil = runoffLiters + Math.max(0, args.boilWaterVolumeLiters);
  return preBoil > 0 ? preBoil : null;
}

export function computeKettleVolumeLiters(args: {
  preBoilVolumeLiters: number | null;
  boilTimeHours: number;
  equipment: ExtractedEquipment;
  kettleHopAbsorptionLiters: number;
  warnings: GravityAnalysisWarning[];
}): number | null {
  if (args.preBoilVolumeLiters == null) return null;

  const evapRate = clamp(args.equipment.kettleBoilEvaporationRatePercentPerHour, 0, 99) / 100;
  const denom = 1 - evapRate * args.boilTimeHours;
  if (!(denom > 0)) {
    args.warnings.push({ code: "invalid_evaporation" });
    return null;
  }

  const postBoilHotVolume = args.preBoilVolumeLiters * denom;
  const shrink = clamp(args.equipment.kettleCoolingShrinkagePercent, 0, 99) / 100;
  const cooledVolume = postBoilHotVolume * (1 - shrink);

  const totalKettleLossesLiters =
    args.equipment.kettleLossesLiters + args.kettleHopAbsorptionLiters + args.equipment.otherLossesLiters;
  const out = cooledVolume - totalKettleLossesLiters;
  if (!(out > 0)) {
    args.warnings.push({ code: "invalid_kettle_volume" });
    return null;
  }

  if (args.equipment.kettleCapacityLiters != null && out > args.equipment.kettleCapacityLiters) {
    args.warnings.push({ code: "exceeds_kettle_capacity" });
  }

  return out;
}

export function resolveEfficiencyPercent(args: {
  equipment: ExtractedEquipment;
  recipeExtJson: unknown;
  beerJsonRecipeJson: unknown;
  warnings: GravityAnalysisWarning[];
}): number {
  const efficiencyPercent =
    args.equipment.mashEfficiencyPercent ??
    (isObject(args.recipeExtJson) ? safeNum(args.recipeExtJson['brewhouseEfficiencyPercent']) : null) ??
    (() => {
      const r0 = extractFirstRecipe(args.beerJsonRecipeJson);
      const efficiency = r0 && isObject(r0['efficiency']) ? r0['efficiency'] : null;
      const brewhouse = isObject(efficiency?.['brewhouse']) ? efficiency['brewhouse'] : null;
      return brewhouse?.['unit'] === "%" ? safeNum(brewhouse['value']) : null;
    })() ??
    0;

  if (!(efficiencyPercent > 0)) {
    args.warnings.push({ code: "missing_efficiency" });
  }

  return efficiencyPercent;
}
