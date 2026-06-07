import type {
  MashAcidificationTargetMashPhResult,
  RecipeWaterSettingsSavedRef,
  WaterAcidificationManualResult,
  WaterAcidificationResult,
  WaterOverallResult,
  WaterSaltAdditionsResult,
} from "./computeAndSave";

import { parseIonProfilePpm } from "./parseComputeAndSaveDerivation.js";

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function parseSettingsSavedRef(v: unknown, label: string): RecipeWaterSettingsSavedRef {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const recipeId = typeof v['recipeId'] === "string" ? v['recipeId'] : "";
  if (!recipeId) throw new Error(`Invalid ${label}.recipeId`);
  return { recipeId };
}

export function parseSaltAdditionsResult(v: unknown, label: string): WaterSaltAdditionsResult {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const baseProfile = parseIonProfilePpm(v['baseProfile'], `${label}.baseProfile`);
  const resultingProfile = parseIonProfilePpm(v['resultingProfile'], `${label}.resultingProfile`);
  const deltasPpm = parseIonProfilePpm(v['deltasPpm'], `${label}.deltasPpm`);
  const breakdown = Array.isArray(v['breakdown'])
    ? v['breakdown']
        .filter((r: unknown): r is Record<string, unknown> =>
          isObject(r) && typeof r['saltKey'] === "string" && isFiniteNumber(r['grams']),
        )
        .map((r) => ({
          saltKey: r['saltKey'] as string,
          grams: r['grams'] as number,
          deltasPpm: (isObject(r['deltasPpm']) ? r['deltasPpm'] : {}),
        }))
    : [];
  return { baseProfile, resultingProfile, deltasPpm, breakdown };
}

export function parseAcidificationResult(v: unknown, label: string): WaterAcidificationResult {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const finalAlkalinityPpmCaCO3 = isFiniteNumber(v['finalAlkalinityPpmCaCO3']) ? v['finalAlkalinityPpmCaCO3'] : NaN;
  const sulfateAddedPpm = isFiniteNumber(v['sulfateAddedPpm']) ? v['sulfateAddedPpm'] : NaN;
  const chlorideAddedPpm = isFiniteNumber(v['chlorideAddedPpm']) ? v['chlorideAddedPpm'] : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  if (!Number.isFinite(sulfateAddedPpm)) throw new Error(`Invalid ${label}.sulfateAddedPpm`);
  if (!Number.isFinite(chlorideAddedPpm)) throw new Error(`Invalid ${label}.chlorideAddedPpm`);
  return {
    acidRequiredMl: v['acidRequiredMl'] === null ? null : isFiniteNumber(v['acidRequiredMl']) ? v['acidRequiredMl'] : null,
    acidRequiredTsp: v['acidRequiredTsp'] === null ? null : isFiniteNumber(v['acidRequiredTsp']) ? v['acidRequiredTsp'] : null,
    acidRequiredGrams: v['acidRequiredGrams'] === null ? null : isFiniteNumber(v['acidRequiredGrams']) ? v['acidRequiredGrams'] : null,
    acidRequiredKg: v['acidRequiredKg'] === null ? null : isFiniteNumber(v['acidRequiredKg']) ? v['acidRequiredKg'] : null,
    finalAlkalinityPpmCaCO3,
    sulfateAddedPpm,
    chlorideAddedPpm,
    debug: isObject(v['debug']) ? v['debug'] : undefined,
  };
}

export function parseAcidificationManualResult(v: unknown, label: string): WaterAcidificationManualResult {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const achievedPh = isFiniteNumber(v['achievedPh']) ? v['achievedPh'] : NaN;
  if (!Number.isFinite(achievedPh)) throw new Error(`Invalid ${label}.achievedPh`);
  const clamped = v['clamped'] === "none" || v['clamped'] === "low" || v['clamped'] === "high" ? v['clamped'] : "none";
  const iterations = isFiniteNumber(v['iterations']) ? v['iterations'] : 0;
  const targetAmount = isFiniteNumber(v['targetAmount']) ? v['targetAmount'] : NaN;
  const predictedAmount = isFiniteNumber(v['predictedAmount']) ? v['predictedAmount'] : NaN;
  return {
    achievedPh,
    predicted: parseAcidificationResult(v['predicted'], `${label}.predicted`),
    clamped,
    iterations,
    targetAmount,
    predictedAmount,
  };
}

export function parseMashTargetMashPhResult(v: unknown, label: string): MashAcidificationTargetMashPhResult {
  const base = parseAcidificationResult(v, label) as MashAcidificationTargetMashPhResult;
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const estimatedMashPhRoomTemp = isFiniteNumber(v['estimatedMashPhRoomTemp']) ? v['estimatedMashPhRoomTemp'] : NaN;
  if (!Number.isFinite(estimatedMashPhRoomTemp)) throw new Error(`Invalid ${label}.estimatedMashPhRoomTemp`);
  return { ...base, estimatedMashPhRoomTemp };
}

export function parseOverallResult(v: unknown, label: string): WaterOverallResult {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const calculatedAt = typeof v['calculatedAt'] === "string" ? v['calculatedAt'] : "";
  if (!calculatedAt) throw new Error(`Invalid ${label}.calculatedAt`);
  const ionsPpm = parseIonProfilePpm(v['ionsPpm'], `${label}.ionsPpm`);
  const finalAlkalinityPpmCaCO3 = isFiniteNumber(v['finalAlkalinityPpmCaCO3']) ? v['finalAlkalinityPpmCaCO3'] : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  const ph = isObject(v['ph']) ? v['ph'] : null;
  const kind = ph?.['kind'] === "target" || ph?.['kind'] === "estimated" ? ph['kind'] : null;
  const value = isFiniteNumber(ph?.['value']) ? ph['value'] : null;
  if (!kind || value === null) throw new Error(`Invalid ${label}.ph`);
  return {
    calculatedAt,
    ionsPpm,
    finalAlkalinityPpmCaCO3,
    ph: { kind, value },
    debug: isObject(v['debug']) ? v['debug'] : undefined,
  };
}
