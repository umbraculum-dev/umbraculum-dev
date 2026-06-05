"use client";

import { useCallback, useMemo, useState } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { calcSaltAdditions } from "@umbraculum/api-client/brewery";
import type { WaterCalcDerivation, WaterProfile } from "@umbraculum/contracts";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../_lib/typeGuards";
import type { IonProfilePpm } from "../../_lib/waterChem";
import type { SaltAdditionsResult } from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettingsResponse } from "../../_lib/waterSettings";

export function useWaterSpargeSalts(params: {
  canCall: boolean;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  selectedSpargeProfile: WaterProfile | null;
  volumeLiters: number;
  spargeWaterProfileId: string;
  spargeSaltAdditions: SaltAdditionRow[];
  setSpargeSaltAdditions: (rows: SaltAdditionRow[]) => void;
  refreshSpargeOverallIfPossible: () => Promise<void>;
}) {
  const {
    canCall,
    saveSettings,
    setSavingError,
    selectedSpargeProfile,
    volumeLiters,
    spargeWaterProfileId,
    spargeSaltAdditions,
    setSpargeSaltAdditions,
    refreshSpargeOverallIfPossible,
  } = params;

  const [spargeSaltsError, setSpargeSaltsError] = useState<string | null>(null);
  const [spargeSaltsStatus, setSpargeSaltsStatus] = useState<string | null>(null);
  const [spargeSaltsSaveStatus, setSpargeSaltsSaveStatus] = useState<string | null>(null);
  const [spargeSaltsCalcSaveStatus, setSpargeSaltsCalcSaveStatus] = useState<string | null>(null);
  const [spargeSaltsSubmitting, setSpargeSaltsSubmitting] = useState(false);
  const [savingSpargeSalts, setSavingSpargeSalts] = useState(false);
  const [spargeSaltsResult, setSpargeSaltsResult] = useState<SaltAdditionsResult | null>(null);
  const [saltDerivation, setSaltDerivation] = useState<WaterCalcDerivation | null>(null);
  const [spargeSaltsInputsKey, setSpargeSaltsInputsKey] = useState<string | null>(null);

  const hasNonZeroSaltAdditions = (rows: SaltAdditionRow[]) =>
    rows.some((r) => typeof r.grams === "number" && Number.isFinite(r.grams) && r.grams > 0);

  const buildSpargeSaltsInputsKey = useCallback(() => {
    return JSON.stringify({
      spargeWaterProfileId,
      volumeLiters,
      additions: spargeSaltAdditions,
    });
  }, [spargeWaterProfileId, volumeLiters, spargeSaltAdditions]);

  const hydrateSpargeSalts = useCallback(
    (s: NonNullable<RecipeWaterSettingsResponse["settings"]>) => {
      if (Array.isArray(s.spargeSaltAdditionsJson)) {
        setSpargeSaltAdditions(s.spargeSaltAdditionsJson as SaltAdditionRow[]);
      }
      const lastResult = asRecord(s.spargeSaltsLastResultJson);
      if (lastResult) {
        const innerResult = asRecord(lastResult["result"]);
        if (innerResult) {
          setSpargeSaltsResult(innerResult as unknown as SaltAdditionsResult);
          setSpargeSaltsInputsKey(
            JSON.stringify({
              spargeWaterProfileId: s.spargeWaterProfileId ?? "",
              volumeLiters: s.spargeVolumeLiters ?? 20,
              additions: Array.isArray(s.spargeSaltAdditionsJson) ? s.spargeSaltAdditionsJson : [],
            }),
          );
          if (typeof lastResult["calculatedAt"] === "string") {
            setSpargeSaltsStatus(`Last calculated: ${new Date(lastResult["calculatedAt"]).toLocaleString()}`);
          }
        }
      }
    },
    [setSpargeSaltAdditions],
  );

  const onSaveSpargeSaltsInputs = async () => {
    setSavingError(null);
    setSpargeSaltsSaveStatus(null);
    setSavingSpargeSalts(true);
    try {
      await saveSettings({ spargeSaltAdditionsJson: spargeSaltAdditions });
      setSpargeSaltsSaveStatus("Saved salts draft.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingSpargeSalts(false);
    }
  };

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

  const applySaltsFromCompute = useCallback(
    (result: SaltAdditionsResult, derivation: WaterCalcDerivation | null) => {
      setSpargeSaltsResult(result);
      setSaltDerivation(derivation);
      setSpargeSaltsInputsKey(buildSpargeSaltsInputsKey());
    },
    [buildSpargeSaltsInputsKey],
  );

  const _spargeCalciumPpm = useMemo(() => {
    const v = spargeSaltsResult?.resultingProfile?.calcium ?? selectedSpargeProfile?.calcium;
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  }, [spargeSaltsResult, selectedSpargeProfile]);

  const _spargeMagnesiumPpm = useMemo(() => {
    const v = spargeSaltsResult?.resultingProfile?.magnesium ?? selectedSpargeProfile?.magnesium;
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  }, [spargeSaltsResult, selectedSpargeProfile]);

  return {
    spargeSaltsError,
    setSpargeSaltsError,
    spargeSaltsStatus,
    setSpargeSaltsStatus,
    spargeSaltsSaveStatus,
    setSpargeSaltsSaveStatus,
    spargeSaltsCalcSaveStatus,
    setSpargeSaltsCalcSaveStatus,
    spargeSaltsSubmitting,
    savingSpargeSalts,
    spargeSaltsResult,
    setSpargeSaltsResult,
    saltDerivation,
    setSaltDerivation,
    spargeSaltsInputsKey,
    hasNonZeroSaltAdditions,
    buildSpargeSaltsInputsKey,
    hydrateSpargeSalts,
    onSaveSpargeSaltsInputs,
    ensureSpargeSaltsSnapshotForAcidification,
    onCalculateSpargeSalts,
    applySaltsFromCompute,
    _spargeCalciumPpm,
    _spargeMagnesiumPpm,
  };
}
