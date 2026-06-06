import { useCallback } from "react";

import { computeAndSaveBoil } from "@umbraculum/api-client/brewery";
import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";

import type { NativeWaterBoilAcidificationState } from "./useNativeWaterBoilAcidificationState";

export function useNativeWaterBoilAcidificationSubmit(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSettings: (s: Record<string, unknown>) => void;
  setError: (value: string | null) => void;
  setSaving: (value: boolean) => void;
  setSaveStatus: (value: string | null) => void;
  sourceProfileId: string;
  targetProfileId: string;
  dilutionProfileId: string;
  tapVolumeLiters: number;
  dilutionVolumeLiters: number;
  derivedBoilWaterVolumeLiters: number;
  saltAdditions: SaltAdditionRow[];
  state: NativeWaterBoilAcidificationState;
}) {
  const {
    canCall,
    recipeId,
    baseUrl,
    token,
    saveSettings,
    setSettings,
    setError,
    setSaving,
    setSaveStatus,
    sourceProfileId,
    targetProfileId,
    dilutionProfileId,
    tapVolumeLiters,
    dilutionVolumeLiters,
    derivedBoilWaterVolumeLiters,
    saltAdditions,
    state,
  } = params;

  const {
    startingAlk,
    startingPh,
    targetPh,
    acidType,
    strengthKind,
    strengthValue,
    acidificationMode,
    manualAcidAdded,
    setAcidResult,
    setManualResult,
    setCalcSaveStatus,
    setSubmitting,
  } = state;

  const buildDraftPatch = useCallback(
    () => ({
      boilSourceWaterProfileId: sourceProfileId || null,
      boilTargetWaterProfileId: targetProfileId || null,
      boilDilutionWaterProfileId: dilutionProfileId || null,
      boilTapWaterVolumeLiters: tapVolumeLiters,
      boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
      boilStartingAlkalinityPpmCaCO3: startingAlk,
      boilStartingPh: startingPh.trim() === "" ? undefined : Number(startingPh),
      boilTargetPh: targetPh,
      boilAcidType: acidType,
      boilStrengthKind: strengthKind,
      boilStrengthValue: strengthKind === "solid" ? null : strengthValue,
      boilAcidificationMode: acidificationMode,
      boilManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
      boilManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
      boilSaltAdditionsJson: saltAdditions,
    }),
    [
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
    ],
  );

  const onSaveDraft = useCallback(async () => {
    if (!canCall) return;
    setError(null);
    setSaveStatus(null);
    setCalcSaveStatus(null);
    setSaving(true);
    try {
      await saveSettings(buildDraftPatch());
      setSaveStatus("Saved boil draft.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }, [canCall, saveSettings, setError, setSaveStatus, setCalcSaveStatus, setSaving, buildDraftPatch]);

  const onCalculateAndSave = useCallback(async () => {
    if (!canCall) return;
    if (!sourceProfileId) {
      setError("Select a Source water profile.");
      return;
    }
    if (!Number.isFinite(derivedBoilWaterVolumeLiters) || !(derivedBoilWaterVolumeLiters > 0)) {
      setError("Boil water volume must be > 0 (set Water adjustment volumes).");
      return;
    }
    if (startingPh.trim() === "" || !Number.isFinite(Number(startingPh))) {
      setError("Starting pH is required.");
      return;
    }
    setError(null);
    setSaveStatus(null);
    setCalcSaveStatus(null);
    setAcidResult(null);
    setManualResult(null);
    setSubmitting(true);
    try {
      const api = nativePlatformApiClient(token!, baseUrl);
      const payload: Record<string, unknown> = {
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
      const computed = await computeAndSaveBoil(api, recipeId, payload);
      setManualResult(null);
      setAcidResult(null);
      if (computed.acid.kind === "boil_acidification_manual") {
        const r = computed.acid.result;
        setManualResult({
          achievedPh: r.achievedPh ?? 0,
          predicted: {
            finalAlkalinityPpmCaCO3: r.predicted?.finalAlkalinityPpmCaCO3 ?? 0,
            sulfateAddedPpm: r.predicted?.sulfateAddedPpm ?? 0,
            chlorideAddedPpm: r.predicted?.chlorideAddedPpm ?? 0,
          },
        });
        setAcidResult(r.predicted ?? null);
        setCalcSaveStatus("Estimated & saved snapshot.");
      } else {
        const r = computed.acid.result;
        setAcidResult({
          acidRequiredMl: r.acidRequiredMl ?? null,
          acidRequiredTsp: r.acidRequiredTsp ?? null,
          acidRequiredGrams: r.acidRequiredGrams ?? null,
          acidRequiredKg: r.acidRequiredKg ?? null,
          finalAlkalinityPpmCaCO3: r.finalAlkalinityPpmCaCO3 ?? 0,
          sulfateAddedPpm: r.sulfateAddedPpm ?? 0,
          chlorideAddedPpm: r.chlorideAddedPpm ?? 0,
        });
        setCalcSaveStatus("Calculated & saved snapshot.");
      }
      if (computed.settings) setSettings(computed.settings as unknown as Record<string, unknown>);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }, [
    canCall,
    sourceProfileId,
    derivedBoilWaterVolumeLiters,
    startingPh,
    setError,
    setSaveStatus,
    token,
    baseUrl,
    dilutionProfileId,
    tapVolumeLiters,
    dilutionVolumeLiters,
    startingAlk,
    targetPh,
    acidType,
    strengthKind,
    strengthValue,
    acidificationMode,
    manualAcidAdded,
    saltAdditions,
    recipeId,
    setSettings,
    setAcidResult,
    setManualResult,
    setCalcSaveStatus,
    setSubmitting,
  ]);

  return { onSaveDraft, onCalculateAndSave };
}
