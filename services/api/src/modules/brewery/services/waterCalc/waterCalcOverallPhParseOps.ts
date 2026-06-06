import { DEFAULT_MASH_TARGET_PH } from "@umbraculum/brewery-core";

import { BadRequestError } from "../../../../errors.js";
import { defaultMashDiPh, defaultMashTaToPh57_mEqPerKg } from "../../../../domain/waterCalc/mashPhDefaultsV1.js";
import {
  colorLovibondToEbc,
  mashPhModelKeyFromMaltClass,
} from "./waterCalcHelpers.js";

export function parseMashOverallInputs(body: Record<string, unknown>): {
  mashMode: "manual" | "targetPh";
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
  targetPh: number;
  volumeLiters: number;
} {
  const mashMode: "manual" | "targetPh" = body["mashMode"] === "manual" ? "manual" : "targetPh";
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

  return { mashMode, startingAlkalinityPpmCaCO3, startingPh, targetPh, volumeLiters };
}

export function parseSpargeBoilOverallInputs(
  body: Record<string, unknown>,
  modeKey: "spargeMode" | "boilMode",
  alkalinityKeys: [string, string],
): {
  mode: "manual" | "targetPh";
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
  targetPh: number;
  volumeLiters: number;
} {
  const mode: "manual" | "targetPh" = body[modeKey] === "manual" ? "manual" : "targetPh";
  const startingAlkalinityPpmCaCO3 =
    typeof body[alkalinityKeys[0]] === "number"
      ? (body[alkalinityKeys[0]] as number)
      : typeof body[alkalinityKeys[1]] === "number"
        ? (body[alkalinityKeys[1]] as number)
        : 0;
  const startingPh = typeof body["startingPh"] === "number" ? body["startingPh"] : 7.0;
  const targetPh = typeof body["targetPh"] === "number" ? body["targetPh"] : DEFAULT_MASH_TARGET_PH;
  const volumeLiters = typeof body["volumeLiters"] === "number" ? body["volumeLiters"] : NaN;
  if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
    throw new BadRequestError("invalid_volume_liters", "Body.volumeLiters must be > 0");
  }

  return { mode, startingAlkalinityPpmCaCO3, startingPh, targetPh, volumeLiters };
}

export type OverallGristRow = {
  amountKg: number;
  colorLovibond: number | null;
  maltClass: "base" | "crystal" | "roast" | "acid";
  mashDiPh?: number | null | undefined;
  mashTaToPh57_mEqPerKg?: number | null | undefined;
};

export function parseOverallGrist(body: Record<string, unknown>): OverallGristRow[] | null {
  const gristRaw = body["grist"];
  const hasGrist = Array.isArray(gristRaw) && gristRaw.length > 0;
  if (!hasGrist) return null;

  return (gristRaw as unknown[]).map((row, idx) => {
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
  });
}

export function toMashPhEstimateGrist(grist: OverallGristRow[] | null) {
  return (
    grist?.map((r) => {
      const modelKey = mashPhModelKeyFromMaltClass(r.maltClass);
      const colorEbc = colorLovibondToEbc(r.colorLovibond);
      const mashDiPh = typeof r.mashDiPh === "number" ? r.mashDiPh : defaultMashDiPh(modelKey) ?? null;
      const mashTaToPh57_mEqPerKg =
        typeof r.mashTaToPh57_mEqPerKg === "number"
          ? r.mashTaToPh57_mEqPerKg
          : defaultMashTaToPh57_mEqPerKg(modelKey, colorEbc) ?? null;
      return { amountKg: r.amountKg, mashDiPh, mashTaToPh57_mEqPerKg };
    }) ?? null
  );
}
