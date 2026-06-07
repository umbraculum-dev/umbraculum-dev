import type { BoilComputeAndSaveInput, RecipeWaterComputeDeps } from "../../recipeWaterComputeAndSaveService.js";
import { BadRequestError } from "../../../../../errors.js";
import { applySaltAdditions, type IonProfilePpm } from "../../waterCalc/saltAdditions.js";
import { buildSaltAdditionsDerivation } from "../../waterCalc/derivation/saltAdditionsDerivation.js";
import {
  ensureFinite,
  mixIonProfilesByVolume,
  parseSaltAdditions,
} from "../recipeWaterComputeHelpers.js";

export type BoilSaltStageResult = {
  tap: number;
  dil: number;
  salts: ReturnType<typeof applySaltAdditions>;
  saltsDerivation: ReturnType<typeof buildSaltAdditionsDerivation>;
};

export async function computeBoilSaltStage(
  deps: RecipeWaterComputeDeps,
  input: BoilComputeAndSaveInput,
  derivedVolumeLiters: number,
): Promise<BoilSaltStageResult> {
  const tap = ensureFinite(input.boilTapWaterVolumeLiters, "boilTapWaterVolumeLiters");
  const dil = ensureFinite(input.boilDilutionWaterVolumeLiters, "boilDilutionWaterVolumeLiters");

  const source = await deps.loadProfileLite(input.boilSourceWaterProfileId!);
  const dilution = input.boilDilutionWaterProfileId ? await deps.loadProfileLite(input.boilDilutionWaterProfileId) : null;
  if (!(tap > 0)) throw new BadRequestError("invalid_volume_liters", "Body.boilTapWaterVolumeLiters must be > 0");
  if (dil > 0 && !dilution) throw new BadRequestError("invalid_profile_id", "Body.boilDilutionWaterProfileId is required when dilution volume > 0");

  const baseSource: IonProfilePpm = {
    calcium: source.calcium,
    magnesium: source.magnesium,
    sodium: source.sodium,
    sulfate: source.sulfate,
    chloride: source.chloride,
    bicarbonate: source.bicarbonate,
  };
  const mixedBase: IonProfilePpm =
    dil > 0 && dilution
      ? (mixIonProfilesByVolume(
          baseSource,
          tap,
          {
            calcium: dilution.calcium,
            magnesium: dilution.magnesium,
            sodium: dilution.sodium,
            sulfate: dilution.sulfate,
            chloride: dilution.chloride,
            bicarbonate: dilution.bicarbonate,
          },
          dil,
        ) ?? baseSource)
      : baseSource;

  const additions = parseSaltAdditions(input.boilSaltAdditionsJson, "boilSaltAdditionsJson");
  const salts = applySaltAdditions(mixedBase, derivedVolumeLiters, additions);
  const saltsDerivation = buildSaltAdditionsDerivation({ volumeLiters: derivedVolumeLiters, baseProfile: mixedBase, result: salts });

  return { tap, dil, salts, saltsDerivation };
}
