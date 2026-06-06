import type { GravityAnalysisDerivationKind, WaterCalcDerivation } from "@umbraculum/brewery-contracts";
import type { YieldEfficiencyMetrics } from "./gravityAnalysisEfficiencyOps.js";

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
