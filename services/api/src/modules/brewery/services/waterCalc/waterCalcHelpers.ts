import { WaterCalcResultOnlyResponseSchema, WaterCalcWithDerivationResponseSchema } from "@umbraculum/brewery-contracts";

import { BadRequestError } from "../../../../errors.js";
import type { AcidStrength, SpargeAcidType } from "./spargeAcidification.js";
import type { IonProfilePpm, SaltAddition, SaltKey } from "./saltAdditions.js";

export function colorLovibondToEbc(colorLovibond: number | null): number | null {
  if (colorLovibond === null) return null;
  if (!Number.isFinite(colorLovibond) || colorLovibond < 0) return null;
  // Pragmatic approximation for defaults lookup. (We only need a reasonable magnitude.)
  return colorLovibond * 1.97;
}

export function mashPhModelKeyFromMaltClass(maltClass: string) {
  if (maltClass === "base") return "base_pale";
  if (maltClass === "crystal") return "crystal";
  if (maltClass === "roast") return "roasted";
  if (maltClass === "acid") return "acidulated";
  return "base_pale";
}

export function waterCalcWithDerivationResponse(result: unknown, derivation: unknown) {
  return WaterCalcWithDerivationResponseSchema.parse({ ok: true, result, derivation });
}

export function waterCalcResultOnlyResponse(result: unknown) {
  return WaterCalcResultOnlyResponseSchema.parse({ ok: true, result });
}

export function parseAcidTypeAndStrength(body: Record<string, unknown>): {
  acidType: SpargeAcidType;
  strength: AcidStrength;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  strengthValue: number | undefined;
} {
  const acidType = body["acidType"] as SpargeAcidType;
  if (typeof acidType !== "string") {
    throw new BadRequestError("invalid_acid_type", "Body.acidType is required");
  }

  const strengthKind = (typeof body["strengthKind"] === "string" ? body["strengthKind"] : "percent") as
    | "percent"
    | "normality"
    | "molarity"
    | "solid";
  const strengthValue = typeof body["strengthValue"] === "number" ? body["strengthValue"] : undefined;

  let strength: AcidStrength;
  if (strengthKind === "solid") {
    strength = { kind: "solid" };
  } else {
    if (typeof strengthValue !== "number") {
      throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a number");
    }
    strength = { kind: strengthKind, value: strengthValue };
  }

  return { acidType, strength, strengthKind, strengthValue };
}

export function validateOptionalCalciumMagnesiumPpm(body: Record<string, unknown>): {
  calciumPpm: number | undefined;
  magnesiumPpm: number | undefined;
} {
  const calciumPpm = typeof body["calciumPpm"] === "number" ? body["calciumPpm"] : undefined;
  const magnesiumPpm = typeof body["magnesiumPpm"] === "number" ? body["magnesiumPpm"] : undefined;
  if (calciumPpm !== undefined && (!Number.isFinite(calciumPpm) || calciumPpm < 0)) {
    throw new BadRequestError("invalid_calcium_ppm", "Body.calciumPpm must be a finite number >= 0");
  }
  if (magnesiumPpm !== undefined && (!Number.isFinite(magnesiumPpm) || magnesiumPpm < 0)) {
    throw new BadRequestError("invalid_magnesium_ppm", "Body.magnesiumPpm must be a finite number >= 0");
  }
  return { calciumPpm, magnesiumPpm };
}

export function parseBaseProfile(body: Record<string, unknown>): IonProfilePpm {
  const base = body["baseProfile"] as Partial<IonProfilePpm>;
  if (!base || typeof base !== "object") {
    throw new BadRequestError("invalid_base_profile", "Body.baseProfile is required");
  }
  return {
    calcium: typeof base.calcium === "number" ? base.calcium : 0,
    magnesium: typeof base.magnesium === "number" ? base.magnesium : 0,
    sodium: typeof base.sodium === "number" ? base.sodium : 0,
    sulfate: typeof base.sulfate === "number" ? base.sulfate : 0,
    chloride: typeof base.chloride === "number" ? base.chloride : 0,
    bicarbonate: typeof base.bicarbonate === "number" ? base.bicarbonate : 0,
  };
}

export function parseSaltAdditions(body: Record<string, unknown>): SaltAddition[] {
  const additionsRaw = body["additions"];
  if (!Array.isArray(additionsRaw)) {
    throw new BadRequestError("invalid_additions", "Body.additions must be an array");
  }
  return additionsRaw.map((a) => {
    const o = (a ?? {}) as Record<string, unknown>;
    const saltKey = o["saltKey"] as SaltKey;
    if (typeof saltKey !== "string") {
      throw new BadRequestError("invalid_salt_key", "addition.saltKey must be a string");
    }
    const grams = typeof o["grams"] === "number" ? o["grams"] : NaN;
    if (!Number.isFinite(grams) || grams < 0) {
      throw new BadRequestError("invalid_grams", "addition.grams must be a number >= 0");
    }
    return { saltKey, grams };
  });
}
