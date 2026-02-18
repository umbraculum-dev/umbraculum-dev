import { apiFetch } from "./api";
import type {
  ExpectedRaRange,
  IonProfilePpm,
  RecipeWaterHubStreamSummary,
  RecipeWaterHubSummary,
  RecipeWaterHubSummaryResponse,
} from "@brewery/contracts";

export type { RecipeWaterHubStreamSummary, RecipeWaterHubSummary, RecipeWaterHubSummaryResponse } from "@brewery/contracts";

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function parseIonProfilePpm(v: unknown): IonProfilePpm | null {
  if (!v || typeof v !== "object") return null;
  const o = v as any;
  const keys: Array<keyof IonProfilePpm> = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  for (const k of keys) if (!isFiniteNumber(o[k])) return null;
  return {
    calcium: o.calcium,
    magnesium: o.magnesium,
    sodium: o.sodium,
    sulfate: o.sulfate,
    chloride: o.chloride,
    bicarbonate: o.bicarbonate,
  };
}

function parseExpectedRaRange(v: unknown): ExpectedRaRange | null {
  if (!v || typeof v !== "object") return null;
  const o = v as any;
  const rationaleKey =
    o.rationaleKey === "styleExpectedRaDark" || o.rationaleKey === "styleExpectedRaPale" || o.rationaleKey === "styleExpectedRaAmber"
      ? o.rationaleKey
      : null;
  if (!rationaleKey) return null;
  if (!isFiniteNumber(o.min) || !isFiniteNumber(o.max)) return null;
  return { min: o.min, max: o.max, rationaleKey };
}

