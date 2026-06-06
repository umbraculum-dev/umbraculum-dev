import { useCallback } from "react";

import { computeAndSaveBoil } from "@umbraculum/api-client/brewery";
import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";

import { applyNativeWaterBoilComputedResult } from "./applyNativeWaterBoilComputedResult";
import { buildNativeWaterBoilAcidificationComputePayload } from "./buildNativeWaterBoilAcidificationComputePayload";
import { buildNativeWaterBoilAcidificationDraftPatch } from "./buildNativeWaterBoilAcidificationDraftPatch";
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
    startingPh,
    setAcidResult,
    setManualResult,
    setCalcSaveStatus,
    setSubmitting,
  } = state;

  const buildDraftPatch = useCallback(
    () =>
      buildNativeWaterBoilAcidificationDraftPatch({
        sourceProfileId,
        targetProfileId,
        dilutionProfileId,
        tapVolumeLiters,
        dilutionVolumeLiters,
        saltAdditions,
        state,
      }),
    [
      sourceProfileId,
      targetProfileId,
      dilutionProfileId,
      tapVolumeLiters,
      dilutionVolumeLiters,
      saltAdditions,
      state,
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
      const payload = buildNativeWaterBoilAcidificationComputePayload({
        sourceProfileId,
        dilutionProfileId,
        tapVolumeLiters,
        dilutionVolumeLiters,
        saltAdditions,
        state,
      });
      const computed = await computeAndSaveBoil(api, recipeId, payload);
      applyNativeWaterBoilComputedResult(computed, state);
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
    saltAdditions,
    recipeId,
    setSettings,
    setAcidResult,
    setManualResult,
    setCalcSaveStatus,
    setSubmitting,
    state,
  ]);

  return { onSaveDraft, onCalculateAndSave };
}
