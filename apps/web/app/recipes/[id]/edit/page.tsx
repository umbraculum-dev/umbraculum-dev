"use client";

import { Link } from "../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Button, H1, H2, Input, SizableText, TextArea, View, XStack, YStack } from "tamagui";

import { apiFetch } from "../../../_lib/apiClient";
import { formatFixed } from "../../../../src/i18n/format";
import { MathHelpPopover } from "../../../_components/MathHelpPopover";
import { AdSlot } from "../../../_components/AdSlot";
import { CodeInline } from "../../../_components/CodeInline";
import {
  ErrorBox,
  RecipeEditField,
  RecipeEditFieldBlock,
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditList,
  RecipeEditReadOnlyValue,
  RecipeEditSection,
  RecipeEditSummary,
} from "../../../_components/recipe-edit";
import { SurfaceMathToggleRow } from "../../../_components/SurfaceMathToggleRow";
import {
  buildBeerJsonRecipeDocument,
  buildRecipeExtJsonFromEditorState,
  editorStateFromBeerJson,
  mergeMashDeduceFromExt,
  validateMashBeforeSave,
  type EditorGristRow,
  type EditorHopRow,
  type EditorMash,
  type EditorMashStep,
  type EditorMiscRow,
  type EditorYeastRow,
} from "../../_lib/beerjsonRecipe";
import { MashStepsEditor } from "../../_components/MashStepsEditor";
import { RecipeEditSectionsNav } from "../../_components/RecipeEditSectionsNav";
import { RecipeMetaLine } from "../water/_components/RecipeMetaLine";
import {
  fetchRecipeWaterSettings,
  saveRecipeWaterSettings,
  type RecipeWaterSettingsResponse,
} from "../water/_lib/waterSettings";
import { mathExplain } from "./_lib/mathExplain";
import { parseGravityAnalysisResponseV1 } from "@brewery/contracts";
import { renderDerivationBody } from "../water/_lib/mathBodies";

type Recipe = {
  id: string;
  accountId: string;
  name: string;
  style: string | null;
  styleKey?: string | null;
  notes: string | null;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
  createdAt: string;
  updatedAt: string;
};

type StyleListItem = { key: string; name: string; code: string; sortOrder: number };
type EquipmentProfile = {
  id: string;
  name: string;
  equipment: {
    kettle: Record<string, unknown>;
    mash: Record<string, unknown>;
    misc: Record<string, unknown>;
  };
};

function newRowId() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

type GristRow = EditorGristRow;
type GristMaltClass = EditorGristRow["maltClass"];
type GristPotential = EditorGristRow["potential"];
type GristPotentialKind = NonNullable<GristPotential>["kind"];
type HopRow = EditorHopRow;
type YeastRow = EditorYeastRow;
type MiscRow = EditorMiscRow;

type HopUse = "boil" | "whirlpool" | "dryhop";
type MiscType = EditorMiscRow["type"];
type MiscUse = EditorMiscRow["use"];

const miscTypeOptions: { value: MiscType; label: string }[] = [
  { value: "spice", label: "Spice" },
  { value: "fining", label: "Fining" },
  { value: "water_agent", label: "Water agent" },
  { value: "herb", label: "Herb" },
  { value: "flavor", label: "Flavor" },
  { value: "other", label: "Other" },
];

const miscUseOptions: { value: MiscUse; label: string }[] = [
  { value: "mash", label: "Mash" },
  { value: "boil", label: "Boil" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "bottling", label: "Bottling" },
];

