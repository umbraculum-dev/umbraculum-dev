import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { bearerTokenAuth, createApiClient } from "@brewery/api-client";
import {
  editorStateFromBeerJson,
  mergeMashDeduceFromExt,
  MASH_TEMPLATES,
  newMashRowId,
  replaceMashInBeerJsonDocument,
  validateMashBeforeSave,
  type EditorMashStep,
} from "@brewery/beerjson";
import { parseGravityAnalysisResponseV1, parseMashComputeAndSaveResponse, parseWaterProfilesResponse } from "@brewery/contracts";
import type { WaterAcidificationManualResult, WaterAcidificationResult, WaterProfile, WaterProfilesResponse } from "@brewery/contracts";
import { useT } from "@brewery/i18n-react";
import { Button, Card, Heading, Screen, Spinner, Text } from "@brewery/ui";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@brewery/recipes-ui";
import { Accordion } from "tamagui";

import { ModeFieldset } from "@brewery/ui";
import { SaltAdditionsEditor, type SaltAdditionRow } from "@brewery/recipes-ui";
import { MashStepsEditor, type WaterVolumes } from "@brewery/recipes-ui";
import { Input } from "../components/AppInput";
import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";
import { useLocaleController } from "../i18n/I18nProvider";
import { useNavigation, useRoute } from "@react-navigation/native";

