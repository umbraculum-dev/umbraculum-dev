"use client";

import { Link, useRouter } from "../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, H1, H2, Input, SizableText, TextArea, View, XStack, YStack } from "tamagui";

import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { formatFixed } from "../../../../src/i18n/format";
import { MathHelpPopover } from "../../../_components/MathHelpPopover";
import { AdSlot } from "../../../_components/AdSlot";
import { CodeInline } from "../../../_components/CodeInline";
import { StripedRow } from "../../../_components/StripedRow";
import { BrewSelect } from "../../../_components/BrewSelect";
import {
  ErrorBox,
  MessageBox,
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
  mergeYeastAttenuationRangeFromExt,
  validateMashBeforeSave,
  type EditorGristRow,
  type EditorHopRow,
  type EditorMash,
  type EditorMashStep,
  type EditorMiscRow,
  type EditorYeastRow,
} from "../../_lib/beerjsonRecipe";
import { MashStepsEditor, SpargeStepReadOnlyRow } from "@brewery/recipes-ui";
import { YeastEditor } from "../../_components/YeastEditor";
import { RecipeEditSectionsNav } from "../../_components/RecipeEditSectionsNav";
import { parseRecipeMetaFromGetRecipeResponse } from "@brewery/recipes-ui";
import { RecipeTitleWithMeta } from "../../../_components/RecipeTitleWithMeta";
import {
  fetchRecipeWaterSettings,
  saveRecipeWaterSettings,
  type RecipeWaterSettingsResponse,
} from "../water/_lib/waterSettings";
import { mathExplain } from "./_lib/mathExplain";
import { parseGravityAnalysisResponseV1 } from "@brewery/contracts";
import type { NumberFormatHintV1, WaterCalcDerivation } from "@brewery/contracts";
import { renderDerivationBody } from "../water/_lib/mathBodies";
import { formatSgWithPlato } from "../../../_lib/gravity";
import { parseGristJson } from "../../../_lib/grist";

interface Recipe {
  id: string;
  accountId: string;
  name: string;
  style: string | null;
  version?: number;
  versionGroupId?: string;
  styleKey?: string | null;
  notes: string | null;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
  /** Gravity analysis attached by `GET /recipes/:id` (see `GravityAnalysisResponseV1`). */
  analysis?: unknown;
  createdAt: string;
  updatedAt: string;
}

interface RecipeVersionListItem {
  id: string;
  version: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface StyleListItem {
  key: string;
  name: string;
  code: string;
  sortOrder: number;
}

interface EquipmentProfile {
  id: string;
  name: string;
  equipment: {
    kettle: Record<string, unknown>;
    mash: Record<string, unknown>;
    misc: Record<string, unknown>;
  };
}

/**
 * Search-result DTOs for the `/api/ingredients/*` endpoints.
 *
 * The API returns Prisma rows plus a few derived fields. We declare them locally
 * (instead of importing Prisma types into apps/web) so the contract is documented
 * at the consumer side and the editor is `any`-free.
 */
interface FermentableSearchResult {
  id: string;
  name: string;
  producer?: string | null;
  group?: string | null;
  type?: string | null;
  notes?: string | null;
  country?: string | null;
  colorEbc?: number | null;
  colorLovibond?: number | null;
  yieldPercent?: number | null;
  ppg?: number | null;
  mashDiPh?: number | null;
  mashTaToPh57_mEqPerKg?: number | null;
}

interface HopSearchResult {
  id: string;
  name: string;
  country?: string | null;
  type?: string | null;
  alphaMin?: number | null;
  alphaMax?: number | null;
  betaMin?: number | null;
  betaMax?: number | null;
}

interface YeastSearchResult {
  id: string;
  name: string;
  lab?: string | null;
  productId?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
}

/**
 * Narrow helper: returns the input as a plain object record, or null otherwise.
 * Mirrors `services/api/src/lib/typeGuards.ts::isObject` (kept local to avoid
 * a cross-app import).
 */
function asRecord(v: unknown): Record<string, unknown> | null {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

/**
 * Compute the brewhouse efficiency to display in math bodies. Tries, in order:
 *  1. `recipeExtJson.equipment.mash.mashEfficiencyPercent`
 *  2. `recipeExtJson.brewhouseEfficiencyPercent`
 *  3. `beerJsonRecipeJson.beerjson.recipes[0].efficiency.brewhouse` (when unit is %)
 */
function getRecipeEfficiencyPercent(recipe: Recipe | null): number | null {
  if (!recipe) return null;
  const ext = asRecord(recipe.recipeExtJson);
  const equipment = ext ? asRecord(ext.equipment) : null;
  const mash = equipment ? asRecord(equipment.mash) : null;
  const mashEff =
    mash && typeof mash.mashEfficiencyPercent === "number" && Number.isFinite(mash.mashEfficiencyPercent)
      ? (mash.mashEfficiencyPercent as number)
      : null;
  if (mashEff != null) return mashEff;

  const brewEff =
    ext && typeof ext.brewhouseEfficiencyPercent === "number" && Number.isFinite(ext.brewhouseEfficiencyPercent)
      ? (ext.brewhouseEfficiencyPercent as number)
      : null;
  if (brewEff != null) return brewEff;

  const bj = asRecord(recipe.beerJsonRecipeJson);
  const bjRoot = bj ? asRecord(bj.beerjson) : null;
  const bjRecipes = bjRoot && Array.isArray(bjRoot.recipes) ? bjRoot.recipes : null;
  const r0 = bjRecipes && bjRecipes.length > 0 ? asRecord(bjRecipes[0]) : null;
  const efficiency = r0 ? asRecord(r0.efficiency) : null;
  const brewhouse = efficiency ? asRecord(efficiency.brewhouse) : null;
  if (brewhouse && brewhouse.unit === "%" && typeof brewhouse.value === "number" && Number.isFinite(brewhouse.value)) {
    return brewhouse.value as number;
  }
  return null;
}

/**
 * Read the BeerJSON `batch_size` for the first recipe (used as a volume fallback
 * when the gravity analysis emits the `used_batch_size_volume` warning).
 */
function getBeerJsonBatchSize(recipe: Recipe | null): { unit: string; value: number | null } {
  if (!recipe) return { unit: "", value: null };
  const bj = asRecord(recipe.beerJsonRecipeJson);
  const bjRoot = bj ? asRecord(bj.beerjson) : null;
  const bjRecipes = bjRoot && Array.isArray(bjRoot.recipes) ? bjRoot.recipes : null;
  const r0 = bjRecipes && bjRecipes.length > 0 ? asRecord(bjRecipes[0]) : null;
  const batch = r0 ? asRecord(r0.batch_size) : null;
  const unit = batch && typeof batch.unit === "string" ? batch.unit : "";
  const value =
    batch && typeof batch.value === "number" && Number.isFinite(batch.value) ? (batch.value as number) : null;
  return { unit, value };
}

/** A `Record`-style alias for `formatHints` so we can index by an arbitrary string field name. */
type FormatHintsRecord = Record<string, NumberFormatHintV1 | undefined>;
/** Same trick for `derivations` keyed by an arbitrary derivation id. */
type DerivationsRecord = Record<string, WaterCalcDerivation | undefined>;

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

const COLLAPSIBLE_SECTION_IDS = ["basics", "analysis", "brewingHistory", "brew", "equipment", "mashing", "fermentables", "hops", "yeast", "other", "boil", "notes", "water"] as const;

export default function RecipeEditPage() {
  const t = useTranslations("recipes.edit");
  const tHops = useTranslations("recipes.edit.hops");
  const tEquip = useTranslations("recipes.edit.equipmentSection");
  const tAnalysis = useTranslations("recipes.analysis");
  const tMath = useTranslations("math");
  const tNav = useTranslations("nav");
  const tUnits = useTranslations("units");
  const tWater = useTranslations("waterHub");
  const tSparge = useTranslations("recipes.water.sparge");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";
  const authState = useRequireAuth({ requireActiveWorkspace: true });

  const loadRecipeMeta = useCallback(async (id: string) => {
    const res = await apiFetch(`/api/recipes/${id}`);
    if (!res.ok) return null;
    return parseRecipeMetaFromGetRecipeResponse(res.data);
  }, []);

  const [layoutMetrics, setLayoutMetrics] = useState<{
    leftGutterPx: number | null;
    railTopPx: number | null;
  }>({ leftGutterPx: null, railTopPx: null });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const appShell = document.querySelector(".brew-app-shell");
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

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.add("brew-hide-global-bottom-ad");
    return () => {
      document.body.classList.remove("brew-hide-global-bottom-ad");
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
    { id: "brewingHistory", label: t("sections.brewingHistory") },
    { id: "brew", label: t("sections.brew") },
    { id: "equipment", label: t("sections.equipment") },
    { id: "mashing", label: t("sections.mashing") },
    { id: "fermentables", label: t("sections.fermentables") },
    { id: "hops", label: t("sections.hops") },
    { id: "yeast", label: t("sections.yeast") },
    { id: "other", label: t("sections.other") },
    { id: "boil", label: t("sections.boil") },
    { id: "notes", label: t("sections.notes") },
    { id: "water", label: t("sections.water") },
  ] as const;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const id of COLLAPSIBLE_SECTION_IDS) init[id] = false;
    init.water = true;
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

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [analysis, setAnalysis] = useState<unknown>(null);
  const [versions, setVersions] = useState<RecipeVersionListItem[] | null>(null);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [creatingVersion, setCreatingVersion] = useState(false);
  const [createVersionError, setCreateVersionError] = useState<string | null>(null);
  const [duplicatingRecipe, setDuplicatingRecipe] = useState(false);
  const [creatingBrewSession, setCreatingBrewSession] = useState(false);
  const [brewSessionError, setBrewSessionError] = useState<string | null>(null);
  const [brewSessions, setBrewSessions] = useState<
    {
      id: string;
      code: string;
      status: string;
      createdAt: string;
      startedAt: string | null;
      stoppedAt: string | null;
      scheduledDate: string | null;
    }[]
  >([]);
  const [brewSessionsLoading, setBrewSessionsLoading] = useState(false);
  const [duplicateRecipeError, setDuplicateRecipeError] = useState<string | null>(null);
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
  const [yeastAttenuationOverrides, setYeastAttenuationOverrides] = useState<Record<string, string>>({});
  const [boilTimeMinutes, setBoilTimeMinutes] = useState<string>("");

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
  const [fermentableResults, setFermentableResults] = useState<FermentableSearchResult[]>([]);
  const [fermentableSearching, setFermentableSearching] = useState(false);
  const [fermentableSearchError, setFermentableSearchError] = useState<string | null>(null);
  const [fermentableAddMessage, setFermentableAddMessage] = useState<string | null>(null);
  const fermentableAddMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hopQuery, setHopQuery] = useState("");
  const [hopResults, setHopResults] = useState<HopSearchResult[]>([]);
  const [hopSearching, setHopSearching] = useState(false);
  const [hopSearchError, setHopSearchError] = useState<string | null>(null);

