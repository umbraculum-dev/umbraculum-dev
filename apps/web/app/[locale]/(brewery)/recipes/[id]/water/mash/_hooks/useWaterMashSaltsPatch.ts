"use client";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { calcSaltAdditions } from "@umbraculum/api-client/brewery";
import type { WaterCalcDerivation } from "@umbraculum/contracts";

import { webBreweryApiClient } from "../../../../../../../_lib/breweryWaterClient";
import type { IonProfilePpm } from "../../_lib/waterChem";
import type { SaltAdditionsResult } from "../../_lib/waterCalcTypes";

import { hasNonZeroSaltAdditions } from "./useWaterMashSaltsLoad";

type MixedSourceProfile = {
  name: string;
  totalVolumeLiters: number;
} & IonProfilePpm;

export function useWaterMashSaltsPatch(params: {
  canCall: boolean;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  mixedSourceProfile: MixedSourceProfile | null;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  selectedSource: { id: string } | null;
  selectedDilution: { id: string } | null;
  saltAdditions: SaltAdditionRow[];
  saltsResult: SaltAdditionsResult | null;
  setSaltsError: (value: string | null) => void;
  setSaltsStatus: (value: string | null) => void;
  setSaltsCalcSaveStatus: (value: string | null) => void;
  setSaltsResult: (value: SaltAdditionsResult | null) => void;
  setSaltsDerivation: (value: WaterCalcDerivation | null) => void;
  setSaltsSubmitting: (value: boolean) => void;
}) {
  const {
    canCall,
    saveSettings,
    mixedSourceProfile,
    tapVolumeLiters,
    dilutionVolumeLiters,
    selectedSource,
    selectedDilution,
    saltAdditions,
    saltsResult,
    setSaltsError,
    setSaltsStatus,
    setSaltsCalcSaveStatus,
    setSaltsResult,
    setSaltsDerivation,
    setSaltsSubmitting,
  } = params;

  const ensureZeroSaltsSnapshotIfMissing = async () => {
    if (!canCall) return;
    if (saltsResult) return;
    if (hasNonZeroSaltAdditions(saltAdditions)) {
      throw new Error(
        "You entered salts but haven’t calculated them. Click “Calculate & save salts snapshot” first so overall uses the correct ions.",
      );
    }
    if (!mixedSourceProfile) {
      throw new Error("Set Source profile + Source volume first (Dilution optional).");
    }

    const base: IonProfilePpm = {
      calcium: mixedSourceProfile.calcium,
      magnesium: mixedSourceProfile.magnesium,
      sodium: mixedSourceProfile.sodium,
      sulfate: mixedSourceProfile.sulfate,
      chloride: mixedSourceProfile.chloride,
      bicarbonate: mixedSourceProfile.bicarbonate,
    };

    const result: SaltAdditionsResult = {
      baseProfile: base,
      resultingProfile: base,
      deltasPpm: { calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 },
      breakdown: [],
    };

    const nowIso = new Date().toISOString();
    setSaltsResult(result);
    setSaltsDerivation(null);
    await saveSettings({
      tapWaterVolumeLiters: tapVolumeLiters,
      dilutionWaterVolumeLiters: dilutionVolumeLiters,
      mashSaltAdditionsJson: saltAdditions,
      mashSaltsLastResultJson: { calculatedAt: nowIso, result },
    });
  };

  const onCalcSalts = async () => {
    if (!canCall) return;
    if (!mixedSourceProfile) {
      const tap = Math.max(0, Number(tapVolumeLiters) || 0);
      const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
      if (!(tap > 0)) setSaltsError("Source volume must be > 0.");
      else if (!selectedSource) setSaltsError("Select a Source water profile.");
      else if (dil > 0 && !selectedDilution)
        setSaltsError("Select a Dilution water profile (or set Dilution volume to 0).");
      else setSaltsError("Compute mixed water first (check Water adjustment inputs).");
      return;
    }
    setSaltsError(null);
    setSaltsStatus(null);
    setSaltsCalcSaveStatus(null);
    setSaltsResult(null);
    setSaltsSubmitting(true);
    try {
      const data = await calcSaltAdditions(webBreweryApiClient(), {
        volumeLiters: mixedSourceProfile.totalVolumeLiters,
        baseProfile: {
          calcium: mixedSourceProfile.calcium,
          magnesium: mixedSourceProfile.magnesium,
          sodium: mixedSourceProfile.sodium,
          sulfate: mixedSourceProfile.sulfate,
          chloride: mixedSourceProfile.chloride,
          bicarbonate: mixedSourceProfile.bicarbonate,
        },
        additions: saltAdditions,
      });
      const result = data.result as SaltAdditionsResult;
      setSaltsResult(result);
      setSaltsDerivation(data.derivation as WaterCalcDerivation);

      await saveSettings({
        tapWaterVolumeLiters: tapVolumeLiters,
        dilutionWaterVolumeLiters: dilutionVolumeLiters,
        mashSaltAdditionsJson: saltAdditions,
        mashSaltsLastResultJson: { calculatedAt: new Date().toISOString(), result },
      });
      setSaltsStatus("Calculated.");
      setSaltsCalcSaveStatus("Calculated & saved salts snapshot.");
    } catch (err) {
      setSaltsError(String(err));
    } finally {
      setSaltsSubmitting(false);
    }
  };

  return {
    onCalcSalts,
    ensureZeroSaltsSnapshotIfMissing,
  };
}
