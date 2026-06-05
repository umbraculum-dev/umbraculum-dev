import type { GravityAnalysisDerivationKind, WaterCalcDerivation } from "@umbraculum/contracts";
import { isFiniteNumber, isObject } from "../../lib/typeGuards.js";
import { extractFirstRecipe, extractTotalGrainKg } from "./gravityAnalysisExtractors.js";
import {
  estimateSgFromPpg,
  extractBoilTimeHours,
  extractEquipment,
  extractFermentablesPpgAndPounds,
  extractKettleHopMassGrams,
} from "./gravityAnalysisGravityOps.js";
import type { ExtractedEquipment, GravityAnalysisWarning } from "./gravityAnalysisHelpers.js";
import { clamp, safeNum } from "./gravityAnalysisHelpers.js";

export type YieldEfficiencyMetrics = {
  equipment: ExtractedEquipment;
  boilTimeHours: number;
  kettleHopAbsorptionLiters: number;
  mashWaterVolumeLiters: number | null;
  spargeVolumeLiters: number | null;
  boilWaterVolumeLiters: number;
  preBoilVolumeLiters: number | null;
  kettleVolumeLiters: number | null;
  efficiencyPercent: number;
  ogEstimatedSg: number | null;
  pbgEstimatedSg: number | null;
};

export function computeYieldEfficiencyMetrics(args: {
  beerJsonRecipeJson: unknown;
  recipeExtJson: unknown;
  recipeWaterSettings: unknown;
  warnings: GravityAnalysisWarning[];
}): YieldEfficiencyMetrics {
  const equipment = extractEquipment(args.recipeExtJson);
  const water = isObject(args.recipeWaterSettings) ? args.recipeWaterSettings : null;

  const mashWaterVolumeLiters = isFiniteNumber(water?.['mashWaterVolumeLiters']) ? water['mashWaterVolumeLiters'] : null;
  const spargeVolumeLiters = isFiniteNumber(water?.['spargeVolumeLiters']) ? water['spargeVolumeLiters'] : null;
  const boilWaterVolumeLiters = isFiniteNumber(water?.['boilWaterVolumeLiters']) ? water['boilWaterVolumeLiters'] : 0;

  const boilTimeHours = extractBoilTimeHours({
    beerJsonRecipeJson: args.beerJsonRecipeJson,
    recipeExtJson: args.recipeExtJson,
  });

  const preBoilVolumeLiters = computePreBoilVolumeLiters({
    water,
    mashWaterVolumeLiters,
    spargeVolumeLiters,
    boilWaterVolumeLiters,
    equipment,
    beerJsonRecipeJson: args.beerJsonRecipeJson,
    warnings: args.warnings,
  });

  const kettleHopMassGrams = extractKettleHopMassGrams(args.beerJsonRecipeJson);
  const kettleHopAbsorptionLiters = equipment.kettleHopsAbsorptionLitersPerGram * kettleHopMassGrams;
  const kettleVolumeLiters = computeKettleVolumeLiters({
    preBoilVolumeLiters,
    boilTimeHours,
    equipment,
    kettleHopAbsorptionLiters,
    warnings: args.warnings,
  });

  const efficiencyPercent = resolveEfficiencyPercent({
    equipment,
    recipeExtJson: args.recipeExtJson,
    beerJsonRecipeJson: args.beerJsonRecipeJson,
    warnings: args.warnings,
  });

  const fermentables = extractFermentablesPpgAndPounds(args.beerJsonRecipeJson);
  if (!fermentables.length) {
    args.warnings.push({ code: "missing_fermentables" });
  }

  const ogEstimatedSg =
    kettleVolumeLiters != null && fermentables.length && efficiencyPercent > 0
      ? estimateSgFromPpg({ fermentables, volumeLiters: kettleVolumeLiters, efficiencyPercent })
      : null;

  const pbgEstimatedSg =
    preBoilVolumeLiters != null && fermentables.length && efficiencyPercent > 0
      ? estimateSgFromPpg({ fermentables, volumeLiters: preBoilVolumeLiters, efficiencyPercent })
      : null;

  return {
    equipment,
    boilTimeHours,
    kettleHopAbsorptionLiters,
    mashWaterVolumeLiters,
    spargeVolumeLiters,
    boilWaterVolumeLiters,
    preBoilVolumeLiters,
    kettleVolumeLiters,
    efficiencyPercent,
    ogEstimatedSg,
    pbgEstimatedSg,
  };
}

function computePreBoilVolumeLiters(args: {
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

function computeKettleVolumeLiters(args: {
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

function resolveEfficiencyPercent(args: {
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

export function appendEfficiencyDerivations(
  derivations: Partial<Record<GravityAnalysisDerivationKind, WaterCalcDerivation>>,
  metrics: YieldEfficiencyMetrics,
) {
  const {
    preBoilVolumeLiters,
    kettleVolumeLiters,
    mashWaterVolumeLiters,
    spargeVolumeLiters,
    boilWaterVolumeLiters,
    boilTimeHours,
    kettleHopAbsorptionLiters,
    equipment,
    efficiencyPercent,
    ogEstimatedSg,
    pbgEstimatedSg,
  } = metrics;

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
}
