import type { IonProfilePpm } from "./ionProfile";
import type { NumberFormatHintV1 } from "../format/numberFormat";
import type {
  ExpectedRaRange,
  RecipeWaterHubStreamSummary,
  RecipeWaterHubSummaryResponse,
} from "./hubSummary";

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function parseIonProfilePpm(v: unknown): IonProfilePpm | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const keys: Array<keyof IonProfilePpm> = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  for (const k of keys) if (!isFiniteNumber(o[k as string])) return null;
  return {
    calcium: o['calcium'] as number,
    magnesium: o['magnesium'] as number,
    sodium: o['sodium'] as number,
    sulfate: o['sulfate'] as number,
    chloride: o['chloride'] as number,
    bicarbonate: o['bicarbonate'] as number,
  };
}

function parseExpectedRaRange(v: unknown): ExpectedRaRange | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const rationaleKey =
    o['rationaleKey'] === "styleExpectedRaDark" || o['rationaleKey'] === "styleExpectedRaPale" || o['rationaleKey'] === "styleExpectedRaAmber"
      ? (o['rationaleKey'] as ExpectedRaRange["rationaleKey"])
      : null;
  if (!rationaleKey) return null;
  if (!isFiniteNumber(o['min']) || !isFiniteNumber(o['max'])) return null;
  return { min: o['min'] as number, max: o['max'] as number, rationaleKey };
}

function parseStream(v: unknown): RecipeWaterHubStreamSummary | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const key = o['key'] === "mash" || o['key'] === "sparge" || o['key'] === "boil" ? (o['key'] as "mash" | "sparge" | "boil") : null;
  if (!key) return null;

  const volumeLiters = o['volumeLiters'] === null ? null : isFiniteNumber(o['volumeLiters']) ? o['volumeLiters'] : null;
  const ph = o['ph'] === null ? null : isFiniteNumber(o['ph']) ? o['ph'] : null;
  const finalAlkalinityPpmCaCO3 =
    o['finalAlkalinityPpmCaCO3'] === null ? null : isFiniteNumber(o['finalAlkalinityPpmCaCO3']) ? o['finalAlkalinityPpmCaCO3'] : null;
  const ionsPpm = parseIonProfilePpm(o['ionsPpm']);

  const saltsBreakdown = (() => {
    if (o['saltsBreakdown'] === null) return null;
    if (!Array.isArray(o['saltsBreakdown'])) return null;
    const rows: Array<{ saltKey: string; grams: number }> = [];
    for (const row of o['saltsBreakdown']) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const saltKey = typeof r['saltKey'] === "string" ? r['saltKey'] : null;
      const grams = isFiniteNumber(r['grams']) ? r['grams'] : null;
      if (!saltKey || grams === null) continue;
      rows.push({ saltKey, grams });
    }
    return rows.length ? rows : null;
  })();

  const acidType = typeof o['acidType'] === "string" ? o['acidType'] : o['acidType'] === null ? null : null;
  const acidMode = o['acidMode'] === "manual" || o['acidMode'] === "required" ? (o['acidMode'] as "manual" | "required") : null;
  const acidStrengthKind = typeof o['acidStrengthKind'] === "string" ? o['acidStrengthKind'] : o['acidStrengthKind'] === null ? null : null;
  const acidStrengthValue =
    o['acidStrengthValue'] === null ? null : isFiniteNumber(o['acidStrengthValue']) ? o['acidStrengthValue'] : null;
  const acidAmountMl = o['acidAmountMl'] === null ? null : isFiniteNumber(o['acidAmountMl']) ? o['acidAmountMl'] : null;
  const acidAmountGrams = o['acidAmountGrams'] === null ? null : isFiniteNumber(o['acidAmountGrams']) ? o['acidAmountGrams'] : null;

  return {
    key,
    volumeLiters,
    ph,
    finalAlkalinityPpmCaCO3,
    ionsPpm,
    saltsBreakdown,
    acidType,
    acidMode,
    acidStrengthKind,
    acidStrengthValue,
    acidAmountMl,
    acidAmountGrams,
  };
}

