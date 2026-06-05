import { DEFAULT_MASH_TARGET_PH } from "@umbraculum/brewery-core";

import { BadRequestError } from "../../../../errors.js";
import {
  spargeAcidification as spargeAcidificationCalc,
} from "../../../../domain/waterCalc/spargeAcidification.js";
import { spargeAcidificationManual } from "../../../../domain/waterCalc/spargeAcidificationManual.js";
import { mashAcidificationManual } from "../../../../domain/waterCalc/mashAcidificationManual.js";
import { mashPhEstimate, type MashPhEstimateInput } from "../../../../domain/waterCalc/mashPhEstimate.js";
import { mashAcidificationTargetMashPh } from "../../../../domain/waterCalc/mashAcidificationTargetMashPh.js";
import { defaultMashDiPh, defaultMashTaToPh57_mEqPerKg } from "../../../../domain/waterCalc/mashPhDefaultsV1.js";
import { applySaltAdditions } from "../../../../domain/waterCalc/saltAdditions.js";
import {
  alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult,
  combineAfterSaltsAndAcid,
} from "../../../../domain/waterCalc/overall.js";
import {
  colorLovibondToEbc,
  mashPhModelKeyFromMaltClass,
  parseAcidTypeAndStrength,
  parseBaseProfile,
  parseSaltAdditions,
  waterCalcWithDerivationResponse,
} from "./waterCalcHelpers.js";

