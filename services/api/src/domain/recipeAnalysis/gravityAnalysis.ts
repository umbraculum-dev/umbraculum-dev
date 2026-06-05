import type {
  GravityAnalysisDerivationKind,
  GravityAnalysisResponseV1,
  WaterCalcDerivation,
} from "@umbraculum/contracts";
import { analysisFormatHints } from "@umbraculum/contracts";
import { isFiniteNumber, isObject } from "../../lib/typeGuards.js";
import {
  computeMcu,
  srmDanielsFromMcu,
  srmMoreyFromMcu,
} from "./gravityAnalysisColorOps.js";
import {
  extractBatchSizeLiters,
  extractFermentablesForColor,
  extractHopAdditions,
  extractTotalGrainKg,
} from "./gravityAnalysisExtractors.js";
import {
  effectiveAttenuationPercent,
  estimateSgFromPpg,
  extractBoilTimeHours,
  extractEquipment,
  extractFermentablesPpgAndPounds,
  extractKettleHopMassGrams,
  extractYeastAttenuations,
} from "./gravityAnalysisGravityOps.js";
import type { GravityAnalysis, GravityAnalysisWarning } from "./gravityAnalysisHelpers.js";
import { clamp, safeNum, ABV_FACTOR } from "./gravityAnalysisHelpers.js";
import { computeIbuRager, computeIbuTinseth } from "./gravityAnalysisIbuOps.js";
import { extractFirstRecipe } from "./gravityAnalysisExtractors.js";

export type { GravityAnalysis, GravityAnalysisWarning } from "./gravityAnalysisHelpers.js";

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

  const water = isObject(args.recipeWaterSettings) ? args.recipeWaterSettings : null;

  const mashWaterVolumeLiters = isFiniteNumber(water?.['mashWaterVolumeLiters']) ? water['mashWaterVolumeLiters'] : null;
  const spargeVolumeLiters = isFiniteNumber(water?.['spargeVolumeLiters']) ? water['spargeVolumeLiters'] : null;
  const boilWaterVolumeLiters = isFiniteNumber(water?.['boilWaterVolumeLiters']) ? water['boilWaterVolumeLiters'] : 0;

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
    (isObject(args.recipeExtJson) ? safeNum(args.recipeExtJson['brewhouseEfficiencyPercent']) : null) ??
    (() => {
      const r0 = extractFirstRecipe(args.beerJsonRecipeJson);
      const efficiency = r0 && isObject(r0['efficiency']) ? r0['efficiency'] : null;
      const brewhouse = isObject(efficiency?.['brewhouse']) ? efficiency['brewhouse'] : null;
      return brewhouse?.['unit'] === "%" ? safeNum(brewhouse['value']) : null;
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

  const derivations: Partial<Record<GravityAnalysisDerivationKind, WaterCalcDerivation>> = {};

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

  return {
    ok: true,
    version: 1,
    canonicalModels: { ibu: "tinseth", srm: "morey" },
    result,
    derivations: derivations,
    formatHints: analysisFormatHints,
  };
}

