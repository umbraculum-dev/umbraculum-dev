import { isFiniteNumber, isObject } from "../../lib/typeGuards.js";
import {
  estimateSgFromPpg,
  extractBoilTimeHours,
  extractEquipment,
  extractFermentablesPpgAndPounds,
  extractKettleHopMassGrams,
} from "./gravityAnalysisGravityOps.js";
import type { ExtractedEquipment, GravityAnalysisWarning } from "./gravityAnalysisHelpers.js";
import {
  computeKettleVolumeLiters,
  computePreBoilVolumeLiters,
  resolveEfficiencyPercent,
} from "./gravityAnalysisEfficiencyVolumeOps.js";

export { appendEfficiencyDerivations } from "./gravityAnalysisEfficiencyDerivationOps.js";

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

export {
  computeKettleVolumeLiters,
  computePreBoilVolumeLiters,
  resolveEfficiencyPercent,
} from "./gravityAnalysisEfficiencyVolumeOps.js";