export function mashOverall(body: Record<string, unknown>) {
  const mashMode = body["mashMode"] === "manual" ? "manual" : "targetPh";
  const startingAlkalinityPpmCaCO3 =
    typeof body["mashStartingAlkalinityPpmCaCO3"] === "number"
      ? body["mashStartingAlkalinityPpmCaCO3"]
      : typeof body["startingAlkalinityPpmCaCO3"] === "number"
        ? body["startingAlkalinityPpmCaCO3"]
        : 0;
  const startingPh =
    typeof body["mashStartingPh"] === "number"
      ? body["mashStartingPh"]
      : typeof body["startingPh"] === "number"
        ? body["startingPh"]
        : 7.0;
  const targetPh =
    typeof body["mashTargetPh"] === "number"
      ? body["mashTargetPh"]
      : typeof body["targetPh"] === "number"
        ? body["targetPh"]
        : DEFAULT_MASH_TARGET_PH;
  const volumeLiters =
    typeof body["mashWaterVolumeLiters"] === "number"
      ? body["mashWaterVolumeLiters"]
      : typeof body["volumeLiters"] === "number"
        ? body["volumeLiters"]
        : NaN;
  if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
    throw new BadRequestError("invalid_volume_liters", "Body.mashWaterVolumeLiters must be > 0");
  }

  const baseProfile = parseBaseProfile(body);
  const additions = parseSaltAdditions(body);

  const salts = applySaltAdditions(baseProfile, volumeLiters, additions);

  const { acidType, strength } = parseAcidTypeAndStrength(body);

  let acid;
  let phKind: "target" | "estimated" = "target";
  let phValue = targetPh;

  const gristRaw = body["grist"];
  const hasGrist = Array.isArray(gristRaw) && gristRaw.length > 0;
  const grist: Array<{
    amountKg: number;
    colorLovibond: number | null;
    maltClass: "base" | "crystal" | "roast" | "acid";
    mashDiPh?: number | null | undefined;
    mashTaToPh57_mEqPerKg?: number | null | undefined;
  }> | null = hasGrist
    ? (gristRaw as unknown[]).map((row, idx) => {
      const o = (row ?? {}) as Record<string, unknown>;
      const amountKg = typeof o["amountKg"] === "number" ? o["amountKg"] : NaN;
      if (!Number.isFinite(amountKg) || !(amountKg > 0)) {
        throw new BadRequestError("invalid_grist_row_amount", `Body.grist[${idx}].amountKg must be a number > 0`);
      }
      const colorRaw = o["colorLovibond"];
      const colorLovibond =
        colorRaw === null || colorRaw === undefined ? null : typeof colorRaw === "number" ? colorRaw : NaN;
      if (typeof colorLovibond === "number" && (!Number.isFinite(colorLovibond) || colorLovibond < 0)) {
        throw new BadRequestError("invalid_grist_row_color", `Body.grist[${idx}].colorLovibond must be null or a number >= 0`);
      }
      const maltClassRaw = o["maltClass"];
      const maltClass =
        maltClassRaw === "base" || maltClassRaw === "crystal" || maltClassRaw === "roast" || maltClassRaw === "acid"
          ? maltClassRaw
          : "base";
      const mashDiPh = typeof o["mashDiPh"] === "number" ? o["mashDiPh"] : o["mashDiPh"] === null ? null : undefined;
      const mashTaToPh57_mEqPerKg =
        typeof o["mashTaToPh57_mEqPerKg"] === "number"
          ? o["mashTaToPh57_mEqPerKg"]
          : o["mashTaToPh57_mEqPerKg"] === null
            ? null
            : undefined;
      return { amountKg, colorLovibond, maltClass, mashDiPh, mashTaToPh57_mEqPerKg };
    })
    : null;

  const mashPhEstimateGrist =
    grist?.map((r) => {
      const modelKey = mashPhModelKeyFromMaltClass(r.maltClass);
      const colorEbc = colorLovibondToEbc(r.colorLovibond);
      const mashDiPh = typeof r.mashDiPh === "number" ? r.mashDiPh : defaultMashDiPh(modelKey) ?? null;
      const mashTaToPh57_mEqPerKg =
        typeof r.mashTaToPh57_mEqPerKg === "number"
          ? r.mashTaToPh57_mEqPerKg
          : defaultMashTaToPh57_mEqPerKg(modelKey, colorEbc) ?? null;
      return { amountKg: r.amountKg, mashDiPh, mashTaToPh57_mEqPerKg };
    }) ?? null;

  if (hasGrist && mashMode !== "manual") {
    const waterToGristRatioQtPerLbOverride =
      typeof body["waterToGristRatioQtPerLbOverride"] === "number" ? body["waterToGristRatioQtPerLbOverride"] : undefined;

    const r = mashAcidificationTargetMashPh({
      startingAlkalinityPpmCaCO3,
      startingPh,
      volumeLiters,
      targetMashPh: targetPh,
      calciumPpm: salts.resultingProfile.calcium,
      magnesiumPpm: salts.resultingProfile.magnesium,
      acidType,
      strength,
      grist: grist ?? [],
      waterToGristRatioQtPerLbOverride,
    });
    acid = r;
    phKind = "estimated";
    phValue = r.estimatedMashPhRoomTemp;
  } else if (mashMode === "manual") {
    const acidAddedMl = typeof body["acidAddedMl"] === "number" ? body["acidAddedMl"] : undefined;
    const acidAddedGrams = typeof body["acidAddedGrams"] === "number" ? body["acidAddedGrams"] : undefined;
    const r = mashAcidificationManual({
      startingAlkalinityPpmCaCO3,
      startingPh,
      volumeLiters,
      acidType,
      strength,
      acidAddedMl,
      acidAddedGrams,
    });
    acid = r.predicted;
    phKind = "estimated";
    if (mashPhEstimateGrist && mashPhEstimateGrist.length) {
      const acidAdded_mEqPerL = r.predicted.debug?.acidRequired_mEqPerL;
      const estimate = mashPhEstimate({
        volumeLiters,
        alkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
        calciumPpm: salts.resultingProfile.calcium,
        magnesiumPpm: salts.resultingProfile.magnesium,
        grist: mashPhEstimateGrist,
        acidAdded_mEqPerL: typeof acidAdded_mEqPerL === "number" ? acidAdded_mEqPerL : 0,
      } satisfies MashPhEstimateInput);
      phValue = estimate.estimatedMashPhRoomTemp;
    } else {
      // Back-compat: without grist, manual mode only models water alkalinity + acid.
      phValue = r.achievedPh;
    }
  } else {
    acid = spargeAcidificationCalc({
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh,
      volumeLiters,
      acidType,
      strength,
    });
    phKind = "target";
    phValue = targetPh;
  }

  const ionsPpm = combineAfterSaltsAndAcid({
    afterSalts: salts.resultingProfile,
    acidResult: acid,
  });
  const alkalinityAfterSaltsPpmCaCO3 = alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult(salts);
  const calculatedAt = new Date().toISOString();

  const result = {
    calculatedAt,
    ionsPpm,
    finalAlkalinityPpmCaCO3: acid.finalAlkalinityPpmCaCO3,
    ph: { kind: phKind, value: phValue },
    debug: {
      startingAlkalinityPpmCaCO3,
      startingAlkalinityAfterSaltsPpmCaCO3: alkalinityAfterSaltsPpmCaCO3,
      saltsDeltaBicarbonatePpm: salts.deltasPpm.bicarbonate,
      acidSulfateAddedPpm: acid.sulfateAddedPpm,
      acidChlorideAddedPpm: acid.chlorideAddedPpm,
      mashMode,
    },
  };

  return waterCalcWithDerivationResponse(result, {
    kind: "mash_overall",
    version: 1,
    formulaId: "water.mash_overall.v1",
    inputs: [
      { id: "volumeLiters", value: { kind: "number", value: volumeLiters, unit: "L" } },
      { id: "startingAlk", value: { kind: "number", value: startingAlkalinityPpmCaCO3, unit: "ppm_as_CaCO3" } },
      { id: "startingPh", value: { kind: "number", value: startingPh, unit: "pH" } },
      { id: "targetPh", value: { kind: "number", value: phValue, unit: "pH" } },
    ],
    intermediates: [
      { id: "alkAfterSalts", value: { kind: "number", value: alkalinityAfterSaltsPpmCaCO3, unit: "ppm_as_CaCO3" } },
      { id: "acidSulfateAddedPpm", value: { kind: "number", value: acid.sulfateAddedPpm, unit: "ppm" } },
      { id: "acidChlorideAddedPpm", value: { kind: "number", value: acid.chlorideAddedPpm, unit: "ppm" } },
    ],
    notes: ["counter_ions_only_for_sulfuric_or_hydrochloric"],
    breakdowns: [
      {
        id: "saltBreakdown",
        rows: salts.breakdown.map((b) => ({
          saltKey: { kind: "string", value: b.saltKey },
          grams: { kind: "number", value: b.grams, unit: "g" },
          calciumPpm: { kind: "number", value: b.deltasPpm.calcium ?? 0, unit: "ppm" },
          magnesiumPpm: { kind: "number", value: b.deltasPpm.magnesium ?? 0, unit: "ppm" },
          sodiumPpm: { kind: "number", value: b.deltasPpm.sodium ?? 0, unit: "ppm" },
          sulfatePpm: { kind: "number", value: b.deltasPpm.sulfate ?? 0, unit: "ppm" },
          chloridePpm: { kind: "number", value: b.deltasPpm.chloride ?? 0, unit: "ppm" },
          bicarbonatePpm: { kind: "number", value: b.deltasPpm.bicarbonate ?? 0, unit: "ppm" },
        })),
      },
    ],
  });
}

