import {
  computeMcu,
  srmDanielsFromMcu,
  srmMoreyFromMcu,
} from "./gravityAnalysisColorOps.js";
import {
  extractBatchSizeLiters,
  extractFermentablesForColor,
  extractHopAdditions,
} from "./gravityAnalysisExtractors.js";
import type { YieldEfficiencyMetrics } from "./gravityAnalysisEfficiencyOps.js";
import {
  effectiveAttenuationPercent,
  extractYeastAttenuations,
} from "./gravityAnalysisGravityOps.js";
import type { GravityAnalysisWarning } from "./gravityAnalysisHelpers.js";
import { ABV_FACTOR } from "./gravityAnalysisHelpers.js";
import { computeIbuRager, computeIbuTinseth } from "./gravityAnalysisIbuOps.js";

export type GravitySummaryMetrics = {
  boilTimeMinutes: number;
  ibuTinsethEstimated: number | null;
  ibuRagerEstimated: number | null;
  buGuRatio: number | null;
  colorSrmMoreyEstimated: number | null;
  colorSrmDanielsEstimated: number | null;
  fgEstimatedSg: number | null;
  abvEstimatedPercent: number | null;
  attenuationEffectivePercent: number | null;
  colorMcuEstimated: number | null;
  ibuVolumeLiters: number | null;
  ibuGravitySg: number | null;
};

export function computeGravitySummaryMetrics(args: {
  beerJsonRecipeJson: unknown;
  recipeExtJson: unknown;
  yieldMetrics: YieldEfficiencyMetrics;
  warnings: GravityAnalysisWarning[];
}): GravitySummaryMetrics {
  const { yieldMetrics, warnings } = args;
  const { kettleVolumeLiters, ogEstimatedSg, pbgEstimatedSg, boilTimeHours } = yieldMetrics;

  const hops = extractHopAdditions(args.beerJsonRecipeJson, args.recipeExtJson);

  const ibuVolumeLiters =
    kettleVolumeLiters ??
    (() => {
      const batchSize = extractBatchSizeLiters(args.beerJsonRecipeJson);
      if (batchSize != null) {
        warnings.push({ code: "used_batch_size_volume" });
      }
      return batchSize;
    })();

  const ibuGravitySg = pbgEstimatedSg ?? ogEstimatedSg;
  if (ibuGravitySg == null) {
    warnings.push({ code: "missing_ibu_gravity" });
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
    warnings.push({ code: "missing_attenuation" });
  }

  const fgEstimatedSg =
    ogEstimatedSg != null && attenuationEffectivePercent != null
      ? 1 + (ogEstimatedSg - 1) * (1 - attenuationEffectivePercent / 100)
      : null;

  const abvEstimatedPercent =
    ogEstimatedSg != null && fgEstimatedSg != null ? (ogEstimatedSg - fgEstimatedSg) * ABV_FACTOR : null;

  return {
    boilTimeMinutes: Math.round(boilTimeHours * 60),
    ibuTinsethEstimated,
    ibuRagerEstimated,
    buGuRatio,
    colorSrmMoreyEstimated,
    colorSrmDanielsEstimated,
    fgEstimatedSg,
    abvEstimatedPercent,
    attenuationEffectivePercent,
    colorMcuEstimated,
    ibuVolumeLiters,
    ibuGravitySg,
  };
}
