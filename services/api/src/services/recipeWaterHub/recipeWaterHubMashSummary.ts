import type { RecipeWaterHubStreamSummary } from "@umbraculum/contracts";
import type { Prisma } from "@prisma/client";
import {
  parseMashOverallLastResultJson,
  parseSaltsBreakdown,
  type MashOverallLastResultJson,
} from "./recipeWaterHubSummaryTypes.js";

export type MashStreamContext = {
  mashOverall: MashOverallLastResultJson | null;
  mashVolumeLiters: number | null;
};

export function buildMashStreamContext(settings: Prisma.RecipeWaterSettingsGetPayload<object> | null): MashStreamContext {
  const mashOverall = parseMashOverallLastResultJson(settings?.mashOverallLastResultJson ?? null);

  const mashTap = typeof settings?.tapWaterVolumeLiters === "number" ? settings.tapWaterVolumeLiters : 0;
  const mashDil = typeof settings?.dilutionWaterVolumeLiters === "number" ? settings.dilutionWaterVolumeLiters : 0;
  const mashMixTotal = Math.max(0, mashTap) + Math.max(0, mashDil);
  const mashLegacy = typeof settings?.mashWaterVolumeLiters === "number" ? settings.mashWaterVolumeLiters : null;
  const mashVolumeLiters = mashMixTotal > 0 ? mashMixTotal : mashLegacy;

  return { mashOverall, mashVolumeLiters };
}

export function buildMashStreamSummary(
  settings: Prisma.RecipeWaterSettingsGetPayload<object> | null,
  ctx: MashStreamContext,
): RecipeWaterHubStreamSummary {
  const mashPh = ctx.mashOverall?.ph?.value ?? null;
  const mashFinalAlk = ctx.mashOverall?.finalAlkalinityPpmCaCO3 ?? null;
  const mashIonsAfterAcid = ctx.mashOverall?.ionsPpm ?? null;

  return {
    key: "mash",
    volumeLiters: ctx.mashVolumeLiters,
    ph: mashPh,
    finalAlkalinityPpmCaCO3: mashFinalAlk,
    ionsPpm: mashIonsAfterAcid,
    saltsBreakdown: parseSaltsBreakdown(settings?.mashSaltsLastResultJson ?? null),
    acidType: settings?.mashAcidType ?? null,
    acidMode:
      settings?.mashAcidificationMode === "manual" ? "manual" : settings?.mashAcidificationMode ? "required" : null,
    acidStrengthKind: settings?.mashStrengthKind ?? null,
    acidStrengthValue: settings?.mashStrengthValue ?? null,
    acidAmountMl:
      settings?.mashAcidificationMode === "manual"
        ? (settings?.mashManualAcidAddedMl ?? null)
        : (settings?.mashLastAcidRequiredMl ?? null),
    acidAmountGrams:
      settings?.mashAcidificationMode === "manual"
        ? (settings?.mashManualAcidAddedGrams ?? null)
        : (settings?.mashLastAcidRequiredGrams ?? null),
  };
}
