import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  getRecipe,
  listEquipmentProfiles,
  listStyles,
  patchRecipe,
  searchFermentables as apiSearchFermentables,
  searchHops as apiSearchHops,
  searchYeasts as apiSearchYeasts,
  getRecipeWaterSettings,
} from "@umbraculum/api-client/brewery";
import {
  buildBeerJsonRecipeDocument,
  buildRecipeExtJsonFromEditorState,
  editorStateFromBeerJson,
  mergeMashDeduceFromExt,
  mergeYeastAttenuationRangeFromExt,
  type EditorGristRow,
  type EditorHopRow,
  type EditorMashStep,
  type EditorYeastRow,
} from "@umbraculum/brewery-beerjson";
import { parseGravityAnalysisResponseV1 } from "@umbraculum/contracts";
import { useT } from "@umbraculum/i18n-react";
import type { WaterVolumes } from "@umbraculum/brewery-recipes-ui";

import { useAuth } from "../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../auth/apiBaseUrl";
import { nativePlatformApiClient } from "../../../auth/nativeApiClient";
import { useLocaleController } from "../../../i18n/I18nProvider";
import { asRecord } from "../../../lib/typeGuards";
import type { RootStackParamList } from "../../../navigation/types";
import { formatFixed, inferMaltClass, newRowId } from "../lib/recipeEditHelpers";
import type {
  EquipmentProfile,
  FermentableSearchItem,
  HopSearchItem,
  Recipe,
  StyleListItem,
  YeastSearchItem,
} from "../lib/recipeEditTypes";

type RecipeEditNavigationProp = NativeStackNavigationProp<RootStackParamList, "RecipeEdit">;

