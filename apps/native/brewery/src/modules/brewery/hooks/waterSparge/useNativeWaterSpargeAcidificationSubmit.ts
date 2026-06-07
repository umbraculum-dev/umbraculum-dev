import { useCallback } from "react";

import { computeAndSaveSparge } from "@umbraculum/api-client/brewery";
import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

import { nativePlatformApiClient } from "@umbraculum/native-shell/auth";

import { applyNativeWaterSpargeComputedResult } from "./applyNativeWaterSpargeComputedResult";
import { buildNativeWaterSpargeAcidificationDraftPatch } from "./buildNativeWaterSpargeAcidificationDraftPatch";
import type { NativeWaterSpargeAcidificationState } from "./useNativeWaterSpargeAcidificationState";

export function useNativeWaterSpargeAcidificationSubmit(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSettings: (s: Record<string, unknown>) => void;
  setError: (value: string | null) => void;
  setSaving: (value: boolean) => void;
  setSaveStatus: (value: string | null) => void;
  saltAdditions: SaltAdditionRow[];
  state: NativeWaterSpargeAcidificationState;
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
    saltAdditions,
    state,
  } = params;

  const {
    spargeWaterProfileId,
    startingAlk,
    startingPh,
    targetPh,
    volumeLiters,
    acidType,
    strengthKind,
    strengthValue,
    acidificationMode,
    manualAcidAdded,
    setSpargeResult,
    setSpargeManualResult,
    setCalcSaveStatus,
    setSubmitting,
  } = state;

  const buildDraftPatch = useCallback(
    () => buildNativeWaterSpargeAcidificationDraftPatch({ saltAdditions, state }),
    [saltAdditions, state],
  );

  const onSaveDraft = useCallback(async () => {
    if (!canCall) return;
    setError(null);
    setSaveStatus(null);
    setCalcSaveStatus(null);
    setSaving(true);
    try {
      await saveSettings(buildDraftPatch());
      setSaveStatus("Saved sparge draft.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }, [canCall, saveSettings, setError, setSaveStatus, setCalcSaveStatus, setSaving, buildDraftPatch]);

  const onCalculateAndSave = useCallback(async () => {
    if (!canCall) return;
    if (!Number.isFinite(volumeLiters) || !(volumeLiters > 0)) {
      setError("Sparge water volume must be > 0.");
      return;
    }
    if (startingPh.trim() === "" || !Number.isFinite(Number(startingPh))) {
      setError("Starting pH is required.");
      return;
    }
    setError(null);
    setSaveStatus(null);
    setCalcSaveStatus(null);
    setSpargeResult(null);
    setSpargeManualResult(null);
    setSubmitting(true);
    try {
      const api = nativePlatformApiClient(token!, baseUrl);
      const payload: Record<string, unknown> = {
        spargeWaterProfileId,
        spargeSaltAdditionsJson: saltAdditions,
        spargeStartingAlkalinityPpmCaCO3: startingAlk,
        spargeStartingPh: Number(startingPh),
        spargeTargetPh: targetPh,
        spargeVolumeLiters: volumeLiters,
        spargeAcidType: acidType,
        spargeStrengthKind: strengthKind,
        spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
        spargeAcidificationMode: acidificationMode,
        spargeManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
        spargeManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
      };
      const computed = await computeAndSaveSparge(api, recipeId, payload);
      applyNativeWaterSpargeComputedResult(computed, state);
      if (computed.settings) setSettings(computed.settings as unknown as Record<string, unknown>);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }, [
    canCall,
    volumeLiters,
    startingPh,
    setError,
    setSaveStatus,
    token,
    baseUrl,
    spargeWaterProfileId,
    saltAdditions,
    startingAlk,
    targetPh,
    acidType,
    strengthKind,
    strengthValue,
    acidificationMode,
    manualAcidAdded,
    recipeId,
    setSettings,
    setSpargeResult,
    setSpargeManualResult,
    setCalcSaveStatus,
    setSubmitting,
    state,
  ]);

  return { onSaveDraft, onCalculateAndSave };
}
