/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  computeAndSaveBoil,
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


type IonProfilePpm = {
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number): number {
  return bicarbPpm * (50 / 61);
}

function mixIonProfilesByVolume(
  a: IonProfilePpm,
  aVolumeLiters: number,
  b: IonProfilePpm,
  bVolumeLiters: number,
): IonProfilePpm | null {
  const av = Math.max(0, aVolumeLiters);
  const bv = Math.max(0, bVolumeLiters);
  const total = av + bv;
  if (!(total > 0)) return null;
  const mix = (x: number, y: number) => (x * av + y * bv) / total;
  return {
    calcium: mix(a.calcium, b.calcium),
    magnesium: mix(a.magnesium, b.magnesium),
    sodium: mix(a.sodium, b.sodium),
    sulfate: mix(a.sulfate, b.sulfate),
    chloride: mix(a.chloride, b.chloride),
    bicarbonate: mix(a.bicarbonate, b.bicarbonate),
  };
}



export function useWaterBoilScreen() {
  const route = useRoute();
  const recipeId = (route.params as { recipeId?: string } | undefined)?.recipeId ?? "";
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const auth = useAuth();
  const { locale: _locale } = useLocaleController();
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

  const { t } = useT("recipes.water.boil");
  const { t: tCommon } = useT("common");
  const { t: tUnits } = useT("units");
  const { t: tWaterCommon } = useT("recipes.water.common");

  const canCall = auth.state.status === "logged_in" && Boolean(baseUrl) && Boolean(token);

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [_settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["adjustment", "acidification", "salts"]);

  const [sourceProfileId, setSourceProfileId] = useState("");
  const [targetProfileId, setTargetProfileId] = useState("");
  const [dilutionProfileId, setDilutionProfileId] = useState("");
  const [tapVolumeLiters, setTapVolumeLiters] = useState(0);
  const [dilutionVolumeLiters, setDilutionVolumeLiters] = useState(0);

  const [startingAlk, setStartingAlk] = useState(0);
  const [startingAlkTouched, setStartingAlkTouched] = useState(false);
  const [startingPh, setStartingPh] = useState("7.0");
  const [targetPh, setTargetPh] = useState(5.6);
  const [acidType, setAcidType] = useState("phosphoric");
  const [strengthKind, setStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">("percent");
  const [strengthValue, setStrengthValue] = useState(10);
  const [acidificationMode, setAcidificationMode] = useState<"targetPh" | "manual">("targetPh");
  const [manualAcidAdded, setManualAcidAdded] = useState(0);

  const [saltAdditions, setSaltAdditions] = useState<SaltAdditionRow[]>([]);
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
  const dilutionProfiles = useMemo(() => allProfiles.filter((p) => p.type === "dilution"), [allProfiles]);
  const selectedSource = useMemo(
    () => waterProfiles.find((p) => p.id === sourceProfileId) ?? null,
    [sourceProfileId, waterProfiles],
  );
  const selectedDilution = useMemo(
    () => dilutionProfiles.find((p) => p.id === dilutionProfileId) ?? null,
    [dilutionProfileId, dilutionProfiles],
  );

  const mixedSourceProfile = useMemo(() => {
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    const total = tap + dil;
    if (!(total > 0)) return null;
    if (!(tap > 0) || !selectedSource) return null;
    if (dil > 0 && !selectedDilution) return null;
    if (!(dil > 0)) {
      return {
        name: `Source (${selectedSource.name})`,
        totalVolumeLiters: tap,
        calcium: selectedSource.calcium,
        magnesium: selectedSource.magnesium,
        sodium: selectedSource.sodium,
        sulfate: selectedSource.sulfate,
        chloride: selectedSource.chloride,
        bicarbonate: selectedSource.bicarbonate,
      };
    }
    if (!selectedSource || !selectedDilution) return null;
    const mixed = mixIonProfilesByVolume(
      {
        calcium: selectedSource.calcium,
        magnesium: selectedSource.magnesium,
        sodium: selectedSource.sodium,
        sulfate: selectedSource.sulfate,
        chloride: selectedSource.chloride,
        bicarbonate: selectedSource.bicarbonate,
      },
      tap,
      {
        calcium: selectedDilution.calcium,
        magnesium: selectedDilution.magnesium,
        sodium: selectedDilution.sodium,
        sulfate: selectedDilution.sulfate,
        chloride: selectedDilution.chloride,
        bicarbonate: selectedDilution.bicarbonate,
      },
      dil,
    );
    if (!mixed) return null;
    return {
      name: `Mixed`,
      totalVolumeLiters: total,
      ...mixed,
    };
  }, [selectedSource, selectedDilution, tapVolumeLiters, dilutionVolumeLiters]);

  const derivedStartingAlkPpmCaCO3 = useMemo(() => {
    if (!mixedSourceProfile) return null;
    const alk = bicarbonatePpmToAlkalinityPpmCaCO3(mixedSourceProfile.bicarbonate);
    return Number.isFinite(alk) ? alk : null;
  }, [mixedSourceProfile]);

  useEffect(() => {
    if (startingAlkTouched) return;
    if (derivedStartingAlkPpmCaCO3 === null) return;
    const rounded = Math.round(derivedStartingAlkPpmCaCO3 * 100) / 100;
    setStartingAlk(rounded);
  }, [derivedStartingAlkPpmCaCO3, startingAlkTouched]);

  const derivedBoilWaterVolumeLiters = useMemo(() => {
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    return tap + dil;
  }, [tapVolumeLiters, dilutionVolumeLiters]);

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
          setSourceProfileId((s['boilSourceWaterProfileId'] as string) ?? "");
          setTargetProfileId((s['boilTargetWaterProfileId'] as string) ?? "");
          setDilutionProfileId((s['boilDilutionWaterProfileId'] as string) ?? "");
          setTapVolumeLiters((s['boilTapWaterVolumeLiters'] as number) ?? 0);
          setDilutionVolumeLiters((s['boilDilutionWaterVolumeLiters'] as number) ?? 0);
          const savedAlk = s['boilStartingAlkalinityPpmCaCO3'];
          setStartingAlk(typeof savedAlk === "number" && Number.isFinite(savedAlk) ? savedAlk : 0);
          setStartingAlkTouched(
            typeof savedAlk === "number" && Number.isFinite(savedAlk) && savedAlk !== 0,
          );
          setStartingPh(String(s['boilStartingPh'] ?? 7.0));
          setTargetPh((s['boilTargetPh'] as number) ?? 5.6);
          setAcidType((s['boilAcidType'] as string) ?? "phosphoric");
          setStrengthKind(((s['boilStrengthKind'] as string) ?? "percent") as "percent" | "normality" | "molarity" | "solid");
          setStrengthValue((s['boilStrengthValue'] as number) ?? 10);
          setAcidificationMode(s['boilAcidificationMode'] === "manual" ? "manual" : "targetPh");
          const savedManual =
            (s['boilStrengthKind'] as string) === "solid"
              ? (s['boilManualAcidAddedGrams'] as number) ?? 0
              : (s['boilManualAcidAddedMl'] as number) ?? 0;
          setManualAcidAdded(savedManual);
          if (Array.isArray(s['boilSaltAdditionsJson'])) setSaltAdditions(s['boilSaltAdditionsJson'] as SaltAdditionRow[]);
          if (s['boilLastCalculatedAt']) {
            setAcidResult({
              acidRequiredMl: s['boilLastAcidRequiredMl'] as number | null,
              acidRequiredTsp: s['boilLastAcidRequiredTsp'] as number | null,
              acidRequiredGrams: s['boilLastAcidRequiredGrams'] as number | null,
              acidRequiredKg: s['boilLastAcidRequiredKg'] as number | null,
              finalAlkalinityPpmCaCO3: (s['boilLastFinalAlkalinityPpmCaCO3'] as number) ?? 0,
              sulfateAddedPpm: (s['boilLastSulfateAddedPpm'] as number) ?? 0,
              chlorideAddedPpm: (s['boilLastChlorideAddedPpm'] as number) ?? 0,
            });
          }
          if (s['boilManualLastCalculatedAt']) {
            setManualResult({
              achievedPh: (s['boilManualLastAchievedPh'] as number) ?? 0,
              predicted: {
                finalAlkalinityPpmCaCO3: (s['boilManualLastFinalAlkalinityPpmCaCO3'] as number) ?? 0,
                sulfateAddedPpm: (s['boilManualLastSulfateAddedPpm'] as number) ?? 0,
                chlorideAddedPpm: (s['boilManualLastChlorideAddedPpm'] as number) ?? 0,
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

  const onSaveAdjustment = async () => {
    if (!canCall) return;
    setError(null);
    setSaving(true);
    try {
      await saveSettings({
        boilSourceWaterProfileId: sourceProfileId || null,
        boilTargetWaterProfileId: targetProfileId || null,
        boilDilutionWaterProfileId: dilutionProfileId || null,
        boilTapWaterVolumeLiters: tapVolumeLiters,
        boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
      });
      setSaveStatus("Saved profile and volumes.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const onSaveDraft = async () => {
    if (!canCall) return;
    setError(null);
    setSaveStatus(null);
    setCalcSaveStatus(null);
    setSaving(true);
    try {
      await saveSettings({
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
      });
      setSaveStatus("Saved boil draft.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const onCalculateAndSave = async () => {
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
  };

  const onSaveSalts = async () => {
    if (!canCall) return;
    setError(null);
    setSaving(true);
    try {
      await saveSettings({ boilSaltAdditionsJson: saltAdditions });
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
    _locale,
    baseUrl,
    token,
    loadRecipeMeta,
    t,
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
    sourceProfileId,
    setSourceProfileId,
    targetProfileId,
    setTargetProfileId,
    dilutionProfileId,
    setDilutionProfileId,
    tapVolumeLiters,
    setTapVolumeLiters,
    dilutionVolumeLiters,
    setDilutionVolumeLiters,
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
    saltAdditions,
    setSaltAdditions,
    acidResult,
    setAcidResult,
    manualResult,
    setManualResult,
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
    dilutionProfiles,
    selectedSource,
    selectedDilution,
    mixedSourceProfile,
    derivedStartingAlkPpmCaCO3,
    derivedBoilWaterVolumeLiters,
    loadData,
    saveSettings,
    onSaveAdjustment,
    onSaveDraft,
    onCalculateAndSave,
    onSaveSalts,
    acidTypeOptions,
    strengthKindOptions,
  };
}

export type WaterBoilScreenModel = ReturnType<typeof useWaterBoilScreen>;
