/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  computeAndSaveSparge,
  getRecipe,
  getRecipeWaterSettings,
  listWaterProfiles,
  updateRecipeWaterSettings,
} from "@umbraculum/api-client/brewery";
import type { WaterProfile, WaterProfilesResponse } from "@umbraculum/contracts";
import { useT } from "@umbraculum/i18n-react";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";

import { SaltAdditionsEditor, type SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { useAuth } from "../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../auth/apiBaseUrl";
import { nativePlatformApiClient } from "../../../auth/nativeApiClient";
import { useLocaleController } from "../../../i18n/I18nProvider";
import { useNavigation, useRoute, type NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "../../../navigation/types";


function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number): number {
  return bicarbPpm * (50 / 61);
}

function formatFixed(locale: string, value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}



export function useWaterSpargeScreen() {
  const route = useRoute();
  const recipeId = (route.params as { recipeId?: string } | undefined)?.recipeId ?? "";
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = useAuth();
  const { locale } = useLocaleController();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const loadRecipeMeta = useCallback(async (id: string) => {
    if (!baseUrl || !token) return null;
    const api = nativePlatformApiClient(token, baseUrl);
    try {
      const data = await getRecipe(api, id);
      return parseRecipeMetaFromGetRecipeResponse(data);
    } catch {
      return null;
    }
  }, [baseUrl, token]);

  const { t } = useT("recipes.water.sparge");
  const { t: tEdit } = useT("recipes.edit");
  const { t: tCommon } = useT("common");
  const { t: tUnits } = useT("units");
  const { t: tWaterCommon } = useT("recipes.water.common");

  const canCall = auth.state.status === "logged_in" && Boolean(baseUrl) && Boolean(token);

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [_settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["spargeConfig", "acidification", "salts"]);

  const [spargeStepTimeMin, setSpargeStepTimeMin] = useState(60);
  const [spargeStepRampMin, setSpargeStepRampMin] = useState(0);
  const [spargeMethodType, setSpargeMethodType] = useState<"fly_sparge" | "batch_sparge">("fly_sparge");
  const [spargeStepTemp, setSpargeStepTemp] = useState(75);
  const [savingSpargeConfig, setSavingSpargeConfig] = useState(false);
  const [spargeConfigSaveStatus, setSpargeConfigSaveStatus] = useState<string | null>(null);

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

  const [saltAdditions, setSaltAdditions] = useState<SaltAdditionRow[]>([]);
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
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [calcSaveStatus, setCalcSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const allProfiles = useMemo(() => {
    if (!profiles) return [];
    const sys = profiles.system ?? [];
    const pub = profiles.public ?? [];
    const ws = profiles.workspace ?? [];
    return [...sys, ...pub, ...ws];
  }, [profiles]);
  const waterProfiles = useMemo(() => allProfiles.filter((p) => p.type === "water"), [allProfiles]);
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

  const loadData = useCallback(async () => {
    if (!canCall || !recipeId) return;
    setLoading(true);
    setError(null);
    try {
      const api = nativePlatformApiClient(token!, baseUrl);
      const [profilesData, settingsData] = await Promise.all([
        listWaterProfiles(api),
        getRecipeWaterSettings(api, recipeId),
      ]);
      setProfiles(profilesData);
      const s = settingsData.settings;
      if (s) {
          setSettings(s);
          setSpargeWaterProfileId((s['spargeWaterProfileId'] as string) ?? "");
          const savedAlk = s['spargeStartingAlkalinityPpmCaCO3'];
          setStartingAlk(typeof savedAlk === "number" && Number.isFinite(savedAlk) ? savedAlk : 0);
          setStartingAlkTouched(
            typeof savedAlk === "number" && Number.isFinite(savedAlk) && savedAlk !== 0,
          );
          setStartingPh(String(s['spargeStartingPh'] ?? 7.0));
          setTargetPh((s['spargeTargetPh'] as number) ?? 5.6);
          setVolumeLiters((s['spargeVolumeLiters'] as number) ?? 20);
          setAcidType((s['spargeAcidType'] as string) ?? "phosphoric");
          setStrengthKind(((s['spargeStrengthKind'] as string) ?? "percent") as "percent" | "normality" | "molarity" | "solid");
          setStrengthValue((s['spargeStrengthValue'] as number) ?? 10);
          setAcidificationMode(s['spargeAcidificationMode'] === "manual" ? "manual" : "targetPh");
          setSpargeStepTimeMin((s['spargeStepTimeMin'] as number) ?? 60);
          setSpargeStepRampMin((s['spargeStepRampMin'] as number) ?? 0);
          setSpargeMethodType(
            (s['spargeMethodType'] as string) === "batch_sparge" ? "batch_sparge" : "fly_sparge",
          );
          setSpargeStepTemp((s['spargeStepTemperatureC'] as number) ?? 75);
          const savedManual =
            (s['spargeStrengthKind'] as string) === "solid"
              ? (s['spargeManualAcidAddedGrams'] as number) ?? 0
              : (s['spargeManualAcidAddedMl'] as number) ?? 0;
          setManualAcidAdded(savedManual);
          if (Array.isArray(s['spargeSaltAdditionsJson'])) setSaltAdditions(s['spargeSaltAdditionsJson'] as SaltAdditionRow[]);
          if (s['spargeLastCalculatedAt']) {
            setSpargeResult({
              acidRequiredMl: s['spargeLastAcidRequiredMl'] as number | null,
              acidRequiredTsp: s['spargeLastAcidRequiredTsp'] as number | null,
              acidRequiredGrams: s['spargeLastAcidRequiredGrams'] as number | null,
              acidRequiredKg: s['spargeLastAcidRequiredKg'] as number | null,
              finalAlkalinityPpmCaCO3: (s['spargeLastFinalAlkalinityPpmCaCO3'] as number) ?? 0,
              sulfateAddedPpm: (s['spargeLastSulfateAddedPpm'] as number) ?? 0,
              chlorideAddedPpm: (s['spargeLastChlorideAddedPpm'] as number) ?? 0,
            });
          }
          if (s['spargeManualLastCalculatedAt']) {
            setSpargeManualResult({
              achievedPh: (s['spargeManualLastAchievedPh'] as number) ?? 0,
              predicted: {
                finalAlkalinityPpmCaCO3: (s['spargeManualLastFinalAlkalinityPpmCaCO3'] as number) ?? 0,
                sulfateAddedPpm: (s['spargeManualLastSulfateAddedPpm'] as number) ?? 0,
                chlorideAddedPpm: (s['spargeManualLastChlorideAddedPpm'] as number) ?? 0,
              },
            });
          }
        }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [canCall, recipeId, baseUrl, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveSettings = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!canCall) return;
      const api = nativePlatformApiClient(token!, baseUrl);
      const d = await updateRecipeWaterSettings(api, recipeId, patch);
      if (d.settings) setSettings(d.settings);
    },
    [canCall, recipeId, baseUrl, token],
  );

  const onSaveDraft = async () => {
    if (!canCall) return;
    setError(null);
    setSaveStatus(null);
    setCalcSaveStatus(null);
    setSaving(true);
    try {
      await saveSettings({
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
      });
      setSaveStatus("Saved sparge draft.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const onCalculateAndSave = async () => {
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
        spargeWaterProfileId: spargeWaterProfileId,
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
  };

  const onSaveSpargeConfig = async () => {
    if (!canCall) return;
    setError(null);
    setSpargeConfigSaveStatus(null);
    setSavingSpargeConfig(true);
    try {
      await saveSettings({
        spargeStepTimeMin: Math.max(0, Math.min(600, spargeStepTimeMin)),
        spargeStepRampMin: Math.max(0, Math.min(120, spargeStepRampMin)),
        spargeMethodType,
        spargeStepTemperatureC: Math.round(Math.max(0, Math.min(100, spargeStepTemp)) * 10) / 10,
      });
      setSpargeConfigSaveStatus("Saved sparge configuration.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSavingSpargeConfig(false);
    }
  };

  const onSaveSalts = async () => {
    if (!canCall) return;
    setError(null);
    setSaving(true);
    try {
      await saveSettings({ spargeSaltAdditionsJson: saltAdditions });
      setSaveStatus("Saved salts draft.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const acidTypeOptions = [
    { value: "phosphoric", label: "Phosphoric" },
    { value: "lactic", label: "Lactic" },
    { value: "hydrochloric", label: "Hydrochloric" },
    { value: "sulfuric", label: "Sulfuric" },
    { value: "acetic", label: "Acetic" },
    { value: "citric", label: "Citric (solid)" },
    { value: "tartaric", label: "Tartaric (solid)" },
    { value: "malic", label: "Malic (solid)" },
  ];

  const strengthKindOptions = [
    { value: "percent", label: "Percent (%)" },
    { value: "normality", label: "Normality (N)" },
    { value: "molarity", label: "Molarity (M)" },
    { value: "solid", label: "Solid (pure)" },
  ];


  return {
    route,
    recipeId,
    navigation,
    auth,
    locale,
    baseUrl,
    token,
    loadRecipeMeta,
    t,
    tEdit,
    tCommon,
    tUnits,
    tWaterCommon,
    canCall,
    profiles,
    setProfiles,
    _settings,
    setSettings,
    loading,
    setLoading,
    error,
    setError,
    openSections,
    setOpenSections,
    spargeStepTimeMin,
    setSpargeStepTimeMin,
    spargeStepRampMin,
    setSpargeStepRampMin,
    spargeMethodType,
    setSpargeMethodType,
    spargeStepTemp,
    setSpargeStepTemp,
    savingSpargeConfig,
    setSavingSpargeConfig,
    spargeConfigSaveStatus,
    setSpargeConfigSaveStatus,
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
    saltAdditions,
    setSaltAdditions,
    spargeResult,
    setSpargeResult,
    spargeManualResult,
    setSpargeManualResult,
    saveStatus,
    setSaveStatus,
    calcSaveStatus,
    setCalcSaveStatus,
    saving,
    setSaving,
    submitting,
    setSubmitting,
    allProfiles,
    waterProfiles,
    selectedProfile,
    derivedStartingAlkPpmCaCO3,
    loadData,
    saveSettings,
    onSaveDraft,
    onCalculateAndSave,
    onSaveSpargeConfig,
    onSaveSalts,
    acidTypeOptions,
    strengthKindOptions,
  };
}

export type WaterSpargeScreenModel = ReturnType<typeof useWaterSpargeScreen>;
