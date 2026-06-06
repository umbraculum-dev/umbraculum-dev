import type { GravityAnalysisDerivationKind, WaterCalcDerivation } from "@umbraculum/brewery-contracts";
import type { YieldEfficiencyMetrics } from "./gravityAnalysisEfficiencyOps.js";
import type { GravityAnalysis, GravityAnalysisWarning } from "./gravityAnalysisHelpers.js";
import type { GravitySummaryMetrics } from "./gravityAnalysisSummaryOps.js";

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
