import {
  derivationNumber,
  derivationString,
  type WaterCalcDerivation,
} from "./types.js";

export type AcidificationDerivationInput = {
  mode: "target" | "manual";
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
  targetPh: number | null;
  volumeLiters: number;
  acidType: string;
  strengthKind: string;
  strengthValue: number | null;
  result: {
    finalAlkalinityPpmCaCO3: number;
    sulfateAddedPpm: number;
    chlorideAddedPpm: number;
    acidRequiredMl: number | null;
    acidRequiredGrams: number | null;
    debug?: {
      acidRequired_mEqPerL?: number;
      mMRequired_mmolPerL?: number;
      frac_equivalentsPerMole?: number;
      effectiveAlkalinityPpmCaCO3?: number;
      alkalinityReductionFromCaMgPpmCaCO3?: number;
      calciumPpm?: number;
      magnesiumPpm?: number;
      sg_mgPerMl?: number | null;
    };
  };
};

export function buildAcidificationDerivation(input: AcidificationDerivationInput): WaterCalcDerivation {
  const dbg = input.result.debug ?? {};

  return {
    kind: "acidification",
    version: 1,
    formulaId: "water.acidification.v1",
    inputs: [
      { id: "mode", value: derivationString(input.mode) },
      {
        id: "startingAlkalinityPpmCaCO3",
        value: derivationNumber(input.startingAlkalinityPpmCaCO3, "ppm_as_CaCO3"),
      },
      { id: "startingPh", value: derivationNumber(input.startingPh, "pH") },
      input.targetPh === null
        ? { id: "targetPh", value: { kind: "null" } }
        : { id: "targetPh", value: derivationNumber(input.targetPh, "pH") },
      { id: "volumeLiters", value: derivationNumber(input.volumeLiters, "L") },
      { id: "acidType", value: derivationString(input.acidType) },
      { id: "strengthKind", value: derivationString(input.strengthKind) },
      input.strengthValue === null
        ? { id: "strengthValue", value: { kind: "null" } }
        : { id: "strengthValue", value: derivationNumber(input.strengthValue) },
    ],
    intermediates: [
      dbg.effectiveAlkalinityPpmCaCO3 === undefined
        ? {
            id: "effectiveAlkalinityPpmCaCO3",
            value: { kind: "null" },
          }
        : {
            id: "effectiveAlkalinityPpmCaCO3",
            value: derivationNumber(dbg.effectiveAlkalinityPpmCaCO3, "ppm_as_CaCO3"),
          },
      dbg.alkalinityReductionFromCaMgPpmCaCO3 === undefined
        ? {
            id: "alkalinityReductionFromCaMgPpmCaCO3",
            value: { kind: "null" },
          }
        : {
            id: "alkalinityReductionFromCaMgPpmCaCO3",
            value: derivationNumber(dbg.alkalinityReductionFromCaMgPpmCaCO3, "ppm_as_CaCO3"),
          },
      dbg.acidRequired_mEqPerL === undefined
        ? { id: "acidRequired_mEqPerL", value: { kind: "null" } }
        : { id: "acidRequired_mEqPerL", value: derivationNumber(dbg.acidRequired_mEqPerL, "mEq_per_L") },
      dbg.mMRequired_mmolPerL === undefined
        ? { id: "mMRequired_mmolPerL", value: { kind: "null" } }
        : { id: "mMRequired_mmolPerL", value: derivationNumber(dbg.mMRequired_mmolPerL, "mmol_per_L") },
      dbg.frac_equivalentsPerMole === undefined
        ? { id: "frac_equivalentsPerMole", value: { kind: "null" } }
        : { id: "frac_equivalentsPerMole", value: derivationNumber(dbg.frac_equivalentsPerMole) },
      dbg.sg_mgPerMl === undefined
        ? { id: "sg_mgPerMl", value: { kind: "null" } }
        : dbg.sg_mgPerMl === null
          ? { id: "sg_mgPerMl", value: { kind: "null" } }
          : { id: "sg_mgPerMl", value: derivationNumber(dbg.sg_mgPerMl) },
    ],
  };
}

