import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { BadRequestError } from "../errors.js";
import {
  spargeAcidification,
  type AcidStrength,
  type SpargeAcidType,
} from "../domain/waterCalc/spargeAcidification.js";
import { mashAcidificationManual } from "../domain/waterCalc/mashAcidificationManual.js";
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

