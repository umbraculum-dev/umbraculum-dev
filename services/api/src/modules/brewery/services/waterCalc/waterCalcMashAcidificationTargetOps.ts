import { BadRequestError } from "../../../../errors.js";
import { mashAcidificationTargetMashPh as mashAcidificationTargetMashPhCalc } from "../../../../domain/waterCalc/mashAcidificationTargetMashPh.js";
import {
  parseAcidTypeAndStrength,
  validateOptionalCalciumMagnesiumPpm,
  waterCalcResultOnlyResponse,
} from "./waterCalcHelpers.js";

export function mashAcidificationTargetMashPh(body: Record<string, unknown>) {
  const { acidType, strength } = parseAcidTypeAndStrength(body);

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
  const targetMashPh =
    typeof body["targetMashPh"] === "number"
      ? body["targetMashPh"]
      : typeof body["mashTargetPh"] === "number"
        ? body["mashTargetPh"]
        : NaN;
  if (!Number.isFinite(targetMashPh)) {
    throw new BadRequestError("invalid_target_mash_ph", "Body.targetMashPh (or mashTargetPh) is required");
  }
  const volumeLiters =
    typeof body["mashWaterVolumeLiters"] === "number"
      ? body["mashWaterVolumeLiters"]
      : typeof body["volumeLiters"] === "number"
        ? body["volumeLiters"]
        : NaN;
  if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
    throw new BadRequestError("invalid_volume_liters", "Body.mashWaterVolumeLiters must be > 0");
  }

  const { calciumPpm, magnesiumPpm } = validateOptionalCalciumMagnesiumPpm(body);

  const gristRaw = body["grist"];
  if (!Array.isArray(gristRaw)) {
    throw new BadRequestError("invalid_grist", "Body.grist must be an array");
  }
  const grist: Array<{ amountKg: number; colorLovibond: number | null; maltClass: "base" | "crystal" | "roast" | "acid" }> = gristRaw.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const amountKg = typeof o["amountKg"] === "number" ? o["amountKg"] : NaN;
    if (!Number.isFinite(amountKg) || !(amountKg > 0)) {
      throw new BadRequestError(
        "invalid_grist_row_amount",
        `Body.grist[${idx}].amountKg must be a number > 0`,
      );
    }
    const colorRaw = o["colorLovibond"];
    const colorLovibond =
      colorRaw === null || colorRaw === undefined
        ? null
        : typeof colorRaw === "number"
          ? colorRaw
          : NaN;
    if (typeof colorLovibond === "number" && (!Number.isFinite(colorLovibond) || colorLovibond < 0)) {
      throw new BadRequestError(
        "invalid_grist_row_color",
        `Body.grist[${idx}].colorLovibond must be null or a number >= 0`,
      );
    }

    const maltClassRaw = o["maltClass"];
    const maltClass =
      maltClassRaw === "base" ||
      maltClassRaw === "crystal" ||
      maltClassRaw === "roast" ||
      maltClassRaw === "acid"
        ? maltClassRaw
        : "base";

    return { amountKg, colorLovibond, maltClass };
  });

  const waterToGristRatioQtPerLbOverride =
    typeof body["waterToGristRatioQtPerLbOverride"] === "number"
      ? body["waterToGristRatioQtPerLbOverride"]
      : undefined;
  if (
    waterToGristRatioQtPerLbOverride !== undefined &&
    (!Number.isFinite(waterToGristRatioQtPerLbOverride) || !(waterToGristRatioQtPerLbOverride > 0))
  ) {
    throw new BadRequestError(
      "invalid_ratio_override",
      "Body.waterToGristRatioQtPerLbOverride must be a number > 0",
    );
  }

  let result;
  try {
    result = mashAcidificationTargetMashPhCalc({
      startingAlkalinityPpmCaCO3,
      startingPh,
      volumeLiters,
      targetMashPh,
      calciumPpm,
      magnesiumPpm,
      acidType,
      strength,
      grist,
      waterToGristRatioQtPerLbOverride,
    });
  } catch (e) {
    throw new BadRequestError("invalid_mash_target_ph_input", (e as Error)?.message || "Invalid input");
  }

  return waterCalcResultOnlyResponse(result);
}
