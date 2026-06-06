import type { GravityAnalysisDerivationKind, GravityAnalysisResponseV1, WaterCalcDerivation } from "@umbraculum/brewery-contracts";
import { analysisFormatHints } from "@umbraculum/contracts";
import {
  appendEfficiencyDerivations,
  computeYieldEfficiencyMetrics,
} from "./gravityAnalysisEfficiencyOps.js";
import type { GravityAnalysis, GravityAnalysisWarning } from "./gravityAnalysisHelpers.js";
import {
  appendSummaryDerivations,
  buildGravityAnalysisResult,
  computeGravitySummaryMetrics,
} from "./gravityAnalysisSummaryOps.js";

export type { GravityAnalysis, GravityAnalysisWarning } from "./gravityAnalysisHelpers.js";

export function computeRecipeGravityAnalysis(args: {
  beerJsonRecipeJson: unknown;
  recipeExtJson: unknown;
  recipeWaterSettings: unknown;
}): GravityAnalysisResponseV1 {
  const warnings: GravityAnalysisWarning[] = [];

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

  const yieldMetrics = computeYieldEfficiencyMetrics({
    beerJsonRecipeJson: args.beerJsonRecipeJson,
    recipeExtJson: args.recipeExtJson,
    recipeWaterSettings: args.recipeWaterSettings,
    warnings,
  });

  const summaryMetrics = computeGravitySummaryMetrics({
    beerJsonRecipeJson: args.beerJsonRecipeJson,
    recipeExtJson: args.recipeExtJson,
    yieldMetrics,
    warnings,
  });

  const result = buildGravityAnalysisResult(yieldMetrics, summaryMetrics, warnings);

  const derivations: Partial<Record<GravityAnalysisDerivationKind, WaterCalcDerivation>> = {};
  appendEfficiencyDerivations(derivations, yieldMetrics);
  appendSummaryDerivations(derivations, yieldMetrics, summaryMetrics);

  return {
    ok: true,
    version: 1,
    canonicalModels: { ibu: "tinseth", srm: "morey" },
    result,
    derivations,
    formatHints: analysisFormatHints,
  };
}
