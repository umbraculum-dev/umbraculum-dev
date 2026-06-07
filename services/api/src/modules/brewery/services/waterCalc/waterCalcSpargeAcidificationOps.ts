import { BadRequestError } from "../../../../errors.js";
import {
  spargeAcidification as spargeAcidificationCalc,
} from "./spargeAcidification.js";
import { spargeAcidificationManual as spargeAcidificationManualCalc } from "./spargeAcidificationManual.js";
import { buildAcidificationDerivation } from "./derivation/acidificationDerivation.js";
import {
  parseAcidTypeAndStrength,
  validateOptionalCalciumMagnesiumPpm,
  waterCalcWithDerivationResponse,
} from "./waterCalcHelpers.js";
import { DEFAULT_MASH_TARGET_PH } from "@umbraculum/brewery-core";

export function spargeAcidification(body: Record<string, unknown>) {
  const { acidType, strength, strengthKind } = parseAcidTypeAndStrength(body);

  const startingAlkalinityPpmCaCO3 =
    typeof body["startingAlkalinityPpmCaCO3"] === "number" ? body["startingAlkalinityPpmCaCO3"] : 0;
  const startingPh = typeof body["startingPh"] === "number" ? body["startingPh"] : 7.0;
  const targetPh = typeof body["targetPh"] === "number" ? body["targetPh"] : DEFAULT_MASH_TARGET_PH;
  const volumeLiters = typeof body["volumeLiters"] === "number" ? body["volumeLiters"] : 1.0;
  const { calciumPpm, magnesiumPpm } = validateOptionalCalciumMagnesiumPpm(body);

  const result = spargeAcidificationCalc({
    startingAlkalinityPpmCaCO3,
    startingPh,
    targetPh,
    volumeLiters,
    calciumPpm,
    magnesiumPpm,
    acidType,
    strength,
  });

  return waterCalcWithDerivationResponse(
    result,
    buildAcidificationDerivation({
      mode: "target",
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh,
      volumeLiters,
      acidType,
      strengthKind,
      strengthValue: strength.kind === "solid" ? null : strength.value,
      result,
    }),
  );
}

export function spargeAcidificationManual(body: Record<string, unknown>) {
  const { acidType, strength, strengthKind } = parseAcidTypeAndStrength(body);

  const startingAlkalinityPpmCaCO3 =
    typeof body["startingAlkalinityPpmCaCO3"] === "number" ? body["startingAlkalinityPpmCaCO3"] : 0;
  const startingPh = typeof body["startingPh"] === "number" ? body["startingPh"] : 7.0;
  const volumeLiters = typeof body["volumeLiters"] === "number" ? body["volumeLiters"] : 1.0;
  const { calciumPpm, magnesiumPpm } = validateOptionalCalciumMagnesiumPpm(body);

  const acidAddedMl = typeof body["acidAddedMl"] === "number" ? body["acidAddedMl"] : undefined;
  const acidAddedGrams = typeof body["acidAddedGrams"] === "number" ? body["acidAddedGrams"] : undefined;
  if (strength.kind === "solid") {
    if (typeof acidAddedGrams !== "number") {
      throw new BadRequestError("invalid_acid_added", "Body.acidAddedGrams is required for solid acids");
    }
  } else {
    if (typeof acidAddedMl !== "number") {
      throw new BadRequestError("invalid_acid_added", "Body.acidAddedMl is required for liquid acids");
    }
  }

  let result;
  try {
    result = spargeAcidificationManualCalc({
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
  } catch (e) {
    throw new BadRequestError(
      "invalid_manual_acid_input",
      (e as Error)?.message || "Invalid manual input",
    );
  }

  return waterCalcWithDerivationResponse(
    result,
    buildAcidificationDerivation({
      mode: "manual",
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh: result.achievedPh,
      volumeLiters,
      acidType,
      strengthKind,
      strengthValue: strength.kind === "solid" ? null : strength.value,
      result: result.predicted,
    }),
  );
}
