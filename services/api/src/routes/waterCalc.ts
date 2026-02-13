import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { BadRequestError } from "../errors.js";
import {
  spargeAcidification,
  type AcidStrength,
  type SpargeAcidType,
} from "../domain/waterCalc/spargeAcidification.js";
import { mashAcidificationManual } from "../domain/waterCalc/mashAcidificationManual.js";
import { mashPhEstimateV0 } from "../domain/waterCalc/mashPhEstimateV0.js";
import { mashAcidificationTargetMashPhV0 } from "../domain/waterCalc/mashAcidificationTargetMashPhV0.js";
import {
  applySaltAdditions,
  type IonProfilePpm,
  type SaltAddition,
  type SaltKey,
} from "../domain/waterCalc/saltAdditions.js";

export async function waterCalcRoutes(app: FastifyInstance) {
  app.post("/water-calc/sparge-acidification", async (req) => {
    requireActiveAccount(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const acidType = body.acidType as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }

    const strengthKind = (typeof body.strengthKind === "string" ? body.strengthKind : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body.strengthValue === "number" ? body.strengthValue : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind as any, value: strengthValue } as AcidStrength;
    }

    const startingAlkalinityPpmCaCO3 =
      typeof body.startingAlkalinityPpmCaCO3 === "number" ? body.startingAlkalinityPpmCaCO3 : 0;
    const startingPh = typeof body.startingPh === "number" ? body.startingPh : 7.0;
    const targetPh = typeof body.targetPh === "number" ? body.targetPh : 5.6;
    const volumeLiters = typeof body.volumeLiters === "number" ? body.volumeLiters : 1.0;

    const result = spargeAcidification({
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh,
      volumeLiters,
      acidType,
      strength,
    });

    return { ok: true, result };
  });

  // Mash water acidification (Sheet 4, v0): same math as sparge acidification, but stored/displayed separately.
  app.post("/water-calc/mash-acidification", async (req) => {
    requireActiveAccount(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const acidType = body.acidType as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }

    const strengthKind = (typeof body.strengthKind === "string" ? body.strengthKind : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body.strengthValue === "number" ? body.strengthValue : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind as any, value: strengthValue } as AcidStrength;
    }

    // Accept mash-prefixed or generic field names.
    const startingAlkalinityPpmCaCO3 =
      typeof body.mashStartingAlkalinityPpmCaCO3 === "number"
        ? (body.mashStartingAlkalinityPpmCaCO3 as number)
        : typeof body.startingAlkalinityPpmCaCO3 === "number"
          ? (body.startingAlkalinityPpmCaCO3 as number)
          : 0;
    const startingPh =
      typeof body.mashStartingPh === "number"
        ? (body.mashStartingPh as number)
        : typeof body.startingPh === "number"
          ? (body.startingPh as number)
          : 7.0;
    const targetPh =
      typeof body.mashTargetPh === "number"
        ? (body.mashTargetPh as number)
        : typeof body.targetPh === "number"
          ? (body.targetPh as number)
          : 5.6;
    const volumeLiters =
      typeof body.mashWaterVolumeLiters === "number"
        ? (body.mashWaterVolumeLiters as number)
        : typeof body.volumeLiters === "number"
          ? (body.volumeLiters as number)
          : 1.0;

    const result = spargeAcidification({
      startingAlkalinityPpmCaCO3,
      startingPh,
      targetPh,
      volumeLiters,
      acidType,
      strength,
    });

    return { ok: true, result };
  });

  // Mash water acidification manual-entry mode (Sheet 4, v0): user enters acid amount; we estimate achieved pH.
  app.post("/water-calc/mash-acidification-manual", async (req) => {
    requireActiveAccount(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const acidType = body.acidType as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }

    const strengthKind = (typeof body.strengthKind === "string" ? body.strengthKind : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body.strengthValue === "number" ? body.strengthValue : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind as any, value: strengthValue } as AcidStrength;
    }

    // Accept mash-prefixed or generic field names.
    const startingAlkalinityPpmCaCO3 =
      typeof body.mashStartingAlkalinityPpmCaCO3 === "number"
        ? (body.mashStartingAlkalinityPpmCaCO3 as number)
        : typeof body.startingAlkalinityPpmCaCO3 === "number"
          ? (body.startingAlkalinityPpmCaCO3 as number)
          : 0;
    const startingPh =
      typeof body.mashStartingPh === "number"
        ? (body.mashStartingPh as number)
        : typeof body.startingPh === "number"
          ? (body.startingPh as number)
          : 7.0;
    const volumeLiters =
      typeof body.mashWaterVolumeLiters === "number"
        ? (body.mashWaterVolumeLiters as number)
        : typeof body.volumeLiters === "number"
          ? (body.volumeLiters as number)
          : 1.0;

    const acidAddedMl = typeof body.acidAddedMl === "number" ? body.acidAddedMl : undefined;
    const acidAddedGrams = typeof body.acidAddedGrams === "number" ? body.acidAddedGrams : undefined;
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

    return { ok: true, result };
  });

  app.post("/water-calc/mash-ph-estimate", async (req) => {
    requireActiveAccount(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const volumeLiters =
      typeof body.mashWaterVolumeLiters === "number"
        ? (body.mashWaterVolumeLiters as number)
        : typeof body.volumeLiters === "number"
          ? (body.volumeLiters as number)
          : NaN;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Body.volumeLiters must be > 0");
    }

    const alkalinityPpmCaCO3 =
      typeof body.alkalinityPpmCaCO3 === "number"
        ? (body.alkalinityPpmCaCO3 as number)
        : typeof body.mashStartingAlkalinityPpmCaCO3 === "number"
          ? (body.mashStartingAlkalinityPpmCaCO3 as number)
          : typeof body.startingAlkalinityPpmCaCO3 === "number"
            ? (body.startingAlkalinityPpmCaCO3 as number)
            : NaN;
    if (!Number.isFinite(alkalinityPpmCaCO3)) {
      throw new BadRequestError(
        "invalid_alkalinity",
        "Body.alkalinityPpmCaCO3 (or starting alkalinity) must be a finite number",
      );
    }

    const gristRaw = body.grist;
    if (!Array.isArray(gristRaw)) {
      throw new BadRequestError("invalid_grist", "Body.grist must be an array");
    }
    const grist = gristRaw.map((row, idx) => {
      const o = (row ?? {}) as Record<string, unknown>;
      const amountKg = typeof o.amountKg === "number" ? o.amountKg : NaN;
      if (!Number.isFinite(amountKg) || !(amountKg > 0)) {
        throw new BadRequestError(
          "invalid_grist_row_amount",
          `Body.grist[${idx}].amountKg must be a number > 0`,
        );
      }
      const colorRaw = o.colorLovibond;
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

      const maltClassRaw = o.maltClass;
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
      typeof body.waterToGristRatioQtPerLbOverride === "number"
        ? body.waterToGristRatioQtPerLbOverride
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
      typeof body.acidAdded_mEqPerL === "number" ? (body.acidAdded_mEqPerL as number) : undefined;
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
      result = mashPhEstimateV0({
        volumeLiters,
        alkalinityPpmCaCO3,
        grist,
        waterToGristRatioQtPerLbOverride,
        acidAdded_mEqPerL,
      });
    } catch (e) {
      throw new BadRequestError("invalid_mash_ph_estimate_input", (e as Error)?.message || "Invalid input");
    }

    return { ok: true, result };
  });

  app.post("/water-calc/mash-acidification-target-mash-ph", async (req) => {
    requireActiveAccount(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const acidType = body.acidType as SpargeAcidType;
    if (typeof acidType !== "string") {
      throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
    }

    const strengthKind = (typeof body.strengthKind === "string" ? body.strengthKind : "percent") as
      | "percent"
      | "normality"
      | "molarity"
      | "solid";
    const strengthValue = typeof body.strengthValue === "number" ? body.strengthValue : undefined;

    let strength: AcidStrength;
    if (strengthKind === "solid") {
      strength = { kind: "solid" };
    } else {
      if (typeof strengthValue !== "number") {
        throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
      }
      strength = { kind: strengthKind as any, value: strengthValue } as AcidStrength;
    }

    const startingAlkalinityPpmCaCO3 =
      typeof body.mashStartingAlkalinityPpmCaCO3 === "number"
        ? (body.mashStartingAlkalinityPpmCaCO3 as number)
        : typeof body.startingAlkalinityPpmCaCO3 === "number"
          ? (body.startingAlkalinityPpmCaCO3 as number)
          : 0;
    const startingPh =
      typeof body.mashStartingPh === "number"
        ? (body.mashStartingPh as number)
        : typeof body.startingPh === "number"
          ? (body.startingPh as number)
          : 7.0;
    const targetMashPh =
      typeof body.targetMashPh === "number"
        ? (body.targetMashPh as number)
        : typeof body.mashTargetPh === "number"
          ? (body.mashTargetPh as number)
          : NaN;
    if (!Number.isFinite(targetMashPh)) {
      throw new BadRequestError("invalid_target_mash_ph", "Body.targetMashPh (or mashTargetPh) is required");
    }
    const volumeLiters =
      typeof body.mashWaterVolumeLiters === "number"
        ? (body.mashWaterVolumeLiters as number)
        : typeof body.volumeLiters === "number"
          ? (body.volumeLiters as number)
          : NaN;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Body.mashWaterVolumeLiters must be > 0");
    }

    const gristRaw = body.grist;
    if (!Array.isArray(gristRaw)) {
      throw new BadRequestError("invalid_grist", "Body.grist must be an array");
    }
    const grist = gristRaw.map((row, idx) => {
      const o = (row ?? {}) as Record<string, unknown>;
      const amountKg = typeof o.amountKg === "number" ? o.amountKg : NaN;
      if (!Number.isFinite(amountKg) || !(amountKg > 0)) {
        throw new BadRequestError(
          "invalid_grist_row_amount",
          `Body.grist[${idx}].amountKg must be a number > 0`,
        );
      }
      const colorRaw = o.colorLovibond;
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

      const maltClassRaw = o.maltClass;
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
      typeof body.waterToGristRatioQtPerLbOverride === "number"
        ? body.waterToGristRatioQtPerLbOverride
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
      result = mashAcidificationTargetMashPhV0({
        startingAlkalinityPpmCaCO3,
        startingPh,
        volumeLiters,
        targetMashPh,
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

  app.post("/water-calc/salt-additions", async (req) => {
    requireActiveAccount(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const volumeLiters = typeof body.volumeLiters === "number" ? body.volumeLiters : NaN;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Body.volumeLiters must be > 0");
    }

    const base = body.baseProfile as Partial<IonProfilePpm>;
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

    const additionsRaw = body.additions;
    if (!Array.isArray(additionsRaw)) {
      throw new BadRequestError("invalid_additions", "Body.additions must be an array");
    }
    const additions: SaltAddition[] = additionsRaw.map((a) => {
      const o = (a ?? {}) as Record<string, unknown>;
      const saltKey = o.saltKey as SaltKey;
      if (typeof saltKey !== "string") {
        throw new BadRequestError("invalid_salt_key", "addition.saltKey must be a string");
      }
      const grams = typeof o.grams === "number" ? o.grams : NaN;
      if (!Number.isFinite(grams) || grams < 0) {
        throw new BadRequestError("invalid_grams", "addition.grams must be a number >= 0");
      }
      return { saltKey, grams };
    });

    const result = applySaltAdditions(baseProfile, volumeLiters, additions);
    return { ok: true, result };
  });
}