  const canCallAccountScoped =
    authState.status === "ready" && Boolean(recipeId);

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

  useEffect(() => {
    if (!canCallAccountScoped || !recipeId) return;
    let cancelled = false;
    setBrewSessionsLoading(true);
    (async () => {
      try {
        const res = await apiFetch(`/api/recipes/${recipeId}/brew-sessions`);
        if (cancelled) return;
        const list = (res.data as { brewSessions?: unknown[] })?.brewSessions;
        const sessions = Array.isArray(list) ? list.slice(0, 20) : [];
        setBrewSessions(
          sessions.map((entry) => {
            const s = asRecord(entry) ?? {};
            return {
              id: typeof s.id === "string" ? s.id : "",
              code: typeof s.code === "string" ? s.code : "",
              status: typeof s.status === "string" ? s.status : "",
              createdAt: typeof s.createdAt === "string" ? s.createdAt : "",
              startedAt: typeof s.startedAt === "string" ? s.startedAt : null,
              stoppedAt: typeof s.stoppedAt === "string" ? s.stoppedAt : null,
              scheduledDate: typeof s.scheduledDate === "string" ? s.scheduledDate : null,
            };
          }),
        );
      } catch {
        if (!cancelled) setBrewSessions([]);
      } finally {
        if (!cancelled) setBrewSessionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCallAccountScoped, recipeId]);

  const programmedSessions = useMemo(
    () =>
      brewSessions.filter((s) => s.scheduledDate != null && s.startedAt == null),
    [brewSessions]
  );
  const brewingNowSessions = useMemo(
    () =>
      brewSessions.filter((s) => s.startedAt != null && s.stoppedAt == null),
    [brewSessions]
  );
  const lastBrewSessions = useMemo(
    () => brewSessions.filter((s) => s.startedAt != null && s.stoppedAt != null),
    [brewSessions]
  );

  const spargeStepTempDisplay = waterSettings?.spargeStepTemperatureC ?? 75;
  const spargeMethodLabel =
    waterSettings?.spargeMethodType === "batch_sparge"
      ? tSparge("spargeMethodBatchSparge")
      : tSparge("spargeMethodFlySparge");

  const [visibilityRefreshTrigger, setVisibilityRefreshTrigger] = useState(0);

  useEffect(() => {
    const applyHashOpen = () => {
      const raw = window.location.hash || "";
      const id = raw.startsWith("#") ? raw.slice(1) : raw;
      if (!id) return;
      if (!(COLLAPSIBLE_SECTION_IDS as ReadonlyArray<string>).includes(id)) return;
      setSectionOpen(id, true);
    };

    window.addEventListener("hashchange", applyHashOpen);
    return () => window.removeEventListener("hashchange", applyHashOpen);
  }, []);

  // Do not auto-open sections based on data presence; only open via hash navigation.

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = () => {
      if (document.visibilityState === "visible") {
        setVisibilityRefreshTrigger((t) => t + 1);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
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
        const r = (res.data as { recipe: Recipe }).recipe;
        if (cancelled) return;
        setRecipe(r);
        setAnalysis(r.analysis ?? null);
        setName(r.name ?? "");
        setStyleKey(r.styleKey ?? "custom");
        setNotes(r.notes ?? "");
        const ext = asRecord(r.recipeExtJson);
        const links = ext ? asRecord(ext.ingredientLinks) : null;
        const linksGrist = links ? asRecord(links.grist) : null;
        const linksHops = links ? asRecord(links.hops) : null;
        const linksYeast = links ? asRecord(links.yeast) : null;
        const linksMisc = links ? asRecord(links.misc) : null;
        const mashPhModel = ext ? asRecord(ext.mashPhModel) : null;
        const yeastOverridesRaw = ext ? asRecord(ext.yeastAttenuationOverridesPercent) : null;
        if (yeastOverridesRaw) {
          const out: Record<string, string> = {};
          for (const [k, v] of Object.entries(yeastOverridesRaw)) {
            if (typeof k !== "string") continue;
            if (typeof v !== "number" || !Number.isFinite(v)) continue;
            out[k] = String(v);
          }
          setYeastAttenuationOverrides(out);
        } else {
          setYeastAttenuationOverrides({});
        }

        const yeastPitchRateRaw = ext ? asRecord(ext.yeastPitchRateOverrides) : null;
        const yeastFermentationTempRaw = ext ? asRecord(ext.yeastFermentationTempOverrides) : null;
        const yeastOxygenationRaw = ext ? asRecord(ext.yeastOxygenationOverrides) : null;
        const yeastDiacetylRestRaw = ext ? asRecord(ext.yeastDiacetylRestOverrides) : null;
        const yeastFormatRaw = ext
          ? asRecord(ext.yeastFormatOverrides) ?? asRecord(ext.yeastTypeOverrides)
          : null;
        const yeastSpeciesRaw = ext ? asRecord(ext.yeastSpeciesOverrides) : null;
        const yeastNeedsPropagationRaw = ext ? asRecord(ext.yeastNeedsPropagationOverrides) : null;
        const yeastCellsPerLRaw = ext ? asRecord(ext.yeastCellsPerLOverrides) : null;
        const yeastCellsPerKGRaw = ext ? asRecord(ext.yeastCellsPerKGOverrides) : null;
        const yeastCellsPerGRaw = ext ? asRecord(ext.yeastCellsPerGOverrides) : null;

        const equipmentSource = ext ? asRecord(ext.equipmentSource) : null;
        const equipmentProfileId =
          equipmentSource && typeof equipmentSource.equipmentProfileId === "string"
            ? equipmentSource.equipmentProfileId
            : "";
        setSelectedEquipmentProfileId(equipmentProfileId);

        if (!r.beerJsonRecipeJson) {
          throw new Error("Recipe is missing BeerJSON (beerJsonRecipeJson)");
        }
        const s = editorStateFromBeerJson(r.beerJsonRecipeJson);

        const boilTimeMinutesOverride =
          ext && typeof ext.boilTimeMinutesOverride === "number" && Number.isFinite(ext.boilTimeMinutesOverride)
            ? (ext.boilTimeMinutesOverride as number)
            : null;
        if (boilTimeMinutesOverride != null && boilTimeMinutesOverride >= 0) {
          setBoilTimeMinutes(String(Math.round(boilTimeMinutesOverride)));
        } else {
          const hopsForBoil = s.hopsRows.filter((h) => h.use === "boil");
          const maxMin =
            hopsForBoil.length > 0
              ? Math.max(
                  ...hopsForBoil
                    .map((h) => (typeof h.timeMinutes === "number" && Number.isFinite(h.timeMinutes) ? h.timeMinutes : 0))
                    .filter((m) => m > 0),
                0,
                )
              : 0;
          setBoilTimeMinutes(maxMin > 0 ? String(Math.round(maxMin)) : "60");
        }

        const grist = s.gristRows.map((row) => {
          const ingredientId =
            linksGrist && typeof linksGrist[row.id] === "string" ? (linksGrist[row.id] as string) : null;
          const m = row.id && mashPhModel ? asRecord(mashPhModel[row.id]) : null;
          return {
            ...row,
            ingredientId,
            mashDiPh: typeof m?.mashDiPh === "number" ? m.mashDiPh : row.mashDiPh ?? null,
            mashTaToPh57_mEqPerKg:
              typeof m?.mashTaToPh57_mEqPerKg === "number"
                ? (m.mashTaToPh57_mEqPerKg as number)
                : row.mashTaToPh57_mEqPerKg ?? null,
            mashRoastDehuskedOverride:
              m && "roastDehuskedOverride" in m
                ? (m.roastDehuskedOverride as boolean | null)
                : row.mashRoastDehuskedOverride ?? null,
          } as EditorGristRow;
        });
        const hopFormOverrides = ext ? asRecord(ext.hopFormOverrides) : null;
        const hops = s.hopsRows.map((row) => {
          const override = hopFormOverrides
            ? hopFormOverrides[row.id] === "debittered_leaf" || hopFormOverrides[row.id] === "hop_extract"
              ? (hopFormOverrides[row.id] as "debittered_leaf" | "hop_extract")
              : null
            : null;
          return {
            ...row,
            ingredientId:
              linksHops && typeof linksHops[row.id] === "string" ? (linksHops[row.id] as string) : null,
            form: override ?? (row.form ?? "pellet"),
          };
        }) as EditorHopRow[];
        const baseYeast = mergeYeastAttenuationRangeFromExt(s.yeastRows, ext);
        const yeast = baseYeast.map((row) => {
          const pitchRateVal = yeastPitchRateRaw?.[row.id];
          const pitchRate = typeof pitchRateVal === "string" ? pitchRateVal : null;

          const fermentationTempVal = yeastFermentationTempRaw?.[row.id];
          const fermentationTempC =
            typeof fermentationTempVal === "number" && Number.isFinite(fermentationTempVal)
              ? fermentationTempVal
              : null;

          const oxygenationVal = yeastOxygenationRaw?.[row.id];
          const oxygenation =
            oxygenationVal === "yes" || oxygenationVal === "no" ? (oxygenationVal as "yes" | "no") : null;

          const diacetylRestVal = yeastDiacetylRestRaw?.[row.id];
          const diacetylRest =
            diacetylRestVal === "yes" || diacetylRestVal === "no" ? (diacetylRestVal as "yes" | "no") : null;

          const formatVal = yeastFormatRaw?.[row.id];
          const format =
            formatVal === "dry" || formatVal === "liquid" || formatVal === "slurry"
              ? (formatVal as "dry" | "liquid" | "slurry")
              : null;

          const speciesRaw = yeastSpeciesRaw?.[row.id] ?? null;
          const validSpecies = [
            "saccharomyces_cerevisiae",
            "saccharomyces_pastorianus",
            "brettanomyces",
            "diastaticus",
            "other",
          ] as const;
          type YeastSpecies = (typeof validSpecies)[number];
          const species =
            typeof speciesRaw === "string" && (validSpecies as ReadonlyArray<string>).includes(speciesRaw)
              ? (speciesRaw as YeastSpecies)
              : null;

          const needsPropagationVal = yeastNeedsPropagationRaw?.[row.id];
          const needsPropagation =
            needsPropagationVal === "yes" || needsPropagationVal === "no"
              ? (needsPropagationVal as "yes" | "no")
              : null;

          const cellsPerLVal = yeastCellsPerLRaw?.[row.id];
          const cellsPerLOverride =
            typeof cellsPerLVal === "number" && Number.isFinite(cellsPerLVal) && cellsPerLVal > 0
              ? cellsPerLVal
              : null;

          const cellsPerKGVal = yeastCellsPerKGRaw?.[row.id];
          const cellsPerKGFromKG =
            typeof cellsPerKGVal === "number" && Number.isFinite(cellsPerKGVal) && cellsPerKGVal > 0
              ? cellsPerKGVal
              : null;

          const cellsPerGVal = yeastCellsPerGRaw?.[row.id];
          const cellsPerKGFromG =
            typeof cellsPerGVal === "number" && Number.isFinite(cellsPerGVal) && cellsPerGVal > 0
              ? cellsPerGVal * 1000
              : null;

          const cellsPerKGOverride = cellsPerKGFromKG ?? cellsPerKGFromG ?? null;

          return {
            ...row,
            ingredientId:
              linksYeast && typeof linksYeast[row.id] === "string" ? (linksYeast[row.id] as string) : null,
            pitchRate: pitchRate ?? undefined,
            fermentationTempC: fermentationTempC ?? undefined,
            oxygenation: oxygenation ?? undefined,
            diacetylRest: diacetylRest ?? undefined,
            format: format ?? undefined,
            species: species ?? undefined,
            needsPropagation: needsPropagation ?? undefined,
            cellsPerLOverride: cellsPerLOverride ?? undefined,
            cellsPerKGOverride: cellsPerKGOverride ?? undefined,
          };
        }) as EditorYeastRow[];
        const misc = s.miscRows.map((row) => ({
          ...row,
          ingredientId:
            linksMisc && typeof linksMisc[row.id] === "string" ? (linksMisc[row.id] as string) : null,
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
  }, [canCallAccountScoped, recipeId, visibilityRefreshTrigger]);

  useEffect(() => {
    if (!canCallAccountScoped) return;
    let cancelled = false;

    (async () => {
      setVersionsLoading(true);
      setVersionsError(null);
      try {
        const res = await apiFetch(`/api/recipes/${recipeId}/versions`);
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const items = (res.data as { versions?: unknown })?.versions;
        if (!cancelled) setVersions(Array.isArray(items) ? (items as RecipeVersionListItem[]) : []);
      } catch (err) {
        if (!cancelled) {
          setVersions(null);
          setVersionsError(String(err));
        }
      } finally {
        if (!cancelled) setVersionsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canCallAccountScoped, recipeId, visibilityRefreshTrigger]);

  useEffect(() => {
    if (authState.status !== "ready") return;
    let cancelled = false;
    (async () => {
      setStylesLoading(true);
      setStylesError(null);
      try {
        const res = await apiFetch("/api/styles");
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const items = (res.data as { styles?: unknown })?.styles;
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
  }, [authState.status]);

  useEffect(() => {
    if (authState.status !== "ready") return;
    let cancelled = false;
    (async () => {
      setEquipmentProfilesLoading(true);
      setEquipmentProfilesError(null);
      try {
        const res = await apiFetch("/api/equipment-profiles");
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const items = (res.data as { profiles?: unknown })?.profiles;
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
  }, [authState.status]);

  const applyEquipmentProfileToRecipe = async (mode: "apply" | "reload") => {
    if (!recipeId) return;
    setEquipmentApplyError(null);
    setEquipmentApplying(true);
    try {
      const selected = equipmentProfiles.find((p) => p.id === selectedEquipmentProfileId) ?? null;
      if (!selected) throw new Error(tEquip("errors.selectFirst"));

      const extBase = asRecord(recipe?.recipeExtJson);
      const base: Record<string, unknown> = extBase ? { ...extBase } : {};

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
      const r = (reload.data as { recipe: Recipe }).recipe;
      setRecipe(r);
      setAnalysis(r.analysis ?? null);
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
      const extBase = asRecord(recipe?.recipeExtJson);
      const extBaseForSave: Record<string, unknown> = extBase ? { ...extBase } : {};

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
      } else {
        delete extBaseForSave.yeastAttenuationOverridesPercent;
      }
      const yeastPitchRateOverrides = Object.fromEntries(
        yeastRows
          .filter((r) => r.pitchRate != null && String(r.pitchRate).trim())
          .map((r) => [r.id, String(r.pitchRate).trim()]),
      );
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
        yeastRows
          .filter((r) => r.oxygenation === "yes" || r.oxygenation === "no")
          .map((r) => [r.id, r.oxygenation as "yes" | "no"]),
      );
      const yeastDiacetylRestOverrides = Object.fromEntries(
        yeastRows
          .filter((r) => r.diacetylRest === "yes" || r.diacetylRest === "no")
          .map((r) => [r.id, r.diacetylRest as "yes" | "no"]),
      );
      const yeastFormatOverrides = Object.fromEntries(
        yeastRows
          .filter((r) => r.format === "dry" || r.format === "liquid" || r.format === "slurry")
          .map((r) => [r.id, r.format as "dry" | "liquid" | "slurry"]),
      );
      const yeastSpeciesOverrides = Object.fromEntries(
        yeastRows
          .filter(
            (r) =>
              r.species === "saccharomyces_cerevisiae" ||
              r.species === "saccharomyces_pastorianus" ||
              r.species === "brettanomyces" ||
              r.species === "diastaticus" ||
              r.species === "other",
          )
          .map((r) => [r.id, r.species!]),
      );
      const yeastNeedsPropagationOverrides = Object.fromEntries(
        yeastRows
          .filter((r) => r.needsPropagation === "yes" || r.needsPropagation === "no")
          .map((r) => [r.id, r.needsPropagation as "yes" | "no"]),
      );
      const yeastCellsPerLOverrides = Object.fromEntries(
        yeastRows
          .filter(
            (r) =>
              r.cellsPerLOverride != null && Number.isFinite(r.cellsPerLOverride) && r.cellsPerLOverride > 0,
          )
          .map((r) => [r.id, r.cellsPerLOverride as number]),
      );
      const yeastCellsPerKGOverrides = Object.fromEntries(
        yeastRows
          .filter(
            (r) =>
              r.cellsPerKGOverride != null && Number.isFinite(r.cellsPerKGOverride) && r.cellsPerKGOverride > 0,
          )
          .map((r) => [r.id, r.cellsPerKGOverride as number]),
      );
      if (Object.keys(yeastPitchRateOverrides).length) {
        extBaseForSave.yeastPitchRateOverrides = yeastPitchRateOverrides;
      } else {
        delete extBaseForSave.yeastPitchRateOverrides;
      }
      if (Object.keys(yeastFermentationTempOverrides).length) {
        extBaseForSave.yeastFermentationTempOverrides = yeastFermentationTempOverrides;
      } else {
        delete extBaseForSave.yeastFermentationTempOverrides;
      }
      if (Object.keys(yeastOxygenationOverrides).length) {
        extBaseForSave.yeastOxygenationOverrides = yeastOxygenationOverrides;
      } else {
        delete extBaseForSave.yeastOxygenationOverrides;
      }
      if (Object.keys(yeastDiacetylRestOverrides).length) {
        extBaseForSave.yeastDiacetylRestOverrides = yeastDiacetylRestOverrides;
      } else {
        delete extBaseForSave.yeastDiacetylRestOverrides;
      }
      if (Object.keys(yeastFormatOverrides).length) {
        extBaseForSave.yeastFormatOverrides = yeastFormatOverrides;
      } else {
        delete extBaseForSave.yeastFormatOverrides;
      }
      if (Object.keys(yeastSpeciesOverrides).length) {
        extBaseForSave.yeastSpeciesOverrides = yeastSpeciesOverrides;
      } else {
        delete extBaseForSave.yeastSpeciesOverrides;
      }
      delete extBaseForSave.yeastTypeOverrides;
      if (Object.keys(yeastNeedsPropagationOverrides).length) {
        extBaseForSave.yeastNeedsPropagationOverrides = yeastNeedsPropagationOverrides;
      } else {
        delete extBaseForSave.yeastNeedsPropagationOverrides;
      }
      if (Object.keys(yeastCellsPerLOverrides).length) {
        extBaseForSave.yeastCellsPerLOverrides = yeastCellsPerLOverrides;
      } else {
        delete extBaseForSave.yeastCellsPerLOverrides;
      }
      if (Object.keys(yeastCellsPerKGOverrides).length) {
        extBaseForSave.yeastCellsPerKGOverrides = yeastCellsPerKGOverrides;
      } else {
        delete extBaseForSave.yeastCellsPerKGOverrides;
      }
      delete extBaseForSave.yeastCellsPerGOverrides;

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
          .map((r, idx) => [String(idx), r.deduceFromMashIn === true] as const)
          .filter(([k, v]) => k !== "0" && v === true),
      );

      const beerJsonRecipeJson = buildBeerJsonRecipeDocument({
        name,
        notes: notes || null,
        gristRows,
        hopsRows,
        yeastRows,
        miscRows,
        mash,
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
      const r = (reload.data as { recipe: Recipe }).recipe;
      setRecipe(r);
      setAnalysis(r.analysis ?? null);
      setStyleKey(r.styleKey ?? styleKey);
      setSaveStatus(t("status.saved"));
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const onCreateAnotherVersion = async () => {
    if (!recipeId) return;
    if (!canCallAccountScoped) return;
    setCreateVersionError(null);
    setCreatingVersion(true);
    try {
      const res = await apiFetch(`/api/recipes/${recipeId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const newId = (res.data as { recipe?: { id?: unknown } })?.recipe?.id;
      if (typeof newId !== "string" || !newId) {
        throw new Error("Version create response is missing recipe.id");
      }
      router.push(`/recipes/${newId}/edit`);
    } catch (err) {
      setCreateVersionError(String(err));
    } finally {
      setCreatingVersion(false);
    }
  };

  const onDuplicateRecipe = async () => {
    if (!recipeId) return;
    if (!canCallAccountScoped) return;
    setDuplicateRecipeError(null);
    setDuplicatingRecipe(true);
    try {
      const res = await apiFetch(`/api/recipes/${recipeId}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const newId = (res.data as { recipe?: { id?: unknown } })?.recipe?.id;
      if (typeof newId !== "string" || !newId) {
        throw new Error("Duplicate response is missing recipe.id");
      }
      router.push(`/recipes/${newId}/edit`);
    } catch (err) {
      setDuplicateRecipeError(String(err));
    } finally {
      setDuplicatingRecipe(false);
    }
  };

  const onBrewRecipe = async () => {
    if (!recipeId) return;
    if (!canCallAccountScoped) return;
    setBrewSessionError(null);
    setCreatingBrewSession(true);
    try {
      const res = await apiFetch(`/api/recipes/${recipeId}/brew-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const id = (res.data as { brewSession?: { id?: unknown } })?.brewSession?.id;
      if (typeof id !== "string" || !id) {
        throw new Error("Create brew session response is missing brewSession.id");
      }
      router.push(`/recipes/${recipeId}/brew-sessions/${id}`);
    } catch (err) {
      setBrewSessionError(String(err));
    } finally {
      setCreatingBrewSession(false);
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
        lateAddition: false,
      },
    ]);
  };

  const addFermentableFromDb = (item: FermentableSearchResult) => {
    const id = typeof item.id === "string" ? item.id : null;
    const itemName = typeof item.name === "string" ? item.name : "";
    if (!id || !itemName) return;
    const producer = typeof item.producer === "string" ? item.producer : null;
    const group = typeof item.group === "string" ? item.group : null;
    const mashDiPh = typeof item.mashDiPh === "number" && Number.isFinite(item.mashDiPh) ? item.mashDiPh : null;
    const mashTaToPh57_mEqPerKg =
      typeof item.mashTaToPh57_mEqPerKg === "number" && Number.isFinite(item.mashTaToPh57_mEqPerKg)
        ? item.mashTaToPh57_mEqPerKg
        : null;
    const mashPhModelSource =
      mashDiPh !== null || mashTaToPh57_mEqPerKg !== null ? ("default" as const) : ("unknown" as const);
    const name = itemName;
    const colorLovibond =
      typeof item.colorLovibond === "number" && Number.isFinite(item.colorLovibond)
        ? roundTo(item.colorLovibond, 3)
        : null;
    const ppg =
      typeof item.ppg === "number" && Number.isFinite(item.ppg) ? roundTo(item.ppg, 3) : null;
    const yieldPercent =
      typeof item.yieldPercent === "number" && Number.isFinite(item.yieldPercent)
        ? roundTo(item.yieldPercent, 3)
        : null;

    const potential: GristPotential =
      ppg !== null ? { kind: "ppg", value: ppg } : yieldPercent !== null ? { kind: "yieldPercent", value: yieldPercent } : null;

    const maltClass = inferMaltClass(typeof item.group === "string" ? item.group : null, itemName);

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
        lateAddition: false,
      },
    ]);
    const msg = t("fermentableAddedSaveHint");
    setFermentableAddMessage(msg);
    if (fermentableAddMessageTimeoutRef.current) {
      clearTimeout(fermentableAddMessageTimeoutRef.current);
    }
    fermentableAddMessageTimeoutRef.current = setTimeout(() => {
      setFermentableAddMessage(null);
      fermentableAddMessageTimeoutRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (fermentableAddMessageTimeoutRef.current) {
        clearTimeout(fermentableAddMessageTimeoutRef.current);
      }
    };
  }, []);

  const addHopFromDb = (item: HopSearchResult) => {
    const id = typeof item.id === "string" ? item.id : null;
    const name = typeof item.name === "string" ? item.name : "";
    if (!id || !name) return;
    const country = typeof item.country === "string" ? item.country : null;
    const alphaMin = typeof item.alphaMin === "number" && Number.isFinite(item.alphaMin) ? item.alphaMin : null;
    const alphaMax = typeof item.alphaMax === "number" && Number.isFinite(item.alphaMax) ? item.alphaMax : null;
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

  const addYeastFromDb = (item: YeastSearchResult) => {
    const id = typeof item.id === "string" ? item.id : null;
    const nameRaw = typeof item.name === "string" ? item.name : "";
    if (!id || !nameRaw) return;
    const lab = typeof item.lab === "string" ? item.lab : null;
    const productId = typeof item.productId === "string" ? item.productId : null;
    const attenuationMin =
      typeof item.attenuationMin === "number" && Number.isFinite(item.attenuationMin) ? item.attenuationMin : null;
    const attenuationMax =
      typeof item.attenuationMax === "number" && Number.isFinite(item.attenuationMax) ? item.attenuationMax : null;
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
        form: "pellet",
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
      const items = (res.data as { items?: unknown })?.items;
      setFermentableResults(Array.isArray(items) ? (items as FermentableSearchResult[]) : []);
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
      const items = (res.data as { items?: unknown })?.items;
      setHopResults(Array.isArray(items) ? (items as HopSearchResult[]) : []);
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

  const gristWaterConsistency = useMemo(() => {
    const recipeMashTotalKg = gristRows
      .filter((r) => (r.timingUse ?? "add_to_mash") === "add_to_mash")
      .reduce((acc, r) => acc + (Number.isFinite(r.amountKg) ? r.amountKg : 0), 0);
    const mashRows = waterSettings?.mashGristImportedJson != null
      ? parseGristJson(waterSettings.mashGristImportedJson)
      : [];
    const mashGristTotalKg = mashRows.reduce(
      (acc, r) => acc + (Number.isFinite(r.amountKg) ? r.amountKg : 0),
      0,
    );
    if (waterSettings == null) return { status: "na" as const, diffPct: null };
    const mashJsonEmpty = !Array.isArray(waterSettings.mashGristImportedJson) || waterSettings.mashGristImportedJson.length === 0;
    if (mashJsonEmpty && recipeMashTotalKg > 0) return { status: "error" as const, diffPct: 100 };
    if (recipeMashTotalKg === 0 && mashGristTotalKg === 0) return { status: "passed" as const, diffPct: 0 };
    const denom = Math.max(recipeMashTotalKg, mashGristTotalKg, 0.0001);
    const diffPct = (Math.abs(recipeMashTotalKg - mashGristTotalKg) / denom) * 100;
    const status = diffPct <= 0.1 ? ("passed" as const) : ("error" as const);
    return { status, diffPct };
  }, [gristRows, waterSettings]);

  return (
    <>
      <RecipeTitleWithMeta
        title={t("title")}
        recipeId={recipeId}
        enabled={authState.status === "ready"}
        loadRecipeMeta={loadRecipeMeta}
      />

      <SurfaceMathToggleRow
        left={null}
        rightHint={<SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{tMath("analysis.common.toggleHint")}</SizableText>}
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mt="$2"
        mb="$2"
      />

      {authState.status === "loading" ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}
      {authState.status === "error" ? (
        <ErrorBox>{authState.error}</ErrorBox>
      ) : null}
      {authState.status === "ready" && !canCallAccountScoped ? (
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

      {(saveStatus || saveError) ? (
        <View
          position="fixed"
          top={16}
          left={0}
          right={0}
          zIndex={1000}
          width="100%"
          px="$4"
        >
          <View width="100%" maxWidth={600} mx="auto">
            <YStack gap="$2" width="100%">
              {saveStatus ? (
                <MessageBox
                  variant="success"
                  role="status"
                  aria-live="polite"
                  dismissAfter={5000}
                  onDismiss={() => setSaveStatus(null)}
                >
                  {saveStatus}
                </MessageBox>
              ) : null}
              {saveError ? (
                <ErrorBox aria-live="polite">
                  {saveError}
                </ErrorBox>
              ) : null}
            </YStack>
          </View>
        </View>
      ) : null}

      <XStack
        flexDirection="column"
        gap="$4"
        $gtNarrow={{ flexDirection: "row" }}
        flex={1}
        minW={0}
      >
        <YStack gap="$0" flex={1} minW={0}>
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
            <XStack
              gap="$3"
              mt="$2"
              flexWrap="wrap"
              $gtNarrow={{ flexWrap: "nowrap" }}
            >
              <View flex={1} minW={200}>
                <RecipeEditField id="recipe-name" label="Name">
                  <XStack gap="$2" items="center" flexWrap="wrap">
                    <Input
                      id="recipe-name"
                      value={name}
                      onChangeText={setName}
                      size="$3"
                      flex={1}
                      minW={180}
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                      {t("versionLabel")}{" "}
                      <SizableText
                        size="$2"
                        color="var(--text-muted)"
                        fontFamily="$body"
                        fontWeight="bold"
                        as="span"
                      >
                        {typeof recipe?.version === "number"
                          ? String(recipe.version).padStart(2, "0")
                          : "—"}
                      </SizableText>
                    </SizableText>
                  </XStack>
                </RecipeEditField>
              </View>
              <View flex={1} minW={200}>
                <RecipeEditField id="recipe-style" label="Style">
                  <BrewSelect
                    id="recipe-style"
                    value={styleKey}
                    onValueChange={setStyleKey}
                    options={styles.map((s) => ({
                      value: s.key,
                      label: s.key === "custom" ? s.name : `${s.code} — ${s.name}`,
                    }))}
                    disabled={stylesLoading || styles.length === 0}
                    width="full"
                  />
                {stylesError ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
                    {String(stylesError)}
                  </SizableText>
                ) : null}
                </RecipeEditField>
              </View>
            </XStack>

            <YStack gap="$2" mt="$3">
              <XStack gap="$3" items="center" flexWrap="wrap">
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
                {recipe ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    Updated: <CodeInline>{recipe.updatedAt}</CodeInline>
                  </SizableText>
                ) : null}
              </XStack>
            </YStack>

            <YStack gap="$2" mt="$3">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                {t("versionCreateNote")}
              </SizableText>
              <Button
                onPress={onCreateAnotherVersion}
                disabled={
                  !canCallAccountScoped ||
                  creatingVersion ||
                  (Array.isArray(versions) && versions.some((v) => v.version >= 99))
                }
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {creatingVersion ? t("versionCreateWorking") : t("versionCreateButton")}
              </Button>
              {Array.isArray(versions) && versions.some((v) => v.version >= 99) ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  {t("versionLimitReached")}
                </SizableText>
              ) : null}
              {(versionsError || createVersionError) ? (
                <ErrorBox mt="$1.5">
                  {createVersionError ? createVersionError : versionsError}
                </ErrorBox>
              ) : null}
            </YStack>

            <YStack gap="$2" mt="$3">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                {t("duplicateRecipeNote")}
              </SizableText>
              <Button
                onPress={onDuplicateRecipe}
                disabled={!canCallAccountScoped || duplicatingRecipe}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {duplicatingRecipe ? t("duplicateRecipeWorking") : t("duplicateRecipeButton")}
              </Button>
              {duplicateRecipeError ? (
                <ErrorBox mt="$1.5">{duplicateRecipeError}</ErrorBox>
              ) : null}
            </YStack>
          </RecipeEditSection>

          <RecipeEditSection
            spaced
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
                    const hints = parsed?.formatHints as FormatHintsRecord | undefined;
                    const hint = hints ? hints[field] : undefined;
                    const decimals =
                      hint && typeof hint.decimals === "number" && Number.isFinite(hint.decimals)
                        ? hint.decimals
                        : fallbackDecimals;
                    return fmt(v, decimals);
                  };

                  const warnings = Array.isArray(a?.warnings) ? a.warnings : [];
                  const warningCodes = new Set(
                    warnings.map((w) => String((asRecord(w)?.code ?? "") as string | number)),
                  );

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
                    const derivations = parsed?.derivations as DerivationsRecord | undefined;
                    const d = derivations ? derivations[derivationKey] : undefined;
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
                      const { unit, value } = getBeerJsonBatchSize(recipe);
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
                          use: tMath(`analysis.common.hopUse.${use}` as Parameters<typeof tMath>[0]),
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
                      const id = typeof y.id === "string" ? y.id : "";
                      const name = typeof y.name === "string" ? y.name.trim() : "";
                      if (!id || !name) continue;
                      const ovRawVal = overrides[id];
                      const ovRaw = typeof ovRawVal === "string" ? ovRawVal.trim() : "";
                      const ov = ovRaw ? Number(ovRaw) : null;
                      const overrideOk = ov != null && Number.isFinite(ov) ? Math.max(0, Math.min(100, ov)) : null;
                      const min =
                        typeof y.attenuationMin === "number" && Number.isFinite(y.attenuationMin)
                          ? y.attenuationMin
                          : null;
                      const max =
                        typeof y.attenuationMax === "number" && Number.isFinite(y.attenuationMax)
                          ? y.attenuationMax
                          : null;
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
                          {[
                            (
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
                            ),
                            (
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
                            ),
                            (
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
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.buGu")}</SizableText>
                                  </XStack>
                                </View>
                                <View>
                                  <CodeInline>{fmtField("buGuRatio", a?.buGuRatio, 2)}</CodeInline>
                                </View>
                              </XStack>
                            ),
                            (
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
                            ),
                            (
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
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <XStack gap="$2" alignItems="baseline" flexWrap="wrap">
                                    <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">{tAnalysis("fields.boilTimeMinutes")}</SizableText>
                                  </XStack>
                                </View>
                                <View>
                                  <XStack gap="$1" ai="baseline" display="inline-flex">
                                    <CodeInline>{fmtField("boilTimeMinutes", a?.boilTimeMinutes, 0)}</CodeInline>
                                    {typeof a?.boilTimeMinutes === "number" ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span"> min</SizableText> : null}
                                  </XStack>
                                </View>
                              </XStack>
                            ),
                            (
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
                            ),
                            (
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
                            ),
                            (
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
                                            const eff = getRecipeEfficiencyPercent(recipe);
                                            return eff != null ? fmt(eff, 1) : tAnalysis("na");
                                          })(),
                                        }),
                                      ) ?? tMath("analysis.og.body", {
                                        og: fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3),
                                        volume: fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2),
                                        efficiency: (() => {
                                          const eff = getRecipeEfficiencyPercent(recipe);
                                          return eff != null ? fmt(eff, 1) : tAnalysis("na");
                                        })(),
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <CodeInline>{formatSgWithPlato(a?.ogEstimatedSg, (v, d) => formatFixed(locale, v, d), 3, 1)}</CodeInline>
                                </View>
                              </XStack>
                            ),
                            (
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
                                  <CodeInline>{formatSgWithPlato(a?.fgEstimatedSg, (v, d) => formatFixed(locale, v, d), 3, 1)}</CodeInline>
                                </View>
                              </XStack>
                            ),
                            (
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
                                            const eff = getRecipeEfficiencyPercent(recipe);
                                            return eff != null ? fmt(eff, 1) : tAnalysis("na");
                                          })(),
                                        }),
                                      ) ?? tMath("analysis.pbg.body", {
                                        pbg: fmtField("pbgEstimatedSg", a?.pbgEstimatedSg, 3),
                                        preBoilVolume: fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2),
                                        efficiency: (() => {
                                          const eff = getRecipeEfficiencyPercent(recipe);
                                          return eff != null ? fmt(eff, 1) : tAnalysis("na");
                                        })(),
                                      }),
                                    )}
                                  </XStack>
                                </View>
                                <View>
                                  <CodeInline>{formatSgWithPlato(a?.pbgEstimatedSg, (v, d) => formatFixed(locale, v, d), 3, 1)}</CodeInline>
                                </View>
                              </XStack>
                            ),
                            (
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
                            ),
                            (
                              <XStack gap="$2" ai="baseline">
                                <View minW={180} pr="$3">
                                  <SizableText fontWeight="bold" fontFamily="$body" color="var(--text)">
                                    {tAnalysis("gristWaterConsistencyCheck")}
                                  </SizableText>
                                </View>
                                <View>
                                  {gristWaterConsistency.status === "passed" ? (
                                    <CodeInline color="var(--success)">
                                      {tAnalysis("gristWaterConsistencyPassed")}
                                    </CodeInline>
                                  ) : gristWaterConsistency.status === "error" ? (
                                    <CodeInline color="var(--danger)">
                                      {tAnalysis("gristWaterConsistencyError")}
                                    </CodeInline>
                                  ) : (
                                    <CodeInline>—</CodeInline>
                                  )}
                                </View>
                              </XStack>
                            ),
                          ].map((row, idx) => (
                            <StripedRow key={idx} odd={idx % 2 === 1}>
                              {row}
                            </StripedRow>
                          ))}
                          {gristWaterConsistency.status === "error" ? (
                            <View
                              mt="$2"
                              px="$3"
                              py="$2"
                              bg="color-mix(in srgb, var(--warning) 18%, var(--surface))"
                              borderWidth={1}
                              borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))"
                              rounded="$2"
                            >
                              <SizableText size="$2" fontFamily="$body" color="var(--text)">
                                {tAnalysis.rich("gristWaterConsistencyWarning", {
                                  link: (chunks) => (
                                    <Link href={`/recipes/${recipeId}/water/mash#grist-summary-heading`}>
                                      {chunks}
                                    </Link>
                                  ),
                                })}
                              </SizableText>
                              {gristWaterConsistency.diffPct != null ? (
                                <SizableText size="$2" fontFamily="$body" color="var(--text)" mt="$1">
                                  {tAnalysis("gristWaterConsistencyDifference", {
                                    value: formatFixed(locale, gristWaterConsistency.diffPct, 2),
                                  })}
                                </SizableText>
                              ) : null}
                            </View>
                          ) : null}
                        </YStack>
                      </View>

                      {warnings.length ? (
                        <View
                          as="details"
                          bg="color-mix(in srgb, var(--surface-2) 35%, var(--surface))"
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
                                  {tAnalysis(`warnings.${String(w?.code ?? "unknown")}` as Parameters<typeof tAnalysis>[0])}
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
            spaced
            id="brewingHistory"
            headingId="brewing-history-heading"
            label={t("sections.brewingHistory")}
            open={openSections.brewingHistory}
            onOpenChange={(open) => setSectionOpen("brewingHistory", open)}
          >
            <YStack gap="$2" mt="$2">
              {brewingNowSessions.length > 0 ? (
                <RecipeEditFieldBlock variant="inProgress" header={t("brewingNowLabel")} mt={0} mb={0}>
                  <RecipeEditList gap="$1" mt="$1" mb={0}>
                    {brewingNowSessions.map((s) => {
                      const dateStr = s.startedAt ?? s.createdAt;
                      const displayDate = dateStr
                        ? new Date(dateStr).toLocaleString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—";
                      return (
                        <SizableText as="li" key={s.id} size="$2" fontFamily="$body" color="var(--text)">
                          <Link href={`/recipes/${recipeId}/brew-sessions/${s.id}`}>{s.code}</Link>
                          {" · "}
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                            {displayDate}
                          </SizableText>
                        </SizableText>
                      );
                    })}
                  </RecipeEditList>
                </RecipeEditFieldBlock>
              ) : null}
              {programmedSessions.length > 0 ? (
                <RecipeEditFieldBlock variant="programmed" header={t("programmedSectionLabel")} mt={0} mb={0}>
                  <RecipeEditList gap="$1" mt="$1" mb={0}>
                    {programmedSessions.map((s) => {
                      const displayDate = s.scheduledDate
                        ? new Date(s.scheduledDate).toLocaleString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—";
                      return (
                        <SizableText as="li" key={s.id} size="$2" fontFamily="$body" color="var(--text)">
                          <Link href={`/recipes/${recipeId}/brew-sessions/${s.id}`}>{s.code}</Link>
                          {" · "}
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                            {displayDate}
                          </SizableText>
                        </SizableText>
                      );
                    })}
                  </RecipeEditList>
                </RecipeEditFieldBlock>
              ) : null}
              {lastBrewSessions.length > 0 ? (
                <RecipeEditFieldBlock variant="computed" header={t("lastBrewedLabel")} mt={0} mb={0}>
                  <RecipeEditList gap="$1" mt="$1" mb={0}>
                    {lastBrewSessions.map((s) => {
                      const dateStr = s.startedAt ?? s.createdAt;
                      const displayDate = dateStr
                        ? new Date(dateStr).toLocaleDateString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—";
                      return (
                        <SizableText as="li" key={s.id} size="$2" fontFamily="$body" color="var(--text)">
                          <Link href={`/recipes/${recipeId}/brew-sessions/${s.id}`}>{s.code}</Link>
                          {" · "}
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                            {displayDate}
                          </SizableText>
                        </SizableText>
                      );
                    })}
                  </RecipeEditList>
                </RecipeEditFieldBlock>
              ) : null}
              {brewSessionsLoading ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  {t("lastBrewedLoading")}
                </SizableText>
              ) : programmedSessions.length === 0 && lastBrewSessions.length === 0 && brewingNowSessions.length === 0 ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  {t("brewingHistoryEmpty")}
                </SizableText>
              ) : null}
            </YStack>
          </RecipeEditSection>

          <RecipeEditSection
            spaced
            id="brew"
            headingId="brew-heading"
            label={t("sections.brew")}
            open={openSections.brew}
            onOpenChange={(open) => setSectionOpen("brew", open)}
          >
            <YStack gap="$2" mt="$2">
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                {t("brewNote")}
              </SizableText>
              <Button
                onPress={onBrewRecipe}
                disabled={!canCallAccountScoped || creatingBrewSession}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {t("brewButton")}
              </Button>
              {brewSessionError ? <ErrorBox mt="$1.5">{brewSessionError}</ErrorBox> : null}
            </YStack>
          </RecipeEditSection>

          <RecipeEditSection
            spaced
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
                  <BrewSelect
                    id="equipment-profile"
                    value={selectedEquipmentProfileId}
                    onValueChange={setSelectedEquipmentProfileId}
                    options={[
                      { value: "", label: tEquip("noneOption") },
                      ...equipmentProfiles.map((p) => ({ value: p.id, label: p.name })),
                    ]}
                    disabled={equipmentProfilesLoading}
                    width="full"
                  />
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
            spaced
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

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2">
                  {t("mashStepsFromWaterPage")}
                </SizableText>
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

                <SizableText size="$2" fontFamily="$body" color="var(--text)" mt="$2" mb={0}>
                  <Link href={`/recipes/${recipeId}/water/mash`}>{t("mashStepConfigureLink")}</Link>
                </SizableText>

                {spargeConfigured ? (
                  <View mt="$4">
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2">
                      {t("spargeStepFromWaterPage")}
                    </SizableText>
                    <SpargeStepReadOnlyRow
                      stepNumber={mashRowsFiltered.length + 1}
                      title="Sparge"
                      name="Sparge"
                      typeLabel={spargeMethodLabel}
                      tempDisplay={formatFixed(locale, spargeStepTempDisplay, 1)}
                      timeDisplay={String(waterSettings?.spargeStepTimeMin ?? 60)}
                      amountDisplay={`${formatFixed(locale, waterVolumes.spargeLiters, 2)} ${tUnits("L")}`}
                      rampDisplay={String(waterSettings?.spargeStepRampMin ?? 0)}
                      labels={{
                        name: t("mashingStepName"),
                        type: t("mashingStepType"),
                        temp: t("mashingStepTemp", { unit: "°C" }),
                        time: t("mashingStepTime", { unit: "min" }),
                        amount: t("mashingStepAmount", { unit: "L" }),
                        ramp: t("mashingStepRamp", { unit: "min" }),
                      }}
                    />
                    <SizableText size="$2" fontFamily="$body" color="var(--text)" mt="$2" mb={0}>
                      <Link href={`/recipes/${recipeId}/water/sparge`}>
                        {t("spargeStepConfigureLink")}
                      </Link>
                    </SizableText>
                  </View>
                ) : null}
          </RecipeEditSection>

          <RecipeEditSection
            spaced
            id="fermentables"
            headingId="fermentables-heading"
            label={t("sections.fermentables")}
            open={openSections.fermentables}
            onOpenChange={(open) => setSectionOpen("fermentables", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              Enter your grist here. Water calculator can import a read-only snapshot.
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
                      <View minW={50} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">°L</SizableText></View>
                      <View minW={70} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">Yield %</SizableText></View>
                      <View minW={60} jc="flex-end"><SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%">PPG</SizableText></View>
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

            {fermentableAddMessage ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite" mt="$2">
                {fermentableAddMessage}
              </SizableText>
            ) : null}

            <YStack gap="$2" mt="$3">
              <XStack gap="$3" items="center" flexWrap="wrap" mt="$1">
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
                  {t("buttons.addCustomFermentable")}
                </Button>
              </XStack>
            </YStack>

            <View borderTopWidth={1} borderColor="var(--border)" my="$3" />

            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite">
              {t("gristTotalKg", { value: gristTotals.totalKg.toFixed(3), unit: tUnits("kg") })}
              {gristTotals.weightedAvgLovibond !== null ? (
                <> · {t("gristAvgColor", { value: gristTotals.weightedAvgLovibond.toFixed(1), unit: tUnits("lovibond") })}</>
              ) : null}
            </SizableText>

            {gristRows.length ? (
              <View overflowX="auto" mt="$2">
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
                                  <BrewSelect
                                    id={`grist-class-${r.id}`}
                                    value={r.maltClass}
                                    onValueChange={(v) => updateGristRow(r.id, { maltClass: v as GristMaltClass })}
                                    options={[
                                      { value: "base", label: "Base" },
                                      { value: "crystal", label: "Crystal" },
                                      { value: "roast", label: "Roast" },
                                      { value: "acid", label: "Acid malt" },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={140}>
                                  <RecipeEditFieldLabel htmlFor={`grist-timing-${r.id}`}>
                                    {t("fermentableTimingLabel")}
                                  </RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`grist-timing-${r.id}`}
                                    value={r.timingUse ?? "add_to_mash"}
                                    onValueChange={(v) =>
                                      updateGristRow(r.id, {
                                        timingUse: v === "add_to_boil" ? "add_to_boil" : "add_to_mash",
                                      })
                                    }
                                    options={[
                                      { value: "add_to_mash", label: t("fermentableTimingMash") },
                                      { value: "add_to_boil", label: t("fermentableTimingKettle") },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={140}>
                                  <RecipeEditFieldLabel htmlFor={`grist-late-${r.id}`}>
                                    {t("fermentableLateAdditionLabel")}
                                  </RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`grist-late-${r.id}`}
                                    value={r.lateAddition === true ? "yes" : "no"}
                                    onValueChange={(v) =>
                                      updateGristRow(r.id, { lateAddition: v === "yes" })
                                    }
                                    options={[
                                      { value: "no", label: t("fermentableLateAdditionNo") },
                                      { value: "yes", label: t("fermentableLateAdditionYes") },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={140}>
                                  <RecipeEditFieldLabel htmlFor={`grist-pot-kind-${r.id}`}>
                                    Potential kind
                                  </RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`grist-pot-kind-${r.id}`}
                                    value={r.potential?.kind ?? ""}
                                    onValueChange={(v) => {
                                      const kind = v as GristPotentialKind | "";
                                      if (!kind) return updateGristRow(r.id, { potential: null });
                                      updateGristRow(r.id, {
                                        potential: { kind, value: roundTo(r.potential?.value ?? 0, 3) },
                                      });
                                    }}
                                    options={[
                                      { value: "", label: "(none)" },
                                      { value: "ppg", label: "PPG" },
                                      { value: "yieldPercent", label: "Yield %" },
                                      { value: "sg", label: "SG (e.g. 1.037)" },
                                      { value: "plato", label: "Plato (°P)" },
                                    ]}
                                  />
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
                                            <BrewSelect
                                              id={`grist-roast-dehusked-override-${r.id}`}
                                              value={
                                                typeof r.mashRoastDehuskedOverride === "boolean"
                                                  ? r.mashRoastDehuskedOverride
                                                    ? "force_dehusked"
                                                    : "force_husked"
                                                  : "auto"
                                              }
                                              onValueChange={(v) => {
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
                                              options={[
                                                { value: "auto", label: "Auto (detect)" },
                                                { value: "force_husked", label: "Force husked" },
                                                { value: "force_dehusked", label: "Force dehusked/de-bittered" },
                                              ]}
                                              width="full"
                                            />
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

          <View className="brew-section">
            <AdSlot placement="recipe_edit_after_fermentables" />
          </View>

          <RecipeEditSection
            spaced
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

                                <YStack gap="$1" minW={170}>
                                  <RecipeEditFieldLabel htmlFor={`hop-form-${r.id}`}>{tHops("typeLabel")}</RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`hop-form-${r.id}`}
                                    value={r.form ?? "pellet"}
                                    onValueChange={(v) =>
                                      updateHopRow(r.id, {
                                        form: v as NonNullable<HopRow["form"]>,
                                      })
                                    }
                                    options={[
                                      { value: "pellet", label: tHops("typeOptions.pellet") },
                                      { value: "leaf", label: tHops("typeOptions.leaf") },
                                      { value: "leaf (wet)", label: tHops("typeOptions.leafWet") },
                                      { value: "powder", label: tHops("typeOptions.powder") },
                                      { value: "extract", label: tHops("typeOptions.extract") },
                                      { value: "hop_extract", label: tHops("typeOptions.hopExtract") },
                                      { value: "plug", label: tHops("typeOptions.plug") },
                                      { value: "debittered_leaf", label: tHops("typeOptions.debitteredLeaf") },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={130}>
                                  <RecipeEditFieldLabel htmlFor={`hop-use-${r.id}`}>Use</RecipeEditFieldLabel>
                                  <BrewSelect
                                    id={`hop-use-${r.id}`}
                                    value={r.use}
                                    onValueChange={(v) => updateHopRow(r.id, { use: v as HopUse })}
                                    options={[
                                      { value: "boil", label: "Boil" },
                                      { value: "whirlpool", label: "Whirlpool" },
                                      { value: "dryhop", label: "Dry hop" },
                                    ]}
                                  />
                                </YStack>

                                <YStack gap="$1" minW={90}>
                                  <RecipeEditFieldLabel htmlFor={`hop-min-${r.id}`}>{tHops("timeBeforeEndOfBoilMin")}</RecipeEditFieldLabel>
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

          <View className="brew-section">
            <AdSlot placement="recipe_edit_after_hops" />
          </View>

          <RecipeEditSection
            spaced
            id="yeast"
            headingId="yeast-heading"
            label={t("sections.yeast")}
            open={openSections.yeast}
            onOpenChange={(open) => setSectionOpen("yeast", open)}
          >
            <View mt="$3">
              <YeastEditor
                yeastRows={yeastRows}
                yeastAttenuationOverrides={yeastAttenuationOverrides}
                readOnly
                recipeId={recipeId}
                t={t}
                tAnalysis={tAnalysis}
                tUnits={tUnits}
                locale={locale}
                formatFixed={formatFixed}
              />
            </View>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
              {t("rawMaterialsCtaPrefix")}{" "}
              <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
            </SizableText>
          </RecipeEditSection>

          <View className="brew-section">
            <AdSlot placement="recipe_edit_after_yeast" />
          </View>

          <RecipeEditSection
            spaced
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
                          <BrewSelect
                            id={`misc-type-${r.id}`}
                            value={r.type}
                            onValueChange={(v) => updateMiscRow(r.id, { type: v as MiscType })}
                            options={miscTypeOptions}
                            aria-label={`Other ingredient type ${idx + 1}`}
                            width="full"
                          />
                        </YStack>

                        <YStack gap="$1" w={160} maxW="100%" flexShrink={0}>
                          <RecipeEditFieldLabel htmlFor={`misc-use-${r.id}`}>Use</RecipeEditFieldLabel>
                          <BrewSelect
                            id={`misc-use-${r.id}`}
                            value={r.use}
                            onValueChange={(v) => updateMiscRow(r.id, { use: v as MiscUse })}
                            options={miscUseOptions}
                            aria-label={`Other ingredient use ${idx + 1}`}
                            width="full"
                          />
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
                          <BrewSelect
                            id={`misc-amount-is-weight-${r.id}`}
                            value={r.amountIsWeight ? "weight" : "volume"}
                            onValueChange={(v) => updateMiscRow(r.id, { amountIsWeight: v === "weight" })}
                            options={[
                              { value: "weight", label: "Weight" },
                              { value: "volume", label: "Volume" },
                            ]}
                            aria-label={`Other ingredient amount kind ${idx + 1}`}
                            width="full"
                          />
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
            spaced
            id="boil"
            headingId="boil-heading"
            label={t("sections.boil")}
            open={openSections.boil}
            onOpenChange={(open) => setSectionOpen("boil", open)}
          >
            <RecipeEditField id="recipe-boil-time" label={t("sections.boil")}>
              <Input
                id="recipe-boil-time"
                value={boilTimeMinutes}
                onChangeText={setBoilTimeMinutes}
                keyboardType="numeric"
                placeholder="60"
                size="$3"
                w={120}
                bg="var(--surface)"
                borderWidth={1}
                borderColor="var(--border)"
                rounded="$2"
                fontFamily="$body"
              />
            </RecipeEditField>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
              {t("boilTimeHelp")}
            </SizableText>
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
                {saving ? "Saving…" : t("boilSave")}
              </Button>
            </XStack>
          </RecipeEditSection>

          <RecipeEditSection
            spaced
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

          <RecipeEditSection
            spaced
            id="water"
            headingId="water-heading"
            label={t("sections.water")}
            open={openSections.water}
            onOpenChange={(open) => setSectionOpen("water", open)}
          >
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
          </RecipeEditSection>
        </YStack>
      </XStack>
    </>
  );
}

