import type { MashComputeAndSaveInput, RecipeWaterComputeDeps } from "../../recipeWaterComputeAndSaveService.js";
import { BadRequestError } from "../../../errors.js";
import {
  applySaltAdditions,
  type IonProfilePpm,
} from "../../../domain/waterCalc/saltAdditions.js";
import { buildSaltAdditionsDerivation } from "../../../domain/waterCalc/derivation/saltAdditionsDerivation.js";
import {
  ensureFinite,
  mixIonProfilesByVolume,
  parseSaltAdditions,
} from "../recipeWaterComputeHelpers.js";

export type MashSaltStageResult = {
  tap: number;
  dil: number;
  mixedBase: IonProfilePpm;
  salts: ReturnType<typeof applySaltAdditions>;
  saltsDerivation: ReturnType<typeof buildSaltAdditionsDerivation>;
};

export async function computeMashSaltStage(
  deps: RecipeWaterComputeDeps,
  input: MashComputeAndSaveInput,
  derivedVolumeLiters: number,
): Promise<MashSaltStageResult> {
  const tap = ensureFinite(input.tapWaterVolumeLiters, "tapWaterVolumeLiters");
  const dil = ensureFinite(input.dilutionWaterVolumeLiters, "dilutionWaterVolumeLiters");

  const source = await deps.loadProfileLite(input.sourceWaterProfileId!);
  const dilution = input.dilutionWaterProfileId ? await deps.loadProfileLite(input.dilutionWaterProfileId) : null;
  if (!(tap > 0)) throw new BadRequestError("invalid_volume_liters", "Body.tapWaterVolumeLiters must be > 0");
  if (dil > 0 && !dilution) throw new BadRequestError("invalid_profile_id", "Body.dilutionWaterProfileId is required when dilution volume > 0");

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

  const additions = parseSaltAdditions(input.mashSaltAdditionsJson, "mashSaltAdditionsJson");
  const salts = applySaltAdditions(mixedBase, derivedVolumeLiters, additions);
  const saltsDerivation = buildSaltAdditionsDerivation({ volumeLiters: derivedVolumeLiters, baseProfile: mixedBase, result: salts });

  return { tap, dil, mixedBase, salts, saltsDerivation };
}
