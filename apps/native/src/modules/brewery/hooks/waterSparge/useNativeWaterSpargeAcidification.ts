import { useCallback, useEffect, useMemo, useState } from "react";

import { computeAndSaveSparge } from "@umbraculum/api-client/brewery";
import type { WaterProfile } from "@umbraculum/contracts";

import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";
import { bicarbonatePpmToAlkalinityPpmCaCO3 } from "./waterSpargeHelpers";
import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

export const SPARGE_ACID_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "phosphoric", label: "Phosphoric" },
  { value: "lactic", label: "Lactic" },
  { value: "hydrochloric", label: "Hydrochloric" },
  { value: "sulfuric", label: "Sulfuric" },
  { value: "acetic", label: "Acetic" },
  { value: "citric", label: "Citric (solid)" },
  { value: "tartaric", label: "Tartaric (solid)" },
  { value: "malic", label: "Malic (solid)" },
];

export const SPARGE_STRENGTH_KIND_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "percent", label: "Percent (%)" },
  { value: "normality", label: "Normality (N)" },
  { value: "molarity", label: "Molarity (M)" },
  { value: "solid", label: "Solid (pure)" },
];

export function useNativeWaterSpargeAcidification(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSettings: (s: Record<string, unknown>) => void;
  setError: (value: string | null) => void;
  waterProfiles: WaterProfile[];
  saltAdditions: SaltAdditionRow[];
  setSaving: (value: boolean) => void;
  setSaveStatus: (value: string | null) => void;
}) {
  const {
    canCall,
    recipeId,
    baseUrl,
    token,
    saveSettings,
    setSettings,
    setError,
    waterProfiles,
    saltAdditions,
    setSaving,
    setSaveStatus,
  } = params;

  const [spargeWaterProfileId, setSpargeWaterProfileId] = useState("");
  const [startingAlk, setStartingAlk] = useState(0);
  const [startingAlkTouched, setStartingAlkTouched] = useState(false);
  const [startingPh, setStartingPh] = useState("7.0");
  const [targetPh, setTargetPh] = useState(5.6);
  const [volumeLiters, setVolumeLiters] = useState(20);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">("percent");
  const [strengthValue, setStrengthValue] = useState(10);
  const [acidificationMode, setAcidificationMode] = useState<"targetPh" | "manual">("targetPh");
  const [manualAcidAdded, setManualAcidAdded] = useState(0);

  const [spargeResult, setSpargeResult] = useState<{
    acidRequiredMl: number | null;
    acidRequiredTsp: number | null;
    acidRequiredGrams: number | null;
    acidRequiredKg: number | null;
    finalAlkalinityPpmCaCO3: number;
    sulfateAddedPpm: number;
    chlorideAddedPpm: number;
  } | null>(null);
  const [spargeManualResult, setSpargeManualResult] = useState<{
    achievedPh: number;
    predicted: { finalAlkalinityPpmCaCO3: number; sulfateAddedPpm: number; chlorideAddedPpm: number };
  } | null>(null);
  const [calcSaveStatus, setCalcSaveStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedProfile = useMemo(
    () => waterProfiles.find((p) => p.id === spargeWaterProfileId) ?? null,
    [spargeWaterProfileId, waterProfiles],
  );

  const derivedStartingAlkPpmCaCO3 = useMemo(() => {
    if (!selectedProfile) return null;
    const alk = bicarbonatePpmToAlkalinityPpmCaCO3(selectedProfile.bicarbonate);
    return Number.isFinite(alk) ? alk : null;
  }, [selectedProfile]);

  useEffect(() => {
    if (startingAlkTouched) return;
    if (derivedStartingAlkPpmCaCO3 === null) return;
    const rounded = Math.round(derivedStartingAlkPpmCaCO3 * 100) / 100;
    setStartingAlk(rounded);
  }, [derivedStartingAlkPpmCaCO3, startingAlkTouched]);

  const hydrateSpargeAcidification = useCallback((s: Record<string, unknown>) => {
    setSpargeWaterProfileId((s["spargeWaterProfileId"] as string) ?? "");
    const savedAlk = s["spargeStartingAlkalinityPpmCaCO3"];
    setStartingAlk(typeof savedAlk === "number" && Number.isFinite(savedAlk) ? savedAlk : 0);
    setStartingAlkTouched(typeof savedAlk === "number" && Number.isFinite(savedAlk) && savedAlk !== 0);
    setStartingPh(String(s["spargeStartingPh"] ?? 7.0));
    setTargetPh((s["spargeTargetPh"] as number) ?? 5.6);
    setVolumeLiters((s["spargeVolumeLiters"] as number) ?? 20);
    setAcidType((s["spargeAcidType"] as string) ?? "phosphoric");
    setStrengthKind(((s["spargeStrengthKind"] as string) ?? "percent") as "percent" | "normality" | "molarity" | "solid");
    setStrengthValue((s["spargeStrengthValue"] as number) ?? 10);
    setAcidificationMode(s["spargeAcidificationMode"] === "manual" ? "manual" : "targetPh");
    const savedManual =
      (s["spargeStrengthKind"] as string) === "solid"
        ? ((s["spargeManualAcidAddedGrams"] as number) ?? 0)
        : ((s["spargeManualAcidAddedMl"] as number) ?? 0);
    setManualAcidAdded(savedManual);
    if (s["spargeLastCalculatedAt"]) {
      setSpargeResult({
        acidRequiredMl: s["spargeLastAcidRequiredMl"] as number | null,
        acidRequiredTsp: s["spargeLastAcidRequiredTsp"] as number | null,
        acidRequiredGrams: s["spargeLastAcidRequiredGrams"] as number | null,
        acidRequiredKg: s["spargeLastAcidRequiredKg"] as number | null,
        finalAlkalinityPpmCaCO3: (s["spargeLastFinalAlkalinityPpmCaCO3"] as number) ?? 0,
        sulfateAddedPpm: (s["spargeLastSulfateAddedPpm"] as number) ?? 0,
        chlorideAddedPpm: (s["spargeLastChlorideAddedPpm"] as number) ?? 0,
      });
    }
    if (s["spargeManualLastCalculatedAt"]) {
      setSpargeManualResult({
        achievedPh: (s["spargeManualLastAchievedPh"] as number) ?? 0,
        predicted: {
          finalAlkalinityPpmCaCO3: (s["spargeManualLastFinalAlkalinityPpmCaCO3"] as number) ?? 0,
          sulfateAddedPpm: (s["spargeManualLastSulfateAddedPpm"] as number) ?? 0,
          chlorideAddedPpm: (s["spargeManualLastChlorideAddedPpm"] as number) ?? 0,
        },
      });
    }
  }, []);

  const buildDraftPatch = useCallback(
    () => ({
      spargeWaterProfileId: spargeWaterProfileId || null,
      spargeStartingAlkalinityPpmCaCO3: startingAlk,
      spargeStartingPh: startingPh.trim() === "" ? undefined : Number(startingPh),
      spargeTargetPh: targetPh,
      spargeVolumeLiters: volumeLiters,
      spargeAcidType: acidType,
      spargeStrengthKind: strengthKind,
      spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
      spargeAcidificationMode: acidificationMode,
      spargeManualAcidAddedMl: strengthKind === "solid" ? null : manualAcidAdded,
      spargeManualAcidAddedGrams: strengthKind === "solid" ? manualAcidAdded : null,
      spargeSaltAdditionsJson: saltAdditions,
    }),
    [
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
      setSpargeManualResult(null);
      setSpargeResult(null);
      if (computed.acid.kind === "sparge_acidification_manual") {
        const r = computed.acid.result;
        setSpargeManualResult({
          achievedPh: r.achievedPh ?? 0,
          predicted: {
            finalAlkalinityPpmCaCO3: r.predicted?.finalAlkalinityPpmCaCO3 ?? 0,
            sulfateAddedPpm: r.predicted?.sulfateAddedPpm ?? 0,
            chlorideAddedPpm: r.predicted?.chlorideAddedPpm ?? 0,
          },
        });
        setSpargeResult(r.predicted ?? null);
        setCalcSaveStatus("Estimated & saved snapshot.");
      } else {
        const r = computed.acid.result;
        setSpargeResult({
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
  ]);

  return {
    spargeWaterProfileId,
    setSpargeWaterProfileId,
    startingAlk,
    setStartingAlk,
    startingAlkTouched,
    setStartingAlkTouched,
    startingPh,
    setStartingPh,
    targetPh,
    setTargetPh,
    volumeLiters,
    setVolumeLiters,
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
    spargeResult,
    spargeManualResult,
    calcSaveStatus,
    submitting,
    selectedProfile,
    derivedStartingAlkPpmCaCO3,
    hydrateSpargeAcidification,
    onSaveDraft,
    onCalculateAndSave,
    acidTypeOptions: SPARGE_ACID_TYPE_OPTIONS,
    strengthKindOptions: SPARGE_STRENGTH_KIND_OPTIONS,
  };
}
