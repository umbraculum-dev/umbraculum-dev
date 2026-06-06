import type { ExpectedRaRange } from "@umbraculum/contracts";
import type { IonProfilePpm } from "../../domain/waterCalc/saltAdditions.js";
import { isObject, isFiniteNumber } from "../../lib/typeGuards.js";

export type MashOverallLastResultJson = {
  ionsPpm: IonProfilePpm;
  finalAlkalinityPpmCaCO3: number;
  ph: { kind: "target" | "estimated"; value: number };
};

export function displayAlkalinityPpmCaCO3(v: number): number {
  if (v < 0 && v > -1) return 0;
  return v;
}

export function calcResidualAlkalinityPpmCaCO3(args: {
  alkalinityPpmCaCO3: number;
  calciumPpm: number;
  magnesiumPpm: number;
}): number {
  return args.alkalinityPpmCaCO3 - 0.713 * args.calciumPpm - 0.588 * args.magnesiumPpm;
}

export function parseIonProfile(v: unknown): IonProfilePpm | null {
  if (!isObject(v)) return null;
  const keys: Array<keyof IonProfilePpm> = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  const out: Partial<IonProfilePpm> = {};
  for (const k of keys) {
    const val = v[k];
    if (!isFiniteNumber(val)) return null;
    out[k] = val;
  }
  return out as IonProfilePpm;
}

export function parseMashOverallLastResultJson(v: unknown): MashOverallLastResultJson | null {
  if (!isObject(v)) return null;
  const ph = v["ph"];
  if (!isObject(ph)) return null;
  if (!isFiniteNumber(v["finalAlkalinityPpmCaCO3"])) return null;
  if (typeof ph["kind"] !== "string" || !isFiniteNumber(ph["value"])) return null;

  const ionsPpm = parseIonProfile(v["ionsPpm"]);
  if (!ionsPpm) return null;

  const kind = ph["kind"] === "target" ? "target" : "estimated";
  return {
    ionsPpm,
    finalAlkalinityPpmCaCO3: v["finalAlkalinityPpmCaCO3"],
    ph: { kind, value: ph["value"] },
  };
}

export function parseSaltsBreakdown(v: unknown): Array<{ saltKey: string; grams: number }> | null {
  if (!isObject(v)) return null;
  const result = isObject(v["result"]) ? v["result"] : null;
  const b = result?.["breakdown"];
  if (!Array.isArray(b)) return null;

  const out: Array<{ saltKey: string; grams: number }> = [];
  for (const row of b) {
    if (!isObject(row)) continue;
    const saltKey = typeof row["saltKey"] === "string" ? row["saltKey"] : null;
    const grams = isFiniteNumber(row["grams"]) ? row["grams"] : null;
    if (!saltKey || grams == null || !(grams > 0)) continue;
    out.push({ saltKey, grams });
  }
  return out.length ? out : null;
}

export function parseSaltsResultingProfile(v: unknown): IonProfilePpm | null {
  if (!isObject(v)) return null;
  const result = isObject(v["result"]) ? v["result"] : null;
  return parseIonProfile(result?.["resultingProfile"]);
}

export function inferExpectedRa(style: { name: string; category: string | null }): ExpectedRaRange | null {
  const text = `${style.category ?? ""} ${style.name}`.trim().toLowerCase();
  const includes = (needle: string) => text.includes(needle);

  if (
    includes("stout") ||
    includes("porter") ||
    includes("schwarz") ||
    includes("dunkel") ||
    includes("dark") ||
    includes("black")
  ) {
    return { min: 50, max: 200, rationaleKey: "styleExpectedRaDark" };
  }
  if (
    includes("ipa") ||
    includes("pale") ||
    includes("pils") ||
    includes("lager") ||
    includes("blonde") ||
    includes("kölsch") ||
    includes("kolsch") ||
    includes("saison")
  ) {
    return { min: -50, max: 50, rationaleKey: "styleExpectedRaPale" };
  }
  if (
    includes("amber") ||
    includes("red") ||
    includes("brown") ||
    includes("bock") ||
    includes("vienna") ||
    includes("märzen") ||
    includes("marzen")
  ) {
    return { min: 0, max: 100, rationaleKey: "styleExpectedRaAmber" };
  }

  return null;
}
