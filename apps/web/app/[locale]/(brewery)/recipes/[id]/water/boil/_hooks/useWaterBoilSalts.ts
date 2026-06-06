"use client";

import { useCallback, useMemo, useState } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { calcSaltAdditions } from "@umbraculum/api-client/brewery";
import type { WaterCalcDerivation } from "@umbraculum/brewery-contracts";

import { webBreweryApiClient } from "../../../../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../../../_lib/typeGuards";
import type { IonProfilePpm } from "../../_lib/waterChem";
import type { SaltAdditionsResult } from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettingsResponse } from "../../_lib/waterSettings";

type MixedSourceProfile = {
  name: string;
  totalVolumeLiters: number;
} & IonProfilePpm;

export function useWaterBoilSalts(params: {
  canCall: boolean;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  mixedSourceProfile: MixedSourceProfile | null;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  selectedSource: { id: string } | null;
  selectedDilution: { id: string } | null;
  saltAdditions: SaltAdditionRow[];
  setSaltAdditions: (rows: SaltAdditionRow[]) => void;
}) {
  const {
    canCall,
    saveSettings,
    setSavingError,
    mixedSourceProfile,
    tapVolumeLiters,
    dilutionVolumeLiters,
    selectedSource,
    selectedDilution,
    saltAdditions,
    setSaltAdditions,
  } = params;

  const [saltsError, setSaltsError] = useState<string | null>(null);
  const [saltsStatus, setSaltsStatus] = useState<string | null>(null);
  const [saltsSaveStatus, setSaltsSaveStatus] = useState<string | null>(null);
  const [saltsCalcSaveStatus, setSaltsCalcSaveStatus] = useState<string | null>(null);
  const [saltsSubmitting, setSaltsSubmitting] = useState(false);
  const [savingSalts, setSavingSalts] = useState(false);
  const [saltsResult, setSaltsResult] = useState<SaltAdditionsResult | null>(null);
  const [saltDerivation, setSaltDerivation] = useState<WaterCalcDerivation | null>(null);

  const hasNonZeroSaltAdditions = (rows: SaltAdditionRow[]) =>
    rows.some((r) => typeof r.grams === "number" && Number.isFinite(r.grams) && r.grams > 0);

  const hydrateBoilSalts = useCallback(
    (s: NonNullable<RecipeWaterSettingsResponse["settings"]>) => {
      if (Array.isArray(s.boilSaltAdditionsJson)) {
        setSaltAdditions(s.boilSaltAdditionsJson as SaltAdditionRow[]);
      }
      const lastResult = asRecord(s.boilSaltsLastResultJson);
      if (lastResult) {
        const innerResult = asRecord(lastResult["result"]);
        if (innerResult) {
          setSaltsResult(innerResult as unknown as SaltAdditionsResult);
          if (typeof lastResult["calculatedAt"] === "string") {
            setSaltsStatus(`Last calculated: ${new Date(lastResult["calculatedAt"]).toLocaleString()}`);
          }
        }
      }
    },
    [setSaltAdditions],
  );

  const onSaveSaltAdditions = async () => {
    setSavingError(null);
    setSaltsSaveStatus(null);
    setSavingSalts(true);
    try {
      await saveSettings({ boilSaltAdditionsJson: saltAdditions });
      setSaltsSaveStatus("Saved salts draft.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingSalts(false);
    }
  };

  const ensureZeroSaltsSnapshotIfMissing = async () => {
    if (!canCall) return;
    if (saltsResult) return;
    if (hasNonZeroSaltAdditions(saltAdditions)) {
      throw new Error(
        "You entered salts but haven’t calculated them. Click “Calculate & save salts snapshot” first so overall/acidification uses the correct ions.",
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
    setSaltDerivation(null);
    await saveSettings({
      boilSaltAdditionsJson: saltAdditions,
      boilSaltsLastResultJson: { calculatedAt: nowIso, result },
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
    setSaltDerivation(null);
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
      setSaltDerivation(data.derivation as WaterCalcDerivation);

      await saveSettings({
        boilSaltAdditionsJson: saltAdditions,
        boilSaltsLastResultJson: { calculatedAt: new Date().toISOString(), result },
      });
      setSaltsStatus("Calculated.");
      setSaltsCalcSaveStatus("Calculated & saved salts snapshot.");
    } catch (err) {
      setSaltsError(String(err));
    } finally {
      setSaltsSubmitting(false);
    }
  };

  const applySaltsFromCompute = useCallback((result: SaltAdditionsResult, derivation: WaterCalcDerivation | null) => {
    setSaltsResult(result);
    setSaltDerivation(derivation);
  }, []);

  const _boilCalciumPpm = useMemo(() => {
    const v = saltsResult?.resultingProfile?.calcium ?? mixedSourceProfile?.calcium;
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  }, [saltsResult, mixedSourceProfile]);

  const _boilMagnesiumPpm = useMemo(() => {
    const v = saltsResult?.resultingProfile?.magnesium ?? mixedSourceProfile?.magnesium;
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  }, [saltsResult, mixedSourceProfile]);

  return {
    saltsError,
    setSaltsError,
    saltsStatus,
    setSaltsStatus,
    saltsSaveStatus,
    setSaltsSaveStatus,
    saltsCalcSaveStatus,
    setSaltsCalcSaveStatus,
    saltsSubmitting,
    savingSalts,
    saltsResult,
    setSaltsResult,
    saltDerivation,
    setSaltDerivation,
    hydrateBoilSalts,
    onSaveSaltAdditions,
    onCalcSalts,
    hasNonZeroSaltAdditions,
    ensureZeroSaltsSnapshotIfMissing,
    applySaltsFromCompute,
    _boilCalciumPpm,
    _boilMagnesiumPpm,
  };
}
