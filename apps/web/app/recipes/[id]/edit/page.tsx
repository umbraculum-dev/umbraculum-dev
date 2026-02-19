"use client";

import { Link } from "../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";

import { apiFetch } from "../../../_lib/apiClient";
import { formatFixed } from "../../../../src/i18n/format";
import { MathHelpPopover } from "../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../_components/SurfaceMathToggleRow";
import {
  buildBeerJsonRecipeDocument,
  buildRecipeExtJsonFromEditorState,
  editorStateFromBeerJson,
  type EditorGristRow,
  type EditorHopRow,
  type EditorMiscRow,
  type EditorYeastRow,
} from "../../_lib/beerjsonRecipe";
import { RecipeMetaLine } from "../water/_components/RecipeMetaLine";
import { mathExplain } from "./_lib/mathExplain";
import { parseGravityAnalysisResponseV1 } from "./_lib/parseGravityAnalysis";
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
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const roundTo = (n: number, decimals: number) => {
    const f = 10 ** decimals;
    return Math.round(n * f) / f;
  };

  const sections = [
    { id: "basics", label: t("sections.basics") },
    { id: "analysis", label: t("sections.analysis") },
    { id: "equipment", label: t("sections.equipment") },
    { id: "fermentables", label: t("sections.fermentables") },
    { id: "hops", label: t("sections.hops") },
    { id: "yeast", label: t("sections.yeast") },
    { id: "other", label: t("sections.other") },
    { id: "notes", label: t("sections.notes") },
    { id: "water", label: t("sections.water") },
  ] as const;

  const collapsibleSectionIds = ["basics", "analysis", "equipment", "fermentables", "hops", "yeast", "other", "notes"] as const;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const id of collapsibleSectionIds) init[id] = false;
    return init;
  });

  const [activeNavId, setActiveNavId] = useState<string>("");

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

  useEffect(() => {
    const applyHashOpen = () => {
      const raw = window.location.hash || "";
      const id = raw.startsWith("#") ? raw.slice(1) : raw;
      setActiveNavId(id);
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

      const beerJsonRecipeJson = buildBeerJsonRecipeDocument({
        name,
        notes: notes || null,
        gristRows: gristRows as any,
        hopsRows: hopsRows as unknown as EditorHopRow[],
        yeastRows: yeastRows as unknown as EditorYeastRow[],
        miscRows: miscRows as any,
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
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <RecipeMetaLine recipeId={recipeId} />

      <SurfaceMathToggleRow
        left={null}
        rightHint={<span className="muted">{tMath("analysis.common.toggleHint")}</span>}
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        style={{ marginTop: 8, marginBottom: 8 }}
      />

      {authLoaded && !canCallAccountScoped ? (
        <p role="alert" className="errorBox">
          {t("notReadyToLoad")}
        </p>
      ) : null}

      {loading ? <p className="muted">{t("loading")}</p> : null}
      {loadError ? (
        <pre className="errorBox" aria-live="polite">
          {loadError}
        </pre>
      ) : null}

      <div className="recipeEditLayout">
        <nav aria-label={t("nav.sectionsAriaLabel")} className="panel recipeEditSidebar">
          <p className="muted" style={{ marginTop: 0 }}>
            {t("nav.sectionsTitle")}
          </p>
          <ul className="recipeEditNavList">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`recipeEditNavLink${activeNavId === s.id ? " recipeEditNavLink--active" : ""}`}
                  aria-current={activeNavId === s.id ? "location" : undefined}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <hr className="recipeEditDivider" suppressHydrationWarning />
          <ul className="recipeEditNavList">
            <li>
              <Link href={`/recipes/${recipeId}/water`} className="recipeEditNavLink recipeEditNavLink--secondary">
                {t("nav.openWaterCalculator")}
              </Link>
            </li>
            <li>
              <Link href="/recipes" className="recipeEditNavLink recipeEditNavLink--secondary">
                {t("nav.backToRecipes")}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="recipeEditContent">
          <section id="basics" className="panel">
            <details open={openSections.basics} onToggle={(e) => setSectionOpen("basics", e.currentTarget.open)}>
              <summary style={{ cursor: "pointer" }}>
                <h2 id="basics-heading" style={{ margin: 0, display: "inline" }}>
                  {t("sections.basics")}
                </h2>
              </summary>
              <div style={{ marginTop: 12 }}>
                <p className="muted" style={{ marginTop: 0 }}>
                  {t("basicsHelp")}
                </p>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label htmlFor="recipe-name" className="muted" style={{ display: "block", fontSize: 12 }}>
                      Name
                    </label>
                    <input
                      id="recipe-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="recipe-style" className="muted" style={{ display: "block", fontSize: 12 }}>
                      Style
                    </label>
                    <select
                      id="recipe-style"
                      value={styleKey}
                      onChange={(e) => setStyleKey(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                      disabled={stylesLoading || styles.length === 0}
                      required
                    >
                      {styles.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.key === "custom" ? s.name : `${s.code} — ${s.name}`}
                        </option>
                      ))}
                    </select>
                    {stylesError ? (
                      <p className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
                        {String(stylesError)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
                  <button onClick={onSave} disabled={!canCallAccountScoped || saving}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                  {saveStatus ? (
                    <span className="muted" aria-live="polite">
                      {saveStatus}
                    </span>
                  ) : null}
                  {recipe ? (
                    <span className="muted">
                      Updated: <code>{recipe.updatedAt}</code>
                    </span>
                  ) : null}
                </div>

                {saveError ? (
                  <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
                    {saveError}
                  </pre>
                ) : null}
              </div>
            </details>
          </section>

          <section id="analysis" className="panel">
            <details open={openSections.analysis} onToggle={(e) => setSectionOpen("analysis", e.currentTarget.open)}>
              <summary style={{ cursor: "pointer" }}>
                <h2 id="analysis-heading" style={{ margin: 0, display: "inline" }}>
                  {t("sections.analysis")}
                </h2>
              </summary>
              <div style={{ marginTop: 12 }}>
                <p className="muted" style={{ marginTop: 0 }}>
                  {tAnalysis("help")}
                </p>

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
                      return renderDerivationBody({ locale, tMath, derivation: d });
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
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <tbody>
                            <tr>
                              <td style={{ paddingRight: 12 }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                  <strong>{tAnalysis("fields.abv")}</strong>
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
                                </div>
                              </td>
                              <td>
                                <code>{fmtField("abvEstimatedPercent", a?.abvEstimatedPercent, 2)}</code>{" "}
                                {typeof a?.abvEstimatedPercent === "number" ? <span className="muted">%</span> : null}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingRight: 12 }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                  <strong>{tAnalysis("fields.ibuTinseth")}</strong>
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
                                </div>
                              </td>
                              <td>
                                <code>{fmtField("ibuTinsethEstimated", a?.ibuTinsethEstimated, 1)}</code>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingRight: 12 }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                  <strong>{tAnalysis("fields.ibuRager")}</strong>
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
                                </div>
                              </td>
                              <td>
                                <code>{fmtField("ibuRagerEstimated", a?.ibuRagerEstimated, 1)}</code>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingRight: 12 }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                  <strong>{tAnalysis("fields.srmMorey")}</strong>
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
                                </div>
                              </td>
                              <td>
                                <code>{fmtField("colorSrmMoreyEstimated", a?.colorSrmMoreyEstimated, 1)}</code>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingRight: 12 }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                  <strong>{tAnalysis("fields.srmDaniels")}</strong>
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
                                </div>
                              </td>
                              <td>
                                <code>{fmtField("colorSrmDanielsEstimated", a?.colorSrmDanielsEstimated, 1)}</code>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingRight: 12 }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                  <strong>{tAnalysis("fields.kettleVolume")}</strong>
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
                                </div>
                              </td>
                              <td>
                                <code>{fmtField("kettleVolumeLiters", a?.kettleVolumeLiters, 2)}</code>{" "}
                                {typeof a?.kettleVolumeLiters === "number" ? <span className="muted">L</span> : null}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingRight: 12 }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                  <strong>{tAnalysis("fields.preBoilVolume")}</strong>
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
                                </div>
                              </td>
                              <td>
                                <code>{fmtField("preBoilVolumeLiters", a?.preBoilVolumeLiters, 2)}</code>{" "}
                                {typeof a?.preBoilVolumeLiters === "number" ? <span className="muted">L</span> : null}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingRight: 12 }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                  <strong>{tAnalysis("fields.og")}</strong>
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
                                </div>
                              </td>
                              <td>
                                <code>{fmtField("ogEstimatedSg", a?.ogEstimatedSg, 3)}</code>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingRight: 12 }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                  <strong>{tAnalysis("fields.fg")}</strong>
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
                                </div>
                              </td>
                              <td>
                                <code>{fmtField("fgEstimatedSg", a?.fgEstimatedSg, 3)}</code>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingRight: 12 }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                  <strong>{tAnalysis("fields.attenuation")}</strong>
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
                                </div>
                              </td>
                              <td>
                                <code>{fmtField("attenuationEffectivePercent", a?.attenuationEffectivePercent, 1)}</code>{" "}
                                {typeof a?.attenuationEffectivePercent === "number" ? (
                                  <span className="muted">%</span>
                                ) : null}
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingRight: 12 }}>
                                <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                                  <strong>{tAnalysis("fields.pbg")}</strong>
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
                                </div>
                              </td>
                              <td>
                                <code>{fmtField("pbgEstimatedSg", a?.pbgEstimatedSg, 3)}</code>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {warnings.length ? (
                        <details className="fieldBlock fieldBlock--computed" style={{ marginTop: 12 }}>
                          <summary className="fieldBlockHeader" style={{ cursor: "pointer" }}>
                            <strong>{tAnalysis("warningsTitle")}</strong>
                            <span className="muted">{tAnalysis("warningsClickToExpand")}</span>
                          </summary>
                          <ul style={{ marginTop: 8 }}>
                            {warnings.map((w, idx) => (
                              <li key={`${String(w?.code ?? "warn")}-${idx}`}>
                                <code>{String(w?.code ?? "warning")}</code>{" "}
                                <span className="muted">{tAnalysis(`warnings.${String(w?.code ?? "unknown")}` as any)}</span>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </>
                  );
                })()}
              </div>
            </details>
          </section>

          <section id="equipment" className="panel">
            <details open={openSections.equipment} onToggle={(e) => setSectionOpen("equipment", e.currentTarget.open)}>
              <summary style={{ cursor: "pointer" }}>
                <h2 id="equipment-heading" style={{ margin: 0, display: "inline" }}>
                  {t("sections.equipment")}
                </h2>
              </summary>
              <div style={{ marginTop: 12 }}>
                <p className="muted" style={{ marginTop: 0 }}>
                  {tEquip("help")}
                </p>

                {equipmentProfilesError ? (
                  <pre className="errorBox" role="alert">
                    {equipmentProfilesError}
                  </pre>
                ) : null}

                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr auto auto", alignItems: "end" }}>
                  <div>
                    <label htmlFor="equipment-profile" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {tEquip("profileLabel")}
                    </label>
                    <select
                      id="equipment-profile"
                      value={selectedEquipmentProfileId}
                      onChange={(e) => setSelectedEquipmentProfileId(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                      disabled={equipmentProfilesLoading}
                    >
                      <option value="">{tEquip("noneOption")}</option>
                      {equipmentProfiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => void applyEquipmentProfileToRecipe("apply")}
                    disabled={!selectedEquipmentProfileId || equipmentApplying}
                  >
                    {equipmentApplying ? tEquip("working") : tEquip("apply")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void applyEquipmentProfileToRecipe("reload")}
                    disabled={!selectedEquipmentProfileId || equipmentApplying}
                  >
                    {equipmentApplying ? tEquip("working") : tEquip("reload")}
                  </button>
                </div>

                {equipmentApplyError ? (
                  <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
                    {equipmentApplyError}
                  </pre>
                ) : null}

                <p className="muted" style={{ marginBottom: 0 }}>
                  {tEquip("manageTemplatesText")} <Link href="/equipment">{tEquip("manageTemplatesLinkText")}</Link>.
                </p>
              </div>
            </details>
          </section>

          <section id="fermentables" className="panel">
            <details
              open={openSections.fermentables}
              onToggle={(e) => setSectionOpen("fermentables", e.currentTarget.open)}
            >
              <summary style={{ cursor: "pointer" }}>
                <h2 id="fermentables-heading" style={{ margin: 0, display: "inline" }}>
                  {t("sections.fermentables")}
                </h2>
              </summary>
              <div style={{ marginTop: 12 }}>
                <p className="muted" style={{ marginTop: 0 }}>
                  v0: enter your grist here. Water calculator can import a read-only snapshot.
                </p>

            <form onSubmit={onSearchFermentables} style={{ marginTop: 12 }}>
              <label htmlFor="fermentable-search" className="muted" style={{ display: "block", fontSize: 12 }}>
                Search fermentables database
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  id="fermentable-search"
                  value={fermentableQuery}
                  onChange={(e) => setFermentableQuery(e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                  autoComplete="off"
                />
                <button type="submit" disabled={!canCallAccountScoped || fermentableSearching}>
                  {fermentableSearching ? "Searching…" : "Search"}
                </button>
                <button
                  type="button"
                  onClick={clearFermentableSearchResults}
                  disabled={fermentableSearching || (!fermentableSearchError && fermentableResults.length === 0)}
                >
                  {t("buttons.clear")}
                </button>
              </div>
              {fermentableSearchError ? (
                <pre className="errorBox" role="alert" style={{ marginTop: 8 }}>
                  {fermentableSearchError}
                </pre>
              ) : null}
              {fermentableResults.length ? (
                <div style={{ overflowX: "auto", marginTop: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th align="left">Name</th>
                        <th align="left">Producer</th>
                        <th align="left">°L</th>
                        <th align="left">Yield %</th>
                        <th align="left">PPG</th>
                        <th align="left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fermentableResults.slice(0, 20).map((it) => (
                        <tr key={it.id}>
                          <td>{it.name}</td>
                          <td>{it.producer ?? ""}</td>
                          <td align="right">{typeof it.colorLovibond === "number" ? it.colorLovibond.toFixed(1) : ""}</td>
                          <td align="right">{typeof it.yieldPercent === "number" ? it.yieldPercent.toFixed(3) : ""}</td>
                          <td align="right">{typeof it.ppg === "number" ? it.ppg.toFixed(3) : ""}</td>
                          <td>
                            <button type="button" onClick={() => addFermentableFromDb(it)} disabled={!canCallAccountScoped}>
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </form>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button type="button" onClick={addGristRow} disabled={!canCallAccountScoped}>
                {t("buttons.addFermentable")}
              </button>
              <span className="muted" aria-live="polite">
                Total: <code>{gristTotals.totalKg.toFixed(3)}</code> kg{" "}
                {gristTotals.weightedAvgLovibond !== null ? (
                  <>
                    · Avg color: <code>{gristTotals.weightedAvgLovibond.toFixed(1)}</code> °L
                  </>
                ) : null}
              </span>
            </div>

            {gristRows.length ? (
              <div style={{ overflowX: "auto", marginTop: 12 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {gristRows.map((r, idx) => {
                      return (
                        <Fragment key={r.id}>
                          <tr>
                            <td colSpan={7} style={{ paddingTop: idx === 0 ? 0 : 12 }}>
                              <div className="ingredientCard">
                                <div
                                  style={{
                                    display: "grid",
                                    gap: 12,
                                    alignItems: "end",
                                    gridTemplateColumns:
                                      "minmax(240px, 1fr) minmax(100px, 140px) minmax(100px, 140px) auto",
                                  }}
                                >
                                  <div style={{ minWidth: 0 }}>
                                    <label className="muted ingredientCardLabel" htmlFor={`grist-name-${r.id}`}>
                                      Name
                                    </label>
                                    <input
                                      id={`grist-name-${r.id}`}
                                      value={r.name}
                                      onChange={(e) =>
                                        updateGristRow(r.id, {
                                          name: e.target.value,
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
                                      style={{ width: "100%", padding: 8 }}
                                      autoComplete="off"
                                    />
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <label className="muted ingredientCardLabel" htmlFor={`grist-producer-${r.id}`}>
                                      Producer
                                    </label>
                                    <input
                                      id={`grist-producer-${r.id}`}
                                      value={r.producer ?? ""}
                                      readOnly
                                      style={{ width: "100%", padding: 8 }}
                                    />
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <label className="muted ingredientCardLabel" htmlFor={`grist-group-${r.id}`}>
                                      Group
                                    </label>
                                    <input
                                      id={`grist-group-${r.id}`}
                                      value={r.group ?? ""}
                                      readOnly
                                      style={{ width: "100%", padding: 8 }}
                                    />
                                  </div>
                                  <div style={{ alignSelf: "start" }}>
                                    <button
                                      type="button"
                                      onClick={() => removeGristRow(r.id)}
                                      aria-label={`Remove fermentable row ${idx + 1}`}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>

                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
                                <div>
                                  <label
                                    className="muted"
                                    style={{ display: "block", fontSize: 12, textAlign: "left" }}
                                    htmlFor={`grist-kg-${r.id}`}
                                  >
                                    Amount (kg)
                                  </label>
                                  <input
                                    id={`grist-kg-${r.id}`}
                                    type="number"
                                    inputMode="decimal"
                                    step={0.001}
                                    value={r.amountKg}
                                    onChange={(e) => updateGristRow(r.id, { amountKg: Number(e.target.value) })}
                                    style={{ width: 140, padding: 8 }}
                                  />
                                </div>

                                <div>
                                  <label
                                    className="muted"
                                    style={{ display: "block", fontSize: 12, textAlign: "left" }}
                                    htmlFor={`grist-lov-${r.id}`}
                                  >
                                    Color (°L)
                                  </label>
                                  <input
                                    id={`grist-lov-${r.id}`}
                                    type="number"
                                    inputMode="decimal"
                                    step={0.1}
                                    value={r.colorLovibond ?? ""}
                                    onChange={(e) =>
                                      updateGristRow(r.id, {
                                        colorLovibond: e.target.value === "" ? null : Number(e.target.value),
                                      })
                                    }
                                    style={{ width: 100, padding: 8 }}
                                  />
                                </div>

                                <div>
                                  <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`grist-class-${r.id}`}>
                                    Mash pH class (legacy)
                                  </label>
                                  <select
                                    id={`grist-class-${r.id}`}
                                    value={r.maltClass}
                                    onChange={(e) => updateGristRow(r.id, { maltClass: e.target.value as any })}
                                    style={{ width: 160, padding: 8 }}
                                  >
                                    <option value="base">Base</option>
                                    <option value="crystal">Crystal</option>
                                    <option value="roast">Roast</option>
                                    <option value="acid">Acid malt</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`grist-pot-kind-${r.id}`}>
                                    Potential kind
                                  </label>
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
                                    style={{ width: 160, padding: 8 }}
                                  >
                                    <option value="">(none)</option>
                                    <option value="ppg">PPG</option>
                                    <option value="yieldPercent">Yield %</option>
                                    <option value="sg">SG (e.g. 1.037)</option>
                                  </select>
                                </div>

                                <div>
                                  <label
                                    className="muted"
                                    style={{ display: "block", fontSize: 12, textAlign: "left" }}
                                    htmlFor={`grist-pot-val-${r.id}`}
                                  >
                                    Potential value
                                  </label>
                                  <input
                                    id={`grist-pot-val-${r.id}`}
                                    type="number"
                                    inputMode="decimal"
                                    step={0.001}
                                    value={r.potential ? roundTo(r.potential.value, 3) : ""}
                                    onChange={(e) => {
                                      const v = e.target.value === "" ? null : Number(e.target.value);
                                      if (!r.potential) return;
                                      if (v === null) return updateGristRow(r.id, { potential: null });
                                      updateGristRow(r.id, { potential: { ...r.potential, value: roundTo(v, 3) } });
                                    }}
                                    disabled={!r.potential}
                                    style={{ width: 140, padding: 8 }}
                                  />
                                </div>

                                <div style={{ flexBasis: "100%" }}>
                                  <details>
                                    <summary className="muted" style={{ fontSize: 12, cursor: "pointer" }}>
                                      Mash pH model (v1) – Advanced users
                                    </summary>
                                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginTop: 8 }}>
                                      {isRoastedLike(r) ? (
                                        <>
                                          <div style={{ width: 220, maxWidth: "100%" }}>
                                            <label className="muted" style={{ display: "block", fontSize: 12 }}>
                                              Dehusked/de-bittered
                                            </label>
                                            <input
                                              value={
                                                typeof r.mashRoastDehuskedOverride === "boolean"
                                                  ? r.mashRoastDehuskedOverride
                                                    ? "yes"
                                                    : "no"
                                                  : r.mashRoastDehuskedSource === "inferred"
                                                    ? inferDehuskedFromName(r.name)
                                                      ? "yes"
                                                      : "no"
                                                    : ""
                                              }
                                              readOnly
                                              style={{ width: "100%", padding: 8 }}
                                              tabIndex={-1}
                                            />
                                          </div>
                                          <div style={{ width: 260, maxWidth: "100%" }}>
                                            <label
                                              className="muted"
                                              style={{ display: "block", fontSize: 12 }}
                                              htmlFor={`grist-roast-dehusked-override-${r.id}`}
                                            >
                                              Override
                                            </label>
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
                                              style={{ width: "100%", padding: 8 }}
                                            >
                                              <option value="auto">Auto (detect)</option>
                                              <option value="force_husked">Force husked</option>
                                              <option value="force_dehusked">Force dehusked/de-bittered</option>
                                            </select>
                                          </div>
                                          <div style={{ width: 200, maxWidth: "100%" }}>
                                            <label className="muted" style={{ display: "block", fontSize: 12 }}>
                                              Dehusked source
                                            </label>
                                            <input
                                              value={r.mashRoastDehuskedSource ?? "unknown"}
                                              readOnly
                                              style={{ width: "100%", padding: 8 }}
                                              tabIndex={-1}
                                            />
                                          </div>
                                        </>
                                      ) : null}
                                      <div style={{ width: 240, maxWidth: "100%" }}>
                                        <label
                                          className="muted"
                                          style={{ display: "block", fontSize: 12 }}
                                          htmlFor={`grist-mash-di-ph-${r.id}`}
                                        >
                                          DI mash pH (room temp)
                                        </label>
                                        <input
                                          id={`grist-mash-di-ph-${r.id}`}
                                          type="number"
                                          inputMode="decimal"
                                          step={0.01}
                                          value={r.mashDiPh ?? ""}
                                          onChange={(e) =>
                                            updateGristRow(r.id, {
                                              mashDiPh: e.target.value === "" ? null : Number(e.target.value),
                                              mashPhModelSource: "override",
                                            })
                                          }
                                          style={{ width: "100%", padding: 8 }}
                                        />
                                      </div>
                                      <div style={{ width: 280, maxWidth: "100%" }}>
                                        <label
                                          className="muted"
                                          style={{ display: "block", fontSize: 12 }}
                                          htmlFor={`grist-mash-ta-${r.id}`}
                                        >
                                          Titratable acidity to pH 5.7 (mEq/kg)
                                        </label>
                                        <input
                                          id={`grist-mash-ta-${r.id}`}
                                          type="number"
                                          inputMode="decimal"
                                          step={0.1}
                                          value={r.mashTaToPh57_mEqPerKg ?? ""}
                                          onChange={(e) =>
                                            updateGristRow(r.id, {
                                              mashTaToPh57_mEqPerKg: e.target.value === "" ? null : Number(e.target.value),
                                              mashPhModelSource: "override",
                                            })
                                          }
                                          style={{ width: "100%", padding: 8 }}
                                        />
                                      </div>
                                      <div style={{ width: 200, maxWidth: "100%" }}>
                                        <label className="muted" style={{ display: "block", fontSize: 12 }}>
                                          Source
                                        </label>
                                        <input
                                          value={r.mashPhModelSource ?? "unknown"}
                                          readOnly
                                          style={{ width: "100%", padding: 8 }}
                                          tabIndex={-1}
                                        />
                                      </div>
                                    </div>
                                  </details>
                                </div>
                              </div>
                              </div>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
                No fermentables yet.
              </p>
            )}

                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <button type="button" onClick={onSave} disabled={!canCallAccountScoped || saving}>
                    {saving ? "Saving…" : "Save (including grist)"}
                  </button>
                </div>

                <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </p>
              </div>
            </details>
          </section>

          <section id="hops" className="panel">
            <details open={openSections.hops} onToggle={(e) => setSectionOpen("hops", e.currentTarget.open)}>
              <summary style={{ cursor: "pointer" }}>
                <h2 id="hops-heading" style={{ margin: 0, display: "inline" }}>
                  {t("sections.hops")}
                </h2>
              </summary>
              <div style={{ marginTop: 12 }}>
                <p className="muted" style={{ marginTop: 0 }}>
                  {t("hopsHelp")}
                </p>

            <form onSubmit={onSearchHops} style={{ marginTop: 12 }}>
              <label htmlFor="hop-search" className="muted" style={{ display: "block", fontSize: 12 }}>
                Search hops database
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  id="hop-search"
                  value={hopQuery}
                  onChange={(e) => setHopQuery(e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                  autoComplete="off"
                />
                <button type="submit" disabled={!canCallAccountScoped || hopSearching}>
                  {hopSearching ? "Searching…" : "Search"}
                </button>
                <button
                  type="button"
                  onClick={clearHopSearchResults}
                  disabled={hopSearching || (!hopSearchError && hopResults.length === 0)}
                >
                  {t("buttons.clear")}
                </button>
              </div>
              {hopSearchError ? (
                <pre className="errorBox" role="alert" style={{ marginTop: 8 }}>
                  {hopSearchError}
                </pre>
              ) : null}
              {hopResults.length ? (
                <div style={{ overflowX: "auto", marginTop: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th align="left">Name</th>
                        <th align="left">Country</th>
                        <th align="left">α min</th>
                        <th align="left">α max</th>
                        <th align="left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hopResults.slice(0, 20).map((it) => (
                        <tr key={it.id}>
                          <td>{it.name}</td>
                          <td>{it.country ?? ""}</td>
                          <td align="right">{typeof it.alphaMin === "number" ? it.alphaMin.toFixed(1) : ""}</td>
                          <td align="right">{typeof it.alphaMax === "number" ? it.alphaMax.toFixed(1) : ""}</td>
                          <td>
                            <button type="button" onClick={() => addHopFromDb(it)} disabled={!canCallAccountScoped}>
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </form>

            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <button type="button" onClick={() => addHopRow()} disabled={!canCallAccountScoped}>
                Add hop
              </button>
            </div>

            {hopsRows.length ? (
              <div style={{ overflowX: "auto", marginTop: 12 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {hopsRows.map((r, idx) => {
                      return (
                        <Fragment key={r.id}>
                          <tr>
                            <td colSpan={6} style={{ paddingTop: idx === 0 ? 0 : 12 }}>
                              <div className="ingredientCard">
                                <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                                  <div style={{ flex: 1, minWidth: 280 }}>
                                    <label className="muted ingredientCardLabel" htmlFor={`hop-name-${r.id}`}>
                                      Name
                                    </label>
                                    <input
                                      id={`hop-name-${r.id}`}
                                      value={r.name}
                                      onChange={(e) =>
                                        updateHopRow(r.id, { name: e.target.value, ingredientId: null, country: null })
                                      }
                                      style={{ width: "100%", padding: 8 }}
                                      autoComplete="off"
                                    />
                                  </div>
                                  <div style={{ width: 240, maxWidth: "100%" }}>
                                    <label className="muted ingredientCardLabel" htmlFor={`hop-country-${r.id}`}>
                                      Country
                                    </label>
                                    <input
                                      id={`hop-country-${r.id}`}
                                      value={r.country ?? ""}
                                      readOnly
                                      style={{ width: "100%", padding: 8 }}
                                    />
                                  </div>
                                  <div style={{ flex: "0 0 auto" }}>
                                    <button
                                      type="button"
                                      onClick={() => removeHopRow(r.id)}
                                      aria-label={`Remove hop row ${idx + 1}`}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>

                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
                                <div>
                                  <label
                                    className="muted"
                                    style={{ display: "block", fontSize: 12, textAlign: "left" }}
                                    htmlFor={`hop-g-${r.id}`}
                                  >
                                    Amount (g)
                                  </label>
                                  <input
                                    id={`hop-g-${r.id}`}
                                    type="number"
                                    inputMode="decimal"
                                    step={0.1}
                                    value={r.amountGrams}
                                    onChange={(e) => updateHopRow(r.id, { amountGrams: Number(e.target.value) })}
                                    style={{ width: 120, padding: 8 }}
                                  />
                                </div>

                                <div>
                                  <label
                                    className="muted"
                                    style={{ display: "block", fontSize: 12, textAlign: "left" }}
                                    htmlFor={`hop-aa-${r.id}`}
                                  >
                                    Alpha (%)
                                  </label>
                                  <input
                                    id={`hop-aa-${r.id}`}
                                    type="number"
                                    inputMode="decimal"
                                    step={0.1}
                                    value={r.alphaAcidPercent ?? ""}
                                    onChange={(e) =>
                                      updateHopRow(r.id, {
                                        alphaAcidPercent: e.target.value === "" ? null : Number(e.target.value),
                                      })
                                    }
                                    style={{ width: 110, padding: 8 }}
                                  />
                                </div>

                                <div>
                                  <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`hop-use-${r.id}`}>
                                    Use
                                  </label>
                                  <select
                                    id={`hop-use-${r.id}`}
                                    value={r.use}
                                    onChange={(e) => updateHopRow(r.id, { use: e.target.value as HopUse })}
                                    style={{ width: 150, padding: 8 }}
                                  >
                                    <option value="boil">Boil</option>
                                    <option value="whirlpool">Whirlpool</option>
                                    <option value="dryhop">Dry hop</option>
                                  </select>
                                </div>

                                <div>
                                  <label
                                    className="muted"
                                    style={{ display: "block", fontSize: 12, textAlign: "left" }}
                                    htmlFor={`hop-min-${r.id}`}
                                  >
                                    Time (min)
                                  </label>
                                  <input
                                    id={`hop-min-${r.id}`}
                                    type="number"
                                    inputMode="decimal"
                                    step={1}
                                    value={r.timeMinutes ?? ""}
                                    onChange={(e) =>
                                      updateHopRow(r.id, { timeMinutes: e.target.value === "" ? null : Number(e.target.value) })
                                    }
                                    style={{ width: 110, padding: 8 }}
                                  />
                                </div>
                              </div>
                              </div>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
                No hops yet.
              </p>
            )}

                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <button type="button" onClick={onSave} disabled={!canCallAccountScoped || saving}>
                    {saving ? "Saving…" : "Save (including hops)"}
                  </button>
                </div>

                <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </p>
              </div>
            </details>
          </section>

          <section id="yeast" className="panel">
            <details open={openSections.yeast} onToggle={(e) => setSectionOpen("yeast", e.currentTarget.open)}>
              <summary style={{ cursor: "pointer" }}>
                <h2 id="yeast-heading" style={{ margin: 0, display: "inline" }}>
                  {t("sections.yeast")}
                </h2>
              </summary>
              <div style={{ marginTop: 12 }}>
                <p className="muted" style={{ marginTop: 0 }}>
                  {t("yeastHelp")}
                </p>

            <form onSubmit={onSearchYeasts} style={{ marginTop: 12 }}>
              <label htmlFor="yeast-search" className="muted" style={{ display: "block", fontSize: 12 }}>
                Search yeast database
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  id="yeast-search"
                  value={yeastQuery}
                  onChange={(e) => setYeastQuery(e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                  autoComplete="off"
                />
                <button type="submit" disabled={!canCallAccountScoped || yeastSearching}>
                  {yeastSearching ? "Searching…" : "Search"}
                </button>
                <button
                  type="button"
                  onClick={clearYeastSearchResults}
                  disabled={yeastSearching || (!yeastSearchError && yeastResults.length === 0)}
                >
                  {t("buttons.clear")}
                </button>
              </div>
              {yeastSearchError ? (
                <pre className="errorBox" role="alert" style={{ marginTop: 8 }}>
                  {yeastSearchError}
                </pre>
              ) : null}
              {yeastResults.length ? (
                <div style={{ overflowX: "auto", marginTop: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th align="left">Name</th>
                        <th align="left">Lab</th>
                        <th align="left">Product ID</th>
                        <th align="left">Type</th>
                        <th align="left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yeastResults.slice(0, 20).map((it) => (
                        <tr key={it.id}>
                          <td>{it.name}</td>
                          <td>{it.lab ?? ""}</td>
                          <td>{it.productId ?? ""}</td>
                          <td>{it.type ?? ""}</td>
                          <td>
                            <button type="button" onClick={() => addYeastFromDb(it)} disabled={!canCallAccountScoped}>
                              Add
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </form>

            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <button type="button" onClick={() => addYeastRow()} disabled={!canCallAccountScoped}>
                Add yeast
              </button>
            </div>

            {yeastRows.length ? (
              <div style={{ overflowX: "auto", marginTop: 12 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {yeastRows.map((r, idx) => {
                      return (
                        <tr key={r.id}>
                          <td colSpan={2} style={{ paddingTop: idx === 0 ? 0 : 12 }}>
                            <div className="ingredientCard">
                              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                                <div style={{ flex: 1, minWidth: 280 }}>
                                  <label className="muted ingredientCardLabel" htmlFor={`yeast-name-${r.id}`}>
                                    Name
                                  </label>
                                  <input
                                    id={`yeast-name-${r.id}`}
                                    value={r.name}
                                    onChange={(e) =>
                                      updateYeastRow(r.id, {
                                        name: e.target.value,
                                        ingredientId: null,
                                        lab: null,
                                        productId: null,
                                        attenuationMin: null,
                                        attenuationMax: null,
                                      })
                                    }
                                    style={{ width: "100%", padding: 8 }}
                                    autoComplete="off"
                                  />
                                </div>
                                <div style={{ width: 240, maxWidth: "100%" }}>
                                  <label className="muted ingredientCardLabel" htmlFor={`yeast-lab-${r.id}`}>
                                    Lab
                                  </label>
                                  <input
                                    id={`yeast-lab-${r.id}`}
                                    value={r.lab ?? ""}
                                    readOnly
                                    style={{ width: "100%", padding: 8 }}
                                  />
                                </div>
                                <div style={{ width: 160, maxWidth: "100%" }}>
                                  <label className="muted ingredientCardLabel" htmlFor={`yeast-product-${r.id}`}>
                                    Product ID
                                  </label>
                                  <input
                                    id={`yeast-product-${r.id}`}
                                    value={r.productId ?? ""}
                                    readOnly
                                    style={{ width: "100%", padding: 8 }}
                                  />
                                </div>
                                <div style={{ width: 160, maxWidth: "100%" }}>
                                  <label className="muted ingredientCardLabel" htmlFor={`yeast-atten-min-${r.id}`}>
                                    Atten min (%)
                                  </label>
                                  <input
                                    id={`yeast-atten-min-${r.id}`}
                                    value={typeof r.attenuationMin === "number" ? roundTo(r.attenuationMin, 3) : ""}
                                    readOnly
                                    style={{ width: "100%", padding: 8 }}
                                  />
                                </div>
                                <div style={{ width: 160, maxWidth: "100%" }}>
                                  <label className="muted ingredientCardLabel" htmlFor={`yeast-atten-max-${r.id}`}>
                                    Atten max (%)
                                  </label>
                                  <input
                                    id={`yeast-atten-max-${r.id}`}
                                    value={typeof r.attenuationMax === "number" ? roundTo(r.attenuationMax, 3) : ""}
                                    readOnly
                                    style={{ width: "100%", padding: 8 }}
                                  />
                                </div>
                                <div style={{ width: 200, maxWidth: "100%" }}>
                                  <label className="muted ingredientCardLabel" htmlFor={`yeast-atten-override-${r.id}`}>
                                    {tAnalysis("customAttenuationPercentLabel")}
                                  </label>
                                  <input
                                    id={`yeast-atten-override-${r.id}`}
                                    type="number"
                                    inputMode="decimal"
                                    step={0.1}
                                    value={yeastAttenuationOverrides[r.id] ?? ""}
                                    onChange={(e) =>
                                      setYeastAttenuationOverrides((prev) => ({ ...prev, [r.id]: e.target.value }))
                                    }
                                    style={{ width: "100%", padding: 8 }}
                                  />
                                </div>
                                <div style={{ flex: "0 0 auto" }}>
                                  <button
                                    type="button"
                                    onClick={() => removeYeastRow(r.id)}
                                    aria-label={`Remove yeast row ${idx + 1}`}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
                No yeast yet.
              </p>
            )}

                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <button type="button" onClick={onSave} disabled={!canCallAccountScoped || saving}>
                    {saving ? "Saving…" : "Save (including yeast)"}
                  </button>
                </div>

                <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </p>
              </div>
            </details>
          </section>

          <section id="other" className="panel">
            <details open={openSections.other} onToggle={(e) => setSectionOpen("other", e.currentTarget.open)}>
              <summary style={{ cursor: "pointer" }}>
                <h2 id="other-heading" style={{ margin: 0, display: "inline" }}>
                  {t("sections.other")}
                </h2>
              </summary>
              <div style={{ marginTop: 12 }}>
                <div style={{ marginTop: 0, display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <p className="muted" style={{ margin: 0 }}>
                    {t("otherHelp")}
                  </p>
                  <button type="button" onClick={addMiscRow}>
                    {t("buttons.addOtherIngredient")}
                  </button>
                </div>

            {miscRows.length ? (
              <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                {miscRows.map((r, idx) => {
                  const amountLabel = r.amountIsWeight ? "Amount (kg)" : "Amount (L)";
                  return (
                    <div key={r.id} className="ingredientCard">
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}>
                        <div style={{ flex: "1 1 280px", minWidth: 240 }}>
                          <label className="muted ingredientCardLabel" htmlFor={`misc-name-${r.id}`}>
                            Name
                          </label>
                          <input
                            id={`misc-name-${r.id}`}
                            value={r.name}
                            onChange={(e) => updateMiscRow(r.id, { name: e.target.value })}
                            style={{ width: "100%", padding: 8 }}
                            aria-label={`Other ingredient name ${idx + 1}`}
                          />
                        </div>

                        <div style={{ flex: "0 0 auto", width: 180, maxWidth: "100%" }}>
                          <label className="muted ingredientCardLabel" htmlFor={`misc-type-${r.id}`}>
                            Type
                          </label>
                          <select
                            id={`misc-type-${r.id}`}
                            value={r.type}
                            onChange={(e) => updateMiscRow(r.id, { type: e.target.value as MiscType })}
                            style={{ width: "100%", padding: 8 }}
                            aria-label={`Other ingredient type ${idx + 1}`}
                          >
                            {miscTypeOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ flex: "0 0 auto", width: 160, maxWidth: "100%" }}>
                          <label className="muted ingredientCardLabel" htmlFor={`misc-use-${r.id}`}>
                            Use
                          </label>
                          <select
                            id={`misc-use-${r.id}`}
                            value={r.use}
                            onChange={(e) => updateMiscRow(r.id, { use: e.target.value as MiscUse })}
                            style={{ width: "100%", padding: 8 }}
                            aria-label={`Other ingredient use ${idx + 1}`}
                          >
                            {miscUseOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ flex: "0 0 auto", width: 140, maxWidth: "100%" }}>
                          <label className="muted ingredientCardLabel" htmlFor={`misc-time-${r.id}`}>
                            Time (min)
                          </label>
                          <input
                            id={`misc-time-${r.id}`}
                            type="number"
                            value={typeof r.timeMinutes === "number" ? r.timeMinutes : ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              updateMiscRow(r.id, { timeMinutes: v === "" ? null : Number(v) });
                            }}
                            style={{ width: "100%", padding: 8 }}
                            aria-label={`Other ingredient time minutes ${idx + 1}`}
                          />
                        </div>

                        <div style={{ flex: "0 0 auto", width: 200, maxWidth: "100%" }}>
                          <label className="muted ingredientCardLabel" htmlFor={`misc-amount-is-weight-${r.id}`}>
                            Amount kind
                          </label>
                          <select
                            id={`misc-amount-is-weight-${r.id}`}
                            value={r.amountIsWeight ? "weight" : "volume"}
                            onChange={(e) => updateMiscRow(r.id, { amountIsWeight: e.target.value === "weight" })}
                            style={{ width: "100%", padding: 8 }}
                            aria-label={`Other ingredient amount kind ${idx + 1}`}
                          >
                            <option value="weight">Weight</option>
                            <option value="volume">Volume</option>
                          </select>
                        </div>

                        <div style={{ flex: "0 0 auto", width: 180, maxWidth: "100%" }}>
                          <label className="muted ingredientCardLabel" htmlFor={`misc-amount-${r.id}`}>
                            {amountLabel}
                          </label>
                          <input
                            id={`misc-amount-${r.id}`}
                            type="number"
                            value={Number.isFinite(r.amount) ? r.amount : ""}
                            onChange={(e) => updateMiscRow(r.id, { amount: Number(e.target.value || 0) })}
                            style={{ width: "100%", padding: 8 }}
                            aria-label={`Other ingredient amount ${idx + 1}`}
                          />
                        </div>

                        <div style={{ flex: "1 1 240px", minWidth: 240 }}>
                          <label className="muted ingredientCardLabel" htmlFor={`misc-use-for-${r.id}`}>
                            Use for
                          </label>
                          <input
                            id={`misc-use-for-${r.id}`}
                            value={r.useFor ?? ""}
                            onChange={(e) => updateMiscRow(r.id, { useFor: e.target.value || null })}
                            style={{ width: "100%", padding: 8 }}
                            aria-label={`Other ingredient use for ${idx + 1}`}
                          />
                        </div>

                        <div style={{ flex: "1 1 320px", minWidth: 260 }}>
                          <label className="muted ingredientCardLabel" htmlFor={`misc-notes-${r.id}`}>
                            Notes
                          </label>
                          <input
                            id={`misc-notes-${r.id}`}
                            value={r.notes ?? ""}
                            onChange={(e) => updateMiscRow(r.id, { notes: e.target.value || null })}
                            style={{ width: "100%", padding: 8 }}
                            aria-label={`Other ingredient notes ${idx + 1}`}
                          />
                        </div>

                        <div style={{ flex: "0 0 auto" }}>
                          <button
                            type="button"
                            onClick={() => removeMiscRow(r.id)}
                            aria-label={`Remove other ingredient row ${idx + 1}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
                No other ingredients yet.
              </p>
            )}

                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                  <button type="button" onClick={onSave} disabled={!canCallAccountScoped || saving}>
                    {saving ? "Saving…" : "Save (including other ingredients)"}
                  </button>
                </div>

                <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
                  {t("rawMaterialsCtaPrefix")}{" "}
                  <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
                </p>
              </div>
            </details>
          </section>

          <section id="notes" className="panel">
            <details open={openSections.notes} onToggle={(e) => setSectionOpen("notes", e.currentTarget.open)}>
              <summary style={{ cursor: "pointer" }}>
                <h2 id="notes-heading" style={{ margin: 0, display: "inline" }}>
                  {t("sections.notes")}
                </h2>
              </summary>
              <div style={{ marginTop: 12 }}>
                <label htmlFor="recipe-notes" className="muted" style={{ display: "block", fontSize: 12 }}>
                  {t("sections.notes")}
                </label>
                <textarea
                  id="recipe-notes"
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>
            </details>
          </section>

          <section id="water" className="panel" aria-labelledby="water-heading">
            <h2 id="water-heading" style={{ marginTop: 0 }}>
              {t("sections.water")}
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              {t("waterHelp")}
            </p>
            <p style={{ marginBottom: 0 }}>
              <Link href={`/recipes/${recipeId}/water`}>{t("nav.openWaterCalculator")}</Link>
            </p>
            <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
              {t("waterProfilesManageText")} <Link href="/water-profiles">{tNav("waterProfiles")}</Link>.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

