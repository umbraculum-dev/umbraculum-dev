import type { FastifyInstance } from "fastify";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { BadRequestError } from "../errors.js";
import {
  spargeAcidification,
  type AcidStrength,
  type SpargeAcidType,
} from "../domain/waterCalc/spargeAcidification.js";
import { spargeAcidificationManual } from "../domain/waterCalc/spargeAcidificationManual.js";
import { mashAcidificationManual } from "../domain/waterCalc/mashAcidificationManual.js";
import { mashPhEstimate, type MashPhEstimateInput } from "../domain/waterCalc/mashPhEstimate.js";
import { mashAcidificationTargetMashPh } from "../domain/waterCalc/mashAcidificationTargetMashPh.js";
import { defaultMashDiPh, defaultMashTaToPh57_mEqPerKg } from "../domain/waterCalc/mashPhDefaultsV1.js";
import {
  applySaltAdditions,
  type IonProfilePpm,
  type SaltAddition,
  type SaltKey,
} from "../domain/waterCalc/saltAdditions.js";
import {
  alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult,
  combineAfterSaltsAndAcid,
} from "../domain/waterCalc/overall.js";
import { buildSaltAdditionsDerivation } from "../domain/waterCalc/derivation/saltAdditionsDerivation.js";
import { buildAcidificationDerivation } from "../domain/waterCalc/derivation/acidificationDerivation.js";
import { DEFAULT_MASH_TARGET_PH } from "@brewery/core";

function colorLovibondToEbc(colorLovibond: number | null): number | null {
  if (colorLovibond === null) return null;
  if (!Number.isFinite(colorLovibond) || colorLovibond < 0) return null;
  // Pragmatic approximation for defaults lookup. (We only need a reasonable magnitude.)
  return colorLovibond * 1.97;
}

function mashPhModelKeyFromMaltClass(maltClass: string) {
  if (maltClass === "base") return "base_pale";
  if (maltClass === "crystal") return "crystal";
  if (maltClass === "roast") return "roasted";
  if (maltClass === "acid") return "acidulated";
  return "base_pale";
}

