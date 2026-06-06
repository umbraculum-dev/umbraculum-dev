import type { RecipeWaterHubStreamSummary } from "@umbraculum/contracts";
import type { Prisma } from "@prisma/client";
import { combineAfterSaltsAndAcid } from "../../domain/waterCalc/overall.js";
import { parseSaltsBreakdown, parseSaltsResultingProfile } from "./recipeWaterHubSummaryTypes.js";

export function buildBoilStreamSummary(
  settings: Prisma.RecipeWaterSettingsGetPayload<object> | null,
): RecipeWaterHubStreamSummary {
  const boilVolumeLiters = typeof settings?.boilWaterVolumeLiters === "number" ? settings.boilWaterVolumeLiters : null;
  const boilPh =
    settings?.boilAcidificationMode === "manual"
      ? (settings?.boilManualLastAchievedPh ?? null)
      : typeof settings?.boilTargetPh === "number"
        ? settings.boilTargetPh
        : null;
  const boilFinalAlk = settings?.boilLastFinalAlkalinityPpmCaCO3 ?? null;
  const boilAfterSalts = parseSaltsResultingProfile(settings?.boilSaltsLastResultJson ?? null);
  const boilIonsAfterAcid =
    boilAfterSalts && boilFinalAlk != null
      ? combineAfterSaltsAndAcid({
          afterSalts: boilAfterSalts,
          acidResult: {
            finalAlkalinityPpmCaCO3: boilFinalAlk,
            sulfateAddedPpm: settings?.boilLastSulfateAddedPpm ?? 0,
            chlorideAddedPpm: settings?.boilLastChlorideAddedPpm ?? 0,
          },
        })
      : null;

  return {
    key: "boil",
    volumeLiters: boilVolumeLiters,
    ph: boilPh,
    finalAlkalinityPpmCaCO3: boilFinalAlk,
    ionsPpm: boilIonsAfterAcid,
    saltsBreakdown: parseSaltsBreakdown(settings?.boilSaltsLastResultJson ?? null),
    acidType: settings?.boilAcidType ?? null,
    acidMode:
      settings?.boilAcidificationMode === "manual" ? "manual" : settings?.boilAcidificationMode ? "required" : null,
    acidStrengthKind: settings?.boilStrengthKind ?? null,
    acidStrengthValue: settings?.boilStrengthValue ?? null,
    acidAmountMl:
      settings?.boilAcidificationMode === "manual"
        ? (settings?.boilManualAcidAddedMl ?? null)
        : (settings?.boilLastAcidRequiredMl ?? null),
    acidAmountGrams:
      settings?.boilAcidificationMode === "manual"
        ? (settings?.boilManualAcidAddedGrams ?? null)
        : (settings?.boilLastAcidRequiredGrams ?? null),
  };
}
