import { BadRequestError } from "../../../../errors.js";
import { mashPhEstimate as mashPhEstimateCalc, type MashPhEstimateInput } from "../../../../domain/waterCalc/mashPhEstimate.js";
import { defaultMashDiPh, defaultMashTaToPh57_mEqPerKg } from "../../../../domain/waterCalc/mashPhDefaultsV1.js";
import {
  colorLovibondToEbc,
  mashPhModelKeyFromMaltClass,
  validateOptionalCalciumMagnesiumPpm,
  waterCalcResultOnlyResponse,
} from "./waterCalcHelpers.js";

export function mashPhEstimate(body: Record<string, unknown>) {
  const volumeLiters =
    typeof body["mashWaterVolumeLiters"] === "number"
      ? body["mashWaterVolumeLiters"]
      : typeof body["volumeLiters"] === "number"
        ? body["volumeLiters"]
        : NaN;
  if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
    throw new BadRequestError("invalid_volume_liters", "Body.volumeLiters must be > 0");
  }

  const alkalinityPpmCaCO3 =
    typeof body["alkalinityPpmCaCO3"] === "number"
      ? body["alkalinityPpmCaCO3"]
      : typeof body["mashStartingAlkalinityPpmCaCO3"] === "number"
        ? body["mashStartingAlkalinityPpmCaCO3"]
        : typeof body["startingAlkalinityPpmCaCO3"] === "number"
          ? body["startingAlkalinityPpmCaCO3"]
          : NaN;
  if (!Number.isFinite(alkalinityPpmCaCO3)) {
    throw new BadRequestError(
      "invalid_alkalinity",
      "Body.alkalinityPpmCaCO3 (or starting alkalinity) must be a finite number",
    );
  }

  const { calciumPpm, magnesiumPpm } = validateOptionalCalciumMagnesiumPpm(body);

  const gristRaw = body["grist"];
  if (!Array.isArray(gristRaw)) {
    throw new BadRequestError("invalid_grist", "Body.grist must be an array");
  }
  const grist: MashPhEstimateInput["grist"] = gristRaw.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const amountKg = typeof o["amountKg"] === "number" ? o["amountKg"] : NaN;
    if (!Number.isFinite(amountKg) || !(amountKg > 0)) {
      throw new BadRequestError(
        "invalid_grist_row_amount",
        `Body.grist[${idx}].amountKg must be a number > 0`,
      );
    }

    // Preferred v1 inputs:
    const diRaw = o["mashDiPh"];
    const mashDiPh =
      diRaw === null || diRaw === undefined ? null : typeof diRaw === "number" ? diRaw : NaN;
    if (typeof mashDiPh === "number" && (!Number.isFinite(mashDiPh) || mashDiPh < 0 || mashDiPh > 14)) {
      throw new BadRequestError(
        "invalid_grist_row_mash_di_ph",
        `Body.grist[${idx}].mashDiPh must be null or a finite number between 0 and 14`,
      );
    }

    const taRaw = o["mashTaToPh57_mEqPerKg"];
    const mashTaToPh57_mEqPerKg =
      taRaw === null || taRaw === undefined ? null : typeof taRaw === "number" ? taRaw : NaN;
    if (
      typeof mashTaToPh57_mEqPerKg === "number" &&
      (!Number.isFinite(mashTaToPh57_mEqPerKg) || mashTaToPh57_mEqPerKg < 0)
    ) {
      throw new BadRequestError(
        "invalid_grist_row_mash_ta",
        `Body.grist[${idx}].mashTaToPh57_mEqPerKg must be null or a finite number >= 0`,
      );
    }

    // Back-compat: derive v1 defaults from v0-style fields when present.
    const colorRaw = o["colorLovibond"];
    const colorLovibond =
      colorRaw === null || colorRaw === undefined ? null : typeof colorRaw === "number" ? colorRaw : NaN;
    if (typeof colorLovibond === "number" && (!Number.isFinite(colorLovibond) || colorLovibond < 0)) {
      throw new BadRequestError(
        "invalid_grist_row_color",
        `Body.grist[${idx}].colorLovibond must be null or a number >= 0`,
      );
    }

    const maltClassRaw = o["maltClass"];
    const maltClass =
      maltClassRaw === "base" || maltClassRaw === "crystal" || maltClassRaw === "roast" || maltClassRaw === "acid"
        ? maltClassRaw
        : null;

    const modelKey = maltClass ? mashPhModelKeyFromMaltClass(maltClass) : "base_pale";
    const colorEbc = colorLovibondToEbc(typeof colorLovibond === "number" ? colorLovibond : null);

    const mashDiPhFinal =
      typeof mashDiPh === "number"
        ? mashDiPh
        : defaultMashDiPh(modelKey) ?? null;
    const mashTaFinal =
      typeof mashTaToPh57_mEqPerKg === "number"
        ? mashTaToPh57_mEqPerKg
        : defaultMashTaToPh57_mEqPerKg(modelKey, colorEbc) ?? null;

    return { amountKg, mashDiPh: mashDiPhFinal, mashTaToPh57_mEqPerKg: mashTaFinal };
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

  const acidAdded_mEqPerL =
    typeof body["acidAdded_mEqPerL"] === "number" ? body["acidAdded_mEqPerL"] : undefined;
  if (
    acidAdded_mEqPerL !== undefined &&
    (!Number.isFinite(acidAdded_mEqPerL) || acidAdded_mEqPerL < 0)
  ) {
    throw new BadRequestError(
      "invalid_acid_added_meq",
      "Body.acidAdded_mEqPerL must be a finite number >= 0",
    );
  }

  let result;
  try {
    result = mashPhEstimateCalc({
      volumeLiters,
      alkalinityPpmCaCO3,
      calciumPpm,
      magnesiumPpm,
      grist,
      waterToGristRatioQtPerLbOverride,
      acidAdded_mEqPerL,
    });
  } catch (e) {
    throw new BadRequestError("invalid_mash_ph_estimate_input", (e as Error)?.message || "Invalid input");
  }

  return waterCalcResultOnlyResponse(result);
}