export function spargeOverall(body: Record<string, unknown>) {
  const spargeMode = body["spargeMode"] === "manual" ? "manual" : "targetPh";
  const startingAlkalinityPpmCaCO3 =
    typeof body["startingAlkalinityPpmCaCO3"] === "number"
      ? body["startingAlkalinityPpmCaCO3"]
      : typeof body["spargeStartingAlkalinityPpmCaCO3"] === "number"
        ? body["spargeStartingAlkalinityPpmCaCO3"]
        : 0;
  const startingPh = typeof body["startingPh"] === "number" ? body["startingPh"] : 7.0;
  const targetPh = typeof body["targetPh"] === "number" ? body["targetPh"] : DEFAULT_MASH_TARGET_PH;
  const volumeLiters = typeof body["volumeLiters"] === "number" ? body["volumeLiters"] : NaN;
  if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
    throw new BadRequestError("invalid_volume_liters", "Body.volumeLiters must be > 0");
  }

  const baseProfile = parseBaseProfile(body);
  const additions = parseSaltAdditions(body);

  const salts = applySaltAdditions(baseProfile, volumeLiters, additions);

  const { acidType, strength } = parseAcidTypeAndStrength(body);

  let acid;
  const calciumPpm = salts.resultingProfile.calcium;
  const magnesiumPpm = salts.resultingProfile.magnesium;

  if (spargeMode === "manual") {
    const acidAddedMl = typeof body["acidAddedMl"] === "number" ? body["acidAddedMl"] : undefined;
    const acidAddedGrams = typeof body["acidAddedGrams"] === "number" ? body["acidAddedGrams"] : undefined;
    const r = spargeAcidificationManual({
      startingAlkalinityPpmCaCO3,
      startingPh,
      volumeLiters,
      calciumPpm,
      magnesiumPpm,
      acidType,
      strength,
      acidAddedMl,
      acidAddedGrams,
    });
    acid = { predicted: r.predicted, achievedPh: r.achievedPh };
  } else {
    const r = spargeAcidificationCalc({
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh,
      volumeLiters,
      calciumPpm,
      magnesiumPpm,
      acidType,
      strength,
    });
    acid = { predicted: r, achievedPh: targetPh };
  }

  const ionsPpm = combineAfterSaltsAndAcid({
    afterSalts: salts.resultingProfile,
    acidResult: acid.predicted,
  });
  const alkalinityAfterSaltsPpmCaCO3 = alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult(salts);
  const calculatedAt = new Date().toISOString();

  const result = {
    calculatedAt,
    ionsPpm,
    finalAlkalinityPpmCaCO3: acid.predicted.finalAlkalinityPpmCaCO3,
    ph: { kind: spargeMode === "manual" ? "estimated" : "target", value: acid.achievedPh },
    debug: {
      startingAlkalinityPpmCaCO3,
      startingAlkalinityAfterSaltsPpmCaCO3: alkalinityAfterSaltsPpmCaCO3,
      saltsDeltaBicarbonatePpm: salts.deltasPpm.bicarbonate,
      acidSulfateAddedPpm: acid.predicted.sulfateAddedPpm,
      acidChlorideAddedPpm: acid.predicted.chlorideAddedPpm,
      spargeMode,
    },
  };

  return waterCalcWithDerivationResponse(result, {
    kind: "sparge_overall",
    version: 1,
    formulaId: "water.sparge_overall.v1",
    inputs: [
      { id: "volumeLiters", value: { kind: "number", value: volumeLiters, unit: "L" } },
      { id: "startingAlk", value: { kind: "number", value: startingAlkalinityPpmCaCO3, unit: "ppm_as_CaCO3" } },
      { id: "startingPh", value: { kind: "number", value: startingPh, unit: "pH" } },
      { id: "targetPh", value: { kind: "number", value: acid.achievedPh, unit: "pH" } },
    ],
    intermediates: [
      { id: "alkAfterSalts", value: { kind: "number", value: alkalinityAfterSaltsPpmCaCO3, unit: "ppm_as_CaCO3" } },
      { id: "acidSulfateAddedPpm", value: { kind: "number", value: acid.predicted.sulfateAddedPpm, unit: "ppm" } },
      { id: "acidChlorideAddedPpm", value: { kind: "number", value: acid.predicted.chlorideAddedPpm, unit: "ppm" } },
    ],
    notes: ["counter_ions_only_for_sulfuric_or_hydrochloric"],
    breakdowns: [
      {
        id: "saltBreakdown",
        rows: salts.breakdown.map((b) => ({
          saltKey: { kind: "string", value: b.saltKey },
          grams: { kind: "number", value: b.grams, unit: "g" },
          calciumPpm: { kind: "number", value: b.deltasPpm.calcium ?? 0, unit: "ppm" },
          magnesiumPpm: { kind: "number", value: b.deltasPpm.magnesium ?? 0, unit: "ppm" },
          sodiumPpm: { kind: "number", value: b.deltasPpm.sodium ?? 0, unit: "ppm" },
          sulfatePpm: { kind: "number", value: b.deltasPpm.sulfate ?? 0, unit: "ppm" },
          chloridePpm: { kind: "number", value: b.deltasPpm.chloride ?? 0, unit: "ppm" },
          bicarbonatePpm: { kind: "number", value: b.deltasPpm.bicarbonate ?? 0, unit: "ppm" },
        })),
      },
    ],
  });
}

