import { useRouter } from "../../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createBrewSession,
  createRecipeVersion,
  duplicateRecipe,
  getRecipe,
  listBrewSessionsForRecipe,
  listEquipmentProfiles,
  listRecipeVersions,
  listStyles,
  patchRecipe,
  searchFermentables,
  searchHops,
} from "@umbraculum/api-client/brewery";
import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { useRequireAuth } from "../../../../_lib/useRequireAuth";
import { asRecord } from "../../../../_lib/typeGuards";
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
} from "../../../_lib/beerjsonRecipe";
import { parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import {
  fetchRecipeWaterSettings,
  type RecipeWaterSettingsResponse,
} from "../../water/_lib/waterSettings";
import { parseGravityAnalysisResponseV1 } from "@umbraculum/contracts";
import { parseGristJson } from "../../../../_lib/grist";
import { COLLAPSIBLE_SECTION_IDS, DESKTOP_RAIL_REQUIRED_GUTTER_PX } from "../_lib/recipeEditConstants";
import { newRowId } from "../_lib/recipeEditHelpers";
import type {
  EquipmentProfile,
  FermentableSearchResult,
  GristMaltClass,
  GristPotential,
  GristRow,
  HopRow,
  HopSearchResult,
  MiscRow,
  Recipe,
  RecipeVersionListItem,
  StyleListItem,
  YeastSearchResult,
} from "../_lib/recipeEditTypes";

export function useRecipeEditPage() {
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
    try {
      const data = await getRecipe(webBreweryApiClient(), id);
      return parseRecipeMetaFromGetRecipeResponse(data);
    } catch {
      return null;
    }
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
    init['water'] = true;
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
  const [_versionsLoading, setVersionsLoading] = useState(false);
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
    void (async () => {
      try {
        const data = await fetchRecipeWaterSettings(recipeId);
        if (cancelled) return;
        setWaterSettings(data.settings as RecipeWaterSettingsResponse["settings"]);
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
    void (async () => {
      try {
        const data = await listBrewSessionsForRecipe(webBreweryApiClient(), recipeId);
        if (cancelled) return;
        const sessions = data.brewSessions.slice(0, 20);
        setBrewSessions(
          sessions.map((entry) => {
            const s = asRecord(entry) ?? {};
            return {
              id: typeof s['id'] === "string" ? s['id'] : "",
              code: typeof s['code'] === "string" ? s['code'] : "",
              status: typeof s['status'] === "string" ? s['status'] : "",
              createdAt: typeof s['createdAt'] === "string" ? s['createdAt'] : "",
              startedAt: typeof s['startedAt'] === "string" ? s['startedAt'] : null,
              stoppedAt: typeof s['stoppedAt'] === "string" ? s['stoppedAt'] : null,
              scheduledDate: typeof s['scheduledDate'] === "string" ? s['scheduledDate'] : null,
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

    void (async () => {
      setLoading(true);
      setLoadError(null);
      setSaveStatus(null);
      try {
        const data = await getRecipe(webBreweryApiClient(), recipeId);
        const r = data.recipe as unknown as Recipe;
        if (cancelled) return;
        setRecipe(r);
        setAnalysis(r.analysis ?? null);
        setName(r.name ?? "");
        setStyleKey(r.styleKey ?? "custom");
        setNotes(r.notes ?? "");
        const ext = asRecord(r.recipeExtJson);
        const links = ext ? asRecord(ext['ingredientLinks']) : null;
        const linksGrist = links ? asRecord(links['grist']) : null;
        const linksHops = links ? asRecord(links['hops']) : null;
        const linksYeast = links ? asRecord(links['yeast']) : null;
        const linksMisc = links ? asRecord(links['misc']) : null;
        const mashPhModel = ext ? asRecord(ext['mashPhModel']) : null;
        const yeastOverridesRaw = ext ? asRecord(ext['yeastAttenuationOverridesPercent']) : null;
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

        const yeastPitchRateRaw = ext ? asRecord(ext['yeastPitchRateOverrides']) : null;
        const yeastFermentationTempRaw = ext ? asRecord(ext['yeastFermentationTempOverrides']) : null;
        const yeastOxygenationRaw = ext ? asRecord(ext['yeastOxygenationOverrides']) : null;
        const yeastDiacetylRestRaw = ext ? asRecord(ext['yeastDiacetylRestOverrides']) : null;
        const yeastFormatRaw = ext
          ? asRecord(ext['yeastFormatOverrides']) ?? asRecord(ext['yeastTypeOverrides'])
          : null;
        const yeastSpeciesRaw = ext ? asRecord(ext['yeastSpeciesOverrides']) : null;
        const yeastNeedsPropagationRaw = ext ? asRecord(ext['yeastNeedsPropagationOverrides']) : null;
        const yeastCellsPerLRaw = ext ? asRecord(ext['yeastCellsPerLOverrides']) : null;
        const yeastCellsPerKGRaw = ext ? asRecord(ext['yeastCellsPerKGOverrides']) : null;
        const yeastCellsPerGRaw = ext ? asRecord(ext['yeastCellsPerGOverrides']) : null;

        const equipmentSource = ext ? asRecord(ext['equipmentSource']) : null;
        const equipmentProfileId =
          equipmentSource && typeof equipmentSource['equipmentProfileId'] === "string"
            ? equipmentSource['equipmentProfileId']
            : "";
        setSelectedEquipmentProfileId(equipmentProfileId);

        if (!r.beerJsonRecipeJson) {
          throw new Error("Recipe is missing BeerJSON (beerJsonRecipeJson)");
        }
        const s = editorStateFromBeerJson(r.beerJsonRecipeJson);

        const boilTimeMinutesOverride =
          ext && typeof ext['boilTimeMinutesOverride'] === "number" && Number.isFinite(ext['boilTimeMinutesOverride'])
            ? (ext['boilTimeMinutesOverride'])
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
            mashDiPh: typeof m?.['mashDiPh'] === "number" ? m['mashDiPh'] : row.mashDiPh ?? null,
            mashTaToPh57_mEqPerKg:
              typeof m?.['mashTaToPh57_mEqPerKg'] === "number"
                ? (m['mashTaToPh57_mEqPerKg'])
                : row.mashTaToPh57_mEqPerKg ?? null,
            mashRoastDehuskedOverride:
              m && "roastDehuskedOverride" in m
                ? (m['roastDehuskedOverride'] as boolean | null)
                : row.mashRoastDehuskedOverride ?? null,
          };
        });
        const hopFormOverrides = ext ? asRecord(ext['hopFormOverrides']) : null;
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
            oxygenationVal === "yes" || oxygenationVal === "no" ? (oxygenationVal) : null;

          const diacetylRestVal = yeastDiacetylRestRaw?.[row.id];
          const diacetylRest =
            diacetylRestVal === "yes" || diacetylRestVal === "no" ? (diacetylRestVal) : null;

          const formatVal = yeastFormatRaw?.[row.id];
          const format =
            formatVal === "dry" || formatVal === "liquid" || formatVal === "slurry"
              ? (formatVal)
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
              ? (needsPropagationVal)
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

    void (async () => {
      setVersionsLoading(true);
      setVersionsError(null);
      try {
        const data = await listRecipeVersions(webBreweryApiClient(), recipeId);
        if (!cancelled) setVersions(data.versions as unknown as RecipeVersionListItem[]);
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
    void (async () => {
      setStylesLoading(true);
      setStylesError(null);
      try {
        const data = await listStyles(webBreweryApiClient());
        if (!cancelled) setStyles(data.styles as StyleListItem[]);
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
    void (async () => {
      setEquipmentProfilesLoading(true);
      setEquipmentProfilesError(null);
      try {
        const data = await listEquipmentProfiles(webBreweryApiClient());
        if (!cancelled) setEquipmentProfiles(data.profiles as unknown as EquipmentProfile[]);
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

      base['version'] = 1;
      base['equipment'] = selected.equipment;
      base['equipmentSource'] = { equipmentProfileId: selected.id, copiedAt: new Date().toISOString() };

      await patchRecipe(webBreweryApiClient(), recipeId, { recipeExtJson: base });

      const reload = await getRecipe(webBreweryApiClient(), recipeId);
      const r = reload.recipe as unknown as Recipe;
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
      } else {
        delete extBaseForSave['yeastAttenuationOverridesPercent'];
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
        extBaseForSave['yeastPitchRateOverrides'] = yeastPitchRateOverrides;
      } else {
        delete extBaseForSave['yeastPitchRateOverrides'];
      }
      if (Object.keys(yeastFermentationTempOverrides).length) {
        extBaseForSave['yeastFermentationTempOverrides'] = yeastFermentationTempOverrides;
      } else {
        delete extBaseForSave['yeastFermentationTempOverrides'];
      }
      if (Object.keys(yeastOxygenationOverrides).length) {
        extBaseForSave['yeastOxygenationOverrides'] = yeastOxygenationOverrides;
      } else {
        delete extBaseForSave['yeastOxygenationOverrides'];
      }
      if (Object.keys(yeastDiacetylRestOverrides).length) {
        extBaseForSave['yeastDiacetylRestOverrides'] = yeastDiacetylRestOverrides;
      } else {
        delete extBaseForSave['yeastDiacetylRestOverrides'];
      }
      if (Object.keys(yeastFormatOverrides).length) {
        extBaseForSave['yeastFormatOverrides'] = yeastFormatOverrides;
      } else {
        delete extBaseForSave['yeastFormatOverrides'];
      }
      if (Object.keys(yeastSpeciesOverrides).length) {
        extBaseForSave['yeastSpeciesOverrides'] = yeastSpeciesOverrides;
      } else {
        delete extBaseForSave['yeastSpeciesOverrides'];
      }
      delete extBaseForSave['yeastTypeOverrides'];
      if (Object.keys(yeastNeedsPropagationOverrides).length) {
        extBaseForSave['yeastNeedsPropagationOverrides'] = yeastNeedsPropagationOverrides;
      } else {
        delete extBaseForSave['yeastNeedsPropagationOverrides'];
      }
      if (Object.keys(yeastCellsPerLOverrides).length) {
        extBaseForSave['yeastCellsPerLOverrides'] = yeastCellsPerLOverrides;
      } else {
        delete extBaseForSave['yeastCellsPerLOverrides'];
      }
      if (Object.keys(yeastCellsPerKGOverrides).length) {
        extBaseForSave['yeastCellsPerKGOverrides'] = yeastCellsPerKGOverrides;
      } else {
        delete extBaseForSave['yeastCellsPerKGOverrides'];
      }
      delete extBaseForSave['yeastCellsPerGOverrides'];

      const batchSizeLiters =
        typeof extBaseForSave['batchSizeLiters'] === "number" ? extBaseForSave['batchSizeLiters']
          : null;
      const brewhouseEfficiencyPercent =
        typeof extBaseForSave['brewhouseEfficiencyPercent'] === "number" ? extBaseForSave['brewhouseEfficiencyPercent']
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

      extBaseForSave['mashStepDeduceFromMashIn'] = Object.fromEntries(
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

      await patchRecipe(webBreweryApiClient(), recipeId, {
        name,
        styleKey,
        notes: notes || null,
        beerJsonRecipeJson,
        recipeExtJson,
      });

      const reload = await getRecipe(webBreweryApiClient(), recipeId);
      const r = reload.recipe as unknown as Recipe;
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
      const data = await createRecipeVersion(webBreweryApiClient(), recipeId);
      const newId = data.recipe?.['id'];
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
      const data = await duplicateRecipe(webBreweryApiClient(), recipeId);
      const newId = data.recipe?.['id'];
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
      const data = await createBrewSession(webBreweryApiClient(), recipeId);
      const id = data.brewSession.id;
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

  // Dead-code helper. Underscore-prefixed because intentionally unused;
  // the `addYeastRow` callee was never wired up. The corresponding
  // `Cannot find name 'addYeastRow'` (TS2552) lives in the apps/web
  // pre-existing tsc baseline. Kept here as a sketch of the future
  // "add yeast from DB" feature so the YeastSearchResult → row
  // mapping isn't lost. When this is wired up, define `addYeastRow`
  // analogously to the inline grist/hop row creators and remove the
  // disable directive below.
  const _addYeastFromDb = (item: YeastSearchResult) => {
    const id = typeof item.id === "string" ? item.id : null;
    const nameRaw = typeof item.name === "string" ? item.name : "";
    if (!id || !nameRaw) return;
    const lab = typeof item.lab === "string" ? item.lab : null;
    const productId = typeof item.productId === "string" ? item.productId : null;
    const attenuationMin =
      typeof item.attenuationMin === "number" && Number.isFinite(item.attenuationMin) ? item.attenuationMin : null;
    const attenuationMax =
      typeof item.attenuationMax === "number" && Number.isFinite(item.attenuationMax) ? item.attenuationMax : null;
    const _addYeastRow = (_row: {
      ingredientId: string;
      name: string;
      lab: string | null;
      productId: string | null;
      attenuationMin: number | null;
      attenuationMax: number | null;
    }) => {
      /* unwired — see block comment above */
    };
    _addYeastRow({ ingredientId: id, name: nameRaw, lab, productId, attenuationMin, attenuationMax });
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
      const data = await searchFermentables(webBreweryApiClient(), { query: fermentableQuery });
      setFermentableResults(data.items as unknown as FermentableSearchResult[]);
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
      const data = await searchHops(webBreweryApiClient(), { query: hopQuery });
      setHopResults(data.items as unknown as HopSearchResult[]);
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

  return {
    t, tHops, tEquip, tAnalysis, tMath, tNav, tUnits, tWater, tSparge,
    locale, router, recipeId, authState, loadRecipeMeta,
    layoutMetrics, useDesktopRail, roundTo, sections,
    openSections, setSectionOpen, surfaceMath, setSurfaceMath,
    loading, loadError, saving, saveError, saveStatus, setSaveStatus,
    recipe, analysis, versions, _versionsLoading, versionsError,
    creatingVersion, createVersionError, duplicatingRecipe, creatingBrewSession,
    brewSessionError, brewSessions, brewSessionsLoading, duplicateRecipeError,
    name, setName, styleKey, setStyleKey, notes, setNotes,
    gristRows, setGristRows, hopsRows, setHopsRows, yeastRows, setYeastRows,
    miscRows, setMiscRows, mashProcedure, setMashProcedure, mashRows, setMashRows,
    waterSettings, yeastAttenuationOverrides, setYeastAttenuationOverrides,
    boilTimeMinutes, setBoilTimeMinutes,
    styles, stylesLoading, stylesError,
    equipmentProfiles, equipmentProfilesLoading, equipmentProfilesError,
    selectedEquipmentProfileId, setSelectedEquipmentProfileId,
    equipmentApplyError, equipmentApplying,
    fermentableQuery, setFermentableQuery, fermentableResults, fermentableSearching,
    fermentableSearchError, fermentableAddMessage,
    hopQuery, setHopQuery, hopResults, hopSearching, hopSearchError,
    canCallAccountScoped, waterVolumes, spargeConfigured, mashRowsFiltered,
    programmedSessions, brewingNowSessions, lastBrewSessions,
    spargeStepTempDisplay, spargeMethodLabel,
    applyEquipmentProfileToRecipe, onSave, onCreateAnotherVersion, onDuplicateRecipe, onBrewRecipe,
    addGristRow, addFermentableFromDb, addHopFromDb, _addYeastFromDb,
    removeGristRow, updateGristRow, addHopRow, removeHopRow, updateHopRow,
    addMiscRow, removeMiscRow, updateMiscRow,
    inferMaltClass, isRoastedLike, inferDehuskedFromName,
    onSearchFermentables, clearFermentableSearchResults, onSearchHops, clearHopSearchResults,
    gristTotals, gristWaterConsistency,
  };
}

export type RecipeEditPageModel = ReturnType<typeof useRecipeEditPage>;
