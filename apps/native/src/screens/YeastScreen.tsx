import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useNavigation, useRoute, type NavigationProp, type RouteProp } from "@react-navigation/native";

import { bearerTokenAuth, createApiClient } from "@brewery/api-client";
import {
  buildBeerJsonRecipeDocument,
  buildRecipeExtJsonFromEditorState,
  CELLS_PER_KG_DRY,
  CELLS_PER_L_LIQUID,
  CELLS_PER_L_SLURRY,
  computeAmountFromCellsB,
  computeCellsPerLFromManualCount,
  computeEstimatedCellsB,
  editorStateFromBeerJson,
  mergeYeastAttenuationRangeFromExt,
  type EditorGristRow,
  type EditorHopRow,
  type EditorMash,
  type EditorMiscRow,
  type EditorYeastRow,
  YEAST_PITCH_RATE_OPTIONS,
} from "@brewery/beerjson";
import { useT } from "@brewery/i18n-react";
import { Button, Card, Heading, Screen, Spinner, Text } from "@brewery/ui";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@brewery/recipes-ui";
import { Accordion } from "tamagui";

import { ManualCellCountHelpBox } from "@brewery/recipes-ui";
import { isMediaAssetKey } from "@brewery/media";
import { ReadOnlyField } from "../components/ReadOnlyField";
import { Input } from "../components/AppInput";
import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";
import { useLocaleController } from "../i18n/I18nProvider";
import { asRecord } from "../lib/typeGuards";
import type { RootStackParamList } from "../navigation/types";
import { RemoteImage } from "../media/RemoteImage";