function formatFixed(locale: string, value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

type IonProfilePpm = {
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

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

function PickerField(props: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (next: string) => void;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = props.options.find((o) => o.value === props.value)?.label ?? "—";

  return (
    <View>
      <Text fontSize={11} opacity={0.8} mb="$1">
        {props.label}
      </Text>
      <Button
        onPress={() => setOpen(true)}
        size="$3"
        background="$background"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Text fontSize={12}>{selectedLabel}</Text>
      </Button>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={() => null}>
            <Card gap="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
              <Heading fontSize={16}>{props.label}</Heading>
              <ScrollView style={{ maxHeight: 300 }}>
                <View style={{ gap: 8 }}>
                  {props.options.map((opt) => (
                    <Button
                      key={opt.value}
                      onPress={() => {
                        props.onChange(opt.value);
                        setOpen(false);
                      }}
                      size="$3"
                      background={opt.value === props.value ? "$color4" : "$background"}
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <Text fontSize={12}>{opt.label}</Text>
                    </Button>
                  ))}
                </View>
              </ScrollView>
              <Button onPress={() => setOpen(false)} size="$3" chromeless>
                <Text>{props.closeLabel}</Text>
              </Button>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export function WaterMashScreen() {
  const route = useRoute();
  const recipeId = (route.params as { recipeId?: string } | undefined)?.recipeId ?? "";
  const navigation = useNavigation<any>();
  const auth = useAuth();
  const { locale } = useLocaleController();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const loadRecipeMeta = useCallback(async (id: string) => {
    if (!baseUrl || !token) return null;
    const api = createApiClient(baseUrl, bearerTokenAuth(() => token));
    const res = await api.get(`/api/recipes/${id}`);
    if (!res.ok) return null;
    return parseRecipeMetaFromGetRecipeResponse(res.data);
  }, [baseUrl, token]);

  const { t } = useT("recipes.water.mash");
  const { t: tEdit } = useT("recipes.edit");
  const { t: tCommon } = useT("common");
  const { t: tUnits } = useT("units");
  const { t: tWaterCommon } = useT("recipes.water.common");

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [recipe, setRecipe] = useState<{ beerJsonRecipeJson?: unknown; recipeExtJson?: unknown; analysis?: unknown } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["adjustment", "acidification"]);

  const [sourceProfileId, setSourceProfileId] = useState("");
  const [targetProfileId, setTargetProfileId] = useState("");
  const [dilutionProfileId, setDilutionProfileId] = useState("");
  const [tapVolumeLiters, setTapVolumeLiters] = useState("");
  const [dilutionVolumeLiters, setDilutionVolumeLiters] = useState("");

  const [mashStartingAlk, setMashStartingAlk] = useState(0);
  const [mashStartingPh, setMashStartingPh] = useState(7);
  const [mashTargetPh, setMashTargetPh] = useState(5.4);
  const [mashAcidType, setMashAcidType] = useState("lactic");
  const [mashAcidificationMode, setMashAcidificationMode] = useState<"targetPh" | "manual">("targetPh");
  const [mashStrengthKind, setMashStrengthKind] = useState<"percent" | "normality" | "molarity" | "solid">("percent");
  const [mashStrengthValue, setMashStrengthValue] = useState(88);
  const [mashManualAcidAdded, setMashManualAcidAdded] = useState(0);

  const [saltAdditions, setSaltAdditions] = useState<SaltAdditionRow[]>([]);
  const [overallResult, setOverallResult] = useState<Record<string, unknown> | null>(null);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [savingOverall, setSavingOverall] = useState(false);

  const [mashAcidResult, setMashAcidResult] = useState<WaterAcidificationResult | null>(null);
  const [mashManualResult, setMashManualResult] = useState<WaterAcidificationManualResult | null>(null);
  const [mashSaveStatus, setMashSaveStatus] = useState<string | null>(null);
  const [mashCalcSaveStatus, setMashCalcSaveStatus] = useState<string | null>(null);
  const [savingMash, setSavingMash] = useState(false);
  const [mashSubmitting, setMashSubmitting] = useState(false);

  const [mashProcedure, setMashProcedure] = useState<{ name: string; grainTemperatureC: number } | null>(null);
  const [mashRows, setMashRows] = useState<EditorMashStep[]>([]);
  const [mashStepsDirty, setMashStepsDirty] = useState(false);
  const [mashStepsSaving, setMashStepsSaving] = useState(false);

  const [gristImportedRows, setGristImportedRows] = useState<Record<string, unknown>[]>([]);
  const [gristImportError, setGristImportError] = useState<string | null>(null);
  const [gristImportStatus, setGristImportStatus] = useState<string | null>(null);
  const [importingGrist, setImportingGrist] = useState(false);

  const canCall = Boolean(recipeId && baseUrl && token);

  const tapNum = Math.max(0, Number(tapVolumeLiters) || 0);
  const dilNum = Math.max(0, Number(dilutionVolumeLiters) || 0);
  const derivedMashWaterVolumeLiters = tapNum + dilNum;

  const computeFirstStepAmountL = useMemo(() => {
    const otherInfusionSum = mashRows
      .slice(1)
      .filter((r) => r.deduceFromMashIn === true)
      .reduce((sum, r) => sum + (r.amountL ?? 0), 0);
    return Math.max(0, derivedMashWaterVolumeLiters - otherInfusionSum);
  }, [mashRows, derivedMashWaterVolumeLiters]);

  const allProfiles = useMemo(() => {
    if (!profiles) return [];
    const sys = profiles.system ?? [];
    const pub = profiles.public ?? [];
    const ws = profiles.workspace ?? [];
    return [...sys, ...pub, ...ws];
  }, [profiles]);
  const waterProfiles = useMemo(() => allProfiles.filter((p: WaterProfile) => p.type === "water"), [allProfiles]);
  const dilutionProfiles = useMemo(() => allProfiles.filter((p: WaterProfile) => p.type === "dilution"), [allProfiles]);

  const profileOptions = (list: WaterProfile[]) =>
    list.map((p) => ({ value: p.id, label: p.name }));

  const selectedSource = useMemo(
    () => waterProfiles.find((p) => p.id === sourceProfileId) ?? null,
    [sourceProfileId, waterProfiles],
  );
  const selectedTarget = useMemo(
    () => waterProfiles.find((p) => p.id === targetProfileId) ?? null,
    [targetProfileId, waterProfiles],
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
      name: "Mixed",
      totalVolumeLiters: total,
      ...mixed,
    };
  }, [selectedSource, selectedDilution, tapVolumeLiters, dilutionVolumeLiters]);

  const waterVolumes = useMemo((): WaterVolumes | null => {
    const analysis = recipe?.analysis;
    if (!analysis) return null;
    try {
      const parsed = parseGravityAnalysisResponseV1(analysis);
      const preBoil = parsed?.derivations?.["analysis.pre_boil_volume"];
      if (!preBoil?.inputs) return null;
      const mashIn = preBoil.inputs.find((i) => i.id === "mashWaterVolumeLiters")?.value;
      const spargeIn = preBoil.inputs.find((i) => i.id === "spargeVolumeLiters")?.value;
      const mashL = mashIn?.kind === "number" ? mashIn.value : null;
      const spargeL = spargeIn?.kind === "number" ? spargeIn.value : null;
      return mashL != null && spargeL != null ? { mashLiters: mashL, spargeLiters: spargeL } : null;
    } catch {
      return null;
    }
  }, [recipe]);

  const loadData = useCallback(async () => {
    if (!canCall) return;
    setLoading(true);
    setError(null);
    try {
      const api = createApiClient(baseUrl, bearerTokenAuth(() => token!));
      const [profRes, settingsRes, recipeRes] = await Promise.all([
        api.get("/api/water-profiles"),
        api.get(`/api/recipes/${recipeId}/water-settings`),
        api.get(`/api/recipes/${recipeId}`),
      ]);
      if (profRes.ok) setProfiles(parseWaterProfilesResponse(profRes.data));
      if (settingsRes.ok) {
        const d = settingsRes.data as { settings?: Record<string, unknown> };
        if (d?.settings) {
          setSettings(d.settings);
          const s = d.settings;
          setSourceProfileId((s.sourceWaterProfileId as string) ?? "");
          setTargetProfileId((s.targetWaterProfileId as string) ?? s.sourceWaterProfileId ?? "");
          setDilutionProfileId((s.dilutionWaterProfileId as string) ?? "");
          setTapVolumeLiters(String(s.tapWaterVolumeLiters ?? 0));
          setDilutionVolumeLiters(String(s.dilutionWaterVolumeLiters ?? 0));
          setMashStartingAlk(Number(s.mashStartingAlkalinityPpmCaCO3) ?? 0);
          setMashStartingPh(Number(s.mashStartingPh) ?? 7);
          setMashTargetPh(Number(s.mashTargetPh) ?? 5.4);
          setMashAcidType((s.mashAcidType as string) ?? "lactic");
          setMashAcidificationMode((s.mashAcidificationMode as string) === "manual" ? "manual" : "targetPh");
          setMashStrengthKind(((s.mashStrengthKind as string) ?? "percent") as "percent" | "normality" | "molarity" | "solid");
          setMashStrengthValue(Number(s.mashStrengthValue) ?? 88);
          setMashManualAcidAdded(Number(s.mashManualAcidAddedMl ?? s.mashManualAcidAddedGrams ?? 0));
          if (Array.isArray(s.mashSaltAdditionsJson)) setSaltAdditions(s.mashSaltAdditionsJson as SaltAdditionRow[]);
          if (Array.isArray(s.mashGristImportedJson)) setGristImportedRows(s.mashGristImportedJson as Record<string, unknown>[]);
          if (s.mashOverallLastResultJson && typeof s.mashOverallLastResultJson === "object") {
            setOverallResult(s.mashOverallLastResultJson as Record<string, unknown>);
          }
        }
      }
      if (recipeRes.ok) {
        const d = recipeRes.data as { recipe?: { beerJsonRecipeJson?: unknown; recipeExtJson?: unknown } };
        if (d?.recipe) {
          setRecipe(d.recipe);
          if (d.recipe.beerJsonRecipeJson && !mashStepsDirty) {
            const s = editorStateFromBeerJson(d.recipe.beerJsonRecipeJson);
            const mashMerged = mergeMashDeduceFromExt(s.mash, d.recipe.recipeExtJson);
            if (mashMerged?.steps?.length) {
              setMashProcedure({ name: mashMerged.name, grainTemperatureC: mashMerged.grainTemperatureC });
              setMashRows(mashMerged.steps);
            } else if (derivedMashWaterVolumeLiters > 0) {
              setMashProcedure({ name: "Mash", grainTemperatureC: 20 });
              setMashRows([
                {
                  id: newMashRowId(),
                  name: "Mash In",
                  type: "infusion",
                  stepTemperatureC: 67,
                  stepTimeMin: 60,
                  amountL: derivedMashWaterVolumeLiters,
                },
              ]);
            }
          }
        }
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [canCall, recipeId, baseUrl, token, mashStepsDirty, derivedMashWaterVolumeLiters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveSettings = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!canCall) return;
      const api = createApiClient(baseUrl, bearerTokenAuth(() => token!));
      const res = await api.put(`/api/recipes/${recipeId}/water-settings`, patch);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const d = res.data as { settings?: Record<string, unknown> };
      if (d?.settings) setSettings(d.settings);
    },
    [canCall, recipeId, baseUrl, token]
  );

  const onSaveAdjustment = async () => {
    setError(null);
    try {
      await saveSettings({
        sourceWaterProfileId: sourceProfileId || null,
        targetWaterProfileId: targetProfileId || null,
        dilutionWaterProfileId: dilutionProfileId || null,
        tapWaterVolumeLiters: tapNum,
        dilutionWaterVolumeLiters: dilNum,
      });
    } catch (err) {
      setError(String(err));
    }
  };

  const onImportGristFromRecipe = async () => {
    if (!canCall || !recipeId) return;
    setGristImportError(null);
    setGristImportStatus(null);
    setImportingGrist(true);
    try {
      const api = createApiClient(baseUrl!, bearerTokenAuth(() => token!));
      const res = await api.get(`/api/recipes/${recipeId}`);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const data = res.data as { recipe?: { beerJsonRecipeJson?: unknown; recipeExtJson?: unknown; updatedAt?: string } };
      const r = data?.recipe;
      if (!r?.beerJsonRecipeJson) throw new Error("Recipe is missing BeerJSON");
      const s = editorStateFromBeerJson(r.beerJsonRecipeJson);
      const mashOnlyRows = (s.gristRows as Record<string, unknown>[]).filter(
        (row) =>
          (row.timingUse as string ?? "add_to_mash") === "add_to_mash" &&
          (row as any).lateAddition !== true,
      );
      const nowIso = new Date().toISOString();
      await saveSettings({
        mashGristImportedJson: mashOnlyRows,
        mashGristImportedAt: nowIso,
        mashGristSourceRecipeUpdatedAt: r.updatedAt ?? nowIso,
      });
      setGristImportedRows(mashOnlyRows);
      setGristImportStatus("Imported grist snapshot.");
    } catch (err) {
      setGristImportError(String(err));
    } finally {
      setImportingGrist(false);
    }
  };

  const lateAdditionsTotalKg = useMemo(() => {
    try {
      const doc = recipe?.beerJsonRecipeJson;
      if (!doc) return 0;
      const s = editorStateFromBeerJson(doc);
      return (s.gristRows as any[]).reduce((sum, r) => {
        if ((r?.timingUse ?? "add_to_mash") !== "add_to_mash") return sum;
        if (r?.lateAddition !== true) return sum;
        const amountKg = typeof r?.amountKg === "number" && Number.isFinite(r.amountKg) ? r.amountKg : 0;
        return sum + amountKg;
      }, 0);
    } catch {
      return 0;
    }
  }, [recipe]);

  const onSaveMashDraft = async () => {
    if (!canCall) return;
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
    if (!canCall || !sourceProfileId) {
      setError("Select a Source water profile.");
      return;
    }
    setError(null);
    setMashSaveStatus(null);
    setMashCalcSaveStatus(null);
    setMashSubmitting(true);
    try {
      const api = createApiClient(baseUrl, bearerTokenAuth(() => token!));
      const payload: Record<string, unknown> = {
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
      const res = await api.post(`/api/recipes/${recipeId}/water-settings/mash/compute-and-save`, payload);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const computed = parseMashComputeAndSaveResponse(res.data);

      if (computed.acid.kind === "mash_acidification_manual") {
        setMashManualResult(computed.acid.result);
        setMashAcidResult(computed.acid.result.predicted ?? null);
        setMashCalcSaveStatus(t("mashSnapshotEstimatedAndSaved"));
      } else {
        setMashManualResult(null);
        setMashAcidResult(computed.acid.result);
        setMashCalcSaveStatus(t("mashSnapshotCalculatedAndSaved"));
      }

      setOverallResult(computed.overall.result as Record<string, unknown>);
      setOverallStatus(t("overallSnapshotSaved"));
    } catch (err) {
      setError(String(err));
    } finally {
      setMashSubmitting(false);
    }
  };

  const onComputeAndSave = async () => {
    if (!canCall || !sourceProfileId) {
      setError("Select a Source water profile.");
      return;
    }
    setError(null);
    setSavingOverall(true);
    try {
      const api = createApiClient(baseUrl, bearerTokenAuth(() => token!));
      const payload: Record<string, unknown> = {
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
      const res = await api.post(`/api/recipes/${recipeId}/water-settings/mash/compute-and-save`, payload);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const computed = parseMashComputeAndSaveResponse(res.data);
      if (computed.acid.kind === "mash_acidification_manual") {
        setMashManualResult(computed.acid.result);
        setMashAcidResult(computed.acid.result.predicted ?? null);
      } else {
        setMashManualResult(null);
        setMashAcidResult(computed.acid.result);
      }
      setOverallResult(computed.overall.result as Record<string, unknown>);
      setOverallStatus("Calculated & saved.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSavingOverall(false);
    }
  };

  const addMashStep = () => {
    if (derivedMashWaterVolumeLiters > 0) {
      const otherInfusionSum = mashRows
        .slice(1)
        .filter((r) => r.deduceFromMashIn === true)
        .reduce((sum, r) => sum + (r.amountL ?? 0), 0);
      if (otherInfusionSum > derivedMashWaterVolumeLiters) {
        setError(t("mashStepsBudgetExceeded"));
        return;
      }
    }

    setMashStepsDirty(true);
    setMashProcedure((prev) => prev ?? { name: "Mash", grainTemperatureC: 20 });
    setMashRows((prev) => [
      ...prev,
      {
        id: newMashRowId(),
        name: "",
        type: "infusion",
        stepTemperatureC: 67,
        stepTimeMin: 60,
        amountL: 0,
        deduceFromMashIn: false,
      },
    ]);
  };

  const updateMashStep = (id: string, patch: Partial<EditorMashStep>) => {
    setMashStepsDirty(true);
    setMashRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx < 0) return prev;

      const row = prev[idx];
      let nextPatch = { ...patch };

      if (idx > 0 && "deduceFromMashIn" in nextPatch) {
        const checked = nextPatch.deduceFromMashIn === true;
        nextPatch = {
          ...nextPatch,
          deduceFromMashIn: checked,
          ...(checked ? {} : { amountL: 0 }),
        };
      }

      if (idx > 0 && "amountL" in nextPatch) {
        const requested = typeof nextPatch.amountL === "number" && Number.isFinite(nextPatch.amountL) ? nextPatch.amountL : 0;
        if (row.deduceFromMashIn !== true && nextPatch.deduceFromMashIn !== true) {
          nextPatch = { ...nextPatch, amountL: 0 };
        } else {
          const otherSum = prev
            .filter((r, i) => i !== idx && i !== 0)
            .reduce((s, r) => s + (r.deduceFromMashIn === true ? (r.amountL ?? 0) : 0), 0);
          const available = Math.max(0, derivedMashWaterVolumeLiters - otherSum);
          nextPatch = { ...nextPatch, amountL: Math.min(Math.max(0, requested), available) };
        }
      }

      return prev.map((r) => (r.id === id ? { ...r, ...nextPatch } : r));
    });
  };

  const deleteMashStep = (id: string) => {
    setMashStepsDirty(true);
    setMashRows((prev) => prev.filter((r) => r.id !== id));
  };

  const moveMashStep = (id: string, direction: "up" | "down") => {
    setMashStepsDirty(true);
    setMashRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      const row = idx >= 0 ? prev[idx] : null;
      if (!row) return prev;

      const isSpargeRow = (r: EditorMashStep) => r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
      if (idx <= 0 || isSpargeRow(row)) return prev;

      const movable = prev
        .map((r, i) => ({ r, i }))
        .filter(({ r, i }) => i > 0 && !isSpargeRow(r))
        .map(({ i }) => i);
      if (!movable.length) return prev;

      const targetIdx =
        direction === "up"
          ? [...movable].reverse().find((i) => i < idx) ?? null
          : movable.find((i) => i > idx) ?? null;
      if (targetIdx == null) return prev;

      const next = prev.slice();
      const tmp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = tmp;
      return next;
    });
  };

  const addMashFromTemplate = (templateId: string) => {
    const tpl = MASH_TEMPLATES.find((x) => x.id === templateId);
    if (!tpl) return;

    if (derivedMashWaterVolumeLiters > 0) {
      const otherInfusionSum = mashRows
        .slice(1)
        .filter((r) => r.deduceFromMashIn === true)
        .reduce((sum, r) => sum + (r.amountL ?? 0), 0);
      if (otherInfusionSum > derivedMashWaterVolumeLiters) {
        setError(t("mashStepsBudgetExceeded"));
        return;
      }
    }

    setMashStepsDirty(true);
    setMashProcedure((prev) => prev ?? { name: "Mash", grainTemperatureC: 20 });
    setMashRows((prev) => [
      ...prev,
      ...tpl.steps.map((s) => ({ ...s, id: newMashRowId(), deduceFromMashIn: false })),
    ]);
  };

  const saveMashSteps = async () => {
    if (!canCall || !recipe?.beerJsonRecipeJson) return;
    setError(null);
    setMashStepsSaving(true);
    try {
      if (derivedMashWaterVolumeLiters > 0) {
        const otherInfusionSum = mashRows
          .slice(1)
          .filter((r) => r.deduceFromMashIn === true)
          .reduce((sum, r) => sum + (r.amountL ?? 0), 0);
        if (otherInfusionSum > derivedMashWaterVolumeLiters) {
          setError(t("mashStepsBudgetExceeded"));
          return;
        }
      }

      const stepsForSave = mashRows.map((r, idx) => {
        if (r.type === "sparge" && r.name.trim().toLowerCase() === "sparge" && waterVolumes) {
          return { ...r, amountL: waterVolumes.spargeLiters };
        }
        if (idx === 0 && r.type === "infusion" && derivedMashWaterVolumeLiters > 0) {
          return { ...r, amountL: computeFirstStepAmountL };
        }
        return r;
      });

      const mash =
        mashRows.length > 0 && mashProcedure
          ? { name: mashProcedure.name, grainTemperatureC: mashProcedure.grainTemperatureC, steps: stepsForSave }
          : mashRows.length > 0
            ? { name: "Mash", grainTemperatureC: 20, steps: stepsForSave }
            : null;
      const validation = validateMashBeforeSave(mash!);
      if (!validation.ok) {
        setError(validation.errors);
        return;
      }
      const newDoc = replaceMashInBeerJsonDocument(recipe.beerJsonRecipeJson, mash);
      const extBase =
        recipe.recipeExtJson && typeof recipe.recipeExtJson === "object" ? recipe.recipeExtJson : ({ version: 1 } as Record<string, unknown>);
      const mashStepDeduceFromMashIn = Object.fromEntries(
        mashRows
          .map((r, idx) => [String(idx), r.deduceFromMashIn === true] as const)
          .filter(([k, v]) => k !== "0" && v === true)
      );
      const recipeExtJson = { ...(extBase as Record<string, unknown>), mashStepDeduceFromMashIn };
      const api = createApiClient(baseUrl, bearerTokenAuth(() => token!));
      const res = await api.patch(`/api/recipes/${recipeId}`, {
        beerJsonRecipeJson: newDoc,
        recipeExtJson,
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      setMashStepsDirty(false);
      void loadData();
    } catch (err) {
      setError(String(err));
    } finally {
      setMashStepsSaving(false);
    }
  };

  if (loading && !profiles) {
    return (
      <Screen>
        <Spinner />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Heading fontSize={22} mb="$2">
          {t("title")}
        </Heading>
        <RecipeMetaLine recipeId={recipeId} enabled={canCall} loadRecipeMeta={loadRecipeMeta} />
        <Button chromeless size="$3" mt="$2" mb="$3" onPress={() => navigation.navigate("WaterHub", { recipeId })}>
          <Text fontSize={12}>{tWaterCommon("backToHub")}</Text>
        </Button>

        {error ? (
          <Card background="$red3" p="$3" mb="$3">
            <Text color="$red11">{error}</Text>
          </Card>
        ) : null}

        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <Accordion.Item value="adjustment">
            <Card gap="$2" mt="$2">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("adjustmentHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("adjustment") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 12 }}>
                  <PickerField
                    label="Source water profile"
                    value={sourceProfileId}
                    options={[{ value: "", label: "—" }, ...profileOptions(waterProfiles)]}
                    onChange={setSourceProfileId}
                    closeLabel={tCommon("close")}
                  />
                  <PickerField
                    label="Target water profile"
                    value={targetProfileId}
                    options={[{ value: "", label: "—" }, ...profileOptions(waterProfiles)]}
                    onChange={setTargetProfileId}
                    closeLabel={tCommon("close")}
                  />
                  <PickerField
                    label="Dilution water profile"
                    value={dilutionProfileId}
                    options={[{ value: "", label: "—" }, ...profileOptions(dilutionProfiles)]}
                    onChange={setDilutionProfileId}
                    closeLabel={tCommon("close")}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {t("sourceVolumeLabel", { unit: tUnits("L") })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={tapVolumeLiters}
                      onChangeText={setTapVolumeLiters}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {t("dilutionVolumeLabel", { unit: tUnits("L") })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={dilutionVolumeLiters}
                      onChangeText={setDilutionVolumeLiters}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <Button size="$3" onPress={onSaveAdjustment}>
                    <Text>Save</Text>
                  </Button>
                  {mixedSourceProfile ? (
                    <View style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: "var(--border)", borderRadius: 8 }}>
                      <Text fontSize={12} fontWeight="bold" mb="$2">
                        Mixed water ions
                      </Text>
                      <Text fontSize={11} opacity={0.8} mb="$2">
                        Computed from profiles + volumes
                      </Text>
                      {[
                        ["Ca", mixedSourceProfile.calcium, selectedTarget?.calcium ?? null],
                        ["Mg", mixedSourceProfile.magnesium, selectedTarget?.magnesium ?? null],
                        ["Na", mixedSourceProfile.sodium, selectedTarget?.sodium ?? null],
                        ["SO4", mixedSourceProfile.sulfate, selectedTarget?.sulfate ?? null],
                        ["Cl", mixedSourceProfile.chloride, selectedTarget?.chloride ?? null],
                        ["HCO3", mixedSourceProfile.bicarbonate, selectedTarget?.bicarbonate ?? null],
                      ].map(([label, mixed, target]) => {
                        const delta = target === null ? null : (mixed as number) - (target as number);
                        return (
                          <View key={String(label)} style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
                            <Text fontSize={12} style={{ minWidth: 40 }}>{label}</Text>
                            <Text fontSize={12}>{formatFixed(locale, mixed as number, 0)} {tUnits("ppm")}</Text>
                            {target !== null ? (
                              <>
                                <Text fontSize={12} opacity={0.7}>Target: {formatFixed(locale, target as number, 0)}</Text>
                                <Text fontSize={12} opacity={0.7}>Δ: {formatFixed(locale, delta as number, 0)}</Text>
                              </>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="grist">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("gristSummaryHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("grist") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 8 }}>
                  <Text fontSize={12} opacity={0.75}>
                    {t("lateFermentablesExcludedNote", { kg: formatFixed(locale, lateAdditionsTotalKg, 2) })}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <Button
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      onPress={onImportGristFromRecipe}
                      disabled={!canCall || importingGrist}
                    >
                      <Text>{importingGrist ? "Importing…" : "Import/update grist snapshot"}</Text>
                    </Button>
                    {gristImportStatus ? <Text fontSize={12} opacity={0.85}>{gristImportStatus}</Text> : null}
                  </View>
                  {gristImportError ? <Text fontSize={12} color="$red10">{gristImportError}</Text> : null}
                  {gristImportedRows.length > 0 ? (
                    <Text fontSize={12} opacity={0.8}>
                      Rows: {gristImportedRows.length} · Total:{" "}
                      {formatFixed(
                        locale,
                        gristImportedRows.reduce(
                          (sum, r) => sum + (Number.isFinite(r.amountKg as number) ? (r.amountKg as number) : 0),
                          0,
                        ),
                        2,
                      )}{" "}
                      {tUnits("kg")}
                    </Text>
                  ) : null}
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="acidification">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("acidificationHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("acidification") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 12 }}>
                  <ModeFieldset
                    legend="Acidification mode"
                    name="mashAcidMode"
                    value={mashAcidificationMode}
                    onChange={setMashAcidificationMode}
                    options={[
                      { value: "targetPh", label: "Target pH" },
                      { value: "manual", label: "Manual" },
                    ]}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {t("startingAlkalinityLabel", { unit: "ppm as CaCO3" })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(mashStartingAlk)}
                      onChangeText={(text: string) => setMashStartingAlk(Number(text) || 0)}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      Starting pH
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(mashStartingPh)}
                      onChangeText={(text: string) => setMashStartingPh(Number(text) || 7)}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      Target pH
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(mashTargetPh)}
                      onChangeText={(text: string) => setMashTargetPh(Number(text) || 5.4)}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <PickerField
                    label="Acid type"
                    value={mashAcidType}
                    options={[
                      { value: "phosphoric", label: "Phosphoric" },
                      { value: "lactic", label: "Lactic" },
                      { value: "hydrochloric", label: "Hydrochloric" },
                      { value: "sulfuric", label: "Sulfuric" },
                      { value: "acetic", label: "Acetic" },
                      { value: "citric", label: "Citric (solid)" },
                      { value: "tartaric", label: "Tartaric (solid)" },
                      { value: "malic", label: "Malic (solid)" },
                    ]}
                    onChange={setMashAcidType}
                    closeLabel={tCommon("close")}
                  />
                  <PickerField
                    label="Strength kind"
                    value={mashStrengthKind}
                    options={[
                      { value: "percent", label: "Percent (%)" },
                      { value: "normality", label: "Normality (N)" },
                      { value: "molarity", label: "Molarity (M)" },
                      { value: "solid", label: "Solid (pure)" },
                    ]}
                    onChange={(v) => setMashStrengthKind(v as "percent" | "normality" | "molarity" | "solid")}
                    closeLabel={tCommon("close")}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      Strength value {mashStrengthKind === "percent" ? "(%)" : ""}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(mashStrengthValue)}
                      onChangeText={(text: string) => setMashStrengthValue(Number(text) || 0)}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      disabled={mashStrengthKind === "solid"}
                    />
                  </View>
                  {mashAcidificationMode === "manual" ? (
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">
                        Acid added ({mashStrengthKind === "solid" ? tUnits("g") : tUnits("mL")})
                      </Text>
                      <Input
                        keyboardType="decimal-pad"
                        value={String(mashManualAcidAdded)}
                        onChangeText={(text: string) => setMashManualAcidAdded(Number(text) || 0)}
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      />
                    </View>
                  ) : null}

                  <View style={{ gap: 8, marginTop: 8 }}>
                    <Button
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      onPress={onSaveMashDraft}
                      disabled={!canCall || savingMash}
                    >
                      <Text>{savingMash ? t("saving") : t("saveMashDraft")}</Text>
                    </Button>
                    <Button
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      onPress={onEstimateAndSaveSnapshot}
                      disabled={!canCall || mashSubmitting}
                    >
                      <Text>
                        {mashSubmitting
                          ? t("working")
                          : mashAcidificationMode === "manual"
                            ? t("estimateAndSaveSnapshot")
                            : t("calculateAndSaveSnapshot")}
                      </Text>
                    </Button>
                    {mashSaveStatus || mashCalcSaveStatus ? (
                      <Text fontSize={12} opacity={0.85}>
                        {mashSaveStatus ?? mashCalcSaveStatus}
                      </Text>
                    ) : null}
                  </View>

                  {mashAcidificationMode === "targetPh" && mashAcidResult ? (
                    <View style={{ gap: 6, marginTop: 8 }}>
                      <Heading fontSize={16}>{t("resultLastCalculated")}</Heading>
                      {mashAcidResult.acidRequiredMl != null ? (
                        <Text fontSize={12}>
                          Acid required: {formatFixed(locale, mashAcidResult.acidRequiredMl, 0)} {tUnits("mL")}
                        </Text>
                      ) : null}
                      {mashAcidResult.acidRequiredGrams != null ? (
                        <Text fontSize={12}>
                          Acid required: {formatFixed(locale, mashAcidResult.acidRequiredGrams, 0)} {tUnits("g")}
                        </Text>
                      ) : null}
                      <Text fontSize={12}>
                        Final alkalinity: {formatFixed(locale, mashAcidResult.finalAlkalinityPpmCaCO3, 0)} {tUnits("ppmAsCaCO3")}
                      </Text>
                      <Text fontSize={12}>
                        Sulfate added: {formatFixed(locale, mashAcidResult.sulfateAddedPpm, 0)} {tUnits("ppm")}
                      </Text>
                      <Text fontSize={12}>
                        Chloride added: {formatFixed(locale, mashAcidResult.chlorideAddedPpm, 0)} {tUnits("ppm")}
                      </Text>
                    </View>
                  ) : null}

                  {mashAcidificationMode === "manual" && mashManualResult ? (
                    <View style={{ gap: 6, marginTop: 10 }}>
                      <Heading fontSize={16}>{t("resultManualAcidAmountMode")}</Heading>
                      <Text fontSize={12} opacity={0.85}>
                        {t("estimatedFromManualAcidAmount")}
                      </Text>
                      <Text fontSize={12}>
                        Estimated achieved pH: {formatFixed(locale, mashManualResult.achievedPh, 2)}
                      </Text>
                      {Number.isFinite(mashManualResult.targetAmount) && Number.isFinite(mashManualResult.predictedAmount) ? (
                        <Text fontSize={12}>
                          Acid amount: {formatFixed(locale, mashManualResult.targetAmount, 0)}{" "}
                          {mashStrengthKind === "solid" ? tUnits("g") : tUnits("mL")} (solver check:{" "}
                          {formatFixed(locale, mashManualResult.predictedAmount, 0)})
                        </Text>
                      ) : null}
                      <Text fontSize={12}>
                        Final alkalinity: {formatFixed(locale, mashManualResult.predicted.finalAlkalinityPpmCaCO3, 0)} {tUnits("ppmAsCaCO3")}
                      </Text>
                      <Text fontSize={12}>
                        Sulfate added: {formatFixed(locale, mashManualResult.predicted.sulfateAddedPpm, 0)} {tUnits("ppm")}
                      </Text>
                      <Text fontSize={12}>
                        Chloride added: {formatFixed(locale, mashManualResult.predicted.chlorideAddedPpm, 0)} {tUnits("ppm")}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="salts">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("saltAdditionsManualV0")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("salts") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <SaltAdditionsEditor
                  rows={saltAdditions}
                  onChange={setSaltAdditions}
                  idPrefix="mash"
                  disabled={!canCall}
                />
                  <Button
                  size="$3"
                  mt="$2"
                  onPress={() => saveSettings({ mashSaltAdditionsJson: saltAdditions })}
                  disabled={!canCall}
                >
                  <Text>Save</Text>
                </Button>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="overall">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("overallResultHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("overall") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <Button
                  size="$3"
                  onPress={onComputeAndSave}
                  disabled={!canCall || savingOverall}
                >
                  <Text>{savingOverall ? "Calculating…" : "Compute & save"}</Text>
                </Button>
                {overallStatus ? <Text fontSize={12} mt="$2">{overallStatus}</Text> : null}
                {overallResult ? (
                  <View style={{ marginTop: 12, gap: 4 }}>
                    <Text fontSize={12}>
                      pH: {formatFixed(locale, (overallResult.ph as { value?: number })?.value ?? 0, 2)}
                    </Text>
                    <Text fontSize={12}>
                      Final alkalinity: {formatFixed(locale, (overallResult.finalAlkalinityPpmCaCO3 as number) ?? 0, 0)} ppm
                    </Text>
                  </View>
                ) : null}
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="mashSteps">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("mashStepsHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("mashSteps") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <MashStepsEditor
                  mashRows={mashRows}
                  waterVolumes={waterVolumes}
                  mashWaterBudgetLiters={derivedMashWaterVolumeLiters > 0 ? derivedMashWaterVolumeLiters : null}
                  firstStepAmountComputed={derivedMashWaterVolumeLiters > 0 ? computeFirstStepAmountL : null}
                  readOnly={false}
                  onUpdateStep={updateMashStep}
                  onMoveStep={moveMashStep}
                  onAddStep={addMashStep}
                  onDeleteStep={deleteMashStep}
                  onAddFromTemplate={addMashFromTemplate}
                  t={(k, v) => tEdit(k, v as Record<string, string | number>)}
                  tUnits={(k) => tUnits(k)}
                  locale={locale}
                  formatFixed={formatFixed}
                />
                {mashStepsDirty ? (
                  <Button size="$3" mt="$2" onPress={saveMashSteps} disabled={mashStepsSaving}>
                    <Text>{mashStepsSaving ? "Saving…" : "Save mash steps"}</Text>
                  </Button>
                ) : null}
              </Accordion.Content>
            </Card>
          </Accordion.Item>
        </Accordion>
      </ScrollView>
    </Screen>
  );
}
