import type { RecipeWaterHubStreamSummary } from "@umbraculum/contracts";
import type { Prisma } from "@prisma/client";
import { combineAfterSaltsAndAcid } from "../../domain/waterCalc/overall.js";
import { parseSaltsBreakdown, parseSaltsResultingProfile } from "./recipeWaterHubSummaryTypes.js";

export function buildSpargeStreamSummary(
  settings: Prisma.RecipeWaterSettingsGetPayload<object> | null,
): RecipeWaterHubStreamSummary {
  const spargeVolumeLiters = typeof settings?.spargeVolumeLiters === "number" ? settings.spargeVolumeLiters : null;
  const spargePh =
    settings?.spargeAcidificationMode === "manual"
      ? (settings?.spargeManualLastAchievedPh ?? null)
      : typeof settings?.spargeTargetPh === "number"
        ? settings.spargeTargetPh
        : null;
  const spargeFinalAlk = settings?.spargeLastFinalAlkalinityPpmCaCO3 ?? null;
  const spargeAfterSalts = parseSaltsResultingProfile(settings?.spargeSaltsLastResultJson ?? null);
  const spargeIonsAfterAcid =
    spargeAfterSalts && spargeFinalAlk != null
      ? combineAfterSaltsAndAcid({
          afterSalts: spargeAfterSalts,
          acidResult: {
            finalAlkalinityPpmCaCO3: spargeFinalAlk,
            sulfateAddedPpm: settings?.spargeLastSulfateAddedPpm ?? 0,
            chlorideAddedPpm: settings?.spargeLastChlorideAddedPpm ?? 0,
          },
        })
      : null;

  return {
    key: "sparge",
    volumeLiters: spargeVolumeLiters,
    ph: spargePh,
    finalAlkalinityPpmCaCO3: spargeFinalAlk,
    ionsPpm: spargeIonsAfterAcid,
    saltsBreakdown: parseSaltsBreakdown(settings?.spargeSaltsLastResultJson ?? null),
    acidType: settings?.spargeAcidType ?? null,
    acidMode:
      settings?.spargeAcidificationMode === "manual"
        ? "manual"
        : settings?.spargeAcidificationMode
          ? "required"
          : null,
    acidStrengthKind: settings?.spargeStrengthKind ?? null,
    acidStrengthValue: settings?.spargeStrengthValue ?? null,
    acidAmountMl:
      settings?.spargeAcidificationMode === "manual"
        ? (settings?.spargeManualAcidAddedMl ?? null)
        : (settings?.spargeLastAcidRequiredMl ?? null),
    acidAmountGrams:
      settings?.spargeAcidificationMode === "manual"
        ? (settings?.spargeManualAcidAddedGrams ?? null)
        : (settings?.spargeLastAcidRequiredGrams ?? null),
  };
}
