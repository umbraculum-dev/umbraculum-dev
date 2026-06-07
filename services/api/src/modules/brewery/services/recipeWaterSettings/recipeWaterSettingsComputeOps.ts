import type { RecipeWaterSettings } from "@prisma/client";

import type { UpsertRecipeWaterSettingsInput } from "./recipeWaterSettingsTypes.js";

export type MashVolumeDerivation = {
  derivedMashVolume: number;
  hasMixingUpdate: boolean;
};

export type BoilVolumeDerivation = {
  derivedBoilVolume: number;
  hasBoilMixingUpdate: boolean;
};

export function deriveMashWaterVolume(
  input: UpsertRecipeWaterSettingsInput,
  existing: RecipeWaterSettings | null,
): MashVolumeDerivation {
  const hasMixingUpdate =
    input.tapWaterVolumeLiters !== undefined || input.dilutionWaterVolumeLiters !== undefined;

  const tap =
    input.tapWaterVolumeLiters === null
      ? 0
      : typeof input.tapWaterVolumeLiters === "number"
        ? input.tapWaterVolumeLiters
        : typeof existing?.tapWaterVolumeLiters === "number"
          ? existing.tapWaterVolumeLiters
          : 0;
  const dil =
    input.dilutionWaterVolumeLiters === null
      ? 0
      : typeof input.dilutionWaterVolumeLiters === "number"
        ? input.dilutionWaterVolumeLiters
        : typeof existing?.dilutionWaterVolumeLiters === "number"
          ? existing.dilutionWaterVolumeLiters
          : 0;

  return { derivedMashVolume: Math.max(0, tap) + Math.max(0, dil), hasMixingUpdate };
}

export function deriveBoilWaterVolume(
  input: UpsertRecipeWaterSettingsInput,
  existing: RecipeWaterSettings | null,
): BoilVolumeDerivation {
  const hasBoilMixingUpdate =
    input.boilTapWaterVolumeLiters !== undefined || input.boilDilutionWaterVolumeLiters !== undefined;
  const boilTap =
    input.boilTapWaterVolumeLiters === null
      ? 0
      : typeof input.boilTapWaterVolumeLiters === "number"
        ? input.boilTapWaterVolumeLiters
        : typeof existing?.boilTapWaterVolumeLiters === "number"
          ? existing.boilTapWaterVolumeLiters
          : 0;
  const boilDil =
    input.boilDilutionWaterVolumeLiters === null
      ? 0
      : typeof input.boilDilutionWaterVolumeLiters === "number"
        ? input.boilDilutionWaterVolumeLiters
        : typeof existing?.boilDilutionWaterVolumeLiters === "number"
          ? existing.boilDilutionWaterVolumeLiters
          : 0;

  return { derivedBoilVolume: Math.max(0, boilTap) + Math.max(0, boilDil), hasBoilMixingUpdate };
}