export function boilOverall(body: Record<string, unknown>) {
  const boilMode = body["boilMode"] === "manual" ? "manual" : "targetPh";
  const startingAlkalinityPpmCaCO3 =
    typeof body["startingAlkalinityPpmCaCO3"] === "number"
      ? body["startingAlkalinityPpmCaCO3"]
      : typeof body["boilStartingAlkalinityPpmCaCO3"] === "number"
        ? body["boilStartingAlkalinityPpmCaCO3"]
        : 0;
  const startingPh = typeof body["startingPh"] === "number" ? body["startingPh"] : 7.0;
  const targetPh = typeof body["targetPh"] === "number" ? body["targetPh"] : DEFAULT_MASH_TARGET_PH;
  const volumeLiters = typeof body["volumeLiters"] === "number" ? body["volumeLiters"] : NaN;
  if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
    throw new BadRequestError("invalid_volume_liters", "Body.volumeLiters must be > 0");
  }

  const baseProfile = parseBaseProfile(body);
  const additions = parseSaltAdditions(body);

  const salts = applySaltAdditions(baseProfile, volumeLiters, additions);

  const { acidType, strength } = parseAcidTypeAndStrength(body);

  let acid;
  const calciumPpm = salts.resultingProfile.calcium;
  const magnesiumPpm = salts.resultingProfile.magnesium;

  if (boilMode === "manual") {
    const acidAddedMl = typeof body["acidAddedMl"] === "number" ? body["acidAddedMl"] : undefined;
    const acidAddedGrams = typeof body["acidAddedGrams"] === "number" ? body["acidAddedGrams"] : undefined;
    const r = spargeAcidificationManual({
      startingAlkalinityPpmCaCO3,
      startingPh,
      volumeLiters,
      calciumPpm,
      magnesiumPpm,
      acidType,
      strength,
      acidAddedMl,
      acidAddedGrams,
    });
    acid = { predicted: r.predicted, achievedPh: r.achievedPh };
  } else {
    const r = spargeAcidificationCalc({
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh,
      volumeLiters,
      calciumPpm,
      magnesiumPpm,
      acidType,
      strength,
    });
    acid = { predicted: r, achievedPh: targetPh };
  }

  const ionsPpm = combineAfterSaltsAndAcid({
    afterSalts: salts.resultingProfile,
    acidResult: acid.predicted,
  });
  const alkalinityAfterSaltsPpmCaCO3 = alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult(salts);
  const calculatedAt = new Date().toISOString();

  const result = {
    calculatedAt,
    ionsPpm,
    finalAlkalinityPpmCaCO3: acid.predicted.finalAlkalinityPpmCaCO3,
    ph: { kind: boilMode === "manual" ? "estimated" : "target", value: acid.achievedPh },
    debug: {
      startingAlkalinityPpmCaCO3,
      startingAlkalinityAfterSaltsPpmCaCO3: alkalinityAfterSaltsPpmCaCO3,
      saltsDeltaBicarbonatePpm: salts.deltasPpm.bicarbonate,
      acidSulfateAddedPpm: acid.predicted.sulfateAddedPpm,
      acidChlorideAddedPpm: acid.predicted.chlorideAddedPpm,
      boilMode,
    },
  };

  return waterCalcWithDerivationResponse(result, {
    kind: "boil_overall",
    version: 1,
    formulaId: "water.boil_overall.v1",
    inputs: [
      { id: "volumeLiters", value: { kind: "number", value: volumeLiters, unit: "L" } },
      { id: "startingAlk", value: { kind: "number", value: startingAlkalinityPpmCaCO3, unit: "ppm_as_CaCO3" } },
      { id: "startingPh", value: { kind: "number", value: startingPh, unit: "pH" } },
      { id: "targetPh", value: { kind: "number", value: acid.achievedPh, unit: "pH" } },
    ],
    intermediates: [
      { id: "alkAfterSalts", value: { kind: "number", value: alkalinityAfterSaltsPpmCaCO3, unit: "ppm_as_CaCO3" } },
      { id: "acidSulfateAddedPpm", value: { kind: "number", value: acid.predicted.sulfateAddedPpm, unit: "ppm" } },
      { id: "acidChlorideAddedPpm", value: { kind: "number", value: acid.predicted.chlorideAddedPpm, unit: "ppm" } },
    ],
    notes: ["counter_ions_only_for_sulfuric_or_hydrochloric"],
    breakdowns: [
      {
        id: "saltBreakdown",
        rows: salts.breakdown.map((b) => ({
          saltKey: { kind: "string", value: b.saltKey },
          grams: { kind: "number", value: b.grams, unit: "g" },
          calciumPpm: { kind: "number", value: b.deltasPpm.calcium ?? 0, unit: "ppm" },
          magnesiumPpm: { kind: "number", value: b.deltasPpm.magnesium ?? 0, unit: "ppm" },
          sodiumPpm: { kind: "number", value: b.deltasPpm.sodium ?? 0, unit: "ppm" },
          sulfatePpm: { kind: "number", value: b.deltasPpm.sulfate ?? 0, unit: "ppm" },
          chloridePpm: { kind: "number", value: b.deltasPpm.chloride ?? 0, unit: "ppm" },
          bicarbonatePpm: { kind: "number", value: b.deltasPpm.bicarbonate ?? 0, unit: "ppm" },
        })),
      },
    ],
  });
}
