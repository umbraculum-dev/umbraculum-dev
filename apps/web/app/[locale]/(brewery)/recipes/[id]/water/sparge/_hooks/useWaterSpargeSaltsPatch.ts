"use client";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { calcSaltAdditions } from "@umbraculum/brewery-api-client";
import type { WaterCalcDerivation, WaterProfile } from "@umbraculum/brewery-contracts";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import type { IonProfilePpm } from "../../_lib/waterChem";
import type { SaltAdditionsResult } from "../../_lib/waterCalcTypes";

import { hasNonZeroSaltAdditions } from "./useWaterSpargeSaltsLoad";

export function useWaterSpargeSaltsPatch(params: {
  canCall: boolean;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  selectedSpargeProfile: WaterProfile | null;
  volumeLiters: number;
  spargeSaltAdditions: SaltAdditionRow[];
  spargeSaltsResult: SaltAdditionsResult | null;
  spargeSaltsInputsKey: string | null;
  buildSpargeSaltsInputsKey: () => string;
  refreshSpargeOverallIfPossible: () => Promise<void>;
  setSpargeSaltsError: (value: string | null) => void;
  setSpargeSaltsStatus: (value: string | null) => void;
  setSpargeSaltsCalcSaveStatus: (value: string | null) => void;
  setSpargeSaltsResult: (value: SaltAdditionsResult | null) => void;
  setSaltDerivation: (value: WaterCalcDerivation | null) => void;
  setSpargeSaltsInputsKey: (value: string | null) => void;
  setSpargeSaltsSubmitting: (value: boolean) => void;
}) {
  const {
    canCall,
    saveSettings,
    selectedSpargeProfile,
    volumeLiters,
    spargeSaltAdditions,
    spargeSaltsResult,
    spargeSaltsInputsKey,
    buildSpargeSaltsInputsKey,
    refreshSpargeOverallIfPossible,
    setSpargeSaltsError,
    setSpargeSaltsStatus,
    setSpargeSaltsCalcSaveStatus,
    setSpargeSaltsResult,
    setSaltDerivation,
    setSpargeSaltsInputsKey,
    setSpargeSaltsSubmitting,
  } = params;

  const ensureSpargeSaltsSnapshotForAcidification = async (): Promise<SaltAdditionsResult> => {
    if (!canCall) throw new Error("Not ready to call API.");
    if (!selectedSpargeProfile) {
      throw new Error("Select a sparge water profile first (base ion profile for recap).");
    }
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      throw new Error("Sparge water volume must be > 0.");
    }

    const inputsKey = buildSpargeSaltsInputsKey();
    const saltsEntered = hasNonZeroSaltAdditions(spargeSaltAdditions);
    const isSnapshotStale = saltsEntered && !!spargeSaltsResult && spargeSaltsInputsKey !== inputsKey;
    if (spargeSaltsResult && !isSnapshotStale) return spargeSaltsResult;

    const base: IonProfilePpm = {
      calcium: selectedSpargeProfile.calcium,
      magnesium: selectedSpargeProfile.magnesium,
      sodium: selectedSpargeProfile.sodium,
      sulfate: selectedSpargeProfile.sulfate,
      chloride: selectedSpargeProfile.chloride,
      bicarbonate: selectedSpargeProfile.bicarbonate,
    };

    if (!saltsEntered) {
      const result: SaltAdditionsResult = {
        baseProfile: base,
        resultingProfile: base,
        deltasPpm: { calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 },
        breakdown: [],
      };

      const nowIso = new Date().toISOString();
      setSpargeSaltsResult(result);
      setSaltDerivation(null);
      setSpargeSaltsInputsKey(inputsKey);
      await saveSettings({
        spargeSaltAdditionsJson: spargeSaltAdditions,
        spargeSaltsLastResultJson: { calculatedAt: nowIso, result },
      });
      return result;
    }

    setSpargeSaltsStatus("Calculating salts for acidification…");
    const data = await calcSaltAdditions(webBreweryApiClient(), {
      volumeLiters,
      baseProfile: base,
      additions: spargeSaltAdditions,
    });
    const result = data.result as SaltAdditionsResult;
    setSaltDerivation(data.derivation as WaterCalcDerivation);

    const nowIso = new Date().toISOString();
    setSpargeSaltsResult(result);
    setSpargeSaltsInputsKey(inputsKey);
    await saveSettings({
      spargeSaltAdditionsJson: spargeSaltAdditions,
      spargeSaltsLastResultJson: { calculatedAt: nowIso, result },
    });
    return result;
  };

  const onCalculateSpargeSalts = async () => {
    if (!canCall) return;
    setSpargeSaltsError(null);
    setSpargeSaltsStatus(null);
    setSpargeSaltsCalcSaveStatus(null);
    setSpargeSaltsResult(null);
    setSpargeSaltsSubmitting(true);
    try {
      if (!selectedSpargeProfile) {
        throw new Error("Select a sparge water profile first (base ion profile for salts).");
      }
      if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
        throw new Error("Sparge water volume must be > 0.");
      }

      setSpargeSaltsInputsKey(buildSpargeSaltsInputsKey());
      const data = await calcSaltAdditions(webBreweryApiClient(), {
        volumeLiters,
        baseProfile: {
          calcium: selectedSpargeProfile.calcium,
          magnesium: selectedSpargeProfile.magnesium,
          sodium: selectedSpargeProfile.sodium,
          sulfate: selectedSpargeProfile.sulfate,
          chloride: selectedSpargeProfile.chloride,
          bicarbonate: selectedSpargeProfile.bicarbonate,
        },
        additions: spargeSaltAdditions,
      });
      const result = data.result as SaltAdditionsResult;
      setSpargeSaltsResult(result);
      setSaltDerivation(data.derivation as WaterCalcDerivation);
      await refreshSpargeOverallIfPossible().catch(() => null);

      await saveSettings({
        spargeSaltAdditionsJson: spargeSaltAdditions,
        spargeSaltsLastResultJson: { calculatedAt: new Date().toISOString(), result },
      });
      setSpargeSaltsStatus("Calculated.");
      setSpargeSaltsCalcSaveStatus("Calculated & saved salts snapshot.");
    } catch (err) {
      setSpargeSaltsError(String(err));
    } finally {
      setSpargeSaltsSubmitting(false);
    }
  };

  return {
    ensureSpargeSaltsSnapshotForAcidification,
    onCalculateSpargeSalts,
  };
}
