import { useCallback, useState, type MutableRefObject } from "react";

import { computeAndSaveMash } from "@umbraculum/api-client/brewery";
import type { WaterAcidificationManualResult, WaterAcidificationResult } from "@umbraculum/contracts";
import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { useT } from "@umbraculum/i18n-react";

import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";
import type { NativeMashAdjustmentFieldsRef } from "./useNativeWaterMashAdjustment";

export function useNativeWaterMashAcidification(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setError: (value: string | null) => void;
  adjustmentFieldsRef: MutableRefObject<NativeMashAdjustmentFieldsRef["current"]>;
  saltAdditions: SaltAdditionRow[];
}) {
  const { canCall, recipeId, baseUrl, token, saveSettings, setError, adjustmentFieldsRef, saltAdditions } = params;

  const { t } = useT("recipes.water.mash");

  const [mashStartingAlk, setMashStartingAlk] = useState(0);
  const [mashStartingPh, setMashStartingPh] = useState(7);
  const [mashTargetPh, setMashTargetPh] = useState(5.4);
  const [mashAcidType, setMashAcidType] = useState("lactic");
  const [mashAcidificationMode, setMashAcidificationMode] = useState<"targetPh" | "manual">("targetPh");
  const [mashStrengthKind, setMashStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">("percent");
  const [mashStrengthValue, setMashStrengthValue] = useState(88);
  const [mashManualAcidAdded, setMashManualAcidAdded] = useState(0);

  const [overallResult, setOverallResult] = useState<Record<string, unknown> | null>(null);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [savingOverall, setSavingOverall] = useState(false);

  const [mashAcidResult, setMashAcidResult] = useState<WaterAcidificationResult | null>(null);
  const [mashManualResult, setMashManualResult] = useState<WaterAcidificationManualResult | null>(null);
  const [mashSaveStatus, setMashSaveStatus] = useState<string | null>(null);
  const [mashCalcSaveStatus, setMashCalcSaveStatus] = useState<string | null>(null);
  const [savingMash, setSavingMash] = useState(false);
  const [mashSubmitting, setMashSubmitting] = useState(false);

  const hydrateMashAcidification = useCallback((s: Record<string, unknown>) => {
    // eslint-disable-next-line no-constant-binary-expression -- pre-existing semantic bug: Number(x) ?? default never short-circuits (Number always returns a number, possibly NaN). Intended pattern is likely Number(x ?? default). Not fixed here because changing the precedence changes runtime behavior (NaN vs default). Tracked separately. See docs/LINTING.md.
    setMashStartingAlk(Number(s["mashStartingAlkalinityPpmCaCO3"]) ?? 0);
    // eslint-disable-next-line no-constant-binary-expression -- pre-existing: see above.
    setMashStartingPh(Number(s["mashStartingPh"]) ?? 7);
    // eslint-disable-next-line no-constant-binary-expression -- pre-existing: see above.
    setMashTargetPh(Number(s["mashTargetPh"]) ?? 5.4);
    setMashAcidType((s["mashAcidType"] as string) ?? "lactic");
    setMashAcidificationMode((s["mashAcidificationMode"] as string) === "manual" ? "manual" : "targetPh");
    setMashStrengthKind(((s["mashStrengthKind"] as string) ?? "percent") as "percent" | "normality" | "molarity" | "solid");
    // eslint-disable-next-line no-constant-binary-expression -- pre-existing: see above.
    setMashStrengthValue(Number(s["mashStrengthValue"]) ?? 88);
    setMashManualAcidAdded(Number(s["mashManualAcidAddedMl"] ?? s["mashManualAcidAddedGrams"] ?? 0));
    if (s["mashOverallLastResultJson"] && typeof s["mashOverallLastResultJson"] === "object") {
      setOverallResult(s["mashOverallLastResultJson"] as Record<string, unknown>);
    }
  }, []);

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
    [t],
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
    mashStartingAlk,
    setMashStartingAlk,
    mashStartingPh,
    setMashStartingPh,
    mashTargetPh,
    setMashTargetPh,
    mashAcidType,
    setMashAcidType,
    mashAcidificationMode,
    setMashAcidificationMode,
    mashStrengthKind,
    setMashStrengthKind,
    mashStrengthValue,
    setMashStrengthValue,
    mashManualAcidAdded,
    setMashManualAcidAdded,
    overallResult,
    setOverallResult,
    overallStatus,
    setOverallStatus,
    savingOverall,
    setSavingOverall,
    mashAcidResult,
    setMashAcidResult,
    mashManualResult,
    setMashManualResult,
    mashSaveStatus,
    setMashSaveStatus,
    mashCalcSaveStatus,
    setMashCalcSaveStatus,
    savingMash,
    setSavingMash,
    mashSubmitting,
    setMashSubmitting,
    hydrateMashAcidification,
    onSaveMashDraft,
    onEstimateAndSaveSnapshot,
    onComputeAndSave,
  };
}
