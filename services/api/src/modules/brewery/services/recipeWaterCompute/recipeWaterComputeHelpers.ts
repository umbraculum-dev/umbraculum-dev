import { BadRequestError } from "../../../../errors.js";
import type { IonProfilePpm, SaltAddition, SaltKey } from "../waterCalc/saltAdditions.js";
import type { AcidStrength, SpargeAcidType } from "../waterCalc/spargeAcidification.js";

type StrengthKind = "percent" | "normality" | "molarity" | "solid";
export type Mode = "targetPh" | "manual";

export type WaterProfileLite = {
  id: string;
  scope: "system" | "public" | "account";
  workspaceId: string | null;
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

export function ensureFinite(n: unknown, field: string) {
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n)) {
    throw new BadRequestError("invalid_number", `Body.${field} must be a number`);
  }
  return n;
}

const STRENGTH_KINDS = ["percent", "normality", "molarity", "solid"] as const;
const ACID_TYPES = [
  "acetic",
  "hydrochloric",
  "lactic",
  "phosphoric",
  "sulfuric",
  "citric",
  "tartaric",
  "malic",
] as const;

export function parseStrengthKind(value: unknown, field: string): StrengthKind {
  if (typeof value === "string" && (STRENGTH_KINDS as readonly string[]).includes(value)) {
    return value as StrengthKind;
  }
  throw new BadRequestError(
    "invalid_strength_kind",
    `Body.${field} must be one of ${STRENGTH_KINDS.join(", ")}`,
  );
}

export function parseAcidType(value: unknown, field: string): SpargeAcidType {
  if (typeof value === "string" && (ACID_TYPES as readonly string[]).includes(value)) {
    return value as SpargeAcidType;
  }
  throw new BadRequestError(
    "invalid_acid_type",
    `Body.${field} must be one of ${ACID_TYPES.join(", ")}`,
  );
}

export function parseStrength(args: { strengthKind: StrengthKind; strengthValue?: number | null }): AcidStrength {
  const kind = args.strengthKind;
  if (kind === "solid") return { kind: "solid" };
  const v = args.strengthValue;
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a finite number");
  }
  return { kind, value: v };
}

/**
 * AcidStrength has a discriminated `kind`; only the non-"solid" variants carry
 * a numeric `value`. This narrows safely so callers don't reach for `(strength as any).value`.
 */
export function strengthValueOrNull(strength: AcidStrength): number | null {
  return strength.kind === "solid" ? null : strength.value;
}

export function mixIonProfilesByVolume(a: IonProfilePpm, aVolumeLiters: number, b: IonProfilePpm, bVolumeLiters: number): IonProfilePpm | null {
  const av = Math.max(0, aVolumeLiters);
  const bv = Math.max(0, bVolumeLiters);
  const total = av + bv;
  if (!(total > 0)) return null;
  const mix = (x: number, y: number) => (x * av + y * bv) / total;
  return {
    calcium: mix(a.calcium, b.calcium),
    magnesium: mix(a.magnesium, b.magnesium),
    sodium: mix(a.sodium, b.sodium),
    sulfate: mix(a.sulfate, b.sulfate),
    chloride: mix(a.chloride, b.chloride),
    bicarbonate: mix(a.bicarbonate, b.bicarbonate),
  };
}

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

export function parseSaltAdditions(value: unknown, field: string): SaltAddition[] {
  if (!Array.isArray(value)) {
    throw new BadRequestError("invalid_salt_additions", `Body.${field} must be an array`);
  }
  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const saltKey = o['saltKey'] as SaltKey;
    if (typeof saltKey !== "string") {
      throw new BadRequestError("invalid_salt_key", `Body.${field}[${idx}].saltKey must be a string`);
    }
    const grams = typeof o['grams'] === "number" ? o['grams'] : NaN;
    if (!Number.isFinite(grams) || grams < 0) {
      throw new BadRequestError("invalid_salt_grams", `Body.${field}[${idx}].grams must be a number >= 0`);
    }
    return { saltKey, grams };
  });
}