export function parseRecipeWaterHubSummaryResponse(x: unknown): RecipeWaterHubSummaryResponse {
  const root = (x ?? {}) as Record<string, unknown>;
  if (!root || typeof root !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse");
  if (root['ok'] !== true) throw new Error("Invalid RecipeWaterHubSummaryResponse.ok");

  const s = root['summary'];
  if (!s || typeof s !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary");

  const version = (s as Record<string, unknown>)['version'] === 1 ? 1 : null;
  if (version === null) throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.version");

  const status = (s as Record<string, unknown>)['status'] ?? null;
  if (!status || typeof status !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.status");

  const statusObj = status as Record<string, unknown>;
  const mashOverallSnapshot = (() => {
    const v = statusObj['mashOverallSnapshot'];
    if (v === null) return null;
    if (!v || typeof v !== "object") return null;
    const o = v as Record<string, unknown>;
    const ph = o['ph'] as Record<string, unknown> | undefined;
    const kind = ph?.['kind'] === "target" || ph?.['kind'] === "estimated" ? (ph['kind'] as "target" | "estimated") : null;
    const value = isFiniteNumber(ph?.['value']) ? (ph['value'] as number) : null;
    const finalAlk = isFiniteNumber(o['finalAlkalinityPpmCaCO3']) ? (o['finalAlkalinityPpmCaCO3'] as number) : null;
    if (!kind || value === null || finalAlk === null) return null;
    return { ph: { kind, value }, finalAlkalinityPpmCaCO3: finalAlk };
  })();

  const sObj = s as Record<string, unknown>;
  const streams = Array.isArray(sObj['streams']) ? (sObj['streams'] as unknown[]).map(parseStream).filter(Boolean) : [];

  const merged = (sObj['merged'] ?? null) as Record<string, unknown> | null;
  if (!merged || typeof merged !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.merged");
  const mergedIons = parseIonProfilePpm(merged['ionsPpm']);
  const mergedPh = merged['ph'] === null ? null : isFiniteNumber(merged['ph']) ? (merged['ph'] as number) : null;
  const mergedFinalAlk =
    merged['finalAlkalinityPpmCaCO3'] === null
      ? null
      : isFiniteNumber(merged['finalAlkalinityPpmCaCO3'])
        ? (merged['finalAlkalinityPpmCaCO3'] as number)
        : null;
  const totalVolumeLiters = isFiniteNumber(merged['totalVolumeLiters']) ? (merged['totalVolumeLiters'] as number) : 0;

  const finalRecap = (sObj['finalRecap'] ?? null) as Record<string, unknown> | null;
  if (!finalRecap || typeof finalRecap !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.finalRecap");
  const predictedMashPh = (() => {
    const v = finalRecap['predictedMashPh'];
    if (v === null) return null;
    if (!v || typeof v !== "object") return null;
    const o = v as Record<string, unknown>;
    const kind = o['kind'] === "target" || o['kind'] === "estimated" ? (o['kind'] as "target" | "estimated") : null;
    const value = isFiniteNumber(o['value']) ? (o['value'] as number) : null;
    if (!kind || value === null) return null;
    return { kind, value };
  })();

  const formatHints =
    root['formatHints'] && typeof root['formatHints'] === "object" && !Array.isArray(root['formatHints'])
      ? (root['formatHints'] as Partial<Record<string, NumberFormatHintV1>>)
      : undefined;

  return {
    ok: true,
    summary: {
      version,
      status: {
        mashAcidificationMode: typeof statusObj['mashAcidificationMode'] === "string" ? statusObj['mashAcidificationMode'] : null,
        spargeAcidificationMode: typeof statusObj['spargeAcidificationMode'] === "string" ? statusObj['spargeAcidificationMode'] : null,
        boilAcidificationMode: typeof statusObj['boilAcidificationMode'] === "string" ? statusObj['boilAcidificationMode'] : null,
        mashLastCalculatedAt: typeof statusObj['mashLastCalculatedAt'] === "string" ? statusObj['mashLastCalculatedAt'] : null,
        spargeLastCalculatedAt: typeof statusObj['spargeLastCalculatedAt'] === "string" ? statusObj['spargeLastCalculatedAt'] : null,
        boilLastCalculatedAt: typeof statusObj['boilLastCalculatedAt'] === "string" ? statusObj['boilLastCalculatedAt'] : null,
        mashOverallSnapshot,
      },
      streams: streams as RecipeWaterHubStreamSummary[],
      merged: {
        totalVolumeLiters,
        ph: mergedPh,
        finalAlkalinityPpmCaCO3: mergedFinalAlk,
        ionsPpm: mergedIons,
      },
      finalRecap: {
        predictedMashPh,
        residualAlkalinityMashOverallPpmCaCO3: isFiniteNumber(finalRecap['residualAlkalinityMashOverallPpmCaCO3'])
          ? (finalRecap['residualAlkalinityMashOverallPpmCaCO3'] as number)
          : finalRecap['residualAlkalinityMashOverallPpmCaCO3'] === null
            ? null
            : null,
        residualAlkalinityMergedPpmCaCO3: isFiniteNumber(finalRecap['residualAlkalinityMergedPpmCaCO3'])
          ? (finalRecap['residualAlkalinityMergedPpmCaCO3'] as number)
          : finalRecap['residualAlkalinityMergedPpmCaCO3'] === null
            ? null
            : null,
        styleExpectedRa: parseExpectedRaRange(finalRecap['styleExpectedRa']),
      },
    },
    formatHints,
  };
}