function formatFixed(locale: string, value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function newRowId(): string {
  try {
    const g = globalThis as { crypto?: { randomUUID?: () => string } };
    return g.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

type PickerOption = { value: string; label: string };

function PickerField(props: {
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (nextValue: string) => void;
  placeholder?: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = props.options.find((o) => o.value === props.value)?.label ?? "";
  const buttonText = selectedLabel || props.placeholder || "—";

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
        <Text fontSize={12}>{buttonText}</Text>
      </Button>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={() => null}>
            <Card gap="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
              <Heading fontSize={16}>{props.label}</Heading>
              <View style={{ gap: 8 }}>
                {props.options.map((opt) => (
                  <Button
                    key={opt.value || "__empty"}
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

const YEAST_FORMAT_OPTIONS: PickerOption[] = [
  { value: "dry", label: "Dry" },
  { value: "liquid", label: "Liquid" },
  { value: "slurry", label: "Slurry" },
];

const YES_NO_OPTIONS: PickerOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const SPECIES_OPTIONS: PickerOption[] = [
  { value: "saccharomyces_cerevisiae", label: "Saccharomyces cerevisiae" },
  { value: "saccharomyces_pastorianus", label: "Saccharomyces pastorianus" },
  { value: "brettanomyces", label: "Brettanomyces" },
  { value: "diastaticus", label: "Diastaticus" },
  { value: "other", label: "Other" },
];

type Recipe = {
  id: string;
  name?: string;
  styleKey?: string | null;
  notes?: string | null;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
  analysis?: { result?: { ogEstimatedSg?: number; kettleVolumeLiters?: number } } | null;
};

export function YeastScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "RecipeYeast">>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const recipeId = route.params?.recipeId ?? "";

  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const loadRecipeMeta = useCallback(async (id: string) => {
    if (!baseUrl || !token) return null;
    const api = createApiClient(baseUrl, bearerTokenAuth(() => token));
    const res = await api.get(`/api/recipes/${id}`);
    if (!res.ok) return null;
    return parseRecipeMetaFromGetRecipeResponse(res.data);
  }, [baseUrl, token]);

  const { t } = useT("recipes.edit");
  const { t: tAnalysis } = useT("recipes.analysis");
  const { t: tUnits } = useT("units");
  const { t: tCommon } = useT("common");
  const { locale } = useLocaleController();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [yeastRows, setYeastRows] = useState<EditorYeastRow[]>([]);
  const [yeastAttenuationOverrides, setYeastAttenuationOverrides] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lowViabilityWarning, setLowViabilityWarning] = useState<number | null>(null);

  const [gristRows, setGristRows] = useState<EditorGristRow[]>([]);
  const [hopsRows, setHopsRows] = useState<EditorHopRow[]>([]);
  const [miscRows, setMiscRows] = useState<EditorMiscRow[]>([]);
  const [mash, setMash] = useState<EditorMash | null>(null);

  const [yeastQuery, setYeastQuery] = useState("");
  const [yeastResults, setYeastResults] = useState<{ id: string; name: string; lab?: string | null; productId?: string | null; attenuationMin?: number; attenuationMax?: number }[]>([]);
  const [yeastSearching, setYeastSearching] = useState(false);
  const [openAdvancedSections, setOpenAdvancedSections] = useState<Record<string, boolean>>({});

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return createApiClient(baseUrl, bearerTokenAuth(() => token));
  }, [baseUrl, token]);

  useEffect(() => {
    navigation.setOptions({ headerTitle: t("yeastPageTitle") });
  }, [navigation, t]);

  useEffect(() => {
    setOpenAdvancedSections((prev) => {
      const rowIds = new Set(yeastRows.map((r) => r.id));
      const next: Record<string, boolean> = {};
      for (const id of rowIds) {
        next[id] = prev[id] ?? true;
      }
      return next;
    });
  }, [yeastRows]);

  const loadRecipe = useCallback(async () => {
    if (!api || !recipeId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.get(`/api/recipes/${recipeId}`);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const r = (res.data as { recipe: Recipe }).recipe;
      setRecipe(r);

      const extRec = asRecord(r.recipeExtJson);
      const linksRec = asRecord(extRec?.ingredientLinks);
      const yeastLinks = asRecord(linksRec?.yeast);
      const yeastOverridesRaw = asRecord(extRec?.yeastAttenuationOverridesPercent);
      if (yeastOverridesRaw) {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(yeastOverridesRaw)) {
          if (typeof k === "string" && typeof v === "number" && Number.isFinite(v)) out[k] = String(v);
        }
        setYeastAttenuationOverrides(out);
      } else {
        setYeastAttenuationOverrides({});
      }

      const yeastPitchRateRaw = asRecord(extRec?.yeastPitchRateOverrides);
      const yeastFermentationTempRaw = asRecord(extRec?.yeastFermentationTempOverrides);
      const yeastOxygenationRaw = asRecord(extRec?.yeastOxygenationOverrides);
      const yeastDiacetylRestRaw = asRecord(extRec?.yeastDiacetylRestOverrides);
      const yeastFormatRaw = asRecord(extRec?.yeastFormatOverrides ?? extRec?.yeastTypeOverrides);
      const yeastSpeciesRaw = asRecord(extRec?.yeastSpeciesOverrides);
      const yeastNeedsPropagationRaw = asRecord(extRec?.yeastNeedsPropagationOverrides);
      const yeastManualCellCountRaw = asRecord(extRec?.yeastManualCellCountOverrides);

      if (!r.beerJsonRecipeJson) throw new Error("Recipe is missing BeerJSON");
      const s = editorStateFromBeerJson(r.beerJsonRecipeJson);
      setGristRows(s.gristRows);
      setHopsRows(s.hopsRows);
      setMiscRows(s.miscRows);
      setMash(s.mash);

      const baseYeast = mergeYeastAttenuationRangeFromExt(s.yeastRows, r.recipeExtJson);
      setYeastRows(
        baseYeast.map((row) => {
          const pitchRate = yeastPitchRateRaw && typeof yeastPitchRateRaw[row.id] === "string" ? (yeastPitchRateRaw[row.id] as string) : null;
          const fermentationTempC = yeastFermentationTempRaw && typeof yeastFermentationTempRaw[row.id] === "number" && Number.isFinite(yeastFermentationTempRaw[row.id]) ? (yeastFermentationTempRaw[row.id] as number) : null;
          const oxygenation = yeastOxygenationRaw && (yeastOxygenationRaw[row.id] === "yes" || yeastOxygenationRaw[row.id] === "no") ? (yeastOxygenationRaw[row.id] as "yes" | "no") : null;
          const diacetylRest = yeastDiacetylRestRaw && (yeastDiacetylRestRaw[row.id] === "yes" || yeastDiacetylRestRaw[row.id] === "no") ? (yeastDiacetylRestRaw[row.id] as "yes" | "no") : null;
          const format = yeastFormatRaw && (yeastFormatRaw[row.id] === "dry" || yeastFormatRaw[row.id] === "liquid" || yeastFormatRaw[row.id] === "slurry") ? (yeastFormatRaw[row.id] as "dry" | "liquid" | "slurry") : null;
          const validSpecies = ["saccharomyces_cerevisiae", "saccharomyces_pastorianus", "brettanomyces", "diastaticus", "other"] as const;
          const speciesRaw = yeastSpeciesRaw ? yeastSpeciesRaw[row.id] : null;
          const species = typeof speciesRaw === "string" && (validSpecies as ReadonlyArray<string>).includes(speciesRaw) ? (speciesRaw as (typeof validSpecies)[number]) : null;
          const needsPropagation = yeastNeedsPropagationRaw && (yeastNeedsPropagationRaw[row.id] === "yes" || yeastNeedsPropagationRaw[row.id] === "no") ? (yeastNeedsPropagationRaw[row.id] as "yes" | "no") : null;
          const manualRaw = yeastManualCellCountRaw && asRecord(yeastManualCellCountRaw[row.id]) ? (yeastManualCellCountRaw[row.id] as { dilutionFactor?: number; aliveCells?: number; totalCells?: number }) : null;
          const dilutionFactor = manualRaw?.dilutionFactor === 200 || manualRaw?.dilutionFactor === 2000 ? (manualRaw.dilutionFactor) : undefined;
          const aliveCells = typeof manualRaw?.aliveCells === "number" && Number.isFinite(manualRaw.aliveCells) && manualRaw.aliveCells > 0 ? manualRaw.aliveCells : undefined;
          const totalCells = typeof manualRaw?.totalCells === "number" && Number.isFinite(manualRaw.totalCells) && manualRaw.totalCells > 0 ? manualRaw.totalCells : undefined;
          const manualCellCount = dilutionFactor != null && aliveCells != null && totalCells != null ? { dilutionFactor, aliveCells, totalCells } : undefined;

          return {
            ...row,
            ingredientId: typeof yeastLinks?.[row.id] === "string" ? (yeastLinks[row.id] as string) : null,
            pitchRate: pitchRate ?? undefined,
            fermentationTempC: fermentationTempC ?? undefined,
            oxygenation: oxygenation ?? undefined,
            diacetylRest: diacetylRest ?? undefined,
            format: format ?? undefined,
            species: species ?? undefined,
            needsPropagation: needsPropagation ?? undefined,
            manualCellCount: manualCellCount ?? undefined,
          };
        }) as EditorYeastRow[],
      );
    } catch (err) {
      setLoadError(String(err));
    } finally {
      setLoading(false);
    }
  }, [api, recipeId]);

  useEffect(() => {
    void loadRecipe();
  }, [loadRecipe]);

  const searchYeasts = useCallback(async () => {
    if (!api) return;
    setYeastSearching(true);
    try {
      const q = yeastQuery.trim() ? `?query=${encodeURIComponent(yeastQuery.trim())}` : "";
      const res = await api.get(`/api/ingredients/yeasts${q}`);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const items = (res.data as { items?: unknown })?.items;
      setYeastResults(Array.isArray(items) ? items : []);
    } catch {
      setYeastResults([]);
    } finally {
      setYeastSearching(false);
    }
  }, [api, yeastQuery]);

  const addYeastRow = (row?: Partial<EditorYeastRow>) => {
    setYeastRows((prev) => [
      ...prev,
      { id: newRowId(), ingredientId: null, name: "", lab: null, productId: null, attenuationMin: null, attenuationMax: null, ...row },
    ]);
  };

  const removeYeastRow = (id: string) => {
    setYeastRows((prev) => prev.filter((r) => r.id !== id));
    setYeastAttenuationOverrides((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateYeastRow = (id: string, patch: Partial<EditorYeastRow>) =>
    setYeastRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const onAttenuationOverrideChange = (id: string, value: string) =>
    setYeastAttenuationOverrides((prev) => ({ ...prev, [id]: value }));

  const yeastPitchRateOverrides = Object.fromEntries(yeastRows.filter((r) => r.pitchRate != null && String(r.pitchRate).trim()).map((r) => [r.id, String(r.pitchRate).trim()]));
  const yeastFermentationTempOverrides = Object.fromEntries(yeastRows.filter((r) => r.fermentationTempC != null && Number.isFinite(r.fermentationTempC) && r.fermentationTempC >= -10 && r.fermentationTempC <= 50).map((r) => [r.id, r.fermentationTempC as number]));
  const yeastOxygenationOverrides = Object.fromEntries(yeastRows.filter((r) => r.oxygenation === "yes" || r.oxygenation === "no").map((r) => [r.id, r.oxygenation as "yes" | "no"]));
  const yeastDiacetylRestOverrides = Object.fromEntries(yeastRows.filter((r) => r.diacetylRest === "yes" || r.diacetylRest === "no").map((r) => [r.id, r.diacetylRest as "yes" | "no"]));
  const yeastFormatOverrides = Object.fromEntries(yeastRows.filter((r) => r.format === "dry" || r.format === "liquid" || r.format === "slurry").map((r) => [r.id, r.format as "dry" | "liquid" | "slurry"]));
  const yeastSpeciesOverrides = Object.fromEntries(yeastRows.filter((r) => r.species && ["saccharomyces_cerevisiae", "saccharomyces_pastorianus", "brettanomyces", "diastaticus", "other"].includes(r.species)).map((r) => [r.id, r.species!]));
  const yeastNeedsPropagationOverrides = Object.fromEntries(yeastRows.filter((r) => r.needsPropagation === "yes" || r.needsPropagation === "no").map((r) => [r.id, r.needsPropagation as "yes" | "no"]));
  const yeastCellsPerLOverrides = Object.fromEntries(yeastRows.filter((r) => r.cellsPerLOverride != null && Number.isFinite(r.cellsPerLOverride) && r.cellsPerLOverride > 0).map((r) => [r.id, r.cellsPerLOverride as number]));
  const yeastCellsPerKGOverrides = Object.fromEntries(yeastRows.filter((r) => r.cellsPerKGOverride != null && Number.isFinite(r.cellsPerKGOverride) && r.cellsPerKGOverride > 0).map((r) => [r.id, r.cellsPerKGOverride as number]));
  const yeastManualCellCountOverrides = Object.fromEntries(
    yeastRows
      .filter(
        (r) =>
          r.manualCellCount != null &&
          (r.manualCellCount.dilutionFactor === 200 || r.manualCellCount.dilutionFactor === 2000) &&
          Number.isFinite(r.manualCellCount.aliveCells) &&
          r.manualCellCount.aliveCells > 0 &&
          Number.isFinite(r.manualCellCount.totalCells) &&
          r.manualCellCount.totalCells > 0 &&
          r.manualCellCount.aliveCells <= r.manualCellCount.totalCells,
      )
      .map((r) => [r.id, { dilutionFactor: r.manualCellCount!.dilutionFactor, aliveCells: r.manualCellCount!.aliveCells, totalCells: r.manualCellCount!.totalCells }]),
  );

  const onSave = async () => {
    if (!recipeId || !recipe || !api) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    setLowViabilityWarning(null);
    try {
      const baseRec = asRecord(recipe?.recipeExtJson);
      const extBaseForSave: Record<string, unknown> = baseRec ? { ...baseRec } : {};

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
      if (Object.keys(yeastAttenuationOverridesPercent).length) extBaseForSave.yeastAttenuationOverridesPercent = yeastAttenuationOverridesPercent;
      else delete extBaseForSave.yeastAttenuationOverridesPercent;
      if (Object.keys(yeastPitchRateOverrides).length) extBaseForSave.yeastPitchRateOverrides = yeastPitchRateOverrides;
      else delete extBaseForSave.yeastPitchRateOverrides;
      if (Object.keys(yeastFermentationTempOverrides).length) extBaseForSave.yeastFermentationTempOverrides = yeastFermentationTempOverrides;
      else delete extBaseForSave.yeastFermentationTempOverrides;
      if (Object.keys(yeastOxygenationOverrides).length) extBaseForSave.yeastOxygenationOverrides = yeastOxygenationOverrides;
      else delete extBaseForSave.yeastOxygenationOverrides;
      if (Object.keys(yeastDiacetylRestOverrides).length) extBaseForSave.yeastDiacetylRestOverrides = yeastDiacetylRestOverrides;
      else delete extBaseForSave.yeastDiacetylRestOverrides;
      if (Object.keys(yeastFormatOverrides).length) extBaseForSave.yeastFormatOverrides = yeastFormatOverrides;
      else delete extBaseForSave.yeastFormatOverrides;
      delete extBaseForSave.yeastTypeOverrides;
      if (Object.keys(yeastSpeciesOverrides).length) extBaseForSave.yeastSpeciesOverrides = yeastSpeciesOverrides;
      else delete extBaseForSave.yeastSpeciesOverrides;
      if (Object.keys(yeastNeedsPropagationOverrides).length) extBaseForSave.yeastNeedsPropagationOverrides = yeastNeedsPropagationOverrides;
      else delete extBaseForSave.yeastNeedsPropagationOverrides;
      if (Object.keys(yeastCellsPerLOverrides).length) extBaseForSave.yeastCellsPerLOverrides = yeastCellsPerLOverrides;
      else delete extBaseForSave.yeastCellsPerLOverrides;
      if (Object.keys(yeastCellsPerKGOverrides).length) extBaseForSave.yeastCellsPerKGOverrides = yeastCellsPerKGOverrides;
      else delete extBaseForSave.yeastCellsPerKGOverrides;
      if (Object.keys(yeastManualCellCountOverrides).length) extBaseForSave.yeastManualCellCountOverrides = yeastManualCellCountOverrides;
      else delete extBaseForSave.yeastManualCellCountOverrides;
      delete extBaseForSave.yeastCellsPerGOverrides;

      const batchSizeLiters = typeof extBaseForSave.batchSizeLiters === "number" ? extBaseForSave.batchSizeLiters : null;
      const brewhouseEfficiencyPercent = typeof extBaseForSave.brewhouseEfficiencyPercent === "number" ? extBaseForSave.brewhouseEfficiencyPercent : null;

      const beerJsonRecipeJson = buildBeerJsonRecipeDocument({
        name: recipe.name ?? "",
        notes: recipe.notes || null,
        gristRows,
        hopsRows,
        yeastRows,
        miscRows,
        mash: mash ?? undefined,
        batchSizeLiters,
        brewhouseEfficiencyPercent,
      });

      const recipeExtJson = buildRecipeExtJsonFromEditorState({
        gristRows,
        hopsRows,
        yeastRows,
        miscRows,
        extBase: extBaseForSave,
      });

      const res = await api.patch(`/api/recipes/${recipeId}`, {
        name: recipe.name,
        styleKey: recipe.styleKey,
        notes: recipe.notes ?? null,
        beerJsonRecipeJson,
        recipeExtJson,
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));

      const reload = await api.get(`/api/recipes/${recipeId}`);
      if (!reload.ok) throw new Error(JSON.stringify(reload.data));
      const r = (reload.data as { recipe: Recipe }).recipe;
      setRecipe(r);
      setSaveStatus(t("status.saved"));

      let minViability: number | null = null;
      for (const row of yeastRows) {
        if (row.format === "slurry" && row.manualCellCount && row.manualCellCount.totalCells > 0 && Number.isFinite(row.manualCellCount.aliveCells)) {
          const v = (row.manualCellCount.aliveCells / row.manualCellCount.totalCells) * 100;
          if (v < 85 && (minViability == null || v < minViability)) minViability = v;
        }
      }
      if (minViability != null) setLowViabilityWarning(minViability);
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const batchSizeForCells = asRecord(recipe?.recipeExtJson)?.batchSizeLiters ?? null;
  const analysisKettleVolume = recipe?.analysis?.result?.kettleVolumeLiters ?? null;
  const analysisOg = recipe?.analysis?.result?.ogEstimatedSg ?? null;
  const batchSizeForCellsVal =
    typeof batchSizeForCells === "number" && Number.isFinite(batchSizeForCells) && batchSizeForCells > 0
      ? batchSizeForCells
      : typeof analysisKettleVolume === "number" && Number.isFinite(analysisKettleVolume) && analysisKettleVolume > 0
        ? analysisKettleVolume
        : null;

  useEffect(() => {
    for (const r of yeastRows) {
      const format = r.format === "dry" || r.format === "liquid" || r.format === "slurry" ? r.format : null;
      const pitchRateValid = r.pitchRate && YEAST_PITCH_RATE_OPTIONS.some((o) => o.value === r.pitchRate);
      if (!format || !pitchRateValid || batchSizeForCellsVal == null || analysisOg == null) continue;
      const cellsB = computeEstimatedCellsB(batchSizeForCellsVal, analysisOg, r.pitchRate);
      if (cellsB == null) continue;
      const cellsPerLOverride =
        format === "slurry" && r.manualCellCount
          ? computeCellsPerLFromManualCount(r.manualCellCount)
          : r.cellsPerLOverride;
      const { amountL, amountKg } = computeAmountFromCellsB(
        cellsB,
        format,
        cellsPerLOverride,
        r.cellsPerKGOverride,
      );
      if (format === "dry" && amountKg != null) {
        const curr = r.amountKg != null && Number.isFinite(r.amountKg) ? r.amountKg : null;
        if (curr == null || Math.abs(curr - amountKg) > 0.0001) updateYeastRow(r.id, { amountKg });
      } else if (amountL != null) {
        const curr = r.amountL != null && Number.isFinite(r.amountL) ? r.amountL : null;
        if (curr == null || Math.abs(curr - amountL) > 0.0001) updateYeastRow(r.id, { amountL });
      }
    }
  }, [yeastRows, batchSizeForCellsVal, analysisOg]);

  if (!api) {
    return (
      <Screen>
        <Text fontSize={14} color="$red10">{tCommon("loading")}</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 16 }}>
          <Heading fontSize={28} mb="$2">
            {t("yeastPageTitle")}
          </Heading>
          <RecipeMetaLine recipeId={recipeId} enabled={!!recipeId} loadRecipeMeta={loadRecipeMeta} />

          {loadError ? (
            <Text fontSize={12} color="$red10">{loadError}</Text>
          ) : null}

          {loading ? (
            <Spinner />
          ) : recipe ? (
            <Card gap="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
              <Heading fontSize={18}>{t("yeastSectionHeading")}</Heading>
              <Text fontSize={12} opacity={0.8} mb="$2">
                {t("yeastHelp")}
              </Text>

              <View style={{ gap: 8, marginBottom: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
                <Input
                  value={yeastQuery}
                  onChangeText={setYeastQuery}
                  placeholder={t("yeastSearchLabel")}
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                  style={{ flex: 1, minWidth: 140 }}
                />
                <Button onPress={() => void searchYeasts()} disabled={yeastSearching} size="$3" background="$background" borderWidth={1} borderColor="$borderColor">
                  <Text>{yeastSearching ? "Searching…" : "Search"}</Text>
                </Button>
                <Button
                  onPress={() => {
                    setYeastQuery("");
                    setYeastResults([]);
                  }}
                  disabled={yeastSearching || (!yeastResults.length && !yeastQuery.trim())}
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Text>{t("buttons.clear")}</Text>
                </Button>
              </View>
              {yeastResults.length > 0 ? (
                <ScrollView horizontal style={{ marginBottom: 12 }} showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                    {yeastResults.slice(0, 20).map((it) => (
                      <Button
                        key={it.id}
                        onPress={() => {
                          const attMin = typeof it.attenuationMin === "number" && Number.isFinite(it.attenuationMin) ? it.attenuationMin : null;
                          const attMax = typeof it.attenuationMax === "number" && Number.isFinite(it.attenuationMax) ? it.attenuationMax : null;
                          addYeastRow({
                            ingredientId: it.id,
                            name: it.name,
                            lab: it.lab ?? null,
                            productId: it.productId ?? null,
                            attenuationMin: attMin ?? attMax,
                            attenuationMax: attMax ?? attMin,
                          });
                        }}
                        size="$2"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      >
                        <Text fontSize={12}>{it.name} {it.lab ? `(${it.lab})` : ""} — Add</Text>
                      </Button>
                    ))}
                  </View>
                </ScrollView>
              ) : null}

              <Button onPress={() => addYeastRow()} size="$3" background="$background" borderWidth={1} borderColor="$borderColor" mb="$2">
                <Text>{t("yeastAddCustomButton")}</Text>
              </Button>

              {yeastRows.map((r, idx) => (
                <Card key={r.id} gap="$2" mb="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text fontSize={14} fontWeight="600">{idx + 1}. {r.name || "(unnamed)"}</Text>
                    <Button onPress={() => removeYeastRow(r.id)} size="$2" chromeless>
                      <Text color="$red10">{t("yeastRemove")}</Text>
                    </Button>
                  </View>
                  <View style={{ gap: 12 }}>
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastNameLabel")}</Text>
                      <Input value={r.name} onChangeText={(text) => updateYeastRow(r.id, { name: text, ingredientId: null })} placeholder={t("yeastCustomNamePlaceholder")} size="$3" background="$background" borderWidth={1} borderColor="$borderColor" />
                    </View>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      <View style={{ minWidth: 140, flexGrow: 1 }}>
                        <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastLabLabel")}</Text>
                        <ReadOnlyField value={r.lab ?? ""} />
                      </View>
                      <View style={{ minWidth: 140, flexGrow: 1 }}>
                        <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastProductIdLabel")}</Text>
                        <ReadOnlyField value={r.productId ?? ""} />
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                        <Text fontSize={11} opacity={0.8} mb="$1" style={{ textAlign: "center" }}>{t("yeastAttenMinLabel")}</Text>
                        <ReadOnlyField
                          value={typeof r.attenuationMin === "number" && Number.isFinite(r.attenuationMin) ? formatFixed(locale, r.attenuationMin, 3) : ""}
                          textAlign="center"
                        />
                      </View>
                      <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                        <Text fontSize={11} opacity={0.8} mb="$1" style={{ textAlign: "center" }}>{t("yeastAttenMaxLabel")}</Text>
                        <ReadOnlyField
                          value={typeof r.attenuationMax === "number" && Number.isFinite(r.attenuationMax) ? formatFixed(locale, r.attenuationMax, 3) : ""}
                          textAlign="center"
                        />
                      </View>
                    </View>
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">{tAnalysis("customAttenuationPercentLabel")}</Text>
                      <Input value={yeastAttenuationOverrides[r.id] ?? ""} onChangeText={(text) => onAttenuationOverrideChange(r.id, text)} keyboardType="decimal-pad" placeholder="—" size="$3" background="$background" borderWidth={1} borderColor="$borderColor" />
                    </View>
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastFermentationTempLabel", { unit: tUnits("C") })}</Text>
                      <Input
                        value={r.fermentationTempC != null && Number.isFinite(r.fermentationTempC) ? String(r.fermentationTempC) : ""}
                        onChangeText={(text) => {
                          const trimmed = text.trim();
                          const parsed = trimmed === "" ? null : Number(trimmed);
                          updateYeastRow(r.id, { fermentationTempC: parsed != null && Number.isFinite(parsed) && parsed >= -10 && parsed <= 50 ? parsed : null });
                        }}
                        keyboardType="decimal-pad"
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      />
                    </View>
                    <View>
                      <PickerField label={t("yeastDiacetylRestLabel")} value={r.diacetylRest === "yes" || r.diacetylRest === "no" ? r.diacetylRest : ""} options={[{ value: "", label: "—" }, ...YES_NO_OPTIONS.map((o) => ({ value: o.value, label: o.value === "yes" ? t("yeastDiacetylRestYes") : t("yeastDiacetylRestNo") }))]} onChange={(v) => updateYeastRow(r.id, { diacetylRest: v === "yes" || v === "no" ? v : null })} closeLabel={tCommon("close")} />
                    </View>
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastAmountLabel", { unit: r.format === "dry" ? tUnits("kg") : tUnits("L") })}</Text>
                      {(() => {
                        const format = r.format === "dry" || r.format === "liquid" || r.format === "slurry" ? r.format : null;
                        const pitchRateSet = r.pitchRate && YEAST_PITCH_RATE_OPTIONS.some((o) => o.value === r.pitchRate);
                        const isComputed = format != null && pitchRateSet && batchSizeForCellsVal != null && analysisOg != null;
                        const amountDecimals = r.format === "dry" ? 3 : 2;
                        const rawVal =
                          r.format === "dry"
                            ? (r.amountKg != null && Number.isFinite(r.amountKg) ? r.amountKg : null)
                            : (r.amountL != null && Number.isFinite(r.amountL) ? r.amountL : null);
                        if (isComputed) {
                          return (
                            <ReadOnlyField
                              value={rawVal != null ? formatFixed(locale, rawVal, amountDecimals) : ""}
                            />
                          );
                        }
                        return (
                          <Input
                            value={
                              r.format === "dry"
                                ? (r.amountKg != null && Number.isFinite(r.amountKg) ? formatFixed(locale, r.amountKg, 3) : "")
                                : (r.amountL != null && Number.isFinite(r.amountL) ? formatFixed(locale, r.amountL, 2) : "")
                            }
                            onChangeText={(text) => {
                              const normalized = text.trim().replace(",", ".");
                              const n = normalized ? parseFloat(normalized) : null;
                              const valid = n != null && Number.isFinite(n) && n >= 0;
                              if (r.format === "dry") updateYeastRow(r.id, { amountKg: valid ? n : null });
                              else updateYeastRow(r.id, { amountL: valid ? n : null });
                            }}
                            keyboardType="decimal-pad"
                            placeholder="—"
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        );
                      })()}
                    </View>
                    <View>
                      <PickerField label={t("yeastOxygenationLabel")} value={r.oxygenation === "yes" || r.oxygenation === "no" ? r.oxygenation : ""} options={[{ value: "", label: "—" }, ...YES_NO_OPTIONS.map((o) => ({ value: o.value, label: o.value === "yes" ? t("yeastOxygenationYes") : t("yeastOxygenationNo") }))]} onChange={(v) => updateYeastRow(r.id, { oxygenation: v === "yes" || v === "no" ? v : null })} closeLabel={tCommon("close")} />
                    </View>

                    <Accordion
                      type="multiple"
                      value={openAdvancedSections[r.id] !== false ? [`advanced-${r.id}`] : []}
                      onValueChange={(v) =>
                        setOpenAdvancedSections((prev) => ({
                          ...prev,
                          [r.id]: Array.isArray(v) ? v.includes(`advanced-${r.id}`) : false,
                        }))
                      }
                      style={{ marginTop: 8 }}
                    >
                      <Accordion.Item value={`advanced-${r.id}`}>
                        <Accordion.Header>
                          <Accordion.Trigger unstyled>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderColor: "#2a2f3a" }}>
                              <Text fontSize={12} fontWeight="600">{t("yeastAdvancedSubsectionHeading")}</Text>
                              <Text opacity={0.7}>{openAdvancedSections[r.id] !== false ? "▾" : "▸"}</Text>
                            </View>
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content>
                          <View style={{ gap: 8, paddingTop: 8 }}>
                            <Text fontSize={12} color="$gray11" mb="$1">{t("yeastPitchRateAmountNote")}</Text>
                            <Text fontSize={12} color="$gray11" mb="$2">{t("yeastEstimatedCellsRecalcNote")}</Text>
                            <PickerField label={t("yeastFormatLabel")} value={r.format ?? ""} options={[{ value: "", label: "—" }, ...YEAST_FORMAT_OPTIONS.map((o) => ({ value: o.value, label: o.value === "dry" ? t("yeastFormatDry") : o.value === "liquid" ? t("yeastFormatLiquid") : t("yeastFormatSlurry") }))]} onChange={(v) => updateYeastRow(r.id, { format: v === "dry" || v === "liquid" || v === "slurry" ? v : null })} closeLabel={tCommon("close")} />
                            <PickerField
                              label={t("yeastPitchRateLabel")}
                              value={r.pitchRate ?? ""}
                              options={[{ value: "", label: `(${t("yeastPitchRateNone")})` }, ...YEAST_PITCH_RATE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))]}
                              onChange={(v) => updateYeastRow(r.id, { pitchRate: v || null })}
                              closeLabel={tCommon("close")}
                            />
                            <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastEstimatedCellsLabel")}</Text>
                          <ReadOnlyField
                            value={
                              batchSizeForCellsVal != null && analysisOg != null && r.format && r.pitchRate && YEAST_PITCH_RATE_OPTIONS.some((o) => o.value === r.pitchRate)
                                ? (() => {
                                    const cellsB = computeEstimatedCellsB(batchSizeForCellsVal, analysisOg, r.pitchRate);
                                    return cellsB != null ? t("yeastEstimatedCellsValue", { value: Math.round(cellsB) }) : "";
                                  })()
                                : ""
                            }
                          />
                        </View>
                        {(r.format === "liquid" || r.format === "slurry") ? (
                          <View>
                            <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastCellsPerLLabel")}</Text>
                            {r.format === "slurry" && r.manualCellCount && computeCellsPerLFromManualCount(r.manualCellCount) != null ? (
                              <ReadOnlyField value={String(Math.round(computeCellsPerLFromManualCount(r.manualCellCount)!))} />
                            ) : (
                              <Input
                                value={
                                  r.cellsPerLOverride != null && Number.isFinite(r.cellsPerLOverride)
                                    ? String(r.cellsPerLOverride)
                                    : r.format === "liquid"
                                      ? String(CELLS_PER_L_LIQUID)
                                      : String(CELLS_PER_L_SLURRY)
                                }
                                onChangeText={(text) => {
                                  const trimmed = text.trim();
                                  const parsed = trimmed === "" ? null : Number(trimmed);
                                  updateYeastRow(r.id, { cellsPerLOverride: parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : null });
                                }}
                                keyboardType="decimal-pad"
                                size="$3"
                                background="$background"
                                borderWidth={1}
                                borderColor="$borderColor"
                              />
                            )}
                          </View>
                        ) : r.format === "dry" ? (
                          <View>
                            <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastCellsPerKGLabel")}</Text>
                            <Input
                              value={
                                r.cellsPerKGOverride != null && Number.isFinite(r.cellsPerKGOverride)
                                  ? String(r.cellsPerKGOverride)
                                  : String(CELLS_PER_KG_DRY)
                              }
                              onChangeText={(text) => {
                                const trimmed = text.trim();
                                const parsed = trimmed === "" ? null : Number(trimmed);
                                updateYeastRow(r.id, { cellsPerKGOverride: parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : null });
                              }}
                              keyboardType="decimal-pad"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                        ) : null}
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                          <Text fontSize={11} color="$gray11">{t("yeastCellsPerDefaultNote")}</Text>
                          <Text fontSize={11} color="$gray11">{t("yeastCellsPerOverrideNote")}</Text>
                        </View>
                        {r.format === "slurry" ? (
                          <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: "#2a2f3a" }}>
                            <Text fontSize={12} fontWeight="600" mb="$1">{t("yeastManualCountSectionTitle")}</Text>
                            <Text fontSize={12} color="$gray11" mb="$1">{t("yeastManualCountFirstNote")}</Text>
                            <Text fontSize={12} color="$gray11" style={{ textDecorationLine: "underline" }} mb="$1">{t("yeastManualCountDisclaimer")}</Text>
                            <Text fontSize={12} color="$gray11" fontWeight="600" mb="$2">{t("yeastManualCountDirectlyInfluencesAmount")}</Text>
                            <View style={{ gap: 8 }}>
                              <View>
                                <PickerField
                                  label={t("yeastManualCountDFLabel")}
                                  value={r.manualCellCount?.dilutionFactor === 200 || r.manualCellCount?.dilutionFactor === 2000 ? String(r.manualCellCount.dilutionFactor) : ""}
                                  options={[{ value: "", label: "—" }, { value: "200", label: t("yeastManualCountDF200") }, { value: "2000", label: t("yeastManualCountDF2000") }]}
                                  onChange={(v) => {
                                    const df = v === "200" ? 200 : v === "2000" ? 2000 : null;
                                    if (df == null) {
                                      updateYeastRow(r.id, { manualCellCount: undefined });
                                      return;
                                    }
                                    const prev = r.manualCellCount;
                                    updateYeastRow(r.id, {
                                      manualCellCount: {
                                        dilutionFactor: df,
                                        aliveCells: prev?.aliveCells != null && prev.aliveCells > 0 ? prev.aliveCells : 0,
                                        totalCells: prev?.totalCells != null && prev.totalCells > 0 ? prev.totalCells : 0,
                                      },
                                    });
                                  }}
                                  closeLabel={tCommon("close")}
                                />
                              </View>
                              <View>
                                <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastManualCountAliveCellsLabel")}</Text>
                                <Input
                                  value={r.manualCellCount?.aliveCells != null && Number.isFinite(r.manualCellCount.aliveCells) ? String(Math.round(r.manualCellCount.aliveCells)) : ""}
                                  onChangeText={(text) => {
                                    const trimmed = text.trim();
                                    const parsed = trimmed === "" ? null : Number(trimmed);
                                    const alive = parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
                                    const df = r.manualCellCount?.dilutionFactor;
                                    if (df !== 200 && df !== 2000) return;
                                    const prevTotal = r.manualCellCount?.totalCells != null && r.manualCellCount.totalCells > 0 ? r.manualCellCount.totalCells : 0;
                                    updateYeastRow(r.id, { manualCellCount: { dilutionFactor: df, aliveCells: alive ?? 0, totalCells: prevTotal } });
                                  }}
                                  placeholder="—"
                                  keyboardType="number-pad"
                                  size="$3"
                                  background="$background"
                                  borderWidth={1}
                                  borderColor="$borderColor"
                                />
                              </View>
                              <View>
                                <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastManualCountTotalCellsLabel")}</Text>
                                <Input
                                  value={r.manualCellCount?.totalCells != null && Number.isFinite(r.manualCellCount.totalCells) ? String(Math.round(r.manualCellCount.totalCells)) : ""}
                                  onChangeText={(text) => {
                                    const trimmed = text.trim();
                                    const parsed = trimmed === "" ? null : Number(trimmed);
                                    const total = parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
                                    const df = r.manualCellCount?.dilutionFactor;
                                    if (df !== 200 && df !== 2000) return;
                                    const prevAlive = r.manualCellCount?.aliveCells != null && r.manualCellCount.aliveCells >= 0 ? r.manualCellCount.aliveCells : 0;
                                    updateYeastRow(r.id, { manualCellCount: { dilutionFactor: df, aliveCells: prevAlive, totalCells: total ?? 0 } });
                                  }}
                                  placeholder="—"
                                  keyboardType="number-pad"
                                  size="$3"
                                  background="$background"
                                  borderWidth={1}
                                  borderColor="$borderColor"
                                />
                              </View>
                              {r.manualCellCount && r.manualCellCount.totalCells > 0 && Number.isFinite(r.manualCellCount.aliveCells) ? (
                                <View>
                                  <Text fontSize={11} opacity={0.8} mb="$1">{t("yeastManualCountViabilityLabel")}</Text>
                                  <ReadOnlyField
                                    value={
                                      (() => {
                                        const raw = (r.manualCellCount.aliveCells / r.manualCellCount.totalCells) * 100;
                                        return raw <= 100 ? `${Math.min(100, raw).toFixed(1)}%` : "";
                                      })()
                                    }
                                  />
                                </View>
                              ) : null}
                            </View>
                          </View>
                        ) : null}
                        <PickerField label={t("yeastSpeciesLabel")} value={r.species ?? ""} options={[{ value: "", label: "—" }, ...SPECIES_OPTIONS]} onChange={(v) => updateYeastRow(r.id, { species: v && ["saccharomyces_cerevisiae", "saccharomyces_pastorianus", "brettanomyces", "diastaticus", "other"].includes(v) ? (v as NonNullable<EditorYeastRow["species"]>) : null })} closeLabel={tCommon("close")} />
                        <PickerField label={t("yeastNeedsPropagationLabel")} value={r.needsPropagation ?? ""} options={[{ value: "", label: "—" }, ...YES_NO_OPTIONS.map((o) => ({ value: o.value, label: o.value === "yes" ? t("yeastNeedsPropagationYes") : t("yeastNeedsPropagationNo") }))]} onChange={(v) => updateYeastRow(r.id, { needsPropagation: v === "yes" || v === "no" ? v : null })} closeLabel={tCommon("close")} />
                          </View>
                        </Accordion.Content>
                      </Accordion.Item>
                    </Accordion>
                  </View>
                </Card>
              ))}

              <Button onPress={() => void onSave()} disabled={saving} size="$3" background="$background" borderWidth={1} borderColor="$borderColor" mt="$2">
                <Text>{saving ? "Saving…" : t("yeastSaveButton")}</Text>
              </Button>
              {saveStatus ? <Text fontSize={12} color="$green10">{saveStatus}</Text> : null}
              {lowViabilityWarning != null ? <Text fontSize={12} color="$yellow10">Low viability warning: {lowViabilityWarning.toFixed(1)}% (slurry + manual cell count &lt; 85%)</Text> : null}
              {saveError ? <Text fontSize={12} color="$red10">{saveError}</Text> : null}
            </Card>
          ) : null}

          <ManualCellCountHelpBox
            renderImage={({ assetKey, alt, width, height }) =>
              isMediaAssetKey(assetKey) ? (
                <RemoteImage
                  assetKey={assetKey}
                  accessibilityLabel={alt}
                  unavailableText={alt}
                  width={width}
                  height={height}
                />
              ) : null
            }
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
