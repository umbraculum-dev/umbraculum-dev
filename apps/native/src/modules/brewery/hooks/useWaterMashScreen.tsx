/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  computeAndSaveMash,
  getRecipe,
  listWaterProfiles,
  patchRecipe,
  getRecipeWaterSettings,
  updateRecipeWaterSettings,
} from "@umbraculum/api-client/brewery";
import {
  editorStateFromBeerJson,
  mergeMashDeduceFromExt,
  MASH_TEMPLATES,
  newMashRowId,
  replaceMashInBeerJsonDocument,
  validateMashBeforeSave,
  type EditorMashStep,
} from "@umbraculum/brewery-beerjson";
import { parseGravityAnalysisResponseV1 } from "@umbraculum/contracts";
import type { WaterAcidificationManualResult, WaterAcidificationResult, WaterProfile, WaterProfilesResponse } from "@umbraculum/contracts";
import { useT } from "@umbraculum/i18n-react";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";

import { SaltAdditionsEditor, type SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { MashStepsEditor, type WaterVolumes } from "@umbraculum/brewery-recipes-ui";
import { useAuth } from "../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../auth/apiBaseUrl";
import { nativePlatformApiClient } from "../../../auth/nativeApiClient";
import { useLocaleController } from "../../../i18n/I18nProvider";
import { useNavigation, useRoute, type NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "../../../navigation/types";


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


export function useWaterMashScreen() {
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

  const { t } = useT("recipes.water.mash");
  const { t: tEdit } = useT("recipes.edit");
  const { t: tCommon } = useT("common");
  const { t: tUnits } = useT("units");
  const { t: tWaterCommon } = useT("recipes.water.common");

  const [profiles, setProfiles] = useState<WaterProfilesResponse | null>(null);
  const [_settings, setSettings] = useState<Record<string, unknown> | null>(null);
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
      const api = nativePlatformApiClient(token!, baseUrl);
      const [profilesData, settingsData, recipeData] = await Promise.all([
        listWaterProfiles(api),
        getRecipeWaterSettings(api, recipeId),
        getRecipe(api, recipeId),
      ]);
      setProfiles(profilesData);
      if (settingsData.settings) {
        const s = settingsData.settings;
        setSettings(s);
        setSourceProfileId((s['sourceWaterProfileId'] as string) ?? "");
        setTargetProfileId((s['targetWaterProfileId'] as string) ?? s['sourceWaterProfileId'] ?? "");
        setDilutionProfileId((s['dilutionWaterProfileId'] as string) ?? "");
        setTapVolumeLiters(String(s['tapWaterVolumeLiters'] ?? 0));
        setDilutionVolumeLiters(String(s['dilutionWaterVolumeLiters'] ?? 0));
        // eslint-disable-next-line no-constant-binary-expression -- pre-existing semantic bug: Number(x) ?? default never short-circuits (Number always returns a number, possibly NaN). Intended pattern is likely Number(x ?? default). Not fixed here because changing the precedence changes runtime behavior (NaN vs default). Tracked separately. See docs/LINTING.md.
        setMashStartingAlk(Number(s['mashStartingAlkalinityPpmCaCO3']) ?? 0);
        // eslint-disable-next-line no-constant-binary-expression -- pre-existing: see above.
        setMashStartingPh(Number(s['mashStartingPh']) ?? 7);
        // eslint-disable-next-line no-constant-binary-expression -- pre-existing: see above.
        setMashTargetPh(Number(s['mashTargetPh']) ?? 5.4);
        setMashAcidType((s['mashAcidType'] as string) ?? "lactic");
        setMashAcidificationMode((s['mashAcidificationMode'] as string) === "manual" ? "manual" : "targetPh");
        setMashStrengthKind(((s['mashStrengthKind'] as string) ?? "percent") as "percent" | "normality" | "molarity" | "solid");
        // eslint-disable-next-line no-constant-binary-expression -- pre-existing: see above.
        setMashStrengthValue(Number(s['mashStrengthValue']) ?? 88);
        setMashManualAcidAdded(Number(s['mashManualAcidAddedMl'] ?? s['mashManualAcidAddedGrams'] ?? 0));
        if (Array.isArray(s['mashSaltAdditionsJson'])) setSaltAdditions(s['mashSaltAdditionsJson'] as SaltAdditionRow[]);
        if (Array.isArray(s['mashGristImportedJson'])) setGristImportedRows(s['mashGristImportedJson'] as Record<string, unknown>[]);
        if (s['mashOverallLastResultJson'] && typeof s['mashOverallLastResultJson'] === "object") {
          setOverallResult(s['mashOverallLastResultJson'] as Record<string, unknown>);
        }
      }
      const d = recipeData.recipe;
      if (d) {
        setRecipe(d);
        if (d['beerJsonRecipeJson'] && !mashStepsDirty) {
          const s = editorStateFromBeerJson(d['beerJsonRecipeJson']);
          const mashMerged = mergeMashDeduceFromExt(s.mash, d['recipeExtJson']);
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
      const api = nativePlatformApiClient(token!, baseUrl);
      const d = await updateRecipeWaterSettings(api, recipeId, patch);
      if (d.settings) setSettings(d.settings);
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
      const api = nativePlatformApiClient(token!, baseUrl);
      const data = await getRecipe(api, recipeId);
      const r = data.recipe as { beerJsonRecipeJson?: unknown; recipeExtJson?: unknown; updatedAt?: string };
      if (!r?.beerJsonRecipeJson) throw new Error("Recipe is missing BeerJSON");
      const s = editorStateFromBeerJson(r.beerJsonRecipeJson);
      const mashOnlyRows = (s.gristRows as Record<string, unknown>[]).filter(
        (row) =>
          (row['timingUse'] as string ?? "add_to_mash") === "add_to_mash" &&
          (row as { lateAddition?: unknown }).lateAddition !== true,
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
      type GristShape = { timingUse?: unknown; lateAddition?: unknown; amountKg?: unknown };
      return (s.gristRows as GristShape[]).reduce((sum, r) => {
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
      const api = nativePlatformApiClient(token!, baseUrl);
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
      const computed = await computeAndSaveMash(api, recipeId, payload);

      if (computed.acid.kind === "mash_acidification_manual") {
        setMashManualResult(computed.acid.result);
        setMashAcidResult(computed.acid.result.predicted ?? null);
        setMashCalcSaveStatus(t("mashSnapshotEstimatedAndSaved"));
      } else {
        setMashManualResult(null);
        setMashAcidResult(computed.acid.result);
        setMashCalcSaveStatus(t("mashSnapshotCalculatedAndSaved"));
      }

      setOverallResult(computed.overall.result);
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
      const api = nativePlatformApiClient(token!, baseUrl);
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
      const computed = await computeAndSaveMash(api, recipeId, payload);
      if (computed.acid.kind === "mash_acidification_manual") {
        setMashManualResult(computed.acid.result);
        setMashAcidResult(computed.acid.result.predicted ?? null);
      } else {
        setMashManualResult(null);
        setMashAcidResult(computed.acid.result);
      }
      setOverallResult(computed.overall.result);
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
      if (!row) return prev;
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
      const target = next[targetIdx];
      if (!tmp || !target) return prev;
      next[idx] = target;
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
      const validation = validateMashBeforeSave(mash);
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
      const api = nativePlatformApiClient(token!, baseUrl);
      await patchRecipe(api, recipeId, {
        beerJsonRecipeJson: newDoc,
        recipeExtJson,
      });
      setMashStepsDirty(false);
      void loadData();
    } catch (err) {
      setError(String(err));
    } finally {
      setMashStepsSaving(false);
    }
  };


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
    profiles,
    setProfiles,
    _settings,
    setSettings,
    recipe,
    setRecipe,
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
    saltAdditions,
    setSaltAdditions,
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
    mashProcedure,
    setMashProcedure,
    mashRows,
    setMashRows,
    mashStepsDirty,
    setMashStepsDirty,
    mashStepsSaving,
    setMashStepsSaving,
    gristImportedRows,
    setGristImportedRows,
    gristImportError,
    setGristImportError,
    gristImportStatus,
    setGristImportStatus,
    importingGrist,
    setImportingGrist,
    canCall,
    tapNum,
    dilNum,
    derivedMashWaterVolumeLiters,
    computeFirstStepAmountL,
    allProfiles,
    waterProfiles,
    dilutionProfiles,
    profileOptions,
    selectedSource,
    selectedTarget,
    selectedDilution,
    mixedSourceProfile,
    waterVolumes,
    loadData,
    saveSettings,
    onSaveAdjustment,
    onImportGristFromRecipe,
    lateAdditionsTotalKg,
    onSaveMashDraft,
    onEstimateAndSaveSnapshot,
    onComputeAndSave,
    addMashStep,
    updateMashStep,
    deleteMashStep,
    moveMashStep,
    addMashFromTemplate,
    saveMashSteps,
  };
}

export type WaterMashScreenModel = ReturnType<typeof useWaterMashScreen>;