export default function RecipeEditPage() {
  const t = useTranslations("recipes.edit");
  const tEquip = useTranslations("recipes.edit.equipmentSection");
  const tAnalysis = useTranslations("recipes.analysis");
  const tMath = useTranslations("math");
  const tNav = useTranslations("nav");
  const tUnits = useTranslations("units");
  const tWater = useTranslations("waterHub");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";
  const [layoutMetrics, setLayoutMetrics] = useState<{
    leftGutterPx: number | null;
    railTopPx: number | null;
  }>({ leftGutterPx: null, railTopPx: null });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const appShell = document.querySelector(".appShell");
      const mainEl = document.getElementById("main");
      const leftGutterPx = appShell instanceof HTMLElement ? appShell.getBoundingClientRect().left : null;
      const railTopPx = mainEl instanceof HTMLElement ? Math.max(mainEl.getBoundingClientRect().top, 16) : null;
      setLayoutMetrics({ leftGutterPx, railTopPx });
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    update();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  // We need enough real left gutter to shift the rail into it.
  // Add a safety margin so we fall back to the button sooner while resizing.
  const DESKTOP_RAIL_REQUIRED_GUTTER_PX = 320;
  const useDesktopRail =
    typeof layoutMetrics.leftGutterPx === "number" &&
    layoutMetrics.leftGutterPx >= DESKTOP_RAIL_REQUIRED_GUTTER_PX;

  const roundTo = (n: number, decimals: number) => {
    const f = 10 ** decimals;
    return Math.round(n * f) / f;
  };

  const sections = [
    { id: "basics", label: t("sections.basics") },
    { id: "analysis", label: t("sections.analysis") },
    { id: "equipment", label: t("sections.equipment") },
    { id: "mashing", label: t("sections.mashing") },
    { id: "fermentables", label: t("sections.fermentables") },
    { id: "hops", label: t("sections.hops") },
    { id: "yeast", label: t("sections.yeast") },
    { id: "other", label: t("sections.other") },
    { id: "notes", label: t("sections.notes") },
    { id: "water", label: t("sections.water") },
  ] as const;

  const collapsibleSectionIds = ["basics", "analysis", "equipment", "mashing", "fermentables", "hops", "yeast", "other", "notes"] as const;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const id of collapsibleSectionIds) init[id] = false;
    return init;
  });

  const [surfaceMath, setSurfaceMath] = useState(false);
  useEffect(() => {
    try {
      const v = sessionStorage.getItem("brewery:surfaceMath:recipeEdit");
      if (v === "1") return setSurfaceMath(true);
      if (v === "0") return setSurfaceMath(false);

      // Back-compat with the previous Analysis-only toggle key.
      const legacy = sessionStorage.getItem("brewery:surfaceMath:recipeEdit:analysis");
      if (legacy === "1") setSurfaceMath(true);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("brewery:surfaceMath:recipeEdit", surfaceMath ? "1" : "0");
    } catch {
      // ignore
    }
  }, [surfaceMath]);

  const setSectionOpen = (id: string, open: boolean) => {
    setOpenSections((prev) => (prev[id] === open ? prev : { ...prev, [id]: open }));
  };

  const [authLoaded, setAuthLoaded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [styleKey, setStyleKey] = useState("custom");
  const [notes, setNotes] = useState("");
  const [gristRows, setGristRows] = useState<EditorGristRow[]>([]);
  const [hopsRows, setHopsRows] = useState<EditorHopRow[]>([]);
  const [yeastRows, setYeastRows] = useState<EditorYeastRow[]>([]);
  const [miscRows, setMiscRows] = useState<EditorMiscRow[]>([]);
  const [mashProcedure, setMashProcedure] = useState<{ name: string; grainTemperatureC: number } | null>(null);
  const [mashRows, setMashRows] = useState<EditorMashStep[]>([]);
  const [waterSettings, setWaterSettings] = useState<RecipeWaterSettingsResponse["settings"]>(null);
  const [spargeStepTempSaving, setSpargeStepTempSaving] = useState(false);
  const [spargeStepTempLocal, setSpargeStepTempLocal] = useState<number | null>(null);
  const [yeastAttenuationOverrides, setYeastAttenuationOverrides] = useState<Record<string, string>>({});

  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [stylesError, setStylesError] = useState<string | null>(null);

  const [equipmentProfiles, setEquipmentProfiles] = useState<EquipmentProfile[]>([]);
  const [equipmentProfilesLoading, setEquipmentProfilesLoading] = useState(false);
  const [equipmentProfilesError, setEquipmentProfilesError] = useState<string | null>(null);
  const [selectedEquipmentProfileId, setSelectedEquipmentProfileId] = useState<string>("");
  const [equipmentApplyError, setEquipmentApplyError] = useState<string | null>(null);
  const [equipmentApplying, setEquipmentApplying] = useState(false);

  // Ingredient DB searches (v0)
  const [fermentableQuery, setFermentableQuery] = useState("");
  const [fermentableResults, setFermentableResults] = useState<any[]>([]);
  const [fermentableSearching, setFermentableSearching] = useState(false);
  const [fermentableSearchError, setFermentableSearchError] = useState<string | null>(null);

  const [hopQuery, setHopQuery] = useState("");
  const [hopResults, setHopResults] = useState<any[]>([]);
  const [hopSearching, setHopSearching] = useState(false);
  const [hopSearchError, setHopSearchError] = useState<string | null>(null);

  const [yeastQuery, setYeastQuery] = useState("");
  const [yeastResults, setYeastResults] = useState<any[]>([]);
  const [yeastSearching, setYeastSearching] = useState(false);
  const [yeastSearchError, setYeastSearchError] = useState<string | null>(null);

  const canCallAccountScoped = useMemo(
    () => Boolean(recipeId),
    [recipeId],
  );

  const waterVolumes = useMemo(() => {
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

  useEffect(() => {
    if (!canCallAccountScoped || !recipeId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchRecipeWaterSettings(recipeId);
        if (cancelled) return;
        setWaterSettings(data.settings);
      } catch {
        if (!cancelled) setWaterSettings(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCallAccountScoped, recipeId]);

  const spargeStepTempDisplay =
    spargeStepTempLocal ?? waterSettings?.spargeStepTemperatureC ?? 76;

  const saveSpargeStepTemperature = async (tempC: number) => {
    if (!canCallAccountScoped || !recipeId) return;
    setSpargeStepTempSaving(true);
    try {
      const data = await saveRecipeWaterSettings(recipeId, { spargeStepTemperatureC: tempC });
      setWaterSettings(data.settings);
      setSpargeStepTempLocal(null);
    } catch {
      setSpargeStepTempLocal(null);
    } finally {
      setSpargeStepTempSaving(false);
    }
  };

  useEffect(() => {
    const applyHashOpen = () => {
      const raw = window.location.hash || "";
      const id = raw.startsWith("#") ? raw.slice(1) : raw;
      if (!id) return;
      if (!collapsibleSectionIds.includes(id as any)) return;
      setSectionOpen(id, true);
    };

    applyHashOpen();
    window.addEventListener("hashchange", applyHashOpen);
    return () => window.removeEventListener("hashchange", applyHashOpen);
  }, []);

  useEffect(() => {
    if (!canCallAccountScoped) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      setSaveStatus(null);
      try {
        const res = await apiFetch(`/api/recipes/${recipeId}`);
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const r = (res.data as any).recipe as Recipe;
        if (cancelled) return;
        setRecipe(r);
        setAnalysis((r as any).analysis ?? null);
        setName(r.name ?? "");
        setStyleKey((r as any).styleKey ?? "custom");
        setNotes(r.notes ?? "");
        const ext = (r as any).recipeExtJson;
        const links = ext && typeof ext === "object" ? (ext as any).ingredientLinks : null;
        const mashPhModel = ext && typeof ext === "object" ? (ext as any).mashPhModel : null;
        const yeastOverridesRaw = ext && typeof ext === "object" ? (ext as any).yeastAttenuationOverridesPercent : null;
        if (yeastOverridesRaw && typeof yeastOverridesRaw === "object") {
          const out: Record<string, string> = {};
          for (const [k, v] of Object.entries(yeastOverridesRaw as any)) {
            if (typeof k !== "string") continue;
            if (typeof v !== "number" || !Number.isFinite(v)) continue;
            out[k] = String(v);
          }
          setYeastAttenuationOverrides(out);
        } else {
          setYeastAttenuationOverrides({});
        }

        const equipmentSource = ext && typeof ext === "object" ? (ext as any).equipmentSource : null;
        const equipmentProfileId =
          equipmentSource && typeof equipmentSource === "object" && typeof (equipmentSource as any).equipmentProfileId === "string"
            ? ((equipmentSource as any).equipmentProfileId as string)
            : "";
        setSelectedEquipmentProfileId(equipmentProfileId);

        if (!(r as any).beerJsonRecipeJson) {
          throw new Error("Recipe is missing BeerJSON (beerJsonRecipeJson)");
        }
        const s = editorStateFromBeerJson((r as any).beerJsonRecipeJson);
        const grist = s.gristRows.map((row) => {
          const ingredientId = typeof links?.grist?.[row.id] === "string" ? (links.grist[row.id] as string) : null;
          const m = row.id && mashPhModel && typeof mashPhModel === "object" ? (mashPhModel as any)[row.id] : null;
          return {
            ...row,
            ingredientId,
            mashDiPh: typeof m?.mashDiPh === "number" ? m.mashDiPh : row.mashDiPh ?? null,
            mashTaToPh57_mEqPerKg:
              typeof m?.mashTaToPh57_mEqPerKg === "number" ? m.mashTaToPh57_mEqPerKg : row.mashTaToPh57_mEqPerKg ?? null,
            mashRoastDehuskedOverride:
              "roastDehuskedOverride" in (m ?? {}) ? (m as any).roastDehuskedOverride : row.mashRoastDehuskedOverride ?? null,
          } as EditorGristRow;
        });
        const hops = s.hopsRows.map((row) => ({
          ...row,
          ingredientId: typeof links?.hops?.[row.id] === "string" ? (links.hops[row.id] as string) : null,
        })) as EditorHopRow[];
        const yeast = s.yeastRows.map((row) => ({
          ...row,
          ingredientId: typeof links?.yeast?.[row.id] === "string" ? (links.yeast[row.id] as string) : null,
        })) as EditorYeastRow[];
        const misc = s.miscRows.map((row) => ({
          ...row,
          ingredientId: typeof links?.misc?.[row.id] === "string" ? (links.misc[row.id] as string) : null,
        })) as EditorMiscRow[];

        setGristRows(grist);
        setHopsRows(hops);
        setYeastRows(yeast);
        setMiscRows(misc);
        const mashMerged = mergeMashDeduceFromExt(s.mash, ext);
        if (mashMerged) {
          setMashProcedure({ name: mashMerged.name, grainTemperatureC: mashMerged.grainTemperatureC });
          setMashRows(mashMerged.steps);
        } else {
          setMashProcedure(null);
          setMashRows([]);
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canCallAccountScoped, recipeId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStylesLoading(true);
      setStylesError(null);
      try {
        const res = await apiFetch("/api/styles");
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const items = (res.data as any)?.styles;
        if (!cancelled) setStyles(Array.isArray(items) ? (items as StyleListItem[]) : []);
      } catch (err) {
        if (!cancelled) setStylesError(String(err));
      } finally {
        if (!cancelled) setStylesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setEquipmentProfilesLoading(true);
      setEquipmentProfilesError(null);
      try {
        const res = await apiFetch("/api/equipment-profiles");
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const items = (res.data as any)?.profiles;
        if (!cancelled) setEquipmentProfiles(Array.isArray(items) ? (items as EquipmentProfile[]) : []);
      } catch (err) {
        if (!cancelled) setEquipmentProfilesError(String(err));
      } finally {
        if (!cancelled) setEquipmentProfilesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyEquipmentProfileToRecipe = async (mode: "apply" | "reload") => {
    if (!recipeId) return;
    setEquipmentApplyError(null);
    setEquipmentApplying(true);
    try {
      const selected = equipmentProfiles.find((p) => p.id === selectedEquipmentProfileId) ?? null;
      if (!selected) throw new Error(tEquip("errors.selectFirst"));

      const extBase = (recipe as any)?.recipeExtJson;
      const base =
        extBase && typeof extBase === "object" && !Array.isArray(extBase) ? ({ ...(extBase as any) } as any) : ({} as any);

      base.version = 1;
      base.equipment = selected.equipment;
      base.equipmentSource = { equipmentProfileId: selected.id, copiedAt: new Date().toISOString() };

      const patchRes = await apiFetch(`/api/recipes/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeExtJson: base }),
      });
      if (!patchRes.ok) throw new Error(JSON.stringify(patchRes.data));

      // Re-fetch to refresh derived analysis.
      const reload = await apiFetch(`/api/recipes/${recipeId}`);
      if (!reload.ok) throw new Error(JSON.stringify(reload.data));
      const r = (reload.data as any).recipe as Recipe;
      setRecipe(r);
      setAnalysis((r as any).analysis ?? null);
      setSaveStatus(mode === "reload" ? t("status.equipmentReloaded") : t("status.equipmentApplied"));
    } catch (err) {
      setEquipmentApplyError(String(err));
    } finally {
      setEquipmentApplying(false);
    }
  };

  const onSave = async () => {
    if (!recipeId) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    try {
      const extBase = (recipe as any)?.recipeExtJson;
      const extBaseForSave =
        extBase && typeof extBase === "object" && !Array.isArray(extBase) ? ({ ...(extBase as any) } as any) : ({} as any);

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
      } else {
        delete extBaseForSave.yeastAttenuationOverridesPercent;
      }

      const batchSizeLiters =
        typeof extBaseForSave.batchSizeLiters === "number" ? extBaseForSave.batchSizeLiters
          : null;
      const brewhouseEfficiencyPercent =
        typeof extBaseForSave.brewhouseEfficiencyPercent === "number" ? extBaseForSave.brewhouseEfficiencyPercent
          : null;

      const stepsForSave = mashRows.map((r) => {
        if (r.type === "sparge" && r.name.trim().toLowerCase() === "sparge" && waterVolumes) {
          return { ...r, amountL: waterVolumes.spargeLiters };
        }
        return r;
      });

      const mash: EditorMash =
        mashRows.length > 0 && mashProcedure
          ? {
              name: mashProcedure.name || "Mash",
              grainTemperatureC: mashProcedure.grainTemperatureC,
              steps: stepsForSave,
            }
          : mashRows.length > 0
            ? {
                name: "Mash",
                grainTemperatureC: 20,
                steps: stepsForSave,
              }
            : null;

      const mashValidation = validateMashBeforeSave(mash);
      if (!mashValidation.ok) {
        setSaveError(mashValidation.errors);
        setSaving(false);
        return;
      }

      extBaseForSave.mashStepDeduceFromMashIn = Object.fromEntries(
        mashRows
          .filter((r, i) => i > 0 && r.deduceFromMashIn === true)
          .map((r) => [r.id, true] as const),
      );

      const beerJsonRecipeJson = buildBeerJsonRecipeDocument({
        name,
        notes: notes || null,
        gristRows: gristRows as any,
        hopsRows: hopsRows as unknown as EditorHopRow[],
        yeastRows: yeastRows as unknown as EditorYeastRow[],
        miscRows: miscRows as any,
        mash,
        batchSizeLiters,
        brewhouseEfficiencyPercent,
      });

      const recipeExtJson = buildRecipeExtJsonFromEditorState({
        gristRows: gristRows as any,
        hopsRows: hopsRows as unknown as EditorHopRow[],
        yeastRows: yeastRows as unknown as EditorYeastRow[],
        miscRows: miscRows as any,
        extBase: extBaseForSave,
      });

      const res = await apiFetch(`/api/recipes/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          styleKey,
          notes: notes || null,
          beerJsonRecipeJson,
          recipeExtJson,
        }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));

      // Re-fetch to refresh derived analysis (PATCH response does not include it).
      const reload = await apiFetch(`/api/recipes/${recipeId}`);
      if (!reload.ok) throw new Error(JSON.stringify(reload.data));
      const r = (reload.data as any).recipe as Recipe;
      setRecipe(r);
      setAnalysis((r as any).analysis ?? null);
      setStyleKey((r as any).styleKey ?? styleKey);
      setSaveStatus(t("status.saved"));
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const addGristRow = () => {
    setGristRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        producer: null,
        group: null,
        mashDiPh: null,
        mashTaToPh57_mEqPerKg: null,
        mashRoastDehuskedOverride: null,
        mashRoastDehuskedSource: "unknown",
        mashPhModelSource: "unknown",
        amountKg: 0,
        colorLovibond: null,
        potential: null,
        maltClass: "base",
        timingUse: "add_to_mash",
      },
    ]);
  };

  const addFermentableFromDb = (item: any) => {
    const id = typeof item?.id === "string" ? item.id : null;
    const itemName = typeof item?.name === "string" ? item.name : "";
    if (!id || !itemName) return;
    const producer = typeof item?.producer === "string" ? item.producer : null;
    const group = typeof item?.group === "string" ? item.group : null;
    const mashDiPh = typeof item?.mashDiPh === "number" && Number.isFinite(item.mashDiPh) ? item.mashDiPh : null;
    const mashTaToPh57_mEqPerKg =
      typeof item?.mashTaToPh57_mEqPerKg === "number" && Number.isFinite(item.mashTaToPh57_mEqPerKg)
        ? item.mashTaToPh57_mEqPerKg
        : null;
    const mashPhModelSource =
      mashDiPh !== null || mashTaToPh57_mEqPerKg !== null ? ("default" as const) : ("unknown" as const);
    const name = itemName;
    const colorLovibond =
      typeof item?.colorLovibond === "number" && Number.isFinite(item.colorLovibond)
        ? roundTo(item.colorLovibond, 3)
        : null;
    const ppg =
      typeof item?.ppg === "number" && Number.isFinite(item.ppg) ? roundTo(item.ppg, 3) : null;
    const yieldPercent =
      typeof item?.yieldPercent === "number" && Number.isFinite(item.yieldPercent)
        ? roundTo(item.yieldPercent, 3)
        : null;

    const potential: GristPotential =
      ppg !== null ? { kind: "ppg", value: ppg } : yieldPercent !== null ? { kind: "yieldPercent", value: yieldPercent } : null;

    const maltClass = inferMaltClass(typeof item?.group === "string" ? item.group : null, itemName);

    setGristRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: id,
        name,
        producer,
        group,
        mashDiPh,
        mashTaToPh57_mEqPerKg,
        mashRoastDehuskedOverride: null,
        mashRoastDehuskedSource: "unknown",
        mashPhModelSource,
        amountKg: 0,
        colorLovibond,
        potential,
        maltClass,
        timingUse: "add_to_mash",
      },
    ]);
  };

  const addHopFromDb = (item: any) => {
    const id = typeof item?.id === "string" ? item.id : null;
    const name = typeof item?.name === "string" ? item.name : "";
    if (!id || !name) return;
    const country = typeof item?.country === "string" ? item.country : null;
    const alphaMin = typeof item?.alphaMin === "number" && Number.isFinite(item.alphaMin) ? item.alphaMin : null;
    const alphaMax = typeof item?.alphaMax === "number" && Number.isFinite(item.alphaMax) ? item.alphaMax : null;
    const alphaAcidPercent =
      alphaMin !== null && alphaMax !== null ? (alphaMin + alphaMax) / 2 : alphaMin !== null ? alphaMin : alphaMax;
    addHopRow({
      ingredientId: id,
      name,
      country,
      alphaAcidPercent:
        typeof alphaAcidPercent === "number" && Number.isFinite(alphaAcidPercent)
          ? roundTo(alphaAcidPercent, 3)
          : null,
      use: "boil",
      timeMinutes: 60,
      amountGrams: 0,
    });
  };

  const addYeastFromDb = (item: any) => {
    const id = typeof item?.id === "string" ? item.id : null;
    const nameRaw = typeof item?.name === "string" ? item.name : "";
    if (!id || !nameRaw) return;
    const lab = typeof item?.lab === "string" ? item.lab : null;
    const productId = typeof item?.productId === "string" ? item.productId : null;
    const attenuationMin =
      typeof item?.attenuationMin === "number" && Number.isFinite(item.attenuationMin) ? item.attenuationMin : null;
    const attenuationMax =
      typeof item?.attenuationMax === "number" && Number.isFinite(item.attenuationMax) ? item.attenuationMax : null;
    addYeastRow({ ingredientId: id, name: nameRaw, lab, productId, attenuationMin, attenuationMax });
  };
  const removeGristRow = (id: string) => {
    setGristRows((prev) => prev.filter((r) => r.id !== id));
  };
  const updateGristRow = (id: string, patch: Partial<GristRow>) => {
    setGristRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addHopRow = (row?: Partial<HopRow>) => {
    setHopsRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        country: null,
        amountGrams: 0,
        alphaAcidPercent: null,
        use: "boil",
        timeMinutes: 60,
        ...row,
      },
    ]);
  };
  const removeHopRow = (id: string) => setHopsRows((prev) => prev.filter((r) => r.id !== id));
  const updateHopRow = (id: string, patch: Partial<HopRow>) =>
    setHopsRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addYeastRow = (row?: Partial<YeastRow>) => {
    setYeastRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        lab: null,
        productId: null,
        attenuationMin: null,
        attenuationMax: null,
        ...row,
      },
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
  const updateYeastRow = (id: string, patch: Partial<YeastRow>) =>
    setYeastRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addMiscRow = () => {
    setMiscRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        type: "other",
        use: "boil",
        timeMinutes: 10,
        amount: 0,
        amountIsWeight: true,
        useFor: null,
        notes: null,
      },
    ]);
  };
  const removeMiscRow = (id: string) => setMiscRows((prev) => prev.filter((r) => r.id !== id));
  const updateMiscRow = (id: string, patch: Partial<MiscRow>) =>
    setMiscRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const inferMaltClass = (group: string | null | undefined, fermentableName: string): GristMaltClass => {
    const g = (group ?? "").toLowerCase();
    const n = fermentableName.toLowerCase();
    if (g.includes("caramel") || g.includes("crystal")) return "crystal";
    if (g.includes("roast") || g.includes("roasted")) return "roast";
    if (n.includes("acid")) return "acid";
    return "base";
  };

  const isRoastedLike = (row: Pick<GristRow, "group" | "name">) => {
    const g = (row.group ?? "").toLowerCase();
    const n = (row.name ?? "").toLowerCase();
    return (
      g.includes("roast") ||
      g.includes("roasted") ||
      g.includes("black") ||
      g.includes("chocolate") ||
      n.includes("roast") ||
      n.includes("black malt") ||
      n.includes("chocolate") ||
      n.includes("carafa") ||
      n.includes("patent") ||
      n.includes("brown malt")
    );
  };

  const inferDehuskedFromName = (name: string) => {
    const n = (name ?? "").toLowerCase();
    if (!n) return false;
    if (n.includes("dehusked") || n.includes("de-husked")) return true;
    if (n.includes("debittered") || n.includes("de-bittered")) return true;
    if (n.includes("carafa") && n.includes("special")) return true;
    if (n.includes("de bittered") || n.includes("de bitter")) return true;
    return false;
  };

  const onSearchFermentables = async (e: React.FormEvent) => {
    e.preventDefault();
    setFermentableSearchError(null);
    setFermentableSearching(true);
    try {
      const res = await apiFetch(`/api/ingredients/fermentables?query=${encodeURIComponent(fermentableQuery)}`);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const items = (res.data as any)?.items;
      setFermentableResults(Array.isArray(items) ? items : []);
    } catch (err) {
      setFermentableSearchError(String(err));
      setFermentableResults([]);
    } finally {
      setFermentableSearching(false);
    }
  };

  const clearFermentableSearchResults = () => {
    setFermentableSearchError(null);
    setFermentableResults([]);
  };

  const onSearchHops = async (e: React.FormEvent) => {
    e.preventDefault();
    setHopSearchError(null);
    setHopSearching(true);
    try {
      const res = await apiFetch(`/api/ingredients/hops?query=${encodeURIComponent(hopQuery)}`);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const items = (res.data as any)?.items;
      setHopResults(Array.isArray(items) ? items : []);
    } catch (err) {
      setHopSearchError(String(err));
      setHopResults([]);
    } finally {
      setHopSearching(false);
    }
  };

  const clearHopSearchResults = () => {
    setHopSearchError(null);
    setHopResults([]);
  };

  const onSearchYeasts = async (e: React.FormEvent) => {
    e.preventDefault();
    setYeastSearchError(null);
    setYeastSearching(true);
    try {
      const res = await apiFetch(`/api/ingredients/yeasts?query=${encodeURIComponent(yeastQuery)}`);
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const items = (res.data as any)?.items;
      setYeastResults(Array.isArray(items) ? items : []);
    } catch (err) {
      setYeastSearchError(String(err));
      setYeastResults([]);
    } finally {
      setYeastSearching(false);
    }
  };

  const clearYeastSearchResults = () => {
    setYeastSearchError(null);
    setYeastResults([]);
  };

  const gristTotals = useMemo(() => {
    const totalKg = gristRows.reduce((acc, r) => acc + (Number.isFinite(r.amountKg) ? r.amountKg : 0), 0);
    let colorSum = 0;
    let colorWeight = 0;
    for (const r of gristRows) {
      if (r.colorLovibond === null) continue;
      const w = Number.isFinite(r.amountKg) ? r.amountKg : 0;
      if (w <= 0) continue;
      colorSum += w * r.colorLovibond;
      colorWeight += w;
    }
    const weightedAvgLovibond = colorWeight > 0 ? colorSum / colorWeight : null;
    return { totalKg, weightedAvgLovibond };
  }, [gristRows]);

  return (
    <>
      <H1 mb="$2">{t("title")}</H1>
      <RecipeMetaLine recipeId={recipeId} />

      <SurfaceMathToggleRow
        left={null}
        rightHint={<SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{tMath("analysis.common.toggleHint")}</SizableText>}
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mt="$2"
        mb="$2"
      />

      {authLoaded && !canCallAccountScoped ? (
        <ErrorBox>{t("notReadyToLoad")}</ErrorBox>
      ) : null}

      {loading ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}
      {loadError ? (
        <ErrorBox aria-live="polite">{loadError}</ErrorBox>
      ) : null}

      {useDesktopRail ? (
        <RecipeEditSectionsNav
          sections={sections}
          recipeId={recipeId}
          layoutMode="rail"
          railLeftPx={layoutMetrics.leftGutterPx}
          railTopPx={layoutMetrics.railTopPx}
        />
      ) : null}

      <XStack
        flexDirection="column"
        gap="$4"
        $gtNarrow={{ flexDirection: "row" }}
        flex={1}
        minW={0}
      >
        <YStack gap="$4" flex={1} minW={0}>
          {!useDesktopRail ? (
            <View mb="$3">
              <RecipeEditSectionsNav sections={sections} recipeId={recipeId} layoutMode="sheet" />
            </View>
          ) : null}
          <RecipeEditSection
            id="basics"
            headingId="basics-heading"
            label={t("sections.basics")}
            open={openSections.basics}
            onOpenChange={(open) => setSectionOpen("basics", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("basicsHelp")}
            </SizableText>
            <XStack
              gap="$3"
              mt="$3"
              flexWrap="wrap"
              $gtNarrow={{ flexWrap: "nowrap" }}
            >
              <View flex={1} minW={200}>
                <RecipeEditField id="recipe-name" label="Name">
                <Input
                  id="recipe-name"
                  value={name}
                  onChangeText={setName}
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
                </RecipeEditField>
              </View>
              <View flex={1} minW={200}>
                <RecipeEditField id="recipe-style" label="Style">
                  <select
                    id="recipe-style"
                    name="styleKey"
                    value={styleKey}
                    onChange={(e) => setStyleKey(e.target.value)}
                    disabled={stylesLoading || styles.length === 0}
                    className="recipeEditSelect recipeEditSelectFull"
                  >
                    {styles.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.key === "custom" ? s.name : `${s.code} — ${s.name}`}
                      </option>
                    ))}
                  </select>
                {stylesError ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
                    {String(stylesError)}
                  </SizableText>
                ) : null}
                </RecipeEditField>
              </View>
            </XStack>

            <XStack gap="$3" items="center" mt="$3" flexWrap="wrap">
              <Button
                onPress={onSave}
                disabled={!canCallAccountScoped || saving}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {saving ? "Saving…" : "Save"}
              </Button>
              {saveStatus ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite">
                  {saveStatus}
                </SizableText>
              ) : null}
              {recipe ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  Updated: <CodeInline>{recipe.updatedAt}</CodeInline>
                </SizableText>
              ) : null}
            </XStack>

            {saveError ? (
              <ErrorBox mt="$3">{saveError}</ErrorBox>
            ) : null}
          </RecipeEditSection>

          <RecipeEditSection
            id="analysis"
            headingId="analysis-heading"
            label={t("sections.analysis")}
            open={openSections.analysis}
            onOpenChange={(open) => setSectionOpen("analysis", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {tAnalysis("help")}
            </SizableText>

                {(() => {
                  const parsed = (() => {
                    try {
                      return parseGravityAnalysisResponseV1(analysis);
                    } catch {
                      return null;
                    }
                  })();
                  const a = parsed?.result ?? null;

                  const fmt = (v: unknown, decimals: number) =>
                    typeof v === "number" && Number.isFinite(v) ? formatFixed(locale, v, decimals) : tAnalysis("na");

                  const fmtField = (field: string, v: unknown, fallbackDecimals: number) => {
                    const hint = parsed?.formatHints ? (parsed.formatHints as any)[field] : null;
                    const decimals = typeof hint?.decimals === "number" && Number.isFinite(hint.decimals) ? hint.decimals : fallbackDecimals;
                    return fmt(v, decimals);
                  };

                  const warnings = Array.isArray(a?.warnings) ? (a.warnings as any[]) : [];
                  const warningCodes = new Set(warnings.map((w) => String(w?.code ?? "")));

                  const renderMath = (key: keyof typeof mathExplain, body: string) => {
                    if (!surfaceMath) return null;
                    const ex = mathExplain[key];
                    const title = tMath(ex.titleKey);
                    return (
                      <MathHelpPopover
                        title={title}
                        body={body}
                        ariaLabel={tMath("fxLabel", { topic: title })}
                      />
                    );
                  };

                  const renderDerivationMath = (derivationKey: string, fallback: string) => {
                    if (!surfaceMath) return null;
                    const d = parsed?.derivations ? (parsed.derivations as any)[derivationKey] : null;
                    if (!d) return null;
                    try {
                      return renderDerivationBody({
                        locale,
                        tMath,
                        derivation: d,
                        units: {
                          L: tUnits("L"),
                          ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                          ppm: tUnits("ppm"),
                          g: tUnits("g"),
                          LPerKg: tUnits("LPerKg"),
                        },
                      });
                    } catch {
                      return fallback;
                    }
                  };

                  const ibuGravityUsed = (() => {
                    const pbg = a?.pbgEstimatedSg;
                    if (typeof pbg === "number" && Number.isFinite(pbg)) return { value: fmtField("pbgEstimatedSg", pbg, 3), source: tMath("analysis.common.sources.pbg") };
                    const og = a?.ogEstimatedSg;
                    if (typeof og === "number" && Number.isFinite(og)) return { value: fmtField("ogEstimatedSg", og, 3), source: tMath("analysis.common.sources.og") };
                    return { value: tAnalysis("na"), source: tMath("analysis.common.sources.unknown") };
                  })();

                  const ibuVolumeUsed = (() => {
                    const vol = a?.kettleVolumeLiters;
                    if (typeof vol === "number" && Number.isFinite(vol)) return { value: fmtField("kettleVolumeLiters", vol, 2), source: tMath("analysis.common.sources.kettleVolume") };
                    if (warningCodes.has("used_batch_size_volume")) {
                      const r0 = (recipe as any)?.beerJsonRecipeJson?.beerjson?.recipes?.[0];
                      const unit = typeof r0?.batch_size?.unit === "string" ? r0.batch_size.unit : "";
                      const value = typeof r0?.batch_size?.value === "number" && Number.isFinite(r0.batch_size.value) ? r0.batch_size.value : null;
                      const liters = value != null ? (unit === "l" ? value : unit === "ml" ? value / 1000 : null) : null;
                      return {
                        value: liters != null && liters > 0 ? fmt(liters, 2) : tAnalysis("na"),
                        source: tMath("analysis.common.sources.batchSize"),
                      };
                    }
                    return { value: tAnalysis("na"), source: tMath("analysis.common.sources.unknown") };
                  })();

                  const hopLines = (() => {
                    const rows = Array.isArray(hopsRows) ? hopsRows : [];
                    const out: string[] = [];
                    for (const h of rows) {
                      const name = typeof h?.name === "string" ? h.name.trim() : "";
                      if (!name) continue;
                      const use: HopUse = h?.use === "whirlpool" || h?.use === "dryhop" ? h.use : "boil";
                      if (use === "dryhop") {
                        out.push(tMath("analysis.common.hopLineExcluded", { name, reason: tMath("analysis.common.excludeDryhop") }));
                        continue;
                      }
                      const amountOk = typeof h?.amountGrams === "number" && Number.isFinite(h.amountGrams) && h.amountGrams > 0;
                      const aaOk = typeof h?.alphaAcidPercent === "number" && Number.isFinite(h.alphaAcidPercent) && h.alphaAcidPercent > 0;
                      const timeMin =
                        typeof h?.timeMinutes === "number" && Number.isFinite(h.timeMinutes) && h.timeMinutes >= 0
                          ? h.timeMinutes
                          : null;
                      if (!amountOk || !aaOk || timeMin === null) {
                        out.push(tMath("analysis.common.hopLineExcluded", { name, reason: tMath("analysis.common.excludeMissingInputs") }));
                        continue;
                      }
                      out.push(
                        tMath("analysis.common.hopLine", {
                          name,
                          use: tMath(`analysis.common.hopUse.${use}` as any),
                          amountG: fmt(h.amountGrams, 1),
                          alpha: fmt(h.alphaAcidPercent, 1),
                          timeMin: String(Math.round(timeMin)),
                        }),
                      );
                    }
                    return out.length ? out.join("\n") : tMath("analysis.common.noHops");
                  })();

                  const yeastLines = (() => {
                    const rows = Array.isArray(yeastRows) ? yeastRows : [];
                    const overrides = yeastAttenuationOverrides && typeof yeastAttenuationOverrides === "object" ? yeastAttenuationOverrides : {};

                    const effective: Array<{ id: string; name: string; eff: number | null; source: "override" | "beerjson" | "missing" }> = [];
                    for (const y of rows) {
                      const id = typeof (y as any)?.id === "string" ? (y as any).id : "";
                      const name = typeof (y as any)?.name === "string" ? String((y as any).name).trim() : "";
                      if (!id || !name) continue;
                      const ovRaw = typeof (overrides as any)[id] === "string" ? String((overrides as any)[id]).trim() : "";
                      const ov = ovRaw ? Number(ovRaw) : null;
                      const overrideOk = ov != null && Number.isFinite(ov) ? Math.max(0, Math.min(100, ov)) : null;
                      const min = typeof (y as any)?.attenuationMin === "number" && Number.isFinite((y as any).attenuationMin) ? (y as any).attenuationMin : null;
                      const max = typeof (y as any)?.attenuationMax === "number" && Number.isFinite((y as any).attenuationMax) ? (y as any).attenuationMax : null;
                      const att =
                        min != null && max != null ? (min + max) / 2 : min != null ? min : max != null ? max : null;
                      const eff = overrideOk ?? (att != null ? Math.max(0, Math.min(100, att)) : null);
                      effective.push({ id, name, eff, source: overrideOk != null ? "override" : att != null ? "beerjson" : "missing" });
                    }

                    const sorted = [...effective].sort((a1, a2) => (a2.eff ?? -1) - (a1.eff ?? -1));
                    const top = sorted.filter((x) => x.eff != null).slice(0, 2);
                    const topAvg = top.length ? top.reduce((acc, x) => acc + (x.eff as number), 0) / top.length : null;

                    const lines = sorted.map((y) =>
                      tMath("analysis.common.yeastLine", {
                        name: y.name,
                        value: y.eff != null ? fmt(y.eff, 1) : tAnalysis("na"),
                        source:
                          y.source === "override"
                            ? tMath("analysis.common.yeastSource.override")
                            : y.source === "beerjson"
                              ? tMath("analysis.common.yeastSource.beerjson")
                              : tMath("analysis.common.yeastSource.missing"),
                      }),
                    );

                    const selected = top.map((y) => tMath("analysis.common.yeastSelectedLine", { name: y.name, value: fmt(y.eff as number, 1) }));

                    return {
                      lines: lines.length ? lines.join("\n") : tMath("analysis.common.noYeast"),
                      selectedLines: selected.length ? selected.join("\n") : tMath("analysis.common.noYeastSelected"),
                      topAvg: topAvg != null ? fmt(topAvg, 1) : tAnalysis("na"),
                    };
                  })();

                  return (
                    <>
                      <View overflowX="auto">
                        <YStack gap="$2">
                          <XStack gap="$2" ai="baseline">
                            <View minW={180} pr="$3">
                              <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.abv")}</SizableText>
                                  {renderMath(
                                    "analysis.abv",
                                    renderDerivationMath(
                                      "analysis.abv",
                                      tMath("analysis.abv.body", {
                                        og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                        fg: fmtField("fgEstimatedSg", a?.fgEstimatedSg, 3),
                                        abv: fmtField("abvEstimatedPercent", a?.abvEstimatedPercent, 2),
                                      }),
                                    ) ?? tMath("analysis.abv.body", {
                                      og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                      fg: fmtField("fgEstimatedSg", a?.fgEstimatedSg, 3),
                                      abv: fmtField("abvEstimatedPercent", a?.abvEstimatedPercent, 2),
                                    }),
                                  )}
                                </XStack>
                            </View>
                            <View>
                              <XStack gap="$1" ai="baseline" display="inline-flex">
                                <CodeInline>{fmtField("abvEstimatedPercent", a?.abvEstimatedPercent, 2)}</CodeInline>
                                {typeof a?.abvEstimatedPercent === "number" ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">%</SizableText> : null}
                              </XStack>
                            </View>
                          </XStack>
                          <XStack gap="$2" ai="baseline">
                            <View minW={180} pr="$3">
                              <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.ibuTinseth")}</SizableText>
                                  {renderMath(
                                    "analysis.ibuTinseth",
                                    renderDerivationMath(
                                      "analysis.ibu_tinseth",
                                      tMath("analysis.ibuTinseth.body", {
                                        ibu: fmtField("ibuTinsethEstimated", a?.ibuTinsethEstimated, 1),
                                        gravity: ibuGravityUsed.value,
                                        gravitySource: ibuGravityUsed.source,
                                        volume: ibuVolumeUsed.value,
                                        volumeSource: ibuVolumeUsed.source,
                                        hopsLines: hopLines,
                                      }),
                                    ) ?? tMath("analysis.ibuTinseth.body", {
                                      ibu: fmtField("ibuTinsethEstimated", a?.ibuTinsethEstimated, 1),
                                      gravity: ibuGravityUsed.value,
                                      gravitySource: ibuGravityUsed.source,
                                      volume: ibuVolumeUsed.value,
                                      volumeSource: ibuVolumeUsed.source,
                                      hopsLines: hopLines,
                                    }),
                                  )}
                                </XStack>
                            </View>
                            <View>
                              <CodeInline>{fmtField("ibuTinsethEstimated", a?.ibuTinsethEstimated, 1)}</CodeInline>
                            </View>
                          </XStack>
                          <XStack gap="$2" ai="baseline">
                            <View minW={180} pr="$3">
                                <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.ibuRager")}</SizableText>
                                  {renderMath(
                                    "analysis.ibuRager",
                                    renderDerivationMath(
                                      "analysis.ibu_rager",
                                      tMath("analysis.ibuRager.body", {
                                        ibu: fmtField("ibuRagerEstimated", a?.ibuRagerEstimated, 1),
                                        gravity: ibuGravityUsed.value,
                                        gravitySource: ibuGravityUsed.source,
                                        volume: ibuVolumeUsed.value,
                                        volumeSource: ibuVolumeUsed.source,
                                        hopsLines: hopLines,
                                      }),
                                    ) ?? tMath("analysis.ibuRager.body", {
                                      ibu: fmtField("ibuRagerEstimated", a?.ibuRagerEstimated, 1),
                                      gravity: ibuGravityUsed.value,
                                      gravitySource: ibuGravityUsed.source,
                                      volume: ibuVolumeUsed.value,
                                      volumeSource: ibuVolumeUsed.source,
                                      hopsLines: hopLines,
                                    }),
                                  )}
                                </XStack>
                            </View>
                            <View>
                              <CodeInline>{fmtField("ibuRagerEstimated", a?.ibuRagerEstimated, 1)}</CodeInline>
                            </View>
                          </XStack>
                          <XStack gap="$2" ai="baseline">
                            <View minW={180} pr="$3">
                                <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.srmMorey")}</SizableText>
                                  {renderMath(
                                    "analysis.srmMorey",
                                    renderDerivationMath(
                                      "analysis.srm_morey",
                                      tMath("analysis.srmMorey.body", {
                                        srm: fmtField("colorSrmMoreyEstimated", a?.colorSrmMoreyEstimated, 1),
                                        volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                        notes: warningCodes.has("missing_color_volume")
                                          ? tMath("analysis.common.noteMissingWaterSettings")
                                          : warningCodes.has("missing_fermentable_colors")
                                            ? tMath("analysis.common.noteMissingFermentableColors")
                                            : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                      }),
                                    ) ?? tMath("analysis.srmMorey.body", {
                                      srm: fmtField("colorSrmMoreyEstimated", a?.colorSrmMoreyEstimated, 1),
                                      volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                      notes: warningCodes.has("missing_color_volume")
                                        ? tMath("analysis.common.noteMissingWaterSettings")
                                        : warningCodes.has("missing_fermentable_colors")
                                          ? tMath("analysis.common.noteMissingFermentableColors")
                                          : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                    }),
                                  )}
                                </XStack>
                            </View>
                            <View>
                              <CodeInline>{fmtField("colorSrmMoreyEstimated", a?.colorSrmMoreyEstimated, 1)}</CodeInline>
                            </View>
                          </XStack>
                          <XStack gap="$2" ai="baseline">
                            <View minW={180} pr="$3">
                                <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.srmDaniels")}</SizableText>
                                  {renderMath(
                                    "analysis.srmDaniels",
                                    renderDerivationMath(
                                      "analysis.srm_daniels",
                                      tMath("analysis.srmDaniels.body", {
                                        srm: fmtField("colorSrmDanielsEstimated", a?.colorSrmDanielsEstimated, 1),
                                        volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                        notes: warningCodes.has("missing_color_volume")
                                          ? tMath("analysis.common.noteMissingWaterSettings")
                                          : warningCodes.has("missing_fermentable_colors")
                                            ? tMath("analysis.common.noteMissingFermentableColors")
                                            : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                      }),
                                    ) ?? tMath("analysis.srmDaniels.body", {
                                      srm: fmtField("colorSrmDanielsEstimated", a?.colorSrmDanielsEstimated, 1),
                                      volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                      notes: warningCodes.has("missing_color_volume")
                                        ? tMath("analysis.common.noteMissingWaterSettings")
                                        : warningCodes.has("missing_fermentable_colors")
                                          ? tMath("analysis.common.noteMissingFermentableColors")
                                          : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                    }),
                                  )}
                                </XStack>
                            </View>
                            <View>
                              <CodeInline>{fmtField("colorSrmDanielsEstimated", a?.colorSrmDanielsEstimated, 1)}</CodeInline>
                            </View>
                          </XStack>
                          <XStack gap="$2" ai="baseline">
                            <View minW={180} pr="$3">
                                <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.kettleVolume")}</SizableText>
                                  {renderMath(
                                    "analysis.kettleVolume",
                                    renderDerivationMath(
                                      "analysis.kettle_volume",
                                      tMath("analysis.kettleVolume.body", {
                                        kettleVolume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                        notes:
                                          warningCodes.has("missing_water_settings") || warningCodes.has("missing_water_volumes")
                                            ? tMath("analysis.common.noteMissingWaterSettings")
                                            : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                      }),
                                    ) ?? tMath("analysis.kettleVolume.body", {
                                      kettleVolume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                      notes:
                                        warningCodes.has("missing_water_settings") || warningCodes.has("missing_water_volumes")
                                          ? tMath("analysis.common.noteMissingWaterSettings")
                                          : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                    }),
                                  )}
                                </XStack>
                            </View>
                            <View>
                              <XStack gap="$1" ai="baseline" display="inline-flex">
                                <CodeInline>{fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2)}</CodeInline>
                                {typeof a?.kettleVolumeLiters === "number" ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">L</SizableText> : null}
                              </XStack>
                            </View>
                          </XStack>
                          <XStack gap="$2" ai="baseline">
                            <View minW={180} pr="$3">
                                <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.preBoilVolume")}</SizableText>
                                  {renderMath(
                                    "analysis.preBoilVolume",
                                    renderDerivationMath(
                                      "analysis.pre_boil_volume",
                                      tMath("analysis.preBoilVolume.body", {
                                        preBoilVolume: fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2),
                                        notes:
                                          warningCodes.has("missing_water_settings") || warningCodes.has("missing_water_volumes")
                                            ? tMath("analysis.common.noteMissingWaterSettings")
                                            : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                      }),
                                    ) ?? tMath("analysis.preBoilVolume.body", {
                                      preBoilVolume: fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2),
                                      notes:
                                        warningCodes.has("missing_water_settings") || warningCodes.has("missing_water_volumes")
                                          ? tMath("analysis.common.noteMissingWaterSettings")
                                          : tMath("analysis.common.noteDependsOnWaterAndEquipment"),
                                    }),
                                  )}
                                </XStack>
                            </View>
                            <View>
                              <XStack gap="$1" ai="baseline" display="inline-flex">
                                <CodeInline>{fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2)}</CodeInline>
                                {typeof a?.preBoilVolumeLiters === "number" ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">L</SizableText> : null}
                              </XStack>
                            </View>
                          </XStack>
                          <XStack gap="$2" ai="baseline">
                            <View minW={180} pr="$3">
                                <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.og")}</SizableText>
                                  {renderMath(
                                    "analysis.og",
                                    renderDerivationMath(
                                      "analysis.og",
                                      tMath("analysis.og.body", {
                                        og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                        volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                        efficiency: (() => {
                                          const ext = (recipe as any)?.recipeExtJson;
                                          const e = ext && typeof ext === "object" && !Array.isArray(ext) ? (ext as any) : null;
                                          const mashEff =
                                            typeof e?.equipment?.mash?.mashEfficiencyPercent === "number" && Number.isFinite(e.equipment.mash.mashEfficiencyPercent)
                                              ? e.equipment.mash.mashEfficiencyPercent
                                              : null;
                                          const brewEff =
                                            typeof e?.brewhouseEfficiencyPercent === "number" && Number.isFinite(e.brewhouseEfficiencyPercent)
                                              ? e.brewhouseEfficiencyPercent
                                              : null;
                                          const bjEff =
                                            (recipe as any)?.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.efficiency?.brewhouse?.unit === "%"
                                              ? (recipe as any)?.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.efficiency?.brewhouse?.value
                                              : null;
                                          const eff = mashEff ?? brewEff ?? (typeof bjEff === "number" && Number.isFinite(bjEff) ? bjEff : null);
                                          return eff != null ? fmt(eff, 1) : tAnalysis("na");
                                        })(),
                                      }),
                                    ) ?? tMath("analysis.og.body", {
                                      og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                      volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                      efficiency: (() => {
                                        const ext = (recipe as any)?.recipeExtJson;
                                        const e = ext && typeof ext === "object" && !Array.isArray(ext) ? (ext as any) : null;
                                        const mashEff =
                                          typeof e?.equipment?.mash?.mashEfficiencyPercent === "number" && Number.isFinite(e.equipment.mash.mashEfficiencyPercent)
                                            ? e.equipment.mash.mashEfficiencyPercent
                                            : null;
                                        const brewEff =
                                          typeof e?.brewhouseEfficiencyPercent === "number" && Number.isFinite(e.brewhouseEfficiencyPercent)
                                            ? e.brewhouseEfficiencyPercent
                                            : null;
                                        const bjEff =
                                          (recipe as any)?.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.efficiency?.brewhouse?.unit === "%"
                                            ? (recipe as any)?.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.efficiency?.brewhouse?.value
                                            : null;
                                        const eff = mashEff ?? brewEff ?? (typeof bjEff === "number" && Number.isFinite(bjEff) ? bjEff : null);
                                        return eff != null ? fmt(eff, 1) : tAnalysis("na");
                                      })(),
                                    }),
                                  )}
                                </XStack>
                            </View>
                            <View>
                              <CodeInline>{fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3)}</CodeInline>
                            </View>
                          </XStack>
                          <XStack gap="$2" ai="baseline">
                            <View minW={180} pr="$3">
                                <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.fg")}</SizableText>
                                  {renderMath(
                                    "analysis.fg",
                                    renderDerivationMath(
                                      "analysis.fg",
                                      tMath("analysis.fg.body", {
                                        og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                        attenuation: fmtField("attenuationEffectivePercent", a?.attenuationEffectivePercent, 1),
                                        fg: fmtField("fgEstimatedSg", a?.fgEstimatedSg, 3),
                                      }),
                                    ) ?? tMath("analysis.fg.body", {
                                      og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                      attenuation: fmtField("attenuationEffectivePercent", a?.attenuationEffectivePercent, 1),
                                      fg: fmtField("fgEstimatedSg", a?.fgEstimatedSg, 3),
                                    }),
                                  )}
                                </XStack>
                            </View>
                            <View>
                              <CodeInline>{fmtField("fgEstimatedSg", a?.fgEstimatedSg, 3)}</CodeInline>
                            </View>
                          </XStack>
                          <XStack gap="$2" ai="baseline">
                            <View minW={180} pr="$3">
                                <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.attenuation")}</SizableText>
                                  {renderMath(
                                    "analysis.attenuation",
                                    renderDerivationMath(
                                      "analysis.attenuation",
                                      tMath("analysis.attenuation.body", {
                                        attenuation: fmtField("attenuationEffectivePercent", a?.attenuationEffectivePercent, 1),
                                        yeastLines: yeastLines.lines,
                                        selectedLines: yeastLines.selectedLines,
                                        topAvg: yeastLines.topAvg,
                                      }),
                                    ) ?? tMath("analysis.attenuation.body", {
                                      attenuation: fmtField("attenuationEffectivePercent", a?.attenuationEffectivePercent, 1),
                                      yeastLines: yeastLines.lines,
                                      selectedLines: yeastLines.selectedLines,
                                      topAvg: yeastLines.topAvg,
                                    }),
                                  )}
                                </XStack>
                            </View>
                            <View>
                              <XStack gap="$1" ai="baseline" display="inline-flex">
                                <CodeInline>{fmtField("attenuationEffectivePercent", a?.attenuationEffectivePercent, 1)}</CodeInline>
                                {typeof a?.attenuationEffectivePercent === "number" ? (
                                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">%</SizableText>
                                ) : null}
                              </XStack>
                            </View>
                          </XStack>
                          <XStack gap="$2" ai="baseline">
                            <View minW={180} pr="$3">
                                <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.pbg")}</SizableText>
                                  {renderMath(
                                    "analysis.pbg",
                                    renderDerivationMath(
                                      "analysis.pbg",
                                      tMath("analysis.pbg.body", {
                                        pbg: fmtField("pbgEstimatedSg", a?.pbgEstimatedSg, 3),
                                        preBoilVolume: fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2),
                                        efficiency: (() => {
                                          const ext = (recipe as any)?.recipeExtJson;
                                          const e = ext && typeof ext === "object" && !Array.isArray(ext) ? (ext as any) : null;
                                          const mashEff =
                                            typeof e?.equipment?.mash?.mashEfficiencyPercent === "number" && Number.isFinite(e.equipment.mash.mashEfficiencyPercent)
                                              ? e.equipment.mash.mashEfficiencyPercent
                                              : null;
                                          const brewEff =
                                            typeof e?.brewhouseEfficiencyPercent === "number" && Number.isFinite(e.brewhouseEfficiencyPercent)
                                              ? e.brewhouseEfficiencyPercent
                                              : null;
                                          const bjEff =
                                            (recipe as any)?.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.efficiency?.brewhouse?.unit === "%"
                                              ? (recipe as any)?.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.efficiency?.brewhouse?.value
                                              : null;
                                          const eff = mashEff ?? brewEff ?? (typeof bjEff === "number" && Number.isFinite(bjEff) ? bjEff : null);
                                          return eff != null ? fmt(eff, 1) : tAnalysis("na");
                                        })(),
                                      }),
                                    ) ?? tMath("analysis.pbg.body", {
                                      pbg: fmtField("pbgEstimatedSg", a?.pbgEstimatedSg, 3),
                                      preBoilVolume: fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2),
                                      efficiency: (() => {
                                        const ext = (recipe as any)?.recipeExtJson;
                                        const e = ext && typeof ext === "object" && !Array.isArray(ext) ? (ext as any) : null;
                                        const mashEff =
                                          typeof e?.equipment?.mash?.mashEfficiencyPercent === "number" && Number.isFinite(e.equipment.mash.mashEfficiencyPercent)
                                            ? e.equipment.mash.mashEfficiencyPercent
                                            : null;
                                        const brewEff =
                                          typeof e?.brewhouseEfficiencyPercent === "number" && Number.isFinite(e.brewhouseEfficiencyPercent)
                                            ? e.brewhouseEfficiencyPercent
                                            : null;
                                        const bjEff =
                                          (recipe as any)?.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.efficiency?.brewhouse?.unit === "%"
                                            ? (recipe as any)?.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.efficiency?.brewhouse?.value
                                            : null;
                                        const eff = mashEff ?? brewEff ?? (typeof bjEff === "number" && Number.isFinite(bjEff) ? bjEff : null);
                                        return eff != null ? fmt(eff, 1) : tAnalysis("na");
                                      })(),
                                    }),
                                  )}
                                </XStack>
                            </View>
                            <View>
                              <CodeInline>{fmtField("pbgEstimatedSg", a?.pbgEstimatedSg, 3)}</CodeInline>
                            </View>
                          </XStack>
                        </YStack>
                      </View>

                      {warnings.length ? (
                        <View
                          as="details"
                          bg="var(--field-computed-bg)"
                          borderWidth={1}
                          borderColor="var(--field-computed-border)"
                          rounded="$2"
                          p="$3"
                          mt="$3"
                        >
                          <RecipeEditSummary>
                            <XStack gap="$2" flexWrap="wrap" items="baseline" display="inline-flex">
                              <SizableText size="$3" fontWeight="bold" fontFamily="$body" color="var(--text)">
                                {tAnalysis("warningsTitle")}
                              </SizableText>
                              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                                {tAnalysis("warningsClickToExpand")}
                              </SizableText>
                            </XStack>
                          </RecipeEditSummary>
                          <RecipeEditList gap="$1" mt="$2">
                            {warnings.map((w, idx) => (
                              <SizableText
                                as="li"
                                key={`${String(w?.code ?? "warn")}-${idx}`}
                                size="$2"
                                fontFamily="$body"
                                color="var(--text)"
                              >
                                <CodeInline>{String(w?.code ?? "warning")}</CodeInline>{" "}
                                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                                  {tAnalysis(`warnings.${String(w?.code ?? "unknown")}` as any)}
                                </SizableText>
                              </SizableText>
                            ))}
                          </RecipeEditList>
                        </View>
                      ) : null}
                    </>
                  );
                })()}
          </RecipeEditSection>

          <RecipeEditSection
            id="equipment"
            headingId="equipment-heading"
            label={t("sections.equipment")}
            open={openSections.equipment}
            onOpenChange={(open) => setSectionOpen("equipment", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {tEquip("help")}
            </SizableText>

            {equipmentProfilesError ? (
              <ErrorBox>{equipmentProfilesError}</ErrorBox>
            ) : null}

            <XStack gap="$3" mt="$3" flexWrap="wrap" items="flex-end">
              <View flex={1} minW={200}>
                <RecipeEditField id="equipment-profile" label={tEquip("profileLabel")}>
                  <select
                    id="equipment-profile"
                    name="equipmentProfileId"
                    value={selectedEquipmentProfileId}
                    onChange={(e) => setSelectedEquipmentProfileId(e.target.value)}
                    disabled={equipmentProfilesLoading}
                    className="recipeEditSelect recipeEditSelectFull"
                  >
                    <option value="">{tEquip("noneOption")}</option>
                    {equipmentProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </RecipeEditField>
              </View>
              <Button
                onPress={() => void applyEquipmentProfileToRecipe("apply")}
                disabled={!selectedEquipmentProfileId || equipmentApplying}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {equipmentApplying ? tEquip("working") : tEquip("apply")}
              </Button>
              <Button
                onPress={() => void applyEquipmentProfileToRecipe("reload")}
                disabled={!selectedEquipmentProfileId || equipmentApplying}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {equipmentApplying ? tEquip("working") : tEquip("reload")}
              </Button>
            </XStack>

            {equipmentApplyError ? (
              <ErrorBox mt="$3">{equipmentApplyError}</ErrorBox>
            ) : null}

            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
              {tEquip("manageTemplatesText")} <Link href="/equipment">{tEquip("manageTemplatesLinkText")}</Link>.
            </SizableText>
          </RecipeEditSection>

          <RecipeEditSection
            id="mashing"
            headingId="mashing-heading"
            label={t("sections.mashing")}
            open={openSections.mashing}
            onOpenChange={(open) => setSectionOpen("mashing", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("mashingHelp")}
            </SizableText>

            {waterVolumes ? (
              <RecipeEditFieldBlock
                variant="computed"
                header={t("mashingWaterVolumesTitle")}
                badge="Computed"
                source={t("mashingWaterVolumesSource")}
                mt="$3"
                mb="$3"
              >
                <RecipeEditList gap="$1" mt="$2" mb={0}>
                  <SizableText as="li" size="$2" fontFamily="$body" color="var(--text)">
                    Mash water: <CodeInline>{formatFixed(locale, waterVolumes.mashLiters, 2)}</CodeInline> {tUnits("L")}
                  </SizableText>
                  <SizableText as="li" size="$2" fontFamily="$body" color="var(--text)">
                    Sparge water: <CodeInline>{formatFixed(locale, waterVolumes.spargeLiters, 2)}</CodeInline> {tUnits("L")}
                  </SizableText>
                </RecipeEditList>
              </RecipeEditFieldBlock>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb="$3">
                {t("mashingWaterVolumesUnavailable")}
              </SizableText>
            )}

                <View mt="$3">
                  <MashStepsEditor
                    mashRows={mashRowsFiltered}
                    mashProcedure={mashProcedure}
                    waterVolumes={waterVolumes}
                    readOnly
                    recipeId={recipeId}
                    t={t}
                    tUnits={tUnits}
                    locale={locale}
                    formatFixed={formatFixed}
                  />
                </View>

                {spargeConfigured ? (
                  <View mt="$4">
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2">
                      {t("spargeStepFromWaterPage")}
                    </SizableText>
                    <RecipeEditIngredientCard>
                      <XStack gap="$3" flexWrap="wrap" items="flex-end">
                        <View alignSelf="center">
                          <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                            {mashRowsFiltered.length + 1}
                          </SizableText>
                        </View>
                        <YStack gap="$1" minW={80}>
                          <RecipeEditFieldLabel>{t("mashingStepName")}</RecipeEditFieldLabel>
                          <RecipeEditReadOnlyValue>Sparge</RecipeEditReadOnlyValue>
                        </YStack>
                        <YStack gap="$1" minW={80}>
                          <RecipeEditFieldLabel>{t("mashingStepType")}</RecipeEditFieldLabel>
                          <RecipeEditReadOnlyValue>Sparge</RecipeEditReadOnlyValue>
                        </YStack>
                        <YStack gap="$1" minW={60}>
                          <RecipeEditFieldLabel htmlFor="sparge-step-temp">
                            {t("mashingStepTemp", { unit: "°C" })}
                          </RecipeEditFieldLabel>
                          <Input
                            id="sparge-step-temp"
                            value={spargeStepTempDisplay === null || spargeStepTempDisplay === undefined ? "" : String(spargeStepTempDisplay)}
                            onChangeText={(text) => {
                              if (text === "") {
                                setSpargeStepTempLocal(null);
                              } else {
                                const v = parseFloat(text);
                                setSpargeStepTempLocal(Number.isFinite(v) ? v : null);
                              }
                            }}
                            onBlur={() => {
                              const v = spargeStepTempLocal;
                              if (v !== null && Number.isFinite(v) && v >= 0 && v <= 100) {
                                void saveSpargeStepTemperature(v);
                              } else {
                                setSpargeStepTempLocal(null);
                              }
                            }}
                            keyboardType="numeric"
                            disabled={spargeStepTempSaving}
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                          />
                        </YStack>
                        <YStack gap="$1" minW={50}>
                          <RecipeEditFieldLabel>{t("mashingStepTime", { unit: "min" })}</RecipeEditFieldLabel>
                          <RecipeEditReadOnlyValue>0</RecipeEditReadOnlyValue>
                        </YStack>
                        <YStack gap="$1" minW={80}>
                          <RecipeEditFieldLabel>{t("mashingStepAmount", { unit: "L" })}</RecipeEditFieldLabel>
                          <RecipeEditReadOnlyValue>
                            <CodeInline>{formatFixed(locale, waterVolumes.spargeLiters, 2)}</CodeInline> {tUnits("L")}
                          </RecipeEditReadOnlyValue>
                        </YStack>
                        <YStack gap="$1" minW={50}>
                          <RecipeEditFieldLabel>{t("mashingStepRamp", { unit: "min" })}</RecipeEditFieldLabel>
                          <RecipeEditReadOnlyValue>—</RecipeEditReadOnlyValue>
                        </YStack>
                      </XStack>
                    </RecipeEditIngredientCard>
                    <SizableText size="$2" fontFamily="$body" color="var(--text)" mt="$2" mb={0}>
                      <Link href={`/recipes/${recipeId}/water/sparge`}>
                        {t("spargeStepConfigureLink")}
                      </Link>
                    </SizableText>
                  </View>
                ) : null}
          </RecipeEditSection>

          <RecipeEditSection
            id="fermentables"
            headingId="fermentables-heading"
            label={t("sections.fermentables")}
            open={openSections.fermentables}
            onOpenChange={(open) => setSectionOpen("fermentables", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              v0: enter your grist here. Water calculator can import a read-only snapshot.
            </SizableText>

            <View mt="$3">
              <form onSubmit={onSearchFermentables}>
                <RecipeEditFieldLabel htmlFor="fermentable-search">
                Search fermentables database
              </RecipeEditFieldLabel>
              <XStack gap="$2" items="center" flexWrap="wrap">
                <Input
                  id="fermentable-search"
                  value={fermentableQuery}
                  onChangeText={setFermentableQuery}
                  flex={1}
                  minW={200}
                  autoComplete="off"
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
                <Button
                  type="submit"
                  disabled={!canCallAccountScoped || fermentableSearching}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {fermentableSearching ? "Searching…" : "Search"}
                </Button>
                <Button
                  type="button"
                  onPress={clearFermentableSearchResults}
                  disabled={fermentableSearching || (!fermentableSearchError && fermentableResults.length === 0)}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {t("buttons.clear")}
                </Button>
              </XStack>
              {fermentableSearchError ? (
                <ErrorBox mt="$2">{fermentableSearchError}</ErrorBox>
              ) : null}
              {fermentableResults.length ? (
                <View overflowX="auto" mt="$2">
                  <YStack gap="$1">
                    <XStack gap="$2" ai="center" minW="max-content">
                      <View minW={140}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Name</SizableText></View>
                      <View minW={100}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Producer</SizableText></View>
                      <View minW={50}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">°L</SizableText></View>
                      <View minW={70}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Yield %</SizableText></View>
                      <View minW={60}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">PPG</SizableText></View>
                      <View minW={60} />
                    </XStack>
                    {fermentableResults.slice(0, 20).map((it) => (
                      <XStack key={it.id} gap="$2" ai="center" minW="max-content">
                        <View minW={140}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.name}</SizableText></View>
                        <View minW={100}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.producer ?? ""}</SizableText></View>
                        <View minW={50}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.colorLovibond === "number" ? it.colorLovibond.toFixed(1) : ""}</SizableText></View>
                        <View minW={70}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.yieldPercent === "number" ? it.yieldPercent.toFixed(3) : ""}</SizableText></View>
                        <View minW={60}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.ppg === "number" ? it.ppg.toFixed(3) : ""}</SizableText></View>
                        <View minW={60}>
                          <Button
                            size="$2"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                            onPress={() => addFermentableFromDb(it)}
                            disabled={!canCallAccountScoped}
                          >
                            Add
                          </Button>
                        </View>
                      </XStack>
                    ))}
                  </YStack>
                </View>
              ) : null}
              </form>
            </View>

            <XStack gap="$3" items="center" flexWrap="wrap">
              <Button
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
                onPress={addGristRow}
                disabled={!canCallAccountScoped}
              >
                {t("buttons.addFermentable")}
              </Button>
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite">
                {t("gristTotalKg", { value: gristTotals.totalKg.toFixed(3), unit: tUnits("kg") })}
                {gristTotals.weightedAvgLovibond !== null ? (
                  <> · {t("gristAvgColor", { value: gristTotals.weightedAvgLovibond.toFixed(1), unit: tUnits("lovibond") })}</>
                ) : null}
              </SizableText>
            </XStack>

            {gristRows.length ? (
              <View overflowX="auto" mt="$3">
                <YStack gap="$3">
                  {gristRows.map((r, idx) => (
                    <RecipeEditIngredientCard key={r.id}>
                                <XStack gap="$3" flexWrap="wrap" items="flex-end" flexDirection="row">
                                  <View alignSelf="center">
                                    <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                                      {idx + 1}
                                    </SizableText>
                                  </View>
                                  <YStack gap="$1" flex={1} minW={240} minWidth={0}>
                                    <RecipeEditFieldLabel htmlFor={`grist-name-${r.id}`}>Name</RecipeEditFieldLabel>
                                    <Input
                                      id={`grist-name-${r.id}`}
                                      value={r.name}
                                      onChangeText={(text) =>
                                        updateGristRow(r.id, {
                                          name: text,
                                          ingredientId: null,
                                          producer: null,
                                          group: null,
                                          mashDiPh: null,
                                          mashTaToPh57_mEqPerKg: null,
                                          mashRoastDehuskedOverride: null,
                                          mashRoastDehuskedSource: "unknown",
                                          mashPhModelSource: "unknown",
                                        })
                                      }
                                      autoComplete="off"
                                      size="$3"
                                      w="100%"
                                      bg="var(--surface)"
                                      borderWidth={1}
                                      borderColor="var(--border)"
                                      rounded="$2"
                                      fontFamily="$body"
                                    />
                                  </YStack>
                                  {(r.producer ?? "") ? (
                                    <YStack gap="$1" minW={100}>
                                      <RecipeEditFieldLabel>Producer</RecipeEditFieldLabel>
                                      <RecipeEditReadOnlyValue>{r.producer}</RecipeEditReadOnlyValue>
                                    </YStack>
                                  ) : null}
                                  {(r.group ?? "") ? (
                                    <YStack gap="$1" minW={100}>
                                      <RecipeEditFieldLabel>Group</RecipeEditFieldLabel>
                                      <RecipeEditReadOnlyValue>{r.group}</RecipeEditReadOnlyValue>
                                    </YStack>
                                  ) : null}
                                  <Button
                                    size="$2"
                                    bg="var(--surface-2)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    color="var(--text)"
                                    fontFamily="$body"
                                    onPress={() => removeGristRow(r.id)}
                                    aria-label={`Remove fermentable row ${idx + 1}`}
                                  >
                                    Remove
                                  </Button>
                                </XStack>

                                <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
                                <YStack gap="$1" minW={100}>
                                  <RecipeEditFieldLabel htmlFor={`grist-kg-${r.id}`}>
                                    {t("amountLabel", { unit: tUnits("kg") })}
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`grist-kg-${r.id}`}
                                    value={String(r.amountKg)}
                                    onChangeText={(text) =>
                                      updateGristRow(r.id, { amountKg: text === "" ? 0 : Number(text) })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={140}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>

                                <YStack gap="$1" minW={80}>
                                  <RecipeEditFieldLabel htmlFor={`grist-lov-${r.id}`}>
                                    {t("colorLabel", { unit: tUnits("lovibond") })}
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`grist-lov-${r.id}`}
                                    value={r.colorLovibond ?? ""}
                                    onChangeText={(text) =>
                                      updateGristRow(r.id, {
                                        colorLovibond: text === "" ? null : Number(text),
                                      })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={100}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>

                                <YStack gap="$1" minW={140}>
                                  <RecipeEditFieldLabel htmlFor={`grist-class-${r.id}`}>
                                    Mash pH class (legacy)
                                  </RecipeEditFieldLabel>
                                  <select
                                    id={`grist-class-${r.id}`}
                                    value={r.maltClass}
                                    onChange={(e) => updateGristRow(r.id, { maltClass: e.target.value as any })}
                                    className="recipeEditSelect"
                                  >
                                    <option value="base">Base</option>
                                    <option value="crystal">Crystal</option>
                                    <option value="roast">Roast</option>
                                    <option value="acid">Acid malt</option>
                                  </select>
                                </YStack>

                                <YStack gap="$1" minW={140}>
                                  <RecipeEditFieldLabel htmlFor={`grist-timing-${r.id}`}>
                                    {t("fermentableTimingLabel")}
                                  </RecipeEditFieldLabel>
                                  <select
                                    id={`grist-timing-${r.id}`}
                                    value={r.timingUse ?? "add_to_mash"}
                                    onChange={(e) =>
                                      updateGristRow(r.id, {
                                        timingUse: e.target.value === "add_to_boil" ? "add_to_boil" : "add_to_mash",
                                      })
                                    }
                                    className="recipeEditSelect"
                                  >
                                    <option value="add_to_mash">{t("fermentableTimingMash")}</option>
                                    <option value="add_to_boil">{t("fermentableTimingKettle")}</option>
                                  </select>
                                </YStack>

                                <YStack gap="$1" minW={140}>
                                  <RecipeEditFieldLabel htmlFor={`grist-pot-kind-${r.id}`}>
                                    Potential kind
                                  </RecipeEditFieldLabel>
                                  <select
                                    id={`grist-pot-kind-${r.id}`}
                                    value={r.potential?.kind ?? ""}
                                    onChange={(e) => {
                                      const kind = e.target.value as GristPotentialKind | "";
                                      if (!kind) return updateGristRow(r.id, { potential: null });
                                      updateGristRow(r.id, {
                                        potential: { kind, value: roundTo(r.potential?.value ?? 0, 3) },
                                      });
                                    }}
                                    className="recipeEditSelect"
                                  >
                                    <option value="">(none)</option>
                                    <option value="ppg">PPG</option>
                                    <option value="yieldPercent">Yield %</option>
                                    <option value="sg">SG (e.g. 1.037)</option>
                                  </select>
                                </YStack>

                                <YStack gap="$1" minW={100}>
                                  <RecipeEditFieldLabel htmlFor={`grist-pot-val-${r.id}`}>
                                    Potential value
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`grist-pot-val-${r.id}`}
                                    value={r.potential ? String(roundTo(r.potential.value, 3)) : ""}
                                    onChangeText={(text) => {
                                      const v = text === "" ? null : Number(text);
                                      if (!r.potential) return;
                                      if (v === null) return updateGristRow(r.id, { potential: null });
                                      updateGristRow(r.id, { potential: { ...r.potential, value: roundTo(v, 3) } });
                                    }}
                                    disabled={!r.potential}
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={140}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>

                                <View flexBasis="100%" w="100%">
                                  <details>
                                    <RecipeEditSummary>
                                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                                        Mash pH model (v1) – Advanced users
                                      </SizableText>
                                    </RecipeEditSummary>
                                    <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
                                      {isRoastedLike(r) ? (
                                        <>
                                          <YStack gap="$1" w={220} maxW="100%">
                                            <RecipeEditFieldLabel>Dehusked/de-bittered</RecipeEditFieldLabel>
                                            <RecipeEditReadOnlyValue>
                                              {typeof r.mashRoastDehuskedOverride === "boolean"
                                                ? r.mashRoastDehuskedOverride
                                                  ? "yes"
                                                  : "no"
                                                : r.mashRoastDehuskedSource === "inferred"
                                                  ? inferDehuskedFromName(r.name)
                                                    ? "yes"
                                                    : "no"
                                                  : ""}
                                            </RecipeEditReadOnlyValue>
                                          </YStack>
                                          <YStack gap="$1" w={260} maxW="100%">
                                            <RecipeEditFieldLabel htmlFor={`grist-roast-dehusked-override-${r.id}`}>
                                              Override
                                            </RecipeEditFieldLabel>
                                            <select
                                              id={`grist-roast-dehusked-override-${r.id}`}
                                              value={
                                                typeof r.mashRoastDehuskedOverride === "boolean"
                                                  ? r.mashRoastDehuskedOverride
                                                    ? "force_dehusked"
                                                    : "force_husked"
                                                  : "auto"
                                              }
                                              onChange={(e) => {
                                                const v = e.target.value;
                                                if (v === "auto") {
                                                  updateGristRow(r.id, {
                                                    mashRoastDehuskedOverride: null,
                                                    mashRoastDehuskedSource: "unknown",
                                                  });
                                                } else if (v === "force_husked") {
                                                  updateGristRow(r.id, {
                                                    mashRoastDehuskedOverride: false,
                                                    mashRoastDehuskedSource: "override",
                                                  });
                                                } else if (v === "force_dehusked") {
                                                  updateGristRow(r.id, {
                                                    mashRoastDehuskedOverride: true,
                                                    mashRoastDehuskedSource: "override",
                                                  });
                                                }
                                              }}
                                              className="recipeEditSelect recipeEditSelectFull"
                                            >
                                              <option value="auto">Auto (detect)</option>
                                              <option value="force_husked">Force husked</option>
                                              <option value="force_dehusked">Force dehusked/de-bittered</option>
                                            </select>
                                          </YStack>
                                          <YStack gap="$1" w={200} maxW="100%">
                                            <RecipeEditFieldLabel>Dehusked source</RecipeEditFieldLabel>
                                            <RecipeEditReadOnlyValue>{r.mashRoastDehuskedSource ?? "unknown"}</RecipeEditReadOnlyValue>
                                          </YStack>
                                        </>
                                      ) : null}
                                      <YStack gap="$1" w={240} maxW="100%">
                                        <RecipeEditFieldLabel htmlFor={`grist-mash-di-ph-${r.id}`}>
                                          DI mash pH (room temp)
                                        </RecipeEditFieldLabel>
                                        <Input
                                          id={`grist-mash-di-ph-${r.id}`}
                                          value={r.mashDiPh ?? ""}
                                          onChangeText={(text) =>
                                            updateGristRow(r.id, {
                                              mashDiPh: text === "" ? null : Number(text),
                                              mashPhModelSource: "override",
                                            })
                                          }
                                          keyboardType="decimal-pad"
                                          size="$3"
                                          w="100%"
                                          bg="var(--surface)"
                                          borderWidth={1}
                                          borderColor="var(--border)"
                                          rounded="$2"
                                          fontFamily="$body"
                                        />
                                      </YStack>
                                      <YStack gap="$1" w={280} maxW="100%">
                                        <RecipeEditFieldLabel htmlFor={`grist-mash-ta-${r.id}`}>
                                          Titratable acidity to pH 5.7 (mEq/kg)
                                        </RecipeEditFieldLabel>
                                        <Input
                                          id={`grist-mash-ta-${r.id}`}
                                          value={r.mashTaToPh57_mEqPerKg ?? ""}
                                          onChangeText={(text) =>
                                            updateGristRow(r.id, {
                                              mashTaToPh57_mEqPerKg: text === "" ? null : Number(text),
                                              mashPhModelSource: "override",
                                            })
                                          }
                                          keyboardType="decimal-pad"
                                          size="$3"
                                          w="100%"
                                          bg="var(--surface)"
                                          borderWidth={1}
                                          borderColor="var(--border)"
                                          rounded="$2"
                                          fontFamily="$body"
                                        />
                                      </YStack>
                                      <YStack gap="$1" w={200} maxW="100%">
                                        <RecipeEditFieldLabel>Source</RecipeEditFieldLabel>
                                        <RecipeEditReadOnlyValue>{r.mashPhModelSource ?? "unknown"}</RecipeEditReadOnlyValue>
                                      </YStack>
                                    </XStack>
                                  </details>
                                </View>
                              </XStack>
                            </RecipeEditIngredientCard>
                  ))}
                </YStack>
              </View>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                No fermentables yet.
              </SizableText>
            )}

                <XStack mt="$3" justify="flex-end">
                  <Button
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                    onPress={onSave}
                    disabled={!canCallAccountScoped || saving}
                  >
                    {saving ? "Saving…" : "Save (including grist)"}
                  </Button>
                </XStack>

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </SizableText>
          </RecipeEditSection>

          <AdSlot placement="recipe_edit_after_fermentables" />

          <RecipeEditSection
            id="hops"
            headingId="hops-heading"
            label={t("sections.hops")}
            open={openSections.hops}
            onOpenChange={(open) => setSectionOpen("hops", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("hopsHelp")}
            </SizableText>

            <View mt="$3">
              <form onSubmit={onSearchHops}>
                <RecipeEditFieldLabel htmlFor="hop-search">Search hops database</RecipeEditFieldLabel>
              <XStack gap="$2" items="center" flexWrap="wrap">
                <Input
                  id="hop-search"
                  value={hopQuery}
                  onChangeText={setHopQuery}
                  flex={1}
                  minW={200}
                  autoComplete="off"
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
                <Button
                  type="submit"
                  disabled={!canCallAccountScoped || hopSearching}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {hopSearching ? "Searching…" : "Search"}
                </Button>
                <Button
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                  onPress={clearHopSearchResults}
                  disabled={hopSearching || (!hopSearchError && hopResults.length === 0)}
                >
                  {t("buttons.clear")}
                </Button>
              </XStack>
              {hopSearchError ? <ErrorBox mt="$2">{hopSearchError}</ErrorBox> : null}
              {hopResults.length ? (
                <View overflowX="auto" mt="$2">
                  <YStack gap="$1">
                    <XStack gap="$2" ai="center" minW="max-content">
                      <View minW={180}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Name</SizableText></View>
                      <View minW={80}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Country</SizableText></View>
                      <View minW={60}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">α min</SizableText></View>
                      <View minW={60}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">α max</SizableText></View>
                      <View minW={60} />
                    </XStack>
                    {hopResults.slice(0, 20).map((it) => (
                      <XStack key={it.id} gap="$2" ai="center" minW="max-content">
                        <View minW={180}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.name}</SizableText></View>
                        <View minW={80}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.country ?? ""}</SizableText></View>
                        <View minW={60}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.alphaMin === "number" ? it.alphaMin.toFixed(1) : ""}</SizableText></View>
                        <View minW={60}><SizableText size="$2" fontFamily="$body" color="var(--text)" textAlign="right">{typeof it.alphaMax === "number" ? it.alphaMax.toFixed(1) : ""}</SizableText></View>
                        <View minW={60}>
                          <Button
                            size="$2"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                            onPress={() => addHopFromDb(it)}
                            disabled={!canCallAccountScoped}
                          >
                            Add
                          </Button>
                        </View>
                      </XStack>
                    ))}
                  </YStack>
                </View>
              ) : null}
              </form>
            </View>

            <XStack gap="$3" items="center" mt="$3">
              <Button
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
                onPress={() => addHopRow()}
                disabled={!canCallAccountScoped}
              >
                Add hop
              </Button>
            </XStack>

            {hopsRows.length ? (
              <View overflowX="auto" mt="$3">
                <YStack gap="$3">
                  {hopsRows.map((r, idx) => (
                    <RecipeEditIngredientCard key={r.id}>
                                <XStack gap="$3" flexWrap="wrap" items="flex-end">
                                  <View alignSelf="center">
                                    <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                                      {idx + 1}
                                    </SizableText>
                                  </View>
                                  <YStack gap="$1" flex={1} minW={280} minWidth={0}>
                                    <RecipeEditFieldLabel htmlFor={`hop-name-${r.id}`}>Name</RecipeEditFieldLabel>
                                    <Input
                                      id={`hop-name-${r.id}`}
                                      value={r.name}
                                      onChangeText={(text) =>
                                        updateHopRow(r.id, { name: text, ingredientId: null, country: null })
                                      }
                                      autoComplete="off"
                                      size="$3"
                                      w="100%"
                                      bg="var(--surface)"
                                      borderWidth={1}
                                      borderColor="var(--border)"
                                      rounded="$2"
                                      fontFamily="$body"
                                    />
                                  </YStack>
                                  {(r.country ?? "") ? (
                                    <YStack gap="$1" w={240} maxW="100%">
                                      <RecipeEditFieldLabel>Country</RecipeEditFieldLabel>
                                      <RecipeEditReadOnlyValue>{r.country}</RecipeEditReadOnlyValue>
                                    </YStack>
                                  ) : null}
                                  <Button
                                    size="$2"
                                    bg="var(--surface-2)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    color="var(--text)"
                                    fontFamily="$body"
                                    onPress={() => removeHopRow(r.id)}
                                    aria-label={`Remove hop row ${idx + 1}`}
                                  >
                                    Remove
                                  </Button>
                                </XStack>

                                <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
                                <YStack gap="$1" minW={100}>
                                  <RecipeEditFieldLabel htmlFor={`hop-g-${r.id}`}>
                                    {t("amountLabel", { unit: tUnits("g") })}
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`hop-g-${r.id}`}
                                    value={String(r.amountGrams)}
                                    onChangeText={(text) =>
                                      updateHopRow(r.id, { amountGrams: text === "" ? 0 : Number(text) })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={120}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>

                                <YStack gap="$1" minW={90}>
                                  <RecipeEditFieldLabel htmlFor={`hop-aa-${r.id}`}>Alpha (%)</RecipeEditFieldLabel>
                                  <Input
                                    id={`hop-aa-${r.id}`}
                                    value={r.alphaAcidPercent ?? ""}
                                    onChangeText={(text) =>
                                      updateHopRow(r.id, {
                                        alphaAcidPercent: text === "" ? null : Number(text),
                                      })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={110}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>

                                <YStack gap="$1" minW={130}>
                                  <RecipeEditFieldLabel htmlFor={`hop-use-${r.id}`}>Use</RecipeEditFieldLabel>
                                  <select
                                    id={`hop-use-${r.id}`}
                                    value={r.use}
                                    onChange={(e) => updateHopRow(r.id, { use: e.target.value as HopUse })}
                                    className="recipeEditSelect"
                                  >
                                    <option value="boil">Boil</option>
                                    <option value="whirlpool">Whirlpool</option>
                                    <option value="dryhop">Dry hop</option>
                                  </select>
                                </YStack>

                                <YStack gap="$1" minW={90}>
                                  <RecipeEditFieldLabel htmlFor={`hop-min-${r.id}`}>Time (min)</RecipeEditFieldLabel>
                                  <Input
                                    id={`hop-min-${r.id}`}
                                    value={r.timeMinutes ?? ""}
                                    onChangeText={(text) =>
                                      updateHopRow(r.id, { timeMinutes: text === "" ? null : Number(text) })
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w={110}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>
                              </XStack>
                            </RecipeEditIngredientCard>
                  ))}
                </YStack>
              </View>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                No hops yet.
              </SizableText>
            )}

                <XStack mt="$3" justify="flex-end">
                  <Button
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                    onPress={onSave}
                    disabled={!canCallAccountScoped || saving}
                  >
                    {saving ? "Saving…" : "Save (including hops)"}
                  </Button>
                </XStack>

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </SizableText>
          </RecipeEditSection>

          <AdSlot placement="recipe_edit_after_hops" />

          <RecipeEditSection
            id="yeast"
            headingId="yeast-heading"
            label={t("sections.yeast")}
            open={openSections.yeast}
            onOpenChange={(open) => setSectionOpen("yeast", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("yeastHelp")}
            </SizableText>

            <View mt="$3">
              <form onSubmit={onSearchYeasts}>
                <RecipeEditFieldLabel htmlFor="yeast-search">Search yeast database</RecipeEditFieldLabel>
              <XStack gap="$2" items="center" flexWrap="wrap">
                <Input
                  id="yeast-search"
                  value={yeastQuery}
                  onChangeText={setYeastQuery}
                  flex={1}
                  minW={200}
                  autoComplete="off"
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
                <Button
                  type="submit"
                  disabled={!canCallAccountScoped || yeastSearching}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {yeastSearching ? "Searching…" : "Search"}
                </Button>
                <Button
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                  onPress={clearYeastSearchResults}
                  disabled={yeastSearching || (!yeastSearchError && yeastResults.length === 0)}
                >
                  {t("buttons.clear")}
                </Button>
              </XStack>
              {yeastSearchError ? <ErrorBox mt="$2">{yeastSearchError}</ErrorBox> : null}
              {yeastResults.length ? (
                <View overflowX="auto" mt="$2">
                  <YStack gap="$1">
                    <XStack gap="$2" ai="center" minW="max-content">
                      <View minW={180}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Name</SizableText></View>
                      <View minW={100}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Lab</SizableText></View>
                      <View minW={100}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Product ID</SizableText></View>
                      <View minW={80}><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">Type</SizableText></View>
                      <View minW={60} />
                    </XStack>
                    {yeastResults.slice(0, 20).map((it) => (
                      <XStack key={it.id} gap="$2" ai="center" minW="max-content">
                        <View minW={180}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.name}</SizableText></View>
                        <View minW={100}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.lab ?? ""}</SizableText></View>
                        <View minW={100}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.productId ?? ""}</SizableText></View>
                        <View minW={80}><SizableText size="$2" fontFamily="$body" color="var(--text)">{it.type ?? ""}</SizableText></View>
                        <View minW={60}>
                          <Button
                            size="$2"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                            onPress={() => addYeastFromDb(it)}
                            disabled={!canCallAccountScoped}
                          >
                            Add
                          </Button>
                        </View>
                      </XStack>
                    ))}
                  </YStack>
                </View>
              ) : null}
              </form>
            </View>

            <XStack gap="$3" items="center" mt="$3">
              <Button
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
                onPress={() => addYeastRow()}
                disabled={!canCallAccountScoped}
              >
                Add yeast
              </Button>
            </XStack>

            {yeastRows.length ? (
              <View overflowX="auto" mt="$3">
                <YStack gap="$3">
                  {yeastRows.map((r, idx) => (
                    <RecipeEditIngredientCard key={r.id}>
                              <XStack gap="$3" flexWrap="wrap" items="flex-end">
                                <View alignSelf="center">
                                  <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                                    {idx + 1}
                                  </SizableText>
                                </View>
                                <YStack gap="$1" flex={1} minW={280} minWidth={0}>
                                  <RecipeEditFieldLabel htmlFor={`yeast-name-${r.id}`}>Name</RecipeEditFieldLabel>
                                  <Input
                                    id={`yeast-name-${r.id}`}
                                    value={r.name}
                                    onChangeText={(text) =>
                                      updateYeastRow(r.id, {
                                        name: text,
                                        ingredientId: null,
                                        lab: null,
                                        productId: null,
                                        attenuationMin: null,
                                        attenuationMax: null,
                                      })
                                    }
                                    autoComplete="off"
                                    size="$3"
                                    w="100%"
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>
                                {(r.lab ?? "") ? (
                                  <YStack gap="$1" w={240} maxW="100%">
                                    <RecipeEditFieldLabel>Lab</RecipeEditFieldLabel>
                                    <RecipeEditReadOnlyValue>{r.lab}</RecipeEditReadOnlyValue>
                                  </YStack>
                                ) : null}
                                {(r.productId ?? "") ? (
                                  <YStack gap="$1" w={160} maxW="100%">
                                    <RecipeEditFieldLabel>Product ID</RecipeEditFieldLabel>
                                    <RecipeEditReadOnlyValue>{r.productId}</RecipeEditReadOnlyValue>
                                  </YStack>
                                ) : null}
                                <YStack gap="$1" w={160} maxW="100%">
                                  <RecipeEditFieldLabel>Atten min (%)</RecipeEditFieldLabel>
                                  <RecipeEditReadOnlyValue>
                                    {typeof r.attenuationMin === "number" ? roundTo(r.attenuationMin, 3) : ""}
                                  </RecipeEditReadOnlyValue>
                                </YStack>
                                <YStack gap="$1" w={160} maxW="100%">
                                  <RecipeEditFieldLabel>Atten max (%)</RecipeEditFieldLabel>
                                  <RecipeEditReadOnlyValue>
                                    {typeof r.attenuationMax === "number" ? roundTo(r.attenuationMax, 3) : ""}
                                  </RecipeEditReadOnlyValue>
                                </YStack>
                                <YStack gap="$1" w={200} maxW="100%">
                                  <RecipeEditFieldLabel htmlFor={`yeast-atten-override-${r.id}`}>
                                    {tAnalysis("customAttenuationPercentLabel")}
                                  </RecipeEditFieldLabel>
                                  <Input
                                    id={`yeast-atten-override-${r.id}`}
                                    value={yeastAttenuationOverrides[r.id] ?? ""}
                                    onChangeText={(text) =>
                                      setYeastAttenuationOverrides((prev) => ({ ...prev, [r.id]: text }))
                                    }
                                    keyboardType="decimal-pad"
                                    size="$3"
                                    w="100%"
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </YStack>
                                <Button
                                  size="$2"
                                  bg="var(--surface-2)"
                                  borderWidth={1}
                                  borderColor="var(--border)"
                                  color="var(--text)"
                                  fontFamily="$body"
                                  onPress={() => removeYeastRow(r.id)}
                                  aria-label={`Remove yeast row ${idx + 1}`}
                                >
                                  Remove
                                </Button>
                              </XStack>
                            </RecipeEditIngredientCard>
                  ))}
                </YStack>
              </View>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                No yeast yet.
              </SizableText>
            )}

                <XStack mt="$3" justify="flex-end">
                  <Button
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                    onPress={onSave}
                    disabled={!canCallAccountScoped || saving}
                  >
                    {saving ? "Saving…" : "Save (including yeast)"}
                  </Button>
                </XStack>

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </SizableText>
          </RecipeEditSection>

          <AdSlot placement="recipe_edit_after_yeast" />

          <RecipeEditSection
            id="other"
            headingId="other-heading"
            label={t("sections.other")}
            open={openSections.other}
            onOpenChange={(open) => setSectionOpen("other", open)}
          >
            <XStack jc="space-between" gap="$3" flexWrap="wrap">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" m={0}>
                {t("otherHelp")}
              </SizableText>
              <Button
                onPress={addMiscRow}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {t("buttons.addOtherIngredient")}
              </Button>
            </XStack>

            {miscRows.length ? (
              <YStack gap="$3" mt="$3" w="100%" minWidth={0}>
                {miscRows.map((r, idx) => {
                  const amountLabel = t("amountLabel", { unit: r.amountIsWeight ? tUnits("kg") : tUnits("L") });
                  return (
                    <RecipeEditIngredientCard key={r.id}>
                      <XStack gap="$3" flexWrap="wrap" items="flex-end" w="100%" minWidth={0}>
                        <View alignSelf="center" flexShrink={0}>
                          <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
                            {idx + 1}
                          </SizableText>
                        </View>
                        <YStack gap="$1" flex={1} minW={280} flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-name-${r.id}`}>Name</RecipeEditFieldLabel>
                          <Input
                            id={`misc-name-${r.id}`}
                            value={r.name}
                            onChangeText={(text) => updateMiscRow(r.id, { name: text })}
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient name ${idx + 1}`}
                          />
                        </YStack>

                        <YStack gap="$1" w={180} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-type-${r.id}`}>Type</RecipeEditFieldLabel>
                          <select
                            id={`misc-type-${r.id}`}
                            value={r.type}
                            onChange={(e) => updateMiscRow(r.id, { type: e.target.value as MiscType })}
                            className="recipeEditSelect recipeEditSelectFull"
                            aria-label={`Other ingredient type ${idx + 1}`}
                          >
                            {miscTypeOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </YStack>

                        <YStack gap="$1" w={160} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-use-${r.id}`}>Use</RecipeEditFieldLabel>
                          <select
                            id={`misc-use-${r.id}`}
                            value={r.use}
                            onChange={(e) => updateMiscRow(r.id, { use: e.target.value as MiscUse })}
                            className="recipeEditSelect recipeEditSelectFull"
                            aria-label={`Other ingredient use ${idx + 1}`}
                          >
                            {miscUseOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </YStack>

                        <YStack gap="$1" w={140} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-time-${r.id}`}>Time (min)</RecipeEditFieldLabel>
                          <Input
                            id={`misc-time-${r.id}`}
                            value={typeof r.timeMinutes === "number" ? String(r.timeMinutes) : ""}
                            onChangeText={(text) =>
                              updateMiscRow(r.id, { timeMinutes: text === "" ? null : Number(text) })
                            }
                            keyboardType="decimal-pad"
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient time minutes ${idx + 1}`}
                          />
                        </YStack>

                        <YStack gap="$1" w={200} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-amount-is-weight-${r.id}`}>Amount kind</RecipeEditFieldLabel>
                          <select
                            id={`misc-amount-is-weight-${r.id}`}
                            value={r.amountIsWeight ? "weight" : "volume"}
                            onChange={(e) => updateMiscRow(r.id, { amountIsWeight: e.target.value === "weight" })}
                            className="recipeEditSelect recipeEditSelectFull"
                            aria-label={`Other ingredient amount kind ${idx + 1}`}
                          >
                            <option value="weight">Weight</option>
                            <option value="volume">Volume</option>
                          </select>
                        </YStack>

                        <YStack gap="$1" w={180} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-amount-${r.id}`}>{amountLabel}</RecipeEditFieldLabel>
                          <Input
                            id={`misc-amount-${r.id}`}
                            value={
                              Number.isFinite(r.amount)
                                ? r.amountIsWeight
                                  ? formatFixed(locale, r.amount, 3)
                                  : formatFixed(locale, r.amount, 2)
                                : ""
                            }
                            onChangeText={(text) => {
                              const normalized = text.replace(",", ".");
                              const parsed = parseFloat(normalized);
                              updateMiscRow(r.id, {
                                amount: Number.isFinite(parsed) ? Math.max(0, parsed) : 0,
                              });
                            }}
                            onBlur={() => {
                              if (!Number.isFinite(r.amount)) return;
                              const decimals = r.amountIsWeight ? 3 : 2;
                              const rounded =
                                Math.round(r.amount * 10 ** decimals) / 10 ** decimals;
                              if (rounded !== r.amount) {
                                updateMiscRow(r.id, { amount: rounded });
                              }
                            }}
                            keyboardType="decimal-pad"
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient amount ${idx + 1}`}
                          />
                        </YStack>

                        <YStack gap="$1" flex={1} minW={240} flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-use-for-${r.id}`}>Use for</RecipeEditFieldLabel>
                          <Input
                            id={`misc-use-for-${r.id}`}
                            value={r.useFor ?? ""}
                            onChangeText={(text) => updateMiscRow(r.id, { useFor: text || null })}
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient use for ${idx + 1}`}
                          />
                        </YStack>

                        <YStack gap="$1" flex={1} minW={260} flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-notes-${r.id}`}>Notes</RecipeEditFieldLabel>
                          <Input
                            id={`misc-notes-${r.id}`}
                            value={r.notes ?? ""}
                            onChangeText={(text) => updateMiscRow(r.id, { notes: text || null })}
                            size="$3"
                            w="100%"
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            aria-label={`Other ingredient notes ${idx + 1}`}
                          />
                        </YStack>

                        <Button
                          size="$2"
                          flexShrink={0}
                          bg="var(--surface-2)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          color="var(--text)"
                          fontFamily="$body"
                          onPress={() => removeMiscRow(r.id)}
                          aria-label={`Remove other ingredient row ${idx + 1}`}
                        >
                          Remove
                        </Button>
                      </XStack>
                    </RecipeEditIngredientCard>
                  );
                })}
              </YStack>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                No other ingredients yet.
              </SizableText>
            )}

                <XStack mt="$3" justify="flex-end">
                  <Button
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                    onPress={onSave}
                    disabled={!canCallAccountScoped || saving}
                  >
                    {saving ? "Saving…" : "Save (including other ingredients)"}
                  </Button>
                </XStack>

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </SizableText>
          </RecipeEditSection>

          <RecipeEditSection
            id="notes"
            headingId="notes-heading"
            label={t("sections.notes")}
            open={openSections.notes}
            onOpenChange={(open) => setSectionOpen("notes", open)}
          >
            <RecipeEditField id="recipe-notes" label={t("sections.notes")}>
              <TextArea
                id="recipe-notes"
                numberOfLines={6}
                value={notes}
                onChangeText={setNotes}
                size="$3"
                w="100%"
                bg="var(--surface)"
                borderWidth={1}
                borderColor="var(--border)"
                rounded="$2"
                fontFamily="$body"
              />
            </RecipeEditField>
          </RecipeEditSection>

          <View
            as="section"
            id="water"
            aria-labelledby="water-heading"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$3"
            p="$3"
          >
            <H2 id="water-heading" m={0} size="$5" fontFamily="$heading" color="var(--text)">
              {t("sections.water")}
            </H2>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("waterHelp")}
            </SizableText>
            <XStack gap="$2" flexWrap="wrap" ai="center" mt="$2">
              <SizableText size="$2" fontFamily="$body" as="span">
                <Link href={`/recipes/${recipeId}/water`}>{t("nav.openWaterCalculator")}</Link>
              </SizableText>
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                ·
              </SizableText>
              <SizableText size="$2" fontFamily="$body" as="span">
                <Link href={`/recipes/${recipeId}/water/mash`}>{tWater("mashWater")}</Link>
              </SizableText>
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                ·
              </SizableText>
              <SizableText size="$2" fontFamily="$body" as="span">
                <Link href={`/recipes/${recipeId}/water/sparge`}>{tWater("spargeWater")}</Link>
              </SizableText>
            </XStack>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
              {t("waterProfilesManageText")} <Link href="/water-profiles">{tNav("waterProfiles")}</Link>.
            </SizableText>
          </View>
        </YStack>
      </XStack>
    </>
  );
}

