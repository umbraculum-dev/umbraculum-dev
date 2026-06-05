import { useCallback, useEffect, useState } from "react";

import { computeAndSaveBoil } from "@umbraculum/api-client/brewery";
import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";
import { SPARGE_ACID_TYPE_OPTIONS, SPARGE_STRENGTH_KIND_OPTIONS } from "../waterSparge/useNativeWaterSpargeAcidification";

export function useNativeWaterBoilAcidification(params: {
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
  derivedStartingAlkPpmCaCO3: number | null;
  saltAdditions: SaltAdditionRow[];
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
    derivedStartingAlkPpmCaCO3,
    saltAdditions,
  } = params;

  const [startingAlk, setStartingAlk] = useState(0);
  const [startingAlkTouched, setStartingAlkTouched] = useState(false);
  const [startingPh, setStartingPh] = useState("7.0");
  const [targetPh, setTargetPh] = useState(5.6);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">("percent");
  const [strengthValue, setStrengthValue] = useState(10);
  const [acidificationMode, setAcidificationMode] = useState<"targetPh" | "manual">("targetPh");
  const [manualAcidAdded, setManualAcidAdded] = useState(0);

  const [acidResult, setAcidResult] = useState<{
    acidRequiredMl: number | null;
    acidRequiredTsp: number | null;
    acidRequiredGrams: number | null;
    acidRequiredKg: number | null;
    finalAlkalinityPpmCaCO3: number;
    sulfateAddedPpm: number;
    chlorideAddedPpm: number;
  } | null>(null);
  const [manualResult, setManualResult] = useState<{
    achievedPh: number;
    predicted: { finalAlkalinityPpmCaCO3: number; sulfateAddedPpm: number; chlorideAddedPpm: number };
  } | null>(null);
  const [calcSaveStatus, setCalcSaveStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (startingAlkTouched) return;
    if (derivedStartingAlkPpmCaCO3 === null) return;
    const rounded = Math.round(derivedStartingAlkPpmCaCO3 * 100) / 100;
    setStartingAlk(rounded);
  }, [derivedStartingAlkPpmCaCO3, startingAlkTouched]);

  const hydrateBoilAcidification = useCallback((s: Record<string, unknown>) => {
    const savedAlk = s["boilStartingAlkalinityPpmCaCO3"];
    setStartingAlk(typeof savedAlk === "number" && Number.isFinite(savedAlk) ? savedAlk : 0);
    setStartingAlkTouched(typeof savedAlk === "number" && Number.isFinite(savedAlk) && savedAlk !== 0);
    setStartingPh(String(s["boilStartingPh"] ?? 7.0));
    setTargetPh((s["boilTargetPh"] as number) ?? 5.6);
    setAcidType((s["boilAcidType"] as string) ?? "phosphoric");
    setStrengthKind(((s["boilStrengthKind"] as string) ?? "percent") as "percent" | "normality" | "molarity" | "solid");
    setStrengthValue((s["boilStrengthValue"] as number) ?? 10);
    setAcidificationMode(s["boilAcidificationMode"] === "manual" ? "manual" : "targetPh");
    const savedManual =
      (s["boilStrengthKind"] as string) === "solid"
        ? ((s["boilManualAcidAddedGrams"] as number) ?? 0)
        : ((s["boilManualAcidAddedMl"] as number) ?? 0);
    setManualAcidAdded(savedManual);
    if (s["boilLastCalculatedAt"]) {
      setAcidResult({
        acidRequiredMl: s["boilLastAcidRequiredMl"] as number | null,
        acidRequiredTsp: s["boilLastAcidRequiredTsp"] as number | null,
        acidRequiredGrams: s["boilLastAcidRequiredGrams"] as number | null,
        acidRequiredKg: s["boilLastAcidRequiredKg"] as number | null,
        finalAlkalinityPpmCaCO3: (s["boilLastFinalAlkalinityPpmCaCO3"] as number) ?? 0,
        sulfateAddedPpm: (s["boilLastSulfateAddedPpm"] as number) ?? 0,
        chlorideAddedPpm: (s["boilLastChlorideAddedPpm"] as number) ?? 0,
      });
    }
    if (s["boilManualLastCalculatedAt"]) {
      setManualResult({
        achievedPh: (s["boilManualLastAchievedPh"] as number) ?? 0,
        predicted: {
          finalAlkalinityPpmCaCO3: (s["boilManualLastFinalAlkalinityPpmCaCO3"] as number) ?? 0,
          sulfateAddedPpm: (s["boilManualLastSulfateAddedPpm"] as number) ?? 0,
          chlorideAddedPpm: (s["boilManualLastChlorideAddedPpm"] as number) ?? 0,
        },
      });
    }
  }, []);

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
  ]);

  return {
    startingAlk,
    setStartingAlk,
    startingAlkTouched,
    setStartingAlkTouched,
    startingPh,
    setStartingPh,
    targetPh,
    setTargetPh,
    acidType,
    setAcidType,
    strengthKind,
    setStrengthKind,
    strengthValue,
    setStrengthValue,
    acidificationMode,
    setAcidificationMode,
    manualAcidAdded,
    setManualAcidAdded,
    acidResult,
    manualResult,
    calcSaveStatus,
    submitting,
    hydrateBoilAcidification,
    onSaveDraft,
    onCalculateAndSave,
    acidTypeOptions: SPARGE_ACID_TYPE_OPTIONS,
    strengthKindOptions: SPARGE_STRENGTH_KIND_OPTIONS,
  };
}
