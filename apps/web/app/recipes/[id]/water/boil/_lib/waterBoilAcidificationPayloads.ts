import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

import type { IonProfilePpm } from "../../_lib/waterChem";
import type { WaterAcidificationMode } from "../../_lib/waterCalcTypes";
import type { MixedSourceProfile } from "./waterBoilAcidificationHydration";

export function buildBoilSaveSettingsPayload(args: {
  sourceProfileId: string;
  targetProfileId: string;
  dilutionProfileId: string;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  startingAlk: number;
  startingPh: string;
  targetPh: number;
  acidType: string;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  strengthValue: number;
  acidificationMode: WaterAcidificationMode;
  manualAcidAdded: number;
  saltAdditions: SaltAdditionRow[];
}) {
  const {
    sourceProfileId,
    targetProfileId,
    dilutionProfileId,
    tapVolumeLiters,
    dilutionVolumeLiters,
    startingAlk,
    startingPh,
    targetPh,
    acidType,
    strengthKind,
    strengthValue,
    acidificationMode,
    manualAcidAdded,
    saltAdditions,
  } = args;

  return {
    boilSourceWaterProfileId: sourceProfileId || null,
    boilTargetWaterProfileId: targetProfileId || null,
    boilDilutionWaterProfileId: dilutionProfileId || null,
    boilTapWaterVolumeLiters: tapVolumeLiters,
    boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
    boilStartingAlkalinityPpmCaCO3: startingAlk,
    ...(startingPh.trim() === "" ? {} : { boilStartingPh: Number(startingPh) }),
    boilTargetPh: targetPh,
    boilAcidType: acidType,
    boilStrengthKind: strengthKind,
    boilStrengthValue: strengthKind === "solid" ? null : strengthValue,
    boilAcidificationMode: acidificationMode,
    boilManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
    boilManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
    boilSaltAdditionsJson: saltAdditions,
  };
}

export function assertCanComputeAndSaveBoil(canCall: boolean, recipeId: string, sourceProfileId: string) {
  if (!canCall) throw new Error("Not ready to call API.");
  if (!recipeId) throw new Error("Missing recipe id.");
  if (!sourceProfileId) throw new Error("Select a Source water profile.");
}

export function assertCanSubmitBoilAcid(derivedBoilWaterVolumeLiters: number, startingPh: string) {
  if (startingPh.trim() === "" || !Number.isFinite(Number(startingPh))) {
    throw new Error("Starting pH is required (select a profile with pH or enter it manually).");
  }
  if (!Number.isFinite(derivedBoilWaterVolumeLiters) || !(derivedBoilWaterVolumeLiters > 0)) {
    throw new Error("Boil water volume must be > 0 (set Water adjustment volumes).");
  }
}

export function buildComputeAndSaveBoilPayload(args: {
  sourceProfileId: string;
  dilutionProfileId: string;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  startingAlk: number;
  startingPh: string;
  targetPh: number;
  acidType: string;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  strengthValue: number;
  acidificationMode: WaterAcidificationMode;
  manualAcidAdded: number;
  saltAdditions: SaltAdditionRow[];
}) {
  const {
    sourceProfileId,
    dilutionProfileId,
    tapVolumeLiters,
    dilutionVolumeLiters,
    startingAlk,
    startingPh,
    targetPh,
    acidType,
    strengthKind,
    strengthValue,
    acidificationMode,
    manualAcidAdded,
    saltAdditions,
  } = args;

  return {
    boilSourceWaterProfileId: sourceProfileId,
    boilDilutionWaterProfileId: dilutionProfileId || null,
    boilTapWaterVolumeLiters: tapVolumeLiters,
    boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
    boilStartingAlkalinityPpmCaCO3: startingAlk,
    boilStartingPh: Number(startingPh),
    boilTargetPh: targetPh,
    boilAcidType: acidType,
    boilStrengthKind: strengthKind,
    boilStrengthValue: strengthKind === "solid" ? null : strengthValue,
    boilAcidificationMode: acidificationMode,
    boilManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
    boilManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
    boilSaltAdditionsJson: saltAdditions,
  };
}

export function ionProfileFromMixedSource(mixedSourceProfile: MixedSourceProfile): IonProfilePpm {
  return {
    calcium: mixedSourceProfile.calcium,
    magnesium: mixedSourceProfile.magnesium,
    sodium: mixedSourceProfile.sodium,
    sulfate: mixedSourceProfile.sulfate,
    chloride: mixedSourceProfile.chloride,
    bicarbonate: mixedSourceProfile.bicarbonate,
  };
}

export function assertMixedSourceProfile(
  mixedSourceProfile: MixedSourceProfile | null,
): asserts mixedSourceProfile is MixedSourceProfile {
  if (!mixedSourceProfile) throw new Error("Set Source profile + Source volume first (Dilution optional).");
}

export function buildOverallBoilPayload(args: {
  acidificationMode: WaterAcidificationMode;
  startingAlk: number;
  startingPh: string;
  targetPh: number;
  derivedBoilWaterVolumeLiters: number;
  mixedSourceProfile: MixedSourceProfile;
  saltAdditions: SaltAdditionRow[];
  acidType: string;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  strengthValue: number;
  manualAcidAdded: number;
}) {
  const {
    acidificationMode,
    startingAlk,
    startingPh,
    targetPh,
    derivedBoilWaterVolumeLiters,
    mixedSourceProfile,
    saltAdditions,
    acidType,
    strengthKind,
    strengthValue,
    manualAcidAdded,
  } = args;

  const baseProfile = ionProfileFromMixedSource(mixedSourceProfile);

  const payload: Record<string, unknown> = {
    boilMode: acidificationMode,
    startingAlkalinityPpmCaCO3: startingAlk,
    startingPh: Number(startingPh),
    targetPh,
    volumeLiters: derivedBoilWaterVolumeLiters,
    baseProfile,
    additions: saltAdditions,
    acidType,
    strengthKind,
  };
  if (strengthKind !== "solid") payload["strengthValue"] = strengthValue;
  if (acidificationMode === "manual") {
    Object.assign(
      payload,
      strengthKind === "solid" ? { acidAddedGrams: manualAcidAdded } : { acidAddedMl: manualAcidAdded },
    );
  }

  return payload;
}
