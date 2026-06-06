import { useCallback, type MutableRefObject } from "react";

import { computeAndSaveMash } from "@umbraculum/api-client/brewery";
import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { useT } from "@umbraculum/i18n-react";

import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";
import type { NativeMashAdjustmentFieldsRef } from "./useNativeWaterMashAdjustment";
import type { useNativeWaterMashAcidificationState } from "./useNativeWaterMashAcidificationState";

type AcidificationState = ReturnType<typeof useNativeWaterMashAcidificationState>;

export function useNativeWaterMashAcidificationOps(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setError: (value: string | null) => void;
  adjustmentFieldsRef: MutableRefObject<NativeMashAdjustmentFieldsRef["current"]>;
  saltAdditions: SaltAdditionRow[];
  state: AcidificationState;
}) {
  const { canCall, recipeId, baseUrl, token, saveSettings, setError, adjustmentFieldsRef, saltAdditions, state } = params;
  const { t } = useT("recipes.water.mash");

  const {
    mashStartingAlk,
    mashStartingPh,
    mashTargetPh,
    mashAcidType,
    mashStrengthKind,
    mashStrengthValue,
    mashAcidificationMode,
    mashManualAcidAdded,
    setMashSaveStatus,
    setMashCalcSaveStatus,
    setSavingMash,
    setMashSubmitting,
    setSavingOverall,
    setOverallStatus,
    setMashManualResult,
    setMashAcidResult,
    setOverallResult,
  } = state;

  const buildComputePayload = useCallback((): Record<string, unknown> => {
    const { sourceProfileId, dilutionProfileId, tapNum, dilNum } = adjustmentFieldsRef.current;
    return {
      sourceWaterProfileId: sourceProfileId,
      dilutionWaterProfileId: dilutionProfileId || null,
      tapWaterVolumeLiters: tapNum,
      dilutionWaterVolumeLiters: dilNum,
      mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
      mashStartingPh: mashStartingPh,
      mashTargetPh: mashTargetPh,
      mashAcidType: mashAcidType,
      mashStrengthKind: mashStrengthKind,
      mashStrengthValue: mashStrengthKind === "solid" ? null : mashStrengthValue,
      mashAcidificationMode: mashAcidificationMode,
      mashManualAcidAddedMl: mashStrengthKind === "solid" ? null : mashManualAcidAdded,
      mashManualAcidAddedGrams: mashStrengthKind === "solid" ? mashManualAcidAdded : null,
      mashSaltAdditionsJson: saltAdditions,
    };
  }, [
    adjustmentFieldsRef,
    mashStartingAlk,
    mashStartingPh,
    mashTargetPh,
    mashAcidType,
    mashStrengthKind,
    mashStrengthValue,
    mashAcidificationMode,
    mashManualAcidAdded,
    saltAdditions,
  ]);

  const applyComputeResults = useCallback(
    (computed: Awaited<ReturnType<typeof computeAndSaveMash>>, snapshotMessages: boolean) => {
      if (computed.acid.kind === "mash_acidification_manual") {
        setMashManualResult(computed.acid.result);
        setMashAcidResult(computed.acid.result.predicted ?? null);
        if (snapshotMessages) {
          setMashCalcSaveStatus(t("mashSnapshotEstimatedAndSaved"));
        }
      } else {
        setMashManualResult(null);
        setMashAcidResult(computed.acid.result);
        if (snapshotMessages) {
          setMashCalcSaveStatus(t("mashSnapshotCalculatedAndSaved"));
        }
      }
      setOverallResult(computed.overall.result);
    },
    [t, setMashManualResult, setMashAcidResult, setMashCalcSaveStatus, setOverallResult],
  );

  const onSaveMashDraft = async () => {
    if (!canCall) return;
    const { tapNum, dilNum, derivedMashWaterVolumeLiters } = adjustmentFieldsRef.current;
    setError(null);
    setMashSaveStatus(null);
    setMashCalcSaveStatus(null);
    setSavingMash(true);
    try {
      await saveSettings({
        tapWaterVolumeLiters: tapNum,
        dilutionWaterVolumeLiters: dilNum,
        mashStartingAlkalinityPpmCaCO3: mashStartingAlk,
        mashStartingPh: mashStartingPh,
        mashTargetPh: mashTargetPh,
        mashWaterVolumeLiters: derivedMashWaterVolumeLiters,
        mashAcidType: mashAcidType,
        mashStrengthKind: mashStrengthKind,
        mashStrengthValue: mashStrengthKind === "solid" ? null : mashStrengthValue,
        mashAcidificationMode: mashAcidificationMode,
        mashManualAcidAddedMl: mashStrengthKind === "solid" ? null : mashManualAcidAdded,
        mashManualAcidAddedGrams: mashStrengthKind === "solid" ? mashManualAcidAdded : null,
      });
      setMashSaveStatus(t("mashDraftSaved"));
    } catch (err) {
      setError(String(err));
    } finally {
      setSavingMash(false);
    }
  };

  const onEstimateAndSaveSnapshot = async () => {
    const { sourceProfileId } = adjustmentFieldsRef.current;
    if (!canCall || !sourceProfileId) {
      setError("Select a Source water profile.");
      return;
    }
    setError(null);
    setMashSaveStatus(null);
    setMashCalcSaveStatus(null);
    setMashSubmitting(true);
    try {
      const api = nativePlatformApiClient(token!, baseUrl);
      const computed = await computeAndSaveMash(api, recipeId, buildComputePayload());
      applyComputeResults(computed, true);
      setOverallStatus(t("overallSnapshotSaved"));
    } catch (err) {
      setError(String(err));
    } finally {
      setMashSubmitting(false);
    }
  };

  const onComputeAndSave = async () => {
    const { sourceProfileId } = adjustmentFieldsRef.current;
    if (!canCall || !sourceProfileId) {
      setError("Select a Source water profile.");
      return;
    }
    setError(null);
    setSavingOverall(true);
    try {
      const api = nativePlatformApiClient(token!, baseUrl);
      const computed = await computeAndSaveMash(api, recipeId, buildComputePayload());
      applyComputeResults(computed, false);
      setOverallStatus("Calculated & saved.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSavingOverall(false);
    }
  };

  return {
    onSaveMashDraft,
    onEstimateAndSaveSnapshot,
    onComputeAndSave,
  };
}