function parseStream(v: unknown): RecipeWaterHubStreamSummary | null {
  if (!v || typeof v !== "object") return null;
  const o = v as any;
  const key = o.key === "mash" || o.key === "sparge" || o.key === "boil" ? o.key : null;
  if (!key) return null;

  const volumeLiters = o.volumeLiters === null ? null : isFiniteNumber(o.volumeLiters) ? o.volumeLiters : null;
  const ph = o.ph === null ? null : isFiniteNumber(o.ph) ? o.ph : null;
  const finalAlkalinityPpmCaCO3 =
    o.finalAlkalinityPpmCaCO3 === null ? null : isFiniteNumber(o.finalAlkalinityPpmCaCO3) ? o.finalAlkalinityPpmCaCO3 : null;
  const ionsPpm = parseIonProfilePpm(o.ionsPpm);

  const saltsBreakdown = (() => {
    if (o.saltsBreakdown === null) return null;
    if (!Array.isArray(o.saltsBreakdown)) return null;
    const rows: Array<{ saltKey: string; grams: number }> = [];
    for (const row of o.saltsBreakdown) {
      if (!row || typeof row !== "object") continue;
      const r = row as any;
      const saltKey = typeof r.saltKey === "string" ? r.saltKey : null;
      const grams = isFiniteNumber(r.grams) ? r.grams : null;
      if (!saltKey || grams === null) continue;
      rows.push({ saltKey, grams });
    }
    return rows.length ? rows : null;
  })();

  const acidType = typeof o.acidType === "string" ? o.acidType : o.acidType === null ? null : null;
  const acidMode = o.acidMode === "manual" || o.acidMode === "required" ? o.acidMode : null;
  const acidStrengthKind = typeof o.acidStrengthKind === "string" ? o.acidStrengthKind : o.acidStrengthKind === null ? null : null;
  const acidStrengthValue =
    o.acidStrengthValue === null ? null : isFiniteNumber(o.acidStrengthValue) ? o.acidStrengthValue : null;
  const acidAmountMl = o.acidAmountMl === null ? null : isFiniteNumber(o.acidAmountMl) ? o.acidAmountMl : null;
  const acidAmountGrams = o.acidAmountGrams === null ? null : isFiniteNumber(o.acidAmountGrams) ? o.acidAmountGrams : null;

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
  const root = (x ?? {}) as any;
  if (!root || typeof root !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse");
  if (root.ok !== true) throw new Error("Invalid RecipeWaterHubSummaryResponse.ok");

  const s = root.summary;
  if (!s || typeof s !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary");

  const version = (s as any).version === 1 ? 1 : null;
  if (version === null) throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.version");

  const status = (s.status ?? null) as any;
  if (!status || typeof status !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.status");

  const mashOverallSnapshot = (() => {
    const v = status.mashOverallSnapshot;
    if (v === null) return null;
    if (!v || typeof v !== "object") return null;
    const o = v as any;
    const ph = o.ph;
    const kind = ph?.kind === "target" || ph?.kind === "estimated" ? ph.kind : null;
    const value = isFiniteNumber(ph?.value) ? ph.value : null;
    const finalAlk = isFiniteNumber(o.finalAlkalinityPpmCaCO3) ? o.finalAlkalinityPpmCaCO3 : null;
    if (!kind || value === null || finalAlk === null) return null;
    return { ph: { kind, value }, finalAlkalinityPpmCaCO3: finalAlk };
  })();

  const streams = Array.isArray(s.streams) ? (s.streams as unknown[]).map(parseStream).filter(Boolean) : [];

  const merged = (s.merged ?? null) as any;
  if (!merged || typeof merged !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.merged");
  const mergedIons = parseIonProfilePpm(merged.ionsPpm);
  const mergedPh = merged.ph === null ? null : isFiniteNumber(merged.ph) ? merged.ph : null;
  const mergedFinalAlk =
    merged.finalAlkalinityPpmCaCO3 === null
      ? null
      : isFiniteNumber(merged.finalAlkalinityPpmCaCO3)
        ? merged.finalAlkalinityPpmCaCO3
        : null;
  const totalVolumeLiters = isFiniteNumber(merged.totalVolumeLiters) ? merged.totalVolumeLiters : 0;

  const finalRecap = (s.finalRecap ?? null) as any;
  if (!finalRecap || typeof finalRecap !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.finalRecap");
  const predictedMashPh = (() => {
    const v = finalRecap.predictedMashPh;
    if (v === null) return null;
    if (!v || typeof v !== "object") return null;
    const o = v as any;
    const kind = o.kind === "target" || o.kind === "estimated" ? o.kind : null;
    const value = isFiniteNumber(o.value) ? o.value : null;
    if (!kind || value === null) return null;
    return { kind, value };
  })();

  return {
    ok: true,
    summary: {
      version,
      status: {
        mashAcidificationMode: typeof status.mashAcidificationMode === "string" ? status.mashAcidificationMode : null,
        spargeAcidificationMode: typeof status.spargeAcidificationMode === "string" ? status.spargeAcidificationMode : null,
        boilAcidificationMode: typeof status.boilAcidificationMode === "string" ? status.boilAcidificationMode : null,
        mashLastCalculatedAt: typeof status.mashLastCalculatedAt === "string" ? status.mashLastCalculatedAt : null,
        spargeLastCalculatedAt: typeof status.spargeLastCalculatedAt === "string" ? status.spargeLastCalculatedAt : null,
        boilLastCalculatedAt: typeof status.boilLastCalculatedAt === "string" ? status.boilLastCalculatedAt : null,
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
        residualAlkalinityMashOverallPpmCaCO3: isFiniteNumber(finalRecap.residualAlkalinityMashOverallPpmCaCO3)
          ? finalRecap.residualAlkalinityMashOverallPpmCaCO3
          : finalRecap.residualAlkalinityMashOverallPpmCaCO3 === null
            ? null
            : null,
        residualAlkalinityMergedPpmCaCO3: isFiniteNumber(finalRecap.residualAlkalinityMergedPpmCaCO3)
          ? finalRecap.residualAlkalinityMergedPpmCaCO3
          : finalRecap.residualAlkalinityMergedPpmCaCO3 === null
            ? null
            : null,
        styleExpectedRa: parseExpectedRaRange(finalRecap.styleExpectedRa),
      },
    },
  };
}

export async function fetchRecipeWaterHubSummary(recipeId: string): Promise<RecipeWaterHubSummaryResponse> {
  const res = await apiFetch(`/api/recipes/${recipeId}/water-hub-summary`);
  if (!res.ok) throw new Error(JSON.stringify(res.data));
  return parseRecipeWaterHubSummaryResponse(res.data);
}