export function useRecipeEditScreen() {
  const auth = useAuth();
  const route = useRoute();
  const navigation = useNavigation<RecipeEditNavigationProp>();
  const recipeId = (route.params as { recipeId?: string })?.recipeId ?? "";
  const { t } = useT("recipes.edit");
  const { t: tBrewSessions } = useT("recipes.brewSessions");
  const { t: tSparge } = useT("recipes.water.sparge");
  const { t: tRecipes } = useT("recipes");
  const { t: tCommon } = useT("common");
  const { t: tEquip } = useT("equipment");
  const { t: tUnits } = useT("units");
  const { locale } = useLocaleController();

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("title") });
  }, [navigation, t]);

  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [styleKey, setStyleKey] = useState("");
  const [notes, setNotes] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const [boilTimeMinutes, setBoilTimeMinutes] = useState("");
  const [openSections, setOpenSections] = useState<string[]>(["basics"]);
  const [openFermentableIds, setOpenFermentableIds] = useState<string[]>([]);
  const [openHopIds, setOpenHopIds] = useState<string[]>([]);
  const [openYeastIds, setOpenYeastIds] = useState<string[]>([]);

  const [gristRows, setGristRows] = useState<EditorGristRow[]>([]);
  const [hopsRows, setHopsRows] = useState<EditorHopRow[]>([]);
  const [yeastRows, setYeastRows] = useState<EditorYeastRow[]>([]);
  const [yeastAttenuationOverrides, setYeastAttenuationOverrides] = useState<Record<string, string>>({});

  const [fermentableQuery, setFermentableQuery] = useState("");
  const [fermentableResults, setFermentableResults] = useState<FermentableSearchItem[]>([]);
  const [fermentableSearching, setFermentableSearching] = useState(false);
  const [fermentableSearchError, setFermentableSearchError] = useState<string | null>(null);

  const [hopQuery, setHopQuery] = useState("");
  const [hopResults, setHopResults] = useState<HopSearchItem[]>([]);
  const [hopSearching, setHopSearching] = useState(false);
  const [hopSearchError, setHopSearchError] = useState<string | null>(null);

  const [yeastQuery, _setYeastQuery] = useState("");
  const [_yeastResults, setYeastResults] = useState<YeastSearchItem[]>([]);
  const [_yeastSearching, setYeastSearching] = useState(false);
  const [_yeastAmountTextById, setYeastAmountTextById] = useState<Record<string, string>>({});

  const [equipmentProfiles, setEquipmentProfiles] = useState<EquipmentProfile[]>([]);
  const [_equipmentProfilesLoading, setEquipmentProfilesLoading] = useState(false);
  const [equipmentProfilesError, setEquipmentProfilesError] = useState<string | null>(null);
  const [selectedEquipmentProfileId, setSelectedEquipmentProfileId] = useState("");
  const [equipmentApplying, setEquipmentApplying] = useState(false);
  const [equipmentApplyError, setEquipmentApplyError] = useState<string | null>(null);

  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [stylePickerOpen, setStylePickerOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [mashProcedure, setMashProcedure] = useState<{ name: string; grainTemperatureC: number } | null>(null);
  const [mashRows, setMashRows] = useState<EditorMashStep[]>([]);
  const [waterSettings, setWaterSettings] = useState<{
    spargeStepTemperatureC?: number | null;
    spargeStepTimeMin?: number | null;
    spargeStepRampMin?: number | null;
    spargeMethodType?: string | null;
  } | null>(null);

  const canCall = auth.state.status === "logged_in" && Boolean(baseUrl) && Boolean(token);

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return nativePlatformApiClient(token);
  }, [baseUrl, token]);

  const analysis = (recipe as { analysis?: unknown })?.analysis;
  const waterVolumes = useMemo((): WaterVolumes | null => {
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
  }, [analysis]);

  const spargeConfigured = waterVolumes != null && waterVolumes.spargeLiters > 0;
  const mashRowsFiltered = useMemo(() => {
    if (!spargeConfigured) return mashRows;
    return mashRows.filter(
      (r) => !(r.type === "sparge" && r.name.trim().toLowerCase() === "sparge"),
    );
  }, [mashRows, spargeConfigured]);

  const spargeRows = useMemo(
    () => mashRows.filter((r) => r.type === "sparge"),
    [mashRows],
  );

  const loadRecipe = useCallback(async () => {
    if (!api || !recipeId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getRecipe(api, recipeId);
      const r = (res.recipe ?? null) as Recipe | null;
      if (!r) throw new Error("Recipe not found");
      setRecipe(r);
      setName(typeof r.name === "string" ? r.name : "");
      setStyleKey(typeof r.styleKey === "string" ? r.styleKey : "custom");
      setNotes(typeof r.notes === "string" ? r.notes : "");

      const extRec = asRecord(r.recipeExtJson);
      const linksRec = asRecord(extRec?.['ingredientLinks']);
      const yeastOverridesRaw = asRecord(extRec?.['yeastAttenuationOverridesPercent']);
      if (yeastOverridesRaw) {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(yeastOverridesRaw)) {
          if (typeof k === "string" && typeof v === "number" && Number.isFinite(v)) out[k] = String(v);
        }
        setYeastAttenuationOverrides(out);
      } else {
        setYeastAttenuationOverrides({});
      }

      const yeastFermentationTempRaw = asRecord(extRec?.['yeastFermentationTempOverrides']);
      const yeastOxygenationRaw = asRecord(extRec?.['yeastOxygenationOverrides']);
      const yeastDiacetylRestRaw = asRecord(extRec?.['yeastDiacetylRestOverrides']);
      const yeastFormatRaw = asRecord(extRec?.['yeastFormatOverrides'] ?? extRec?.['yeastTypeOverrides']);

      const equipmentSource = asRecord(extRec?.['equipmentSource']);
      const equipmentProfileId =
        typeof equipmentSource?.['equipmentProfileId'] === "string" ? equipmentSource['equipmentProfileId'] : "";
      setSelectedEquipmentProfileId(equipmentProfileId);

      const boilTimeMinutesOverrideRaw = extRec?.['boilTimeMinutesOverride'];
      const boilTimeMinutesOverride =
        typeof boilTimeMinutesOverrideRaw === "number" && Number.isFinite(boilTimeMinutesOverrideRaw)
          ? boilTimeMinutesOverrideRaw
          : null;
      if (boilTimeMinutesOverride != null && boilTimeMinutesOverride >= 0) {
        setBoilTimeMinutes(String(Math.round(boilTimeMinutesOverride)));
      } else {
        setBoilTimeMinutes("60");
      }

      if (!r.beerJsonRecipeJson) {
        setGristRows([]);
        setHopsRows([]);
        setYeastRows([]);
        setMashProcedure(null);
        setMashRows([]);
        return;
      }
      const s = editorStateFromBeerJson(r.beerJsonRecipeJson);
      setGristRows(s.gristRows);
      setHopsRows(s.hopsRows);
      const mashMerged = mergeMashDeduceFromExt(s.mash, r.recipeExtJson);
      if (mashMerged) {
        setMashProcedure({
          name: mashMerged.name || "Mash",
          grainTemperatureC: mashMerged.grainTemperatureC,
        });
        setMashRows(mashMerged.steps);
      } else {
        setMashProcedure(null);
        setMashRows([]);
      }
      const baseYeast = mergeYeastAttenuationRangeFromExt(s.yeastRows, r.recipeExtJson);
      const yeastLinks = asRecord(linksRec?.['yeast']);
      const mappedYeastRows: EditorYeastRow[] = baseYeast.map((row) => {
        const fermentationTempC =
          yeastFermentationTempRaw &&
          typeof yeastFermentationTempRaw[row.id] === "number" &&
          Number.isFinite(yeastFermentationTempRaw[row.id])
            ? (yeastFermentationTempRaw[row.id] as number)
            : null;
        const oxygenation =
          yeastOxygenationRaw &&
          (yeastOxygenationRaw[row.id] === "yes" || yeastOxygenationRaw[row.id] === "no")
            ? (yeastOxygenationRaw[row.id] as "yes" | "no")
            : null;
        const diacetylRest =
          yeastDiacetylRestRaw &&
          (yeastDiacetylRestRaw[row.id] === "yes" || yeastDiacetylRestRaw[row.id] === "no")
            ? (yeastDiacetylRestRaw[row.id] as "yes" | "no")
            : null;
        const formatOverride =
          yeastFormatRaw &&
          (yeastFormatRaw[row.id] === "dry" ||
            yeastFormatRaw[row.id] === "liquid" ||
            yeastFormatRaw[row.id] === "slurry")
            ? (yeastFormatRaw[row.id] as "dry" | "liquid" | "slurry")
            : null;

        const inferredFormat: NonNullable<EditorYeastRow["format"]> =
          formatOverride ??
          (row.format === "dry" || row.format === "liquid" || row.format === "slurry" ? row.format : null) ??
          (row.amountKg != null && Number.isFinite(row.amountKg) ? "dry" : "liquid");

        return {
          ...row,
          ingredientId: typeof yeastLinks?.[row.id] === "string" ? (yeastLinks[row.id] as string) : null,
          fermentationTempC: fermentationTempC ?? undefined,
          oxygenation: oxygenation ?? undefined,
          diacetylRest: diacetylRest ?? undefined,
          format: inferredFormat,
        };
      });

      setYeastRows(mappedYeastRows);

      setYeastAmountTextById(() => {
        const next: Record<string, string> = {};
        for (const y of mappedYeastRows) {
          if (y.format === "dry") {
            const v = y.amountKg;
            if (typeof v === "number" && Number.isFinite(v)) next[y.id] = formatFixed(locale, v, 3);
          } else {
            const v = y.amountL;
            if (typeof v === "number" && Number.isFinite(v)) next[y.id] = formatFixed(locale, v, 2);
          }
        }
        return next;
      });
    } catch (err) {
      setLoadError(String(err));
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [api, recipeId, locale]);

  const loadStyles = useCallback(async () => {
    if (!api) return;
    setStylesLoading(true);
    try {
      const parsed = await listStyles(api);
      const items = parsed.styles;
      setStyles(Array.isArray(items) ? (items as StyleListItem[]) : []);
    } catch {
      setStyles([]);
    } finally {
      setStylesLoading(false);
    }
  }, [api]);

  const loadEquipmentProfiles = useCallback(async () => {
    if (!api) return;
    setEquipmentProfilesLoading(true);
    setEquipmentProfilesError(null);
    try {
      const parsed = await listEquipmentProfiles(api);
      const items = parsed.profiles;
      setEquipmentProfiles(Array.isArray(items) ? (items as unknown as EquipmentProfile[]) : []);
    } catch (err) {
      setEquipmentProfilesError(String(err));
      setEquipmentProfiles([]);
    } finally {
      setEquipmentProfilesLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (canCall && recipeId) {
      void loadRecipe();
      void loadStyles();
      void loadEquipmentProfiles();
    }
  }, [canCall, recipeId, loadRecipe, loadStyles, loadEquipmentProfiles]);

  useEffect(() => {
    if (!canCall || !recipeId || !api) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await getRecipeWaterSettings(api, recipeId);
        if (cancelled) return;
        const data = res.settings as Record<string, unknown> | null | undefined;
        setWaterSettings(data ?? null);
      } catch {
        if (!cancelled) setWaterSettings(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCall, recipeId, api]);

  useFocusEffect(
    useCallback(() => {
      if (canCall && recipeId && recipe) {
        void loadRecipe();
      }
    }, [canCall, recipeId, recipe, loadRecipe]),
  );

  const searchFermentables = useCallback(async () => {
    if (!api) return;
    setFermentableSearching(true);
    setFermentableSearchError(null);
    try {
      const parsed = await apiSearchFermentables(
        api,
        fermentableQuery.trim() ? { query: fermentableQuery.trim(), limit: 20 } : { limit: 20 },
      );
      const items = parsed.items;
      setFermentableResults(Array.isArray(items) ? (items as FermentableSearchItem[]) : []);
    } catch (err) {
      setFermentableSearchError(String(err));
      setFermentableResults([]);
    } finally {
      setFermentableSearching(false);
    }
  }, [api, fermentableQuery]);

  const searchHops = useCallback(async () => {
    if (!api) return;
    setHopSearching(true);
    setHopSearchError(null);
    try {
      const parsed = await apiSearchHops(
        api,
        hopQuery.trim() ? { query: hopQuery.trim(), limit: 20 } : { limit: 20 },
      );
      const items = parsed.items;
      setHopResults(Array.isArray(items) ? (items as HopSearchItem[]) : []);
    } catch (err) {
      setHopSearchError(String(err));
      setHopResults([]);
    } finally {
      setHopSearching(false);
    }
  }, [api, hopQuery]);

  const _searchYeasts = useCallback(async () => {
    if (!api) return;
    setYeastSearching(true);
    try {
      const parsed = await apiSearchYeasts(api, yeastQuery.trim() ? { query: yeastQuery.trim() } : undefined);
      const items = parsed.items;
      setYeastResults(Array.isArray(items) ? (items as YeastSearchItem[]) : []);
    } catch {
      setYeastResults([]);
    } finally {
      setYeastSearching(false);
    }
  }, [api, yeastQuery]);

  const addGristRow = useCallback(() => {
    setGristRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        name: "",
        amountKg: 0,
        colorLovibond: null,
        potential: null,
        maltClass: "base",
        timingUse: "add_to_mash",
        lateAddition: false,
      },
    ]);
  }, []);

  const addFermentableFromDb = useCallback((item: FermentableSearchItem) => {
    const yieldPct = typeof item.yieldPercent === "number" && Number.isFinite(item.yieldPercent) ? item.yieldPercent : null;
    const ppg = typeof item.ppg === "number" && Number.isFinite(item.ppg) ? item.ppg : null;
    const potential = yieldPct != null ? { kind: "yieldPercent" as const, value: yieldPct } : ppg != null ? { kind: "ppg" as const, value: ppg } : null;
    const group = typeof item.group === "string" ? item.group : null;
    const maltClass = inferMaltClass(group, item.name);
    setGristRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: item.id,
        name: item.name,
        producer: item.producer ?? null,
        group,
        amountKg: 0,
        colorLovibond: typeof item.colorLovibond === "number" ? item.colorLovibond : null,
        potential,
        maltClass,
        timingUse: "add_to_mash",
        lateAddition: false,
      },
    ]);
  }, []);

  const updateGristRow = useCallback((id: string, patch: Partial<EditorGristRow>) => {
    setGristRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const removeGristRow = useCallback((id: string) => {
    setGristRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addHopRow = useCallback(() => {
    setHopsRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        amountGrams: 0,
        alphaAcidPercent: null,
        use: "boil",
        timeMinutes: 60,
        form: "pellet",
      },
    ]);
  }, []);

  const addHopFromDb = useCallback((item: HopSearchItem) => {
    const alpha = typeof item.alphaMin === "number" && Number.isFinite(item.alphaMin)
      ? item.alphaMin
      : typeof item.alphaMax === "number" && Number.isFinite(item.alphaMax)
        ? item.alphaMax
        : null;
    setHopsRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: item.id,
        name: item.name,
        country: item.country ?? null,
        amountGrams: 0,
        alphaAcidPercent: alpha,
        use: "boil",
        timeMinutes: 60,
        form: "pellet",
      },
    ]);
  }, []);

  const updateHopRow = useCallback((id: string, patch: Partial<EditorHopRow>) => {
    setHopsRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const removeHopRow = useCallback((id: string) => {
    setHopsRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const _addYeastRow = useCallback(() => {
    setYeastRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        amountL: null,
        amountKg: null,
        format: "liquid",
      },
    ]);
  }, []);

  const _addYeastFromDb = useCallback((item: YeastSearchItem) => {
    const attenuationMin =
      typeof item.attenuationMin === "number" && Number.isFinite(item.attenuationMin) ? item.attenuationMin : null;
    const attenuationMax =
      typeof item.attenuationMax === "number" && Number.isFinite(item.attenuationMax) ? item.attenuationMax : null;
    setYeastRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: item.id,
        name: item.name,
        lab: item.lab ?? null,
        attenuationMin: attenuationMin ?? attenuationMax,
        attenuationMax: attenuationMax ?? attenuationMin,
        amountL: null,
        amountKg: null,
        format: "liquid",
      },
    ]);
  }, []);

  const _updateYeastRow = useCallback((id: string, patch: Partial<EditorYeastRow>) => {
    setYeastRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const _removeYeastRow = useCallback((id: string) => {
    setYeastRows((prev) => prev.filter((r) => r.id !== id));
    setYeastAttenuationOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const applyEquipmentProfileToRecipe = useCallback(
    async (mode: "apply" | "reload") => {
      if (!api || !recipeId) return;
      setEquipmentApplyError(null);
      setEquipmentApplying(true);
      try {
        const selected = equipmentProfiles.find((p) => p.id === selectedEquipmentProfileId) ?? null;
        if (!selected) throw new Error(t("equipmentSection.errors.selectFirst"));

        const baseRec = asRecord(recipe?.recipeExtJson);
        const base: Record<string, unknown> = baseRec ? { ...baseRec } : {};
        base['version'] = 1;
        base['equipment'] = selected.equipment;
        base['equipmentSource'] = { equipmentProfileId: selected.id, copiedAt: new Date().toISOString() };

        await patchRecipe(api, recipeId, { recipeExtJson: base });

        await loadRecipe();
        setSaveStatus(mode === "reload" ? t("status.equipmentReloaded") : t("status.equipmentApplied"));
      } catch (err) {
        setEquipmentApplyError(String(err));
      } finally {
        setEquipmentApplying(false);
      }
    },
    [api, recipeId, equipmentProfiles, selectedEquipmentProfileId, recipe, loadRecipe, t],
  );

  const gristTotals = useMemo(() => {
    const totalKg = gristRows.reduce((sum, r) => sum + (typeof r.amountKg === "number" && Number.isFinite(r.amountKg) ? r.amountKg : 0), 0);
    let weightedSum = 0;
    let weightSum = 0;
    for (const r of gristRows) {
      const kg = typeof r.amountKg === "number" && Number.isFinite(r.amountKg) ? r.amountKg : 0;
      const lov = typeof r.colorLovibond === "number" && Number.isFinite(r.colorLovibond) ? r.colorLovibond : null;
      if (kg > 0 && lov != null) {
        weightedSum += kg * lov;
        weightSum += kg;
      }
    }
    const weightedAvgLovibond = weightSum > 0 ? weightedSum / weightSum : null;
    return { totalKg, weightedAvgLovibond };
  }, [gristRows]);

  const save = useCallback(async () => {
    if (!api || !recipeId || !recipe) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    try {
      const extBaseRec = asRecord(recipe?.recipeExtJson);
      const extBaseForSave: Record<string, unknown> = extBaseRec ? { ...extBaseRec } : {};

      const boilTimeMinutesVal = (() => {
        const trimmed = boilTimeMinutes.trim();
        if (!trimmed) return null;
        const n = Number(trimmed);
        if (!Number.isFinite(n) || n < 0 || n > 600) return null;
        return Math.round(n);
      })();
      if (boilTimeMinutesVal != null) {
        extBaseForSave['boilTimeMinutesOverride'] = boilTimeMinutesVal;
      } else {
        delete extBaseForSave['boilTimeMinutesOverride'];
      }

      const yeastAttenuationOverridesPercent = Object.fromEntries(
        Object.entries(yeastAttenuationOverrides)
          .map(([k, v]) => {
            const trimmed = v.trim();
            if (!trimmed) return null;
            const n = Number(trimmed);
            if (!Number.isFinite(n)) return null;
            return [k, n] as const;
          })
          .filter(Boolean) as Array<readonly [string, number]>,
      );
      if (Object.keys(yeastAttenuationOverridesPercent).length) {
        extBaseForSave['yeastAttenuationOverridesPercent'] = yeastAttenuationOverridesPercent;
      }

      const yeastFermentationTempOverrides = Object.fromEntries(
        yeastRows
          .filter(
            (r) =>
              r.fermentationTempC != null &&
              Number.isFinite(r.fermentationTempC) &&
              r.fermentationTempC >= -10 &&
              r.fermentationTempC <= 50,
          )
          .map((r) => [r.id, r.fermentationTempC as number]),
      );
      const yeastOxygenationOverrides = Object.fromEntries(
        yeastRows.filter((r) => r.oxygenation === "yes" || r.oxygenation === "no").map((r) => [r.id, r.oxygenation as "yes" | "no"]),
      );
      const yeastDiacetylRestOverrides = Object.fromEntries(
        yeastRows.filter((r) => r.diacetylRest === "yes" || r.diacetylRest === "no").map((r) => [r.id, r.diacetylRest as "yes" | "no"]),
      );
      const yeastFormatOverrides = Object.fromEntries(
        yeastRows.filter((r) => r.format === "dry" || r.format === "liquid" || r.format === "slurry").map((r) => [r.id, r.format as "dry" | "liquid" | "slurry"]),
      );

      if (Object.keys(yeastFermentationTempOverrides).length) extBaseForSave['yeastFermentationTempOverrides'] = yeastFermentationTempOverrides;
      else delete extBaseForSave['yeastFermentationTempOverrides'];

      if (Object.keys(yeastOxygenationOverrides).length) extBaseForSave['yeastOxygenationOverrides'] = yeastOxygenationOverrides;
      else delete extBaseForSave['yeastOxygenationOverrides'];

      if (Object.keys(yeastDiacetylRestOverrides).length) extBaseForSave['yeastDiacetylRestOverrides'] = yeastDiacetylRestOverrides;
      else delete extBaseForSave['yeastDiacetylRestOverrides'];

      if (Object.keys(yeastFormatOverrides).length) extBaseForSave['yeastFormatOverrides'] = yeastFormatOverrides;
      else delete extBaseForSave['yeastFormatOverrides'];

      delete extBaseForSave['yeastTypeOverrides'];

      const beerJsonDoc = buildBeerJsonRecipeDocument({
        name: name.trim() || recipe.name,
        notes: notes.trim() || null,
        gristRows,
        hopsRows,
        yeastRows,
        miscRows: [],
      });

      const recipeExtJson = buildRecipeExtJsonFromEditorState({
        gristRows,
        hopsRows,
        yeastRows,
        miscRows: [],
        extBase: extBaseForSave,
      });

      const payload: Record<string, unknown> = {
        name: name.trim() || recipe.name,
        styleKey: styleKey.trim() || "custom",
        notes: notes.trim() || null,
        beerJsonRecipeJson: beerJsonDoc,
        recipeExtJson,
      };

      await patchRecipe(api, recipeId, payload);
      setSaveStatus(t("status.saved"));
      await loadRecipe();
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  }, [
    api,
    recipeId,
    recipe,
    name,
    styleKey,
    notes,
    boilTimeMinutes,
    gristRows,
    hopsRows,
    yeastRows,
    yeastAttenuationOverrides,
    loadRecipe,
    t,
  ]);

  const selectedStyleLabel =
    styleKey && styles.find((s) => s.key === styleKey)
      ? styleKey === "custom"
        ? styles.find((s) => s.key === "custom")?.name ?? "Custom"
        : `${styles.find((s) => s.key === styleKey)?.code ?? ""} — ${styles.find((s) => s.key === styleKey)?.name ?? styleKey}`
      : "Select style";

  return {
    canCall,
    loading,
    recipe,
    loadError,
    t,
    tBrewSessions,
    tSparge,
    tRecipes,
    tCommon,
    tEquip,
    tUnits,
    locale,
    navigation,
    recipeId,
    saveStatus,
    saveError,
    scrollRef,
    openSections,
    setOpenSections,
    name,
    setName,
    styleKey,
    setStyleKey,
    styles,
    stylesLoading,
    stylePickerOpen,
    setStylePickerOpen,
    selectedStyleLabel,
    fermentableQuery,
    setFermentableQuery,
    fermentableResults,
    setFermentableResults,
    fermentableSearching,
    fermentableSearchError,
    searchFermentables,
    addFermentableFromDb,
    addGristRow,
    gristTotals,
    openFermentableIds,
    setOpenFermentableIds,
    gristRows,
    updateGristRow,
    removeGristRow,
    hopQuery,
    setHopQuery,
    hopResults,
    setHopResults,
    hopSearching,
    hopSearchError,
    searchHops,
    addHopFromDb,
    addHopRow,
    openHopIds,
    setOpenHopIds,
    hopsRows,
    updateHopRow,
    removeHopRow,
    openYeastIds,
    setOpenYeastIds,
    yeastRows,
    yeastAttenuationOverrides,
    equipmentProfilesError,
    equipmentProfiles,
    selectedEquipmentProfileId,
    setSelectedEquipmentProfileId,
    equipmentApplying,
    applyEquipmentProfileToRecipe,
    equipmentApplyError,
    waterVolumes,
    mashRowsFiltered,
    mashProcedure,
    spargeRows,
    spargeConfigured,
    waterSettings,
    boilTimeMinutes,
    setBoilTimeMinutes,
    notes,
    setNotes,
    saving,
    save,
  };
}

export type RecipeEditScreenModel = ReturnType<typeof useRecipeEditScreen>;
