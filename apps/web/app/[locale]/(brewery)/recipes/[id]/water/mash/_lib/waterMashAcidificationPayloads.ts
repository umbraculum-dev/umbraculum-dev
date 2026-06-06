import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

import type { GristRow } from "../../../../../../../_lib/grist";
import type { IonProfilePpm } from "../../_lib/waterChem";
import type { WaterAcidificationMode } from "../../_lib/waterCalcTypes";
import type { MixedSourceProfile } from "./waterMashAcidificationHydration";

export function mapGristRowsForApi(rows: GristRow[]) {
  return rows.map((r) => ({
    amountKg: r.amountKg,
    colorLovibond: r.colorLovibond,
    maltClass: r.maltClass,
  }));
}

export function buildMashSaveSettingsPayload(args: {
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  derivedMashWaterVolumeLiters: number;
  mashStartingAlk: number;
  mashStartingPh: number;
  mashTargetPh: number;
  mashAcidType: string;
  mashStrengthKind: "percent" | "normality" | "molarity" | "solid";
  mashStrengthValue: number;
  mashAcidificationMode: WaterAcidificationMode;
  mashManualAcidAdded: number;
}) {
  const {
    tapVolumeLiters,
    dilutionVolumeLiters,
    derivedMashWaterVolumeLiters,
    mashStartingAlk,
    mashStartingPh,
    mashTargetPh,
    mashAcidType,
    mashStrengthKind,
    mashStrengthValue,
    mashAcidificationMode,
    mashManualAcidAdded,
  } = args;

  return {
    tapWaterVolumeLiters: tapVolumeLiters,
    dilutionWaterVolumeLiters: dilutionVolumeLiters,
    mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
    mashStartingPh,
    mashTargetPh,
    mashWaterVolumeLiters: derivedMashWaterVolumeLiters,
    mashAcidType,
    mashStrengthKind,
    mashStrengthValue: mashStrengthKind === "solid" ? null : mashStrengthValue,
    mashAcidificationMode,
    mashManualAcidAddedMl: mashStrengthKind === "solid" ? null : mashManualAcidAdded,
    mashManualAcidAddedGrams: mashStrengthKind === "solid" ? mashManualAcidAdded : null,
  };
}

export function assertCanComputeAndSaveMash(canCall: boolean, recipeId: string, sourceProfileId: string) {
  if (!canCall) throw new Error("Not ready to call API.");
  if (!recipeId) throw new Error("Missing recipe id.");
  if (!sourceProfileId) throw new Error("Select a Source water profile.");
}

export function buildComputeAndSaveMashPayload(args: {
  sourceProfileId: string;
  dilutionProfileId: string;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  mashStartingAlk: number;
  mashStartingPh: number;
  mashTargetPh: number;
  mashAcidType: string;
  mashStrengthKind: "percent" | "normality" | "molarity" | "solid";
  mashStrengthValue: number;
  mashAcidificationMode: WaterAcidificationMode;
  mashManualAcidAdded: number;
  saltAdditions: SaltAdditionRow[];
  gristRows: GristRow[];
}) {
  const {
    sourceProfileId,
    dilutionProfileId,
    tapVolumeLiters,
    dilutionVolumeLiters,
    mashStartingAlk,
    mashStartingPh,
    mashTargetPh,
    mashAcidType,
    mashStrengthKind,
    mashStrengthValue,
    mashAcidificationMode,
    mashManualAcidAdded,
    saltAdditions,
    gristRows,
  } = args;

  const grist = mapGristRowsForApi(gristRows);
  const payload: Record<string, unknown> = {
    sourceWaterProfileId: sourceProfileId,
    dilutionWaterProfileId: dilutionProfileId || null,
    tapWaterVolumeLiters: tapVolumeLiters,
    dilutionWaterVolumeLiters: dilutionVolumeLiters,
    mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
    mashStartingPh,
    mashTargetPh,
    mashAcidType,
    mashStrengthKind,
    mashStrengthValue: mashStrengthKind === "solid" ? null : mashStrengthValue,
    mashAcidificationMode,
    mashManualAcidAddedMl: mashStrengthKind === "solid" ? null : mashManualAcidAdded,
    mashManualAcidAddedGrams: mashStrengthKind === "solid" ? mashManualAcidAdded : null,
    mashSaltAdditionsJson: saltAdditions,
    ...(grist.length ? { grist } : {}),
  };

  return payload;
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

export function buildOverallMashPayload(args: {
  mashAcidificationMode: WaterAcidificationMode;
  mashStartingAlk: number;
  mashStartingPh: number;
  mashTargetPh: number;
  derivedMashWaterVolumeLiters: number;
  mixedSourceProfile: MixedSourceProfile;
  saltAdditions: SaltAdditionRow[];
  mashAcidType: string;
  mashStrengthKind: "percent" | "normality" | "molarity" | "solid";
  mashStrengthValue: number;
  mashManualAcidAdded: number;
  gristRows: GristRow[];
}) {
  const {
    mashAcidificationMode,
    mashStartingAlk,
    mashStartingPh,
    mashTargetPh,
    derivedMashWaterVolumeLiters,
    mixedSourceProfile,
    saltAdditions,
    mashAcidType,
    mashStrengthKind,
    mashStrengthValue,
    mashManualAcidAdded,
    gristRows,
  } = args;

  const baseProfile = ionProfileFromMixedSource(mixedSourceProfile);
  const grist = mapGristRowsForApi(gristRows);

  const payload: Record<string, unknown> = {
    mashMode: mashAcidificationMode,
    mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
    mashStartingPh,
    mashTargetPh,
    mashWaterVolumeLiters: derivedMashWaterVolumeLiters,
    volumeLiters: derivedMashWaterVolumeLiters,
    baseProfile,
    additions: saltAdditions,
    acidType: mashAcidType,
    strengthKind: mashStrengthKind,
    ...(grist.length ? { grist } : {}),
  };
  if (mashStrengthKind !== "solid") payload["strengthValue"] = mashStrengthValue;
  if (mashAcidificationMode === "manual") {
    Object.assign(
      payload,
      mashStrengthKind === "solid"
        ? { acidAddedGrams: mashManualAcidAdded }
        : { acidAddedMl: mashManualAcidAdded },
    );
  }

  return payload;
}

export function mapEstimateMashPhGristRequest(
  grist: Array<{
    amountKg: number;
    colorLovibond: number | null;
    maltClass: "base" | "crystal" | "roast" | "acid";
    mashDiPh?: number | null;
    mashTaToPh57_mEqPerKg?: number | null;
  }>,
) {
  return grist.map((r) => ({
    amountKg: r.amountKg,
    colorLovibond: r.colorLovibond,
    maltClass: r.maltClass,
    mashDiPh: r.mashDiPh ?? null,
    mashTaToPh57_mEqPerKg: r.mashTaToPh57_mEqPerKg ?? null,
  }));
}
