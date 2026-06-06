import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import type { WaterProfile } from "@umbraculum/brewery-contracts";

import type { IonProfilePpm } from "../../_lib/waterChem";
import type { WaterAcidificationMode } from "../../_lib/waterCalcTypes";

export function buildSpargeSaveSettingsPayload(args: {
  spargeWaterProfileId: string;
  startingAlk: number;
  startingPh: string;
  targetPh: number;
  volumeLiters: number;
  acidType: string;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  strengthValue: number;
  spargeAcidificationMode: WaterAcidificationMode;
  spargeManualAcidAdded: number;
  spargeSaltAdditions: SaltAdditionRow[];
}) {
  const {
    spargeWaterProfileId,
    startingAlk,
    startingPh,
    targetPh,
    volumeLiters,
    acidType,
    strengthKind,
    strengthValue,
    spargeAcidificationMode,
    spargeManualAcidAdded,
    spargeSaltAdditions,
  } = args;

  return {
    spargeWaterProfileId: spargeWaterProfileId || null,
    spargeStartingAlkalinityPpmCaCO3: startingAlk,
    ...(startingPh.trim() === "" ? {} : { spargeStartingPh: Number(startingPh) }),
    spargeTargetPh: targetPh,
    spargeVolumeLiters: volumeLiters,
    spargeAcidType: acidType,
    spargeStrengthKind: strengthKind,
    spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
    spargeAcidificationMode,
    spargeManualAcidAddedMl: strengthKind === "solid" ? null : spargeManualAcidAdded,
    spargeManualAcidAddedGrams: strengthKind === "solid" ? spargeManualAcidAdded : null,
    spargeSaltAdditionsJson: spargeSaltAdditions,
  };
}

export function assertCanSubmitSparge(volumeLiters: number, startingPh: string) {
  if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
    throw new Error("Sparge water volume must be > 0.");
  }
  if (startingPh.trim() === "" || !Number.isFinite(Number(startingPh))) {
    throw new Error("Starting pH is required (select a profile with pH or enter it manually).");
  }
}

export function buildComputeAndSaveSpargePayload(args: {
  recipeId: string;
  spargeWaterProfileId: string;
  spargeSaltAdditions: SaltAdditionRow[];
  startingAlk: number;
  startingPh: string;
  targetPh: number;
  volumeLiters: number;
  acidType: string;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  strengthValue: number;
  spargeAcidificationMode: WaterAcidificationMode;
  spargeManualAcidAdded: number;
}) {
  const {
    spargeWaterProfileId,
    spargeSaltAdditions,
    startingAlk,
    startingPh,
    targetPh,
    volumeLiters,
    acidType,
    strengthKind,
    strengthValue,
    spargeAcidificationMode,
    spargeManualAcidAdded,
  } = args;

  return {
    spargeWaterProfileId,
    spargeSaltAdditionsJson: spargeSaltAdditions,
    spargeStartingAlkalinityPpmCaCO3: startingAlk,
    spargeStartingPh: Number(startingPh),
    spargeTargetPh: targetPh,
    spargeVolumeLiters: volumeLiters,
    spargeAcidType: acidType,
    spargeStrengthKind: strengthKind,
    spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
    spargeAcidificationMode,
    spargeManualAcidAddedMl: strengthKind === "solid" ? null : spargeManualAcidAdded,
    spargeManualAcidAddedGrams: strengthKind === "solid" ? spargeManualAcidAdded : null,
  };
}

export function ionProfileFromWaterProfile(profile: WaterProfile): IonProfilePpm {
  return {
    calcium: profile.calcium,
    magnesium: profile.magnesium,
    sodium: profile.sodium,
    sulfate: profile.sulfate,
    chloride: profile.chloride,
    bicarbonate: profile.bicarbonate,
  };
}

export function buildSpargeOverallPayload(args: {
  spargeAcidificationMode: WaterAcidificationMode;
  startingAlk: number;
  startingPh: string;
  targetPh: number;
  volumeLiters: number;
  selectedSpargeProfile: WaterProfile;
  spargeSaltAdditions: SaltAdditionRow[];
  acidType: string;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  strengthValue: number;
  spargeManualAcidAdded: number;
}) {
  const {
    spargeAcidificationMode,
    startingAlk,
    startingPh,
    targetPh,
    volumeLiters,
    selectedSpargeProfile,
    spargeSaltAdditions,
    acidType,
    strengthKind,
    strengthValue,
    spargeManualAcidAdded,
  } = args;

  const payload: Record<string, unknown> = {
    spargeMode: spargeAcidificationMode,
    startingAlkalinityPpmCaCO3: startingAlk,
    startingPh: Number(startingPh),
    targetPh,
    volumeLiters,
    baseProfile: ionProfileFromWaterProfile(selectedSpargeProfile),
    additions: spargeSaltAdditions,
    acidType,
    strengthKind,
  };
  if (strengthKind !== "solid") payload["strengthValue"] = strengthValue;
  if (spargeAcidificationMode === "manual") {
    Object.assign(
      payload,
      strengthKind === "solid" ? { acidAddedGrams: spargeManualAcidAdded } : { acidAddedMl: spargeManualAcidAdded },
    );
  }

  return payload;
}
