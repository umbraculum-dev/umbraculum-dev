import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { bearerTokenAuth, createApiClient } from "@brewery/api-client";
import {
  buildBeerJsonRecipeDocument,
  buildRecipeExtJsonFromEditorState,
  editorStateFromBeerJson,
  type EditorGristRow,
  type EditorHopRow,
  type EditorYeastRow,
} from "@brewery/beerjson";
import { useT } from "@brewery/i18n-react";
import { Accordion, Input, TextArea } from "tamagui";
import { Button, Card, Heading, Screen, Spinner, Text } from "@brewery/ui";

import { AdSlot } from "../components/AdSlot";
import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";
import { useLocaleController } from "../i18n/I18nProvider";

function newRowId(): string {
  try {
    const g = globalThis as { crypto?: { randomUUID?: () => string } };
    return g.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

type PickerOption = { value: string; label: string };

function roundTo(n: number, decimals: number) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function formatFixed(locale: string, value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function inferMaltClass(
  group: string | null | undefined,
  fermentableName: string
): EditorGristRow["maltClass"] {
  const g = (group ?? "").toLowerCase();
  const n = (fermentableName ?? "").toLowerCase();
  if (g.includes("caramel") || g.includes("crystal")) return "crystal";
  if (g.includes("roast") || g.includes("roasted")) return "roast";
  if (n.includes("acid")) return "acid";
  return "base";
}

function PickerField(props: {
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (nextValue: string) => void;
  placeholder?: string;
  modalTitle?: string;
  closeLabel: string;
  accessibilityLabel?: string;
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
        accessibilityLabel={props.accessibilityLabel ?? props.label}
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
              <Heading fontSize={16}>{props.modalTitle ?? props.label}</Heading>
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

type Recipe = {
  id: string;
  name: string;
  style: string | null;
  styleKey?: string | null;
  notes: string | null;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
};

type StyleListItem = { key: string; name: string; code: string; sortOrder: number };

type EquipmentProfile = {
  id: string;
  name: string;
  equipment: { kettle: Record<string, unknown>; mash: Record<string, unknown>; misc: Record<string, unknown> };
};

type FermentableSearchItem = {
  id: string;
  name: string;
  producer?: string | null;
  group?: string | null;
  colorLovibond?: number | null;
  yieldPercent?: number | null;
  ppg?: number | null;
};

type HopSearchItem = {
  id: string;
  name: string;
  country?: string | null;
  alphaMin?: number | null;
  alphaMax?: number | null;
};

type YeastSearchItem = {
  id: string;
  name: string;
  lab?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
};

const MALT_CLASS_OPTIONS: { value: EditorGristRow["maltClass"]; label: string }[] = [
  { value: "base", label: "Base" },
  { value: "crystal", label: "Crystal" },
  { value: "roast", label: "Roast" },
  { value: "acid", label: "Acid malt" },
];

const HOP_USE_OPTIONS: { value: EditorHopRow["use"]; label: string }[] = [
  { value: "boil", label: "Boil" },
  { value: "whirlpool", label: "Whirlpool" },
  { value: "dryhop", label: "Dry hop" },
];

const HOP_FORM_OPTIONS: { value: EditorHopRow["form"]; label: string }[] = [
  { value: "pellet", label: "Pellet" },
  { value: "leaf", label: "Leaf" },
  { value: "extract", label: "Extract" },
  { value: "powder", label: "Powder" },
  { value: "plug", label: "Plug" },
];

const YEAST_FORMAT_OPTIONS: { value: NonNullable<EditorYeastRow["format"]>; label: string }[] = [
  { value: "dry", label: "Dry" },
  { value: "liquid", label: "Liquid" },
  { value: "slurry", label: "Slurry" },
];

export function RecipeEditScreen() {
  const auth = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const recipeId = (route.params as { recipeId?: string })?.recipeId ?? "";
  const { t } = useT("recipes.edit");
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

  const [yeastQuery, setYeastQuery] = useState("");
  const [yeastResults, setYeastResults] = useState<YeastSearchItem[]>([]);
  const [yeastSearching, setYeastSearching] = useState(false);
  const [yeastAmountTextById, setYeastAmountTextById] = useState<Record<string, string>>({});

  const [equipmentProfiles, setEquipmentProfiles] = useState<EquipmentProfile[]>([]);
  const [equipmentProfilesLoading, setEquipmentProfilesLoading] = useState(false);
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

  const canCall = auth.state.status === "logged_in" && Boolean(baseUrl) && Boolean(token);

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return createApiClient(baseUrl, bearerTokenAuth(() => token));
  }, [baseUrl, token]);

  const loadRecipe = useCallback(async () => {
    if (!api || !recipeId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.get(`/api/recipes/${recipeId}`);
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const r = (res.data as any)?.recipe;
      if (!r) throw new Error("Recipe not found");
      setRecipe(r);
      setName(typeof r.name === "string" ? r.name : "");
      setStyleKey(typeof r.styleKey === "string" ? r.styleKey : "custom");
      setNotes(typeof r.notes === "string" ? r.notes : "");

      const ext = (r as any).recipeExtJson;
      const links = ext && typeof ext === "object" ? (ext as any).ingredientLinks : null;
      const yeastOverridesRaw = ext && typeof ext === "object" ? (ext as any).yeastAttenuationOverridesPercent : null;
      if (yeastOverridesRaw && typeof yeastOverridesRaw === "object") {
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(yeastOverridesRaw as any)) {
          if (typeof k === "string" && typeof v === "number" && Number.isFinite(v)) out[k] = String(v);
        }
        setYeastAttenuationOverrides(out);
      } else {
        setYeastAttenuationOverrides({});
      }

      const yeastFermentationTempRaw = ext && typeof ext === "object" ? (ext as any).yeastFermentationTempOverrides : null;
      const yeastOxygenationRaw = ext && typeof ext === "object" ? (ext as any).yeastOxygenationOverrides : null;
      const yeastDiacetylRestRaw = ext && typeof ext === "object" ? (ext as any).yeastDiacetylRestOverrides : null;
      const yeastFormatRaw =
        ext && typeof ext === "object" ? (ext as any).yeastFormatOverrides ?? (ext as any).yeastTypeOverrides : null;

      const equipmentSource = ext && typeof ext === "object" ? (ext as any).equipmentSource : null;
      const equipmentProfileId =
        equipmentSource && typeof equipmentSource === "object" && typeof (equipmentSource as any).equipmentProfileId === "string"
          ? (equipmentSource as any).equipmentProfileId
          : "";
      setSelectedEquipmentProfileId(equipmentProfileId);

      const boilTimeMinutesOverride =
        ext && typeof ext === "object" && typeof (ext as any).boilTimeMinutesOverride === "number" && Number.isFinite((ext as any).boilTimeMinutesOverride)
          ? (ext as any).boilTimeMinutesOverride
          : null;
      if (boilTimeMinutesOverride != null && boilTimeMinutesOverride >= 0) {
        setBoilTimeMinutes(String(Math.round(boilTimeMinutesOverride)));
      } else {
        setBoilTimeMinutes("60");
      }

      if (!(r as any).beerJsonRecipeJson) {
        setGristRows([]);
        setHopsRows([]);
        setYeastRows([]);
        return;
      }
      const s = editorStateFromBeerJson((r as any).beerJsonRecipeJson);
      setGristRows(s.gristRows);
      setHopsRows(s.hopsRows);
      const mappedYeastRows: EditorYeastRow[] = s.yeastRows.map((row) => {
        const fermentationTempC =
          yeastFermentationTempRaw &&
          typeof yeastFermentationTempRaw === "object" &&
          typeof (yeastFermentationTempRaw as any)[row.id] === "number" &&
          Number.isFinite((yeastFermentationTempRaw as any)[row.id])
            ? ((yeastFermentationTempRaw as any)[row.id] as number)
            : null;
        const oxygenation =
          yeastOxygenationRaw &&
          typeof yeastOxygenationRaw === "object" &&
          (((yeastOxygenationRaw as any)[row.id] as any) === "yes" ||
            ((yeastOxygenationRaw as any)[row.id] as any) === "no")
            ? ((yeastOxygenationRaw as any)[row.id] as "yes" | "no")
            : null;
        const diacetylRest =
          yeastDiacetylRestRaw &&
          typeof yeastDiacetylRestRaw === "object" &&
          (((yeastDiacetylRestRaw as any)[row.id] as any) === "yes" ||
            ((yeastDiacetylRestRaw as any)[row.id] as any) === "no")
            ? ((yeastDiacetylRestRaw as any)[row.id] as "yes" | "no")
            : null;
        const formatOverride =
          yeastFormatRaw &&
          typeof yeastFormatRaw === "object" &&
          (((yeastFormatRaw as any)[row.id] as any) === "dry" ||
            ((yeastFormatRaw as any)[row.id] as any) === "liquid" ||
            ((yeastFormatRaw as any)[row.id] as any) === "slurry")
            ? ((yeastFormatRaw as any)[row.id] as "dry" | "liquid" | "slurry")
            : null;

        const inferredFormat: NonNullable<EditorYeastRow["format"]> =
          formatOverride ??
          (row.format === "dry" || row.format === "liquid" || row.format === "slurry" ? row.format : null) ??
          (row.amountKg != null && Number.isFinite(row.amountKg) ? "dry" : "liquid");

        return {
          ...row,
          ingredientId: typeof links?.yeast?.[row.id] === "string" ? (links.yeast[row.id] as string) : null,
          fermentationTempC: fermentationTempC ?? undefined,
          oxygenation: oxygenation ?? undefined,
          diacetylRest: diacetylRest ?? undefined,
          format: inferredFormat,
        } as EditorYeastRow;
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
      const res = await api.get("/api/styles");
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const items = (res.data as any)?.styles;
      setStyles(Array.isArray(items) ? items : []);
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
      const res = await api.get("/api/equipment-profiles");
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const items = (res.data as any)?.profiles;
      setEquipmentProfiles(Array.isArray(items) ? items : []);
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

  const searchFermentables = useCallback(async () => {
    if (!api) return;
    setFermentableSearching(true);
    setFermentableSearchError(null);
    try {
      const q = fermentableQuery.trim() ? `?query=${encodeURIComponent(fermentableQuery.trim())}&limit=20` : "?limit=20";
      const res = await api.get(`/api/ingredients/fermentables${q}`);
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const items = (res.data as any)?.items ?? [];
      setFermentableResults(Array.isArray(items) ? items : []);
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
      const q = hopQuery.trim() ? `?query=${encodeURIComponent(hopQuery.trim())}&limit=20` : "?limit=20";
      const res = await api.get(`/api/ingredients/hops${q}`);
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const items = (res.data as any)?.items ?? [];
      setHopResults(Array.isArray(items) ? items : []);
    } catch (err) {
      setHopSearchError(String(err));
      setHopResults([]);
    } finally {
      setHopSearching(false);
    }
  }, [api, hopQuery]);

  const searchYeasts = useCallback(async () => {
    if (!api) return;
    setYeastSearching(true);
    try {
      const q = yeastQuery.trim() ? `?query=${encodeURIComponent(yeastQuery.trim())}` : "";
      const res = await api.get(`/api/ingredients/yeasts${q}`);
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const items = (res.data as any)?.items ?? [];
      setYeastResults(Array.isArray(items) ? items : []);
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
      } as EditorGristRow,
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
      } as EditorGristRow,
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
      } as EditorHopRow,
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
      } as EditorHopRow,
    ]);
  }, []);

  const updateHopRow = useCallback((id: string, patch: Partial<EditorHopRow>) => {
    setHopsRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const removeHopRow = useCallback((id: string) => {
    setHopsRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addYeastRow = useCallback(() => {
    setYeastRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        amountL: null,
        amountKg: null,
        format: "liquid",
      } as EditorYeastRow,
    ]);
  }, []);

  const addYeastFromDb = useCallback((item: YeastSearchItem) => {
    const att = typeof item.attenuationMin === "number" && Number.isFinite(item.attenuationMin)
      ? item.attenuationMin
      : typeof item.attenuationMax === "number" && Number.isFinite(item.attenuationMax)
        ? item.attenuationMax
        : null;
    setYeastRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: item.id,
        name: item.name,
        lab: item.lab ?? null,
        attenuationMin: att,
        attenuationMax: att,
        amountL: null,
        amountKg: null,
        format: "liquid",
      } as EditorYeastRow,
    ]);
  }, []);

  const updateYeastRow = useCallback((id: string, patch: Partial<EditorYeastRow>) => {
    setYeastRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const removeYeastRow = useCallback((id: string) => {
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

        const extBase = (recipe as any)?.recipeExtJson;
        const base = extBase && typeof extBase === "object" && !Array.isArray(extBase) ? { ...(extBase as any) } : ({} as any);
        base.version = 1;
        base.equipment = selected.equipment;
        base.equipmentSource = { equipmentProfileId: selected.id, copiedAt: new Date().toISOString() };

        const res = await api.patch(`/api/recipes/${recipeId}`, { recipeExtJson: base });
        if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));

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
      const extBase = (recipe as any)?.recipeExtJson;
      const extBaseForSave = extBase && typeof extBase === "object" && !Array.isArray(extBase) ? { ...(extBase as any) } : ({} as any);

      const boilTimeMinutesVal = (() => {
        const trimmed = boilTimeMinutes.trim();
        if (!trimmed) return null;
        const n = Number(trimmed);
        if (!Number.isFinite(n) || n < 0 || n > 600) return null;
        return Math.round(n);
      })();
      if (boilTimeMinutesVal != null) {
        extBaseForSave.boilTimeMinutesOverride = boilTimeMinutesVal;
      } else {
        delete extBaseForSave.boilTimeMinutesOverride;
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
        extBaseForSave.yeastAttenuationOverridesPercent = yeastAttenuationOverridesPercent;
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

      if (Object.keys(yeastFermentationTempOverrides).length) extBaseForSave.yeastFermentationTempOverrides = yeastFermentationTempOverrides;
      else delete extBaseForSave.yeastFermentationTempOverrides;

      if (Object.keys(yeastOxygenationOverrides).length) extBaseForSave.yeastOxygenationOverrides = yeastOxygenationOverrides;
      else delete extBaseForSave.yeastOxygenationOverrides;

      if (Object.keys(yeastDiacetylRestOverrides).length) extBaseForSave.yeastDiacetylRestOverrides = yeastDiacetylRestOverrides;
      else delete extBaseForSave.yeastDiacetylRestOverrides;

      if (Object.keys(yeastFormatOverrides).length) extBaseForSave.yeastFormatOverrides = yeastFormatOverrides;
      else delete extBaseForSave.yeastFormatOverrides;

      delete extBaseForSave.yeastTypeOverrides;

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

      const res = await api.patch(`/api/recipes/${recipeId}`, payload);
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
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

  if (!canCall) {
    return (
      <Screen>
        <Text fontSize={14} color="$red10">
          Not authenticated or missing API base URL.
        </Text>
      </Screen>
    );
  }

  if (loading && !recipe) {
    return (
      <Screen>
        <View style={{ paddingVertical: 48, alignItems: "center" }}>
          <Spinner />
          <Text fontSize={14} opacity={0.8} mt="$2">
            {t("loading")}
          </Text>
        </View>
      </Screen>
    );
  }

  if (loadError || !recipe) {
    return (
      <Screen>
        <Heading fontSize={22}>Error</Heading>
        <Text fontSize={14} color="$red10">
          {loadError ?? "Recipe not found"}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {(saveStatus || saveError) ? (
          <Card gap="$2" mb="$3" bg={saveError ? "rgba(255,80,80,0.15)" : "rgba(80,200,80,0.15)"}>
            {saveStatus ? <Text fontSize={14}>{saveStatus}</Text> : null}
            {saveError ? <Text fontSize={14} color="$red10">{saveError}</Text> : null}
          </Card>
        ) : null}

        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : (next ? [next] : []))}
        >
          <Accordion.Item value="basics">
            <Card gap="$2" aria-label={t("sections.basics")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.basics")}
                  accessibilityState={{ expanded: openSections.includes("basics") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.basics")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("basics") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 12, marginTop: 12 }}>
                  <View>
                    <Text fontSize={12} opacity={0.8} mb="$1">
                      Name
                    </Text>
                    <Input
                      value={name}
                      onChangeText={setName}
                      placeholder="Recipe name"
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={12} opacity={0.8} mb="$1">
                      {t("sections.basics")} — Style
                    </Text>
                    <Button
                      onPress={() => setStylePickerOpen(true)}
                      disabled={stylesLoading || styles.length === 0}
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      width="100%"
                      p="$3"
                      accessibilityRole="button"
                      accessibilityLabel={selectedStyleLabel}
                    >
                      <Text fontSize={14}>{selectedStyleLabel}</Text>
                    </Button>
                  </View>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="fermentables">
            <Card gap="$2" mt="$3" aria-label={t("sections.fermentables")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.fermentables")}
                  accessibilityState={{ expanded: openSections.includes("fermentables") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.fermentables")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("fermentables") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <Text fontSize={12} opacity={0.8} mb="$2">
                    Enter your grist here.
                  </Text>
                  <View style={{ gap: 8, marginBottom: 12 }}>
                    <Input
                      value={fermentableQuery}
                      onChangeText={setFermentableQuery}
                      placeholder="Search fermentables"
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button onPress={() => void searchFermentables()} disabled={fermentableSearching} size="$3">
                        <Text>{fermentableSearching ? "Searching…" : "Search"}</Text>
                      </Button>
                      <Button
                        onPress={() => {
                          setFermentableQuery("");
                          setFermentableResults([]);
                        }}
                        disabled={fermentableSearching}
                        size="$3"
                        chromeless
                      >
                        <Text>{t("buttons.clear")}</Text>
                      </Button>
                    </View>
                  </View>
                  {fermentableSearchError ? (
                    <Text fontSize={12} color="$red10" mb="$2">
                      {fermentableSearchError}
                    </Text>
                  ) : null}
                  {fermentableResults.length > 0 ? (
                    <ScrollView horizontal style={{ marginBottom: 12 }} showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        {fermentableResults.slice(0, 20).map((it) => (
                          <Button
                            key={it.id}
                            onPress={() => addFermentableFromDb(it)}
                            size="$2"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          >
                            <Text fontSize={12}>
                              {it.name} {it.producer ? `(${it.producer})` : ""} — Add
                            </Text>
                          </Button>
                        ))}
                      </View>
                    </ScrollView>
                  ) : null}
                  <View style={{ marginTop: 8 }}>
                    <Button onPress={addGristRow} size="$3" background="$background" borderWidth={1} borderColor="$borderColor">
                      <Text>{t("buttons.addCustomFermentable")}</Text>
                    </Button>
                  </View>
                  <View style={{ height: 1, backgroundColor: "#2a2f3a", marginVertical: 12 }} />
                  <Text fontSize={12} opacity={0.8} style={{ marginBottom: 12 }}>
                    {t("gristTotalKg", { value: gristTotals.totalKg.toFixed(3), unit: tUnits("kg") })}
                    {gristTotals.weightedAvgLovibond != null
                      ? ` · ${t("gristAvgColor", { value: gristTotals.weightedAvgLovibond.toFixed(1), unit: tUnits("lovibond") })}`
                      : ""}
                  </Text>
                  <Accordion
                    type="multiple"
                    value={openFermentableIds}
                    onValueChange={(next) => setOpenFermentableIds(Array.isArray(next) ? next : next ? [next] : [])}
                  >
                    {gristRows.map((r, idx) => (
                      <Accordion.Item key={r.id} value={`grist-${r.id}`}>
                        <Card gap="$2" mb="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
                          <Accordion.Header>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                              <Accordion.Trigger
                                flex={1}
                                unstyled
                                accessibilityRole="button"
                                accessibilityLabel={`${idx + 1}. ${r.name || "(unnamed)"}`}
                                accessibilityState={{ expanded: openFermentableIds.includes(`grist-${r.id}`) }}
                              >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                  <Text fontSize={14} fontWeight="600">
                                    {idx + 1}. {r.name || "(unnamed)"}
                                  </Text>
                                  <Text fontSize={14} opacity={0.7}>
                                    {openFermentableIds.includes(`grist-${r.id}`) ? "▾" : "▸"}
                                  </Text>
                                </View>
                              </Accordion.Trigger>
                              <Button onPress={() => removeGristRow(r.id)} size="$2" chromeless>
                                <Text color="$red10">{tCommon("remove")}</Text>
                              </Button>
                            </View>
                          </Accordion.Header>
                          <Accordion.Content>
                            <View style={{ gap: 8, marginTop: 12 }}>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            Name
                          </Text>
                          <Input
                            value={r.name}
                            onChangeText={(text) =>
                              updateGristRow(r.id, { name: text, ingredientId: undefined, producer: null, group: null })
                            }
                            placeholder="Fermentable name"
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        </View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <View style={{ flex: 1 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              {t("amountLabel", { unit: tUnits("kg") })}
                            </Text>
                            <Input
                              value={String(r.amountKg)}
                              onChangeText={(text) => {
                                const n = parseFloat(text);
                                updateGristRow(r.id, { amountKg: Number.isFinite(n) ? n : 0 });
                              }}
                              placeholder="0"
                              keyboardType="decimal-pad"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              {t("colorLabel", { unit: "°L" })}
                            </Text>
                            <Input
                              value={r.colorLovibond != null ? String(r.colorLovibond) : ""}
                              onChangeText={(text) => {
                                const n = text.trim() ? parseFloat(text) : null;
                                updateGristRow(r.id, { colorLovibond: n != null && Number.isFinite(n) ? n : null });
                              }}
                              placeholder="—"
                              keyboardType="decimal-pad"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                        </View>
                        <PickerField
                          label={t("fermentables.mashPhClassLegacyLabel")}
                          value={r.maltClass ?? "base"}
                          options={MALT_CLASS_OPTIONS as unknown as PickerOption[]}
                          onChange={(v) => updateGristRow(r.id, { maltClass: v as EditorGristRow["maltClass"] })}
                          closeLabel={tCommon("close")}
                          accessibilityLabel={t("fermentables.mashPhClassLegacyLabel")}
                        />
                        <PickerField
                          label={t("fermentableTimingLabel")}
                          value={r.timingUse ?? "add_to_mash"}
                          options={[
                            { value: "add_to_mash", label: t("fermentableTimingMash") },
                            { value: "add_to_boil", label: t("fermentableTimingKettle") },
                          ]}
                          onChange={(v) =>
                            updateGristRow(r.id, { timingUse: v === "add_to_boil" ? "add_to_boil" : "add_to_mash" })
                          }
                          closeLabel={tCommon("close")}
                          accessibilityLabel={t("fermentableTimingLabel")}
                        />
                        {(r.group ?? "") ? (
                          <View>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              {t("fermentables.groupLabel")}
                            </Text>
                            <Input
                              value={r.group ?? ""}
                              disabled
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                        ) : null}
                        <View>
                          <PickerField
                            label={t("fermentables.potentialKindLabel")}
                            value={r.potential?.kind ?? ""}
                            options={[
                              { value: "", label: "(none)" },
                              { value: "ppg", label: "PPG" },
                              { value: "yieldPercent", label: "Yield %" },
                              { value: "sg", label: "SG (e.g. 1.037)" },
                              { value: "plato", label: "Plato (°P)" },
                            ]}
                            onChange={(v) => {
                              const kind = v as "" | NonNullable<EditorGristRow["potential"]>["kind"];
                              if (!kind) return updateGristRow(r.id, { potential: null });
                              updateGristRow(r.id, { potential: { kind, value: roundTo(r.potential?.value ?? 0, 3) } as any });
                            }}
                            closeLabel={tCommon("close")}
                            accessibilityLabel={t("fermentables.potentialKindLabel")}
                          />
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {t("fermentables.potentialValueLabel")}
                          </Text>
                          <Input
                            value={r.potential ? String(roundTo(r.potential.value, 3)) : ""}
                            onChangeText={(text) => {
                              if (!r.potential) return;
                              const v = text === "" ? null : Number(text);
                              if (v === null) return updateGristRow(r.id, { potential: null });
                              updateGristRow(r.id, { potential: { ...r.potential, value: roundTo(v, 3) } as any });
                            }}
                            placeholder="—"
                            keyboardType="decimal-pad"
                            disabled={!r.potential}
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        </View>
                      </View>
                          </Accordion.Content>
                        </Card>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </View>
                <AdSlot placement="recipe_edit_after_fermentables" />
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="hops">
            <Card gap="$2" mt="$3" aria-label={t("sections.hops")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.hops")}
                  accessibilityState={{ expanded: openSections.includes("hops") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.hops")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("hops") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <Text fontSize={12} opacity={0.8} mb="$2">
                    {t("hopsHelp")}
                  </Text>
                  <View style={{ gap: 8, marginBottom: 12 }}>
                    <Input
                      value={hopQuery}
                      onChangeText={setHopQuery}
                      placeholder="Search hops"
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button onPress={() => void searchHops()} disabled={hopSearching} size="$3">
                        <Text>{hopSearching ? "Searching…" : "Search"}</Text>
                      </Button>
                      <Button
                        onPress={() => {
                          setHopQuery("");
                          setHopResults([]);
                        }}
                        disabled={hopSearching}
                        size="$3"
                        chromeless
                      >
                        <Text>{t("buttons.clear")}</Text>
                      </Button>
                    </View>
                  </View>
                  {hopSearchError ? (
                    <Text fontSize={12} color="$red10" mb="$2">
                      {hopSearchError}
                    </Text>
                  ) : null}
                  {hopResults.length > 0 ? (
                    <ScrollView horizontal style={{ marginBottom: 12 }} showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        {hopResults.slice(0, 20).map((it) => (
                          <Button
                            key={it.id}
                            onPress={() => addHopFromDb(it)}
                            size="$2"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          >
                            <Text fontSize={12}>
                              {it.name} {it.country ? `(${it.country})` : ""} — Add
                            </Text>
                          </Button>
                        ))}
                      </View>
                    </ScrollView>
                  ) : null}
                  <Button onPress={addHopRow} size="$3" background="$background" borderWidth={1} borderColor="$borderColor" mb="$2">
                    <Text>Add hop</Text>
                  </Button>
                  <Accordion
                    type="multiple"
                    value={openHopIds}
                    onValueChange={(next) => setOpenHopIds(Array.isArray(next) ? next : next ? [next] : [])}
                  >
                    {hopsRows.map((r, idx) => (
                      <Accordion.Item key={r.id} value={`hop-${r.id}`}>
                        <Card gap="$2" mb="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
                          <Accordion.Header>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                              <Accordion.Trigger
                                flex={1}
                                unstyled
                                accessibilityRole="button"
                                accessibilityLabel={`${idx + 1}. ${r.name || "(unnamed)"}`}
                                accessibilityState={{ expanded: openHopIds.includes(`hop-${r.id}`) }}
                              >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                  <Text fontSize={14} fontWeight="600">
                                    {idx + 1}. {r.name || "(unnamed)"}
                                  </Text>
                                  <Text fontSize={14} opacity={0.7}>
                                    {openHopIds.includes(`hop-${r.id}`) ? "▾" : "▸"}
                                  </Text>
                                </View>
                              </Accordion.Trigger>
                              <Button onPress={() => removeHopRow(r.id)} size="$2" chromeless>
                                <Text color="$red10">{tCommon("remove")}</Text>
                              </Button>
                            </View>
                          </Accordion.Header>
                          <Accordion.Content>
                            <View style={{ gap: 8, marginTop: 12 }}>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            Name
                          </Text>
                          <Input
                            value={r.name}
                            onChangeText={(text) => updateHopRow(r.id, { name: text, ingredientId: null, country: null })}
                            placeholder="Hop name"
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        </View>
                        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                          <View style={{ flex: 1, minWidth: 80 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              Amount (g)
                            </Text>
                            <Input
                              value={String(r.amountGrams)}
                              onChangeText={(text) => {
                                const n = parseFloat(text);
                                updateHopRow(r.id, { amountGrams: Number.isFinite(n) ? n : 0 });
                              }}
                              placeholder="0"
                              keyboardType="decimal-pad"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                          <View style={{ flex: 1, minWidth: 80 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              α %
                            </Text>
                            <Input
                              value={r.alphaAcidPercent != null ? String(r.alphaAcidPercent) : ""}
                              onChangeText={(text) => {
                                const n = text.trim() ? parseFloat(text) : null;
                                updateHopRow(r.id, { alphaAcidPercent: n != null && Number.isFinite(n) ? n : null });
                              }}
                              placeholder="—"
                              keyboardType="decimal-pad"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                          <View style={{ flex: 1, minWidth: 80 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              Time (min)
                            </Text>
                            <Input
                              value={r.timeMinutes != null ? String(r.timeMinutes) : ""}
                              onChangeText={(text) => {
                                const n = text.trim() ? parseFloat(text) : null;
                                updateHopRow(r.id, { timeMinutes: n != null && Number.isFinite(n) ? n : null });
                              }}
                              placeholder="60"
                              keyboardType="number-pad"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                        </View>
                        <View>
                          <PickerField
                            label="Use"
                            value={r.use ?? "boil"}
                            options={HOP_USE_OPTIONS as unknown as PickerOption[]}
                            onChange={(v) => updateHopRow(r.id, { use: v as EditorHopRow["use"] })}
                            closeLabel={tCommon("close")}
                            accessibilityLabel="Use"
                          />
                        </View>
                        <View>
                          <PickerField
                            label="Form"
                            value={r.form ?? "pellet"}
                            options={HOP_FORM_OPTIONS as unknown as PickerOption[]}
                            onChange={(v) => updateHopRow(r.id, { form: v as EditorHopRow["form"] })}
                            closeLabel={tCommon("close")}
                            accessibilityLabel="Form"
                          />
                        </View>
                      </View>
                          </Accordion.Content>
                        </Card>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="yeast">
            <Card gap="$2" mt="$3" aria-label={t("sections.yeast")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.yeast")}
                  accessibilityState={{ expanded: openSections.includes("yeast") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.yeast")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("yeast") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <Accordion
                    type="multiple"
                    value={openYeastIds}
                    onValueChange={(next) => setOpenYeastIds(Array.isArray(next) ? next : next ? [next] : [])}
                  >
                    {yeastRows.map((r, idx) => (
                      <Accordion.Item key={r.id} value={`yeast-${r.id}`}>
                        <Card gap="$2" mb="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
                          <Accordion.Header>
                            <Accordion.Trigger
                              width="100%"
                              unstyled
                              accessibilityRole="button"
                              accessibilityLabel={`${idx + 1}. ${r.name || "(unnamed)"}`}
                              accessibilityState={{ expanded: openYeastIds.includes(`yeast-${r.id}`) }}
                            >
                              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text fontSize={14} fontWeight="600">
                                  {idx + 1}. {r.name || "(unnamed)"}
                                </Text>
                                <Text fontSize={14} opacity={0.7}>
                                  {openYeastIds.includes(`yeast-${r.id}`) ? "▾" : "▸"}
                                </Text>
                              </View>
                            </Accordion.Trigger>
                          </Accordion.Header>
                          <Accordion.Content>
                            <View style={{ gap: 8, marginTop: 12 }}>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                          <View style={{ minWidth: 140, flexGrow: 1 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              {t("yeastLabLabel")}
                            </Text>
                            <Input
                              value={r.lab ?? ""}
                              editable={false}
                              placeholder="—"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                          <View style={{ minWidth: 140, flexGrow: 1 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              {t("yeastProductIdLabel")}
                            </Text>
                            <Input
                              value={r.productId ?? ""}
                              editable={false}
                              placeholder="—"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                        </View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1" textAlign="center" numberOfLines={1}>
                              {t("yeastAttenMinLabel")}
                            </Text>
                            <Input
                              value={
                                typeof r.attenuationMin === "number" && Number.isFinite(r.attenuationMin)
                                  ? formatFixed(locale, r.attenuationMin, 3)
                                  : ""
                              }
                              editable={false}
                              placeholder="—"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                              textAlign="center"
                            />
                          </View>
                          <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1" textAlign="center" numberOfLines={1}>
                              {t("yeastAttenMaxLabel")}
                            </Text>
                            <Input
                              value={
                                typeof r.attenuationMax === "number" && Number.isFinite(r.attenuationMax)
                                  ? formatFixed(locale, r.attenuationMax, 3)
                                  : ""
                              }
                              editable={false}
                              placeholder="—"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                              textAlign="center"
                            />
                          </View>
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {tRecipes("analysis.customAttenuationPercentLabel")}
                          </Text>
                          <Input
                            value={yeastAttenuationOverrides[r.id] ?? ""}
                            editable={false}
                            placeholder="—"
                            keyboardType="decimal-pad"
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {t("yeastFormatLabel")}
                          </Text>
                          <Input
                            value={
                              r.format === "dry"
                                ? t("yeastFormatDry")
                                : r.format === "slurry"
                                  ? t("yeastFormatSlurry")
                                  : t("yeastFormatLiquid")
                            }
                            editable={false}
                            placeholder="—"
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {t("yeastAmountLabel", { unit: r.format === "dry" ? tUnits("kg") : tUnits("L") })}
                          </Text>
                          <Input
                            value={
                              r.format === "dry"
                                ? (r.amountKg != null && Number.isFinite(r.amountKg) ? formatFixed(locale, r.amountKg, 3) : "")
                                : (r.amountL != null && Number.isFinite(r.amountL) ? formatFixed(locale, r.amountL, 2) : "")
                            }
                            editable={false}
                            placeholder="—"
                            keyboardType="decimal-pad"
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {t("yeastFermentationTempLabel", { unit: tUnits("C") })}
                          </Text>
                          <Input
                            value={
                              r.fermentationTempC != null && Number.isFinite(r.fermentationTempC)
                                ? formatFixed(locale, r.fermentationTempC, 1)
                                : ""
                            }
                            editable={false}
                            placeholder="—"
                            keyboardType="decimal-pad"
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {t("yeastDiacetylRestLabel")}
                          </Text>
                          <Input
                            value={
                              r.diacetylRest === "yes"
                                ? t("yeastDiacetylRestYes")
                                : r.diacetylRest === "no"
                                  ? t("yeastDiacetylRestNo")
                                  : ""
                            }
                            editable={false}
                            placeholder="—"
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {t("yeastOxygenationLabel")}
                          </Text>
                          <Input
                            value={
                              r.oxygenation === "yes"
                                ? t("yeastOxygenationYes")
                                : r.oxygenation === "no"
                                  ? t("yeastOxygenationNo")
                                  : ""
                            }
                            editable={false}
                            placeholder="—"
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        </View>
                      </View>
                          </Accordion.Content>
                        </Card>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                  <Button
                    onPress={() => (navigation as any).navigate("RecipeYeast", { recipeId })}
                    size="$3"
                    mt="$2"
                    width="100%"
                    background="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                    accessibilityRole="button"
                    accessibilityLabel={t("yeastEditInYeastPage")}
                  >
                    <Text fontSize={14}>{t("yeastEditInYeastPage")}</Text>
                  </Button>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="equipment">
            <Card gap="$2" mt="$3" aria-label={t("sections.equipment")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.equipment")}
                  accessibilityState={{ expanded: openSections.includes("equipment") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.equipment")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("equipment") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <Text fontSize={12} opacity={0.8} mb="$2">
                    {t("equipmentSection.help")}
                  </Text>
                  {equipmentProfilesError ? (
                    <Text fontSize={12} color="$red10" mb="$2">
                      {equipmentProfilesError}
                    </Text>
                  ) : null}
                  <View style={{ gap: 8 }}>
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">
                        {t("equipmentSection.profileLabel")}
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                          <Button
                            onPress={() => setSelectedEquipmentProfileId("")}
                            size="$3"
                            background={!selectedEquipmentProfileId ? "$color4" : "$background"}
                            borderWidth={1}
                            borderColor="$borderColor"
                          >
                            <Text fontSize={14}>{t("equipmentSection.noneOption")}</Text>
                          </Button>
                          {equipmentProfiles.map((p) => (
                            <Button
                              key={p.id}
                              onPress={() => setSelectedEquipmentProfileId(p.id)}
                              size="$3"
                              background={selectedEquipmentProfileId === p.id ? "$color4" : "$background"}
                              borderWidth={1}
                              borderColor="$borderColor"
                            >
                              <Text fontSize={14}>{p.name}</Text>
                            </Button>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button
                        onPress={() => void applyEquipmentProfileToRecipe("apply")}
                        disabled={!selectedEquipmentProfileId || equipmentApplying}
                        size="$3"
                      >
                        <Text>{equipmentApplying ? t("equipmentSection.working") : t("equipmentSection.apply")}</Text>
                      </Button>
                      <Button
                        onPress={() => void applyEquipmentProfileToRecipe("reload")}
                        disabled={!selectedEquipmentProfileId || equipmentApplying}
                        size="$3"
                        chromeless
                      >
                        <Text>{t("equipmentSection.reload")}</Text>
                      </Button>
                    </View>
                  </View>
                  {equipmentApplyError ? (
                    <Text fontSize={12} color="$red10" mt="$2">
                      {equipmentApplyError}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4, marginTop: 8 }}>
                    <Text fontSize={12} opacity={0.8}>{t("equipmentSection.manageTemplatesText")}</Text>
                    <Button chromeless size="$3" onPress={() => (navigation as any).navigate("Equipment")}>
                      <Text fontSize={12} color="$blue10">{t("equipmentSection.manageTemplatesLinkText")}</Text>
                    </Button>
                  </View>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="water">
            <Card gap="$2" mt="$3" aria-label={t("sections.water")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.water")}
                  accessibilityState={{ expanded: openSections.includes("water") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.water")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("water") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <Text fontSize={12} opacity={0.8} mb="$2">
                    {t("waterHelp")}
                  </Text>
                  <Button
                    onPress={() => (navigation as any).navigate("WaterHub", { recipeId })}
                    size="$3"
                  >
                    <Text>{t("nav.openWaterCalculator")}</Text>
                  </Button>
                  <Button
                    chromeless
                    size="$3"
                    mt="$2"
                    onPress={() => (navigation as any).navigate("WaterProfiles")}
                  >
                    <Text fontSize={12} opacity={0.9}>{t("waterProfilesManageText")}</Text>
                  </Button>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="boil">
            <Card gap="$2" mt="$3" aria-label={t("sections.boil")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.boil")}
                  accessibilityState={{ expanded: openSections.includes("boil") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.boil")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("boil") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <View>
                    <Text fontSize={12} opacity={0.8} mb="$1">
                      Boil time (min)
                    </Text>
                    <Input
                      value={boilTimeMinutes}
                      onChangeText={setBoilTimeMinutes}
                      placeholder="60"
                      keyboardType="number-pad"
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="notes">
            <Card gap="$2" mt="$3" aria-label={t("sections.notes")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.notes")}
                  accessibilityState={{ expanded: openSections.includes("notes") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.notes")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("notes") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <TextArea
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Notes"
                    size="$3"
                    background="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                    height={80}
                  />
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>
        </Accordion>

        <Button
          onPress={() => void save()}
          disabled={saving}
          mt="$4"
          accessibilityRole="button"
          accessibilityLabel={tEquip("save")}
        >
          <Text>{saving ? t("status.saved") + "…" : tEquip("save")}</Text>
        </Button>

        <Modal
          visible={stylePickerOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setStylePickerOpen(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }}
            onPress={() => setStylePickerOpen(false)}
            accessibilityRole="button"
          >
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: "#141820",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: 16,
                borderTopWidth: 1,
                borderTopColor: "#2a2f3a",
              }}
              accessibilityRole="none"
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Heading fontSize={18}>Style</Heading>
                <Button
                  onPress={() => setStylePickerOpen(false)}
                  size="$2"
                  chromeless
                  accessibilityRole="button"
                  accessibilityLabel={tCommon("close")}
                >
                  <Text>{tCommon("close")}</Text>
                </Button>
              </View>
              <ScrollView style={{ maxHeight: 300 }}>
                <View style={{ gap: 8 }}>
                  {styles.map((s) => {
                    const label = s.key === "custom" ? s.name : `${s.code} — ${s.name}`;
                    const selected = styleKey === s.key;
                    return (
                      <Button
                        key={s.key}
                        onPress={() => {
                          setStyleKey(s.key);
                          setStylePickerOpen(false);
                        }}
                        background={selected ? "$color4" : "$background"}
                        borderWidth={1}
                        borderColor="$borderColor"
                        width="100%"
                        p="$3"
                        accessibilityRole="button"
                        accessibilityLabel={label}
                      >
                        <Text fontWeight={selected ? "700" : "400"}>{label}</Text>
                      </Button>
                    );
                  })}
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </Screen>
  );
}
