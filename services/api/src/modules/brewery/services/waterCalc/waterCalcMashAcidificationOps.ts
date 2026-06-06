import { DEFAULT_MASH_TARGET_PH } from "@umbraculum/brewery-core";

import { BadRequestError } from "../../../../errors.js";
import {
  spargeAcidification as spargeAcidificationCalc,
} from "../../../../domain/waterCalc/spargeAcidification.js";
import { mashAcidificationManual as mashAcidificationManualCalc } from "../../../../domain/waterCalc/mashAcidificationManual.js";
import { buildAcidificationDerivation } from "../../../../domain/waterCalc/derivation/acidificationDerivation.js";
import {
  parseAcidTypeAndStrength,
  waterCalcWithDerivationResponse,
} from "./waterCalcHelpers.js";

export function mashAcidification(body: Record<string, unknown>) {
  const { acidType, strength, strengthKind } = parseAcidTypeAndStrength(body);

  // Accept mash-prefixed or generic field names.
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
        : 1.0;

  const result = spargeAcidificationCalc({
    startingAlkalinityPpmCaCO3,
    startingPh,
    targetPh,
    volumeLiters,
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

export function mashAcidificationManual(body: Record<string, unknown>) {
  const { acidType, strength, strengthKind } = parseAcidTypeAndStrength(body);

  // Accept mash-prefixed or generic field names.
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
  const volumeLiters =
    typeof body["mashWaterVolumeLiters"] === "number"
      ? body["mashWaterVolumeLiters"]
      : typeof body["volumeLiters"] === "number"
        ? body["volumeLiters"]
        : 1.0;

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
    result = mashAcidificationManualCalc({
      startingAlkalinityPpmCaCO3,
      startingPh,
      volumeLiters,
      acidType,
      strength,
      acidAddedMl,
      acidAddedGrams,
    });
  } catch (e) {
    throw new BadRequestError("invalid_manual_acid_input", (e as Error)?.message || "Invalid manual input");
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