export function waterCalcRoutes(app: FastifyInstance) {
  app.post("/water-calc/sparge-acidification", (req) => {
    requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const acidType = body['acidType'] as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }

    const strengthKind = (typeof body['strengthKind'] === "string" ? body['strengthKind'] : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body['strengthValue'] === "number" ? body['strengthValue'] : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind, value: strengthValue };
    }

    const startingAlkalinityPpmCaCO3 =
      typeof body['startingAlkalinityPpmCaCO3'] === "number" ? body['startingAlkalinityPpmCaCO3'] : 0;
    const startingPh = typeof body['startingPh'] === "number" ? body['startingPh'] : 7.0;
    const targetPh = typeof body['targetPh'] === "number" ? body['targetPh'] : DEFAULT_MASH_TARGET_PH;
    const volumeLiters = typeof body['volumeLiters'] === "number" ? body['volumeLiters'] : 1.0;
    const calciumPpm = typeof body['calciumPpm'] === "number" ? (body['calciumPpm']) : undefined;
    const magnesiumPpm = typeof body['magnesiumPpm'] === "number" ? (body['magnesiumPpm']) : undefined;
    if (calciumPpm !== undefined && (!Number.isFinite(calciumPpm) || calciumPpm < 0)) {
      throw new BadRequestError("invalid_calcium_ppm", "Body.calciumPpm must be a finite number >= 0");
    }
    if (magnesiumPpm !== undefined && (!Number.isFinite(magnesiumPpm) || magnesiumPpm < 0)) {
      throw new BadRequestError("invalid_magnesium_ppm", "Body.magnesiumPpm must be a finite number >= 0");
    }

    const result = spargeAcidification({
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh,
      volumeLiters,
      calciumPpm,
      magnesiumPpm,
      acidType,
      strength,
    });

    return {
      ok: true,
      result,
      derivation: buildAcidificationDerivation({
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
    };
  });

  // Sparge acidification manual-entry mode (Sheet 2, v0): user enters acid amount; we estimate achieved pH.
  app.post("/water-calc/sparge-acidification-manual", (req) => {
    requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const acidType = body['acidType'] as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }

    const strengthKind = (typeof body['strengthKind'] === "string" ? body['strengthKind'] : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body['strengthValue'] === "number" ? body['strengthValue'] : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind, value: strengthValue };
    }

    const startingAlkalinityPpmCaCO3 =
      typeof body['startingAlkalinityPpmCaCO3'] === "number" ? body['startingAlkalinityPpmCaCO3'] : 0;
    const startingPh = typeof body['startingPh'] === "number" ? body['startingPh'] : 7.0;
    const volumeLiters = typeof body['volumeLiters'] === "number" ? body['volumeLiters'] : 1.0;
    const calciumPpm = typeof body['calciumPpm'] === "number" ? (body['calciumPpm']) : undefined;
    const magnesiumPpm = typeof body['magnesiumPpm'] === "number" ? (body['magnesiumPpm']) : undefined;
    if (calciumPpm !== undefined && (!Number.isFinite(calciumPpm) || calciumPpm < 0)) {
      throw new BadRequestError("invalid_calcium_ppm", "Body.calciumPpm must be a finite number >= 0");
    }
    if (magnesiumPpm !== undefined && (!Number.isFinite(magnesiumPpm) || magnesiumPpm < 0)) {
      throw new BadRequestError("invalid_magnesium_ppm", "Body.magnesiumPpm must be a finite number >= 0");
    }

    const acidAddedMl = typeof body['acidAddedMl'] === "number" ? body['acidAddedMl'] : undefined;
    const acidAddedGrams = typeof body['acidAddedGrams'] === "number" ? body['acidAddedGrams'] : undefined;
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
      result = spargeAcidificationManual({
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

    return {
      ok: true,
      result,
      derivation: buildAcidificationDerivation({
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
    };
  });

  // Mash water acidification (Sheet 4, v0): same math as sparge acidification, but stored/displayed separately.
  app.post("/water-calc/mash-acidification", (req) => {
    requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const acidType = body['acidType'] as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }

    const strengthKind = (typeof body['strengthKind'] === "string" ? body['strengthKind'] : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body['strengthValue'] === "number" ? body['strengthValue'] : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind, value: strengthValue };
    }

    // Accept mash-prefixed or generic field names.
    const startingAlkalinityPpmCaCO3 =
      typeof body['mashStartingAlkalinityPpmCaCO3'] === "number"
        ? (body['mashStartingAlkalinityPpmCaCO3'])
        : typeof body['startingAlkalinityPpmCaCO3'] === "number"
          ? (body['startingAlkalinityPpmCaCO3'])
          : 0;
    const startingPh =
      typeof body['mashStartingPh'] === "number"
        ? (body['mashStartingPh'])
        : typeof body['startingPh'] === "number"
          ? (body['startingPh'])
          : 7.0;
    const targetPh =
      typeof body['mashTargetPh'] === "number"
        ? (body['mashTargetPh'])
        : typeof body['targetPh'] === "number"
          ? (body['targetPh'])
          : DEFAULT_MASH_TARGET_PH;
    const volumeLiters =
      typeof body['mashWaterVolumeLiters'] === "number"
        ? (body['mashWaterVolumeLiters'])
        : typeof body['volumeLiters'] === "number"
          ? (body['volumeLiters'])
          : 1.0;

    const result = spargeAcidification({
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh,
      volumeLiters,
      acidType,
      strength,
    });

    return {
      ok: true,
      result,
      derivation: buildAcidificationDerivation({
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
    };
  });

  // Mash water acidification manual-entry mode (Sheet 4, v0): user enters acid amount; we estimate achieved pH.
  app.post("/water-calc/mash-acidification-manual", (req) => {
    requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const acidType = body['acidType'] as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }

    const strengthKind = (typeof body['strengthKind'] === "string" ? body['strengthKind'] : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body['strengthValue'] === "number" ? body['strengthValue'] : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind, value: strengthValue };
    }

    // Accept mash-prefixed or generic field names.
    const startingAlkalinityPpmCaCO3 =
      typeof body['mashStartingAlkalinityPpmCaCO3'] === "number"
        ? (body['mashStartingAlkalinityPpmCaCO3'])
        : typeof body['startingAlkalinityPpmCaCO3'] === "number"
          ? (body['startingAlkalinityPpmCaCO3'])
          : 0;
    const startingPh =
      typeof body['mashStartingPh'] === "number"
        ? (body['mashStartingPh'])
        : typeof body['startingPh'] === "number"
          ? (body['startingPh'])
          : 7.0;
    const volumeLiters =
      typeof body['mashWaterVolumeLiters'] === "number"
        ? (body['mashWaterVolumeLiters'])
        : typeof body['volumeLiters'] === "number"
          ? (body['volumeLiters'])
          : 1.0;

    const acidAddedMl = typeof body['acidAddedMl'] === "number" ? body['acidAddedMl'] : undefined;
    const acidAddedGrams = typeof body['acidAddedGrams'] === "number" ? body['acidAddedGrams'] : undefined;
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
      result = mashAcidificationManual({
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

    return {
      ok: true,
      result,
      derivation: buildAcidificationDerivation({
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
    };
  });

  app.post("/water-calc/mash-ph-estimate", (req) => {
    requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const volumeLiters =
      typeof body['mashWaterVolumeLiters'] === "number"
        ? (body['mashWaterVolumeLiters'])
        : typeof body['volumeLiters'] === "number"
          ? (body['volumeLiters'])
          : NaN;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Body.volumeLiters must be > 0");
    }

    const alkalinityPpmCaCO3 =
      typeof body['alkalinityPpmCaCO3'] === "number"
        ? (body['alkalinityPpmCaCO3'])
        : typeof body['mashStartingAlkalinityPpmCaCO3'] === "number"
          ? (body['mashStartingAlkalinityPpmCaCO3'])
          : typeof body['startingAlkalinityPpmCaCO3'] === "number"
            ? (body['startingAlkalinityPpmCaCO3'])
            : NaN;
    if (!Number.isFinite(alkalinityPpmCaCO3)) {
      throw new BadRequestError(
        "invalid_alkalinity",
        "Body.alkalinityPpmCaCO3 (or starting alkalinity) must be a finite number",
      );
    }

    const calciumPpm = typeof body['calciumPpm'] === "number" ? (body['calciumPpm']) : undefined;
    const magnesiumPpm = typeof body['magnesiumPpm'] === "number" ? (body['magnesiumPpm']) : undefined;
    if (calciumPpm !== undefined && (!Number.isFinite(calciumPpm) || calciumPpm < 0)) {
      throw new BadRequestError("invalid_calcium_ppm", "Body.calciumPpm must be a finite number >= 0");
    }
    if (magnesiumPpm !== undefined && (!Number.isFinite(magnesiumPpm) || magnesiumPpm < 0)) {
      throw new BadRequestError("invalid_magnesium_ppm", "Body.magnesiumPpm must be a finite number >= 0");
    }

    const gristRaw = body['grist'];
    if (!Array.isArray(gristRaw)) {
      throw new BadRequestError("invalid_grist", "Body.grist must be an array");
    }
    const grist: MashPhEstimateInput["grist"] = gristRaw.map((row, idx) => {
      const o = (row ?? {}) as Record<string, unknown>;
      const amountKg = typeof o['amountKg'] === "number" ? o['amountKg'] : NaN;
      if (!Number.isFinite(amountKg) || !(amountKg > 0)) {
        throw new BadRequestError(
          "invalid_grist_row_amount",
          `Body.grist[${idx}].amountKg must be a number > 0`,
        );
      }

      // Preferred v1 inputs:
      const diRaw = o['mashDiPh'];
      const mashDiPh =
        diRaw === null || diRaw === undefined ? null : typeof diRaw === "number" ? diRaw : NaN;
      if (typeof mashDiPh === "number" && (!Number.isFinite(mashDiPh) || mashDiPh < 0 || mashDiPh > 14)) {
        throw new BadRequestError(
          "invalid_grist_row_mash_di_ph",
          `Body.grist[${idx}].mashDiPh must be null or a finite number between 0 and 14`,
        );
      }

      const taRaw = o['mashTaToPh57_mEqPerKg'];
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
      const colorRaw = o['colorLovibond'];
      const colorLovibond =
        colorRaw === null || colorRaw === undefined ? null : typeof colorRaw === "number" ? colorRaw : NaN;
      if (typeof colorLovibond === "number" && (!Number.isFinite(colorLovibond) || colorLovibond < 0)) {
        throw new BadRequestError(
          "invalid_grist_row_color",
          `Body.grist[${idx}].colorLovibond must be null or a number >= 0`,
        );
      }

      const maltClassRaw = o['maltClass'];
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
      typeof body['waterToGristRatioQtPerLbOverride'] === "number"
        ? body['waterToGristRatioQtPerLbOverride']
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
      typeof body['acidAdded_mEqPerL'] === "number" ? (body['acidAdded_mEqPerL']) : undefined;
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
      result = mashPhEstimate({
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

    return { ok: true, result };
  });

  // v1 is now canonical: the unversioned endpoint handles both the new v1 per-row inputs and
  // the older maltClass/color inputs (it derives v1 defaults when needed).

  app.post("/water-calc/mash-acidification-target-mash-ph", (req) => {
    requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const acidType = body['acidType'] as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }

    const strengthKind = (typeof body['strengthKind'] === "string" ? body['strengthKind'] : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body['strengthValue'] === "number" ? body['strengthValue'] : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind, value: strengthValue };
    }

    const startingAlkalinityPpmCaCO3 =
      typeof body['mashStartingAlkalinityPpmCaCO3'] === "number"
        ? (body['mashStartingAlkalinityPpmCaCO3'])
        : typeof body['startingAlkalinityPpmCaCO3'] === "number"
          ? (body['startingAlkalinityPpmCaCO3'])
          : 0;
    const startingPh =
      typeof body['mashStartingPh'] === "number"
        ? (body['mashStartingPh'])
        : typeof body['startingPh'] === "number"
          ? (body['startingPh'])
          : 7.0;
    const targetMashPh =
      typeof body['targetMashPh'] === "number"
        ? (body['targetMashPh'])
        : typeof body['mashTargetPh'] === "number"
          ? (body['mashTargetPh'])
          : NaN;
    if (!Number.isFinite(targetMashPh)) {
      throw new BadRequestError("invalid_target_mash_ph", "Body.targetMashPh (or mashTargetPh) is required");
    }
    const volumeLiters =
      typeof body['mashWaterVolumeLiters'] === "number"
        ? (body['mashWaterVolumeLiters'])
        : typeof body['volumeLiters'] === "number"
          ? (body['volumeLiters'])
          : NaN;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Body.mashWaterVolumeLiters must be > 0");
    }

    const calciumPpm = typeof body['calciumPpm'] === "number" ? (body['calciumPpm']) : undefined;
    const magnesiumPpm = typeof body['magnesiumPpm'] === "number" ? (body['magnesiumPpm']) : undefined;
    if (calciumPpm !== undefined && (!Number.isFinite(calciumPpm) || calciumPpm < 0)) {
      throw new BadRequestError("invalid_calcium_ppm", "Body.calciumPpm must be a finite number >= 0");
    }
    if (magnesiumPpm !== undefined && (!Number.isFinite(magnesiumPpm) || magnesiumPpm < 0)) {
      throw new BadRequestError("invalid_magnesium_ppm", "Body.magnesiumPpm must be a finite number >= 0");
    }

    const gristRaw = body['grist'];
    if (!Array.isArray(gristRaw)) {
      throw new BadRequestError("invalid_grist", "Body.grist must be an array");
    }
    const grist: Array<{ amountKg: number; colorLovibond: number | null; maltClass: "base" | "crystal" | "roast" | "acid" }> = gristRaw.map((row, idx) => {
      const o = (row ?? {}) as Record<string, unknown>;
      const amountKg = typeof o['amountKg'] === "number" ? o['amountKg'] : NaN;
      if (!Number.isFinite(amountKg) || !(amountKg > 0)) {
        throw new BadRequestError(
          "invalid_grist_row_amount",
          `Body.grist[${idx}].amountKg must be a number > 0`,
        );
      }
      const colorRaw = o['colorLovibond'];
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

      const maltClassRaw = o['maltClass'];
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
      typeof body['waterToGristRatioQtPerLbOverride'] === "number"
        ? body['waterToGristRatioQtPerLbOverride']
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
      result = mashAcidificationTargetMashPh({
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

    return { ok: true, result };
  });

  app.post("/water-calc/salt-additions", (req) => {
    requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const volumeLiters = typeof body['volumeLiters'] === "number" ? body['volumeLiters'] : NaN;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Body.volumeLiters must be > 0");
    }

    const base = body['baseProfile'] as Partial<IonProfilePpm>;
    if (!base || typeof base !== "object") {
      throw new BadRequestError("invalid_base_profile", "Body.baseProfile is required");
    }
    const baseProfile: IonProfilePpm = {
      calcium: typeof base.calcium === "number" ? base.calcium : 0,
      magnesium: typeof base.magnesium === "number" ? base.magnesium : 0,
      sodium: typeof base.sodium === "number" ? base.sodium : 0,
      sulfate: typeof base.sulfate === "number" ? base.sulfate : 0,
      chloride: typeof base.chloride === "number" ? base.chloride : 0,
      bicarbonate: typeof base.bicarbonate === "number" ? base.bicarbonate : 0,
    };

    const additionsRaw = body['additions'];
    if (!Array.isArray(additionsRaw)) {
      throw new BadRequestError("invalid_additions", "Body.additions must be an array");
    }
    const additions: SaltAddition[] = additionsRaw.map((a) => {
      const o = (a ?? {}) as Record<string, unknown>;
      const saltKey = o['saltKey'] as SaltKey;
      if (typeof saltKey !== "string") {
        throw new BadRequestError("invalid_salt_key", "addition.saltKey must be a string");
      }
      const grams = typeof o['grams'] === "number" ? o['grams'] : NaN;
      if (!Number.isFinite(grams) || grams < 0) {
        throw new BadRequestError("invalid_grams", "addition.grams must be a number >= 0");
      }
      return { saltKey, grams };
    });

    const result = applySaltAdditions(baseProfile, volumeLiters, additions);
    return {
      ok: true,
      result,
      derivation: buildSaltAdditionsDerivation({ volumeLiters, baseProfile, result }),
    };
  });

  app.post("/water-calc/mash-overall", (req) => {
    requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const mashMode = body['mashMode'] === "manual" ? "manual" : "targetPh";
    const startingAlkalinityPpmCaCO3 =
      typeof body['mashStartingAlkalinityPpmCaCO3'] === "number"
        ? (body['mashStartingAlkalinityPpmCaCO3'])
        : typeof body['startingAlkalinityPpmCaCO3'] === "number"
          ? (body['startingAlkalinityPpmCaCO3'])
          : 0;
    const startingPh =
      typeof body['mashStartingPh'] === "number"
        ? (body['mashStartingPh'])
        : typeof body['startingPh'] === "number"
          ? (body['startingPh'])
          : 7.0;
    const targetPh =
      typeof body['mashTargetPh'] === "number"
        ? (body['mashTargetPh'])
        : typeof body['targetPh'] === "number"
          ? (body['targetPh'])
          : DEFAULT_MASH_TARGET_PH;
    const volumeLiters =
      typeof body['mashWaterVolumeLiters'] === "number"
        ? (body['mashWaterVolumeLiters'])
        : typeof body['volumeLiters'] === "number"
          ? (body['volumeLiters'])
          : NaN;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Body.mashWaterVolumeLiters must be > 0");
    }

    const base = body['baseProfile'] as Partial<IonProfilePpm>;
    if (!base || typeof base !== "object") {
      throw new BadRequestError("invalid_base_profile", "Body.baseProfile is required");
    }
    const baseProfile: IonProfilePpm = {
      calcium: typeof base.calcium === "number" ? base.calcium : 0,
      magnesium: typeof base.magnesium === "number" ? base.magnesium : 0,
      sodium: typeof base.sodium === "number" ? base.sodium : 0,
      sulfate: typeof base.sulfate === "number" ? base.sulfate : 0,
      chloride: typeof base.chloride === "number" ? base.chloride : 0,
      bicarbonate: typeof base.bicarbonate === "number" ? base.bicarbonate : 0,
    };

    const additionsRaw = body['additions'];
    if (!Array.isArray(additionsRaw)) {
      throw new BadRequestError("invalid_additions", "Body.additions must be an array");
    }
    const additions: SaltAddition[] = additionsRaw.map((a) => {
      const o = (a ?? {}) as Record<string, unknown>;
      const saltKey = o['saltKey'] as SaltKey;
      if (typeof saltKey !== "string") {
        throw new BadRequestError("invalid_salt_key", "addition.saltKey must be a string");
      }
      const grams = typeof o['grams'] === "number" ? o['grams'] : NaN;
      if (!Number.isFinite(grams) || grams < 0) {
        throw new BadRequestError("invalid_grams", "addition.grams must be a number >= 0");
      }
      return { saltKey, grams };
    });

    const salts = applySaltAdditions(baseProfile, volumeLiters, additions);

    const acidType = body['acidType'] as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }
    const strengthKind = (typeof body['strengthKind'] === "string" ? body['strengthKind'] : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body['strengthValue'] === "number" ? body['strengthValue'] : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind, value: strengthValue };
    }

    let acid;
    let phKind: "target" | "estimated" = "target";
    let phValue = targetPh;

    const gristRaw = body['grist'];
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
        const amountKg = typeof o['amountKg'] === "number" ? o['amountKg'] : NaN;
        if (!Number.isFinite(amountKg) || !(amountKg > 0)) {
          throw new BadRequestError("invalid_grist_row_amount", `Body.grist[${idx}].amountKg must be a number > 0`);
        }
        const colorRaw = o['colorLovibond'];
        const colorLovibond =
          colorRaw === null || colorRaw === undefined ? null : typeof colorRaw === "number" ? colorRaw : NaN;
        if (typeof colorLovibond === "number" && (!Number.isFinite(colorLovibond) || colorLovibond < 0)) {
          throw new BadRequestError("invalid_grist_row_color", `Body.grist[${idx}].colorLovibond must be null or a number >= 0`);
        }
        const maltClassRaw = o['maltClass'];
        const maltClass =
          maltClassRaw === "base" || maltClassRaw === "crystal" || maltClassRaw === "roast" || maltClassRaw === "acid"
            ? maltClassRaw
            : "base";
        const mashDiPh = typeof o['mashDiPh'] === "number" ? (o['mashDiPh']) : o['mashDiPh'] === null ? null : undefined;
        const mashTaToPh57_mEqPerKg =
          typeof o['mashTaToPh57_mEqPerKg'] === "number"
            ? (o['mashTaToPh57_mEqPerKg'])
            : o['mashTaToPh57_mEqPerKg'] === null
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
        typeof body['waterToGristRatioQtPerLbOverride'] === "number" ? body['waterToGristRatioQtPerLbOverride'] : undefined;

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
      const acidAddedMl = typeof body['acidAddedMl'] === "number" ? body['acidAddedMl'] : undefined;
      const acidAddedGrams = typeof body['acidAddedGrams'] === "number" ? body['acidAddedGrams'] : undefined;
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
      acid = spargeAcidification({
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

    return {
      ok: true,
      result,
      derivation: {
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
      },
    };
  });

  app.post("/water-calc/sparge-overall", (req) => {
    requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const spargeMode = body['spargeMode'] === "manual" ? "manual" : "targetPh";
    const startingAlkalinityPpmCaCO3 =
      typeof body['startingAlkalinityPpmCaCO3'] === "number"
        ? (body['startingAlkalinityPpmCaCO3'])
        : typeof body['spargeStartingAlkalinityPpmCaCO3'] === "number"
          ? (body['spargeStartingAlkalinityPpmCaCO3'])
          : 0;
    const startingPh = typeof body['startingPh'] === "number" ? (body['startingPh']) : 7.0;
    const targetPh = typeof body['targetPh'] === "number" ? (body['targetPh']) : DEFAULT_MASH_TARGET_PH;
    const volumeLiters = typeof body['volumeLiters'] === "number" ? (body['volumeLiters']) : NaN;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Body.volumeLiters must be > 0");
    }

    const base = body['baseProfile'] as Partial<IonProfilePpm>;
    if (!base || typeof base !== "object") {
      throw new BadRequestError("invalid_base_profile", "Body.baseProfile is required");
    }
    const baseProfile: IonProfilePpm = {
      calcium: typeof base.calcium === "number" ? base.calcium : 0,
      magnesium: typeof base.magnesium === "number" ? base.magnesium : 0,
      sodium: typeof base.sodium === "number" ? base.sodium : 0,
      sulfate: typeof base.sulfate === "number" ? base.sulfate : 0,
      chloride: typeof base.chloride === "number" ? base.chloride : 0,
      bicarbonate: typeof base.bicarbonate === "number" ? base.bicarbonate : 0,
    };

    const additionsRaw = body['additions'];
    if (!Array.isArray(additionsRaw)) {
      throw new BadRequestError("invalid_additions", "Body.additions must be an array");
    }
    const additions: SaltAddition[] = additionsRaw.map((a) => {
      const o = (a ?? {}) as Record<string, unknown>;
      const saltKey = o['saltKey'] as SaltKey;
      if (typeof saltKey !== "string") {
        throw new BadRequestError("invalid_salt_key", "addition.saltKey must be a string");
      }
      const grams = typeof o['grams'] === "number" ? o['grams'] : NaN;
      if (!Number.isFinite(grams) || grams < 0) {
        throw new BadRequestError("invalid_grams", "addition.grams must be a number >= 0");
      }
      return { saltKey, grams };
    });

    const salts = applySaltAdditions(baseProfile, volumeLiters, additions);

    const acidType = body['acidType'] as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }
    const strengthKind = (typeof body['strengthKind'] === "string" ? body['strengthKind'] : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body['strengthValue'] === "number" ? body['strengthValue'] : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind, value: strengthValue };
    }

    let acid;
    const calciumPpm = salts.resultingProfile.calcium;
    const magnesiumPpm = salts.resultingProfile.magnesium;

    if (spargeMode === "manual") {
      const acidAddedMl = typeof body['acidAddedMl'] === "number" ? body['acidAddedMl'] : undefined;
      const acidAddedGrams = typeof body['acidAddedGrams'] === "number" ? body['acidAddedGrams'] : undefined;
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
      const r = spargeAcidification({
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

    return {
      ok: true,
      result,
      derivation: {
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
      },
    };
  });

  app.post("/water-calc/boil-overall", (req) => {
    requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const boilMode = body['boilMode'] === "manual" ? "manual" : "targetPh";
    const startingAlkalinityPpmCaCO3 =
      typeof body['startingAlkalinityPpmCaCO3'] === "number"
        ? (body['startingAlkalinityPpmCaCO3'])
        : typeof body['boilStartingAlkalinityPpmCaCO3'] === "number"
          ? (body['boilStartingAlkalinityPpmCaCO3'])
          : 0;
    const startingPh = typeof body['startingPh'] === "number" ? (body['startingPh']) : 7.0;
    const targetPh = typeof body['targetPh'] === "number" ? (body['targetPh']) : DEFAULT_MASH_TARGET_PH;
    const volumeLiters = typeof body['volumeLiters'] === "number" ? (body['volumeLiters']) : NaN;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Body.volumeLiters must be > 0");
    }

    const base = body['baseProfile'] as Partial<IonProfilePpm>;
    if (!base || typeof base !== "object") {
      throw new BadRequestError("invalid_base_profile", "Body.baseProfile is required");
    }
    const baseProfile: IonProfilePpm = {
      calcium: typeof base.calcium === "number" ? base.calcium : 0,
      magnesium: typeof base.magnesium === "number" ? base.magnesium : 0,
      sodium: typeof base.sodium === "number" ? base.sodium : 0,
      sulfate: typeof base.sulfate === "number" ? base.sulfate : 0,
      chloride: typeof base.chloride === "number" ? base.chloride : 0,
      bicarbonate: typeof base.bicarbonate === "number" ? base.bicarbonate : 0,
    };

    const additionsRaw = body['additions'];
    if (!Array.isArray(additionsRaw)) {
      throw new BadRequestError("invalid_additions", "Body.additions must be an array");
    }
    const additions: SaltAddition[] = additionsRaw.map((a) => {
      const o = (a ?? {}) as Record<string, unknown>;
      const saltKey = o['saltKey'] as SaltKey;
      if (typeof saltKey !== "string") {
        throw new BadRequestError("invalid_salt_key", "addition.saltKey must be a string");
      }
      const grams = typeof o['grams'] === "number" ? o['grams'] : NaN;
      if (!Number.isFinite(grams) || grams < 0) {
        throw new BadRequestError("invalid_grams", "addition.grams must be a number >= 0");
      }
      return { saltKey, grams };
    });

    const salts = applySaltAdditions(baseProfile, volumeLiters, additions);

    const acidType = body['acidType'] as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }
    const strengthKind = (typeof body['strengthKind'] === "string" ? body['strengthKind'] : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body['strengthValue'] === "number" ? body['strengthValue'] : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind, value: strengthValue };
    }

    let acid;
    const calciumPpm = salts.resultingProfile.calcium;
    const magnesiumPpm = salts.resultingProfile.magnesium;

    if (boilMode === "manual") {
      const acidAddedMl = typeof body['acidAddedMl'] === "number" ? body['acidAddedMl'] : undefined;
      const acidAddedGrams = typeof body['acidAddedGrams'] === "number" ? body['acidAddedGrams'] : undefined;
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
      const r = spargeAcidification({
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

    return {
      ok: true,
      result,
      derivation: {
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
      },
    };
  });
}

