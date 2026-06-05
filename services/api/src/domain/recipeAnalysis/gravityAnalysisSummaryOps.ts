import type { GravityAnalysisDerivationKind, WaterCalcDerivation } from "@umbraculum/contracts";
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
import type { GravityAnalysis, GravityAnalysisWarning } from "./gravityAnalysisHelpers.js";
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
  const { kettleVolumeLiters, preBoilVolumeLiters, ogEstimatedSg, pbgEstimatedSg, boilTimeHours } = yieldMetrics;

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

export function buildGravityAnalysisResult(
  yieldMetrics: YieldEfficiencyMetrics,
  summaryMetrics: GravitySummaryMetrics,
  warnings: GravityAnalysisWarning[],
): GravityAnalysis {
  return {
    boilTimeMinutes: summaryMetrics.boilTimeMinutes,
    kettleVolumeLiters: yieldMetrics.kettleVolumeLiters,
    preBoilVolumeLiters: yieldMetrics.preBoilVolumeLiters,
    ogEstimatedSg: yieldMetrics.ogEstimatedSg,
    pbgEstimatedSg: yieldMetrics.pbgEstimatedSg,
    ibuTinsethEstimated: summaryMetrics.ibuTinsethEstimated,
    ibuRagerEstimated: summaryMetrics.ibuRagerEstimated,
    buGuRatio: summaryMetrics.buGuRatio,
    colorSrmMoreyEstimated: summaryMetrics.colorSrmMoreyEstimated,
    colorSrmDanielsEstimated: summaryMetrics.colorSrmDanielsEstimated,
    fgEstimatedSg: summaryMetrics.fgEstimatedSg,
    abvEstimatedPercent: summaryMetrics.abvEstimatedPercent,
    attenuationEffectivePercent: summaryMetrics.attenuationEffectivePercent,
    warnings,
  };
}

export function appendSummaryDerivations(
  derivations: Partial<Record<GravityAnalysisDerivationKind, WaterCalcDerivation>>,
  yieldMetrics: YieldEfficiencyMetrics,
  summaryMetrics: GravitySummaryMetrics,
) {
  const { ogEstimatedSg, kettleVolumeLiters } = yieldMetrics;
  const {
    attenuationEffectivePercent,
    fgEstimatedSg,
    abvEstimatedPercent,
    ibuTinsethEstimated,
    ibuRagerEstimated,
    ibuVolumeLiters,
    ibuGravitySg,
    colorMcuEstimated,
    colorSrmMoreyEstimated,
    colorSrmDanielsEstimated,
  } = summaryMetrics;

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
}
