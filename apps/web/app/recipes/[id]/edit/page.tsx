"use client";

import { Link } from "../../../../src/i18n/navigation";
import { useParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";

import { apiFetch } from "../../../_lib/apiClient";
import {
  parseGristJson,
  type GristMaltClass,
  type GristPotential,
  type GristPotentialKind,
  type GristRow,
} from "../../../_lib/grist";

type Recipe = {
  id: string;
  accountId: string;
  name: string;
  style: string | null;
  notes: string | null;
  gristJson?: unknown;
  hopsJson?: unknown;
  yeastJson?: unknown;
  createdAt: string;
  updatedAt: string;
};

function newRowId() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

type HopUse = "boil" | "whirlpool" | "dryhop";
type HopRow = {
  id: string;
  ingredientId: string | null;
  name: string;
  country?: string | null;
  amountGrams: number;
  alphaAcidPercent: number | null;
  use: HopUse;
  timeMinutes: number | null;
};

function parseHopsJson(value: unknown): HopRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const o = (row ?? {}) as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : newRowId();
      const ingredientIdRaw = o.ingredientId;
      const ingredientId =
        ingredientIdRaw === null || ingredientIdRaw === undefined
          ? null
          : typeof ingredientIdRaw === "string"
            ? ingredientIdRaw
            : null;
      const name = typeof o.name === "string" ? o.name : "";
      const country = typeof o.country === "string" ? o.country : null;
      const amountGrams =
        typeof o.amountGrams === "number" && Number.isFinite(o.amountGrams) ? o.amountGrams : 0;
      const alphaRaw = o.alphaAcidPercent;
      const alphaAcidPercent =
        alphaRaw === null || alphaRaw === undefined
          ? null
          : typeof alphaRaw === "number" && Number.isFinite(alphaRaw)
            ? alphaRaw
            : null;
      const useRaw = o.use;
      const use: HopUse = useRaw === "whirlpool" || useRaw === "dryhop" || useRaw === "boil" ? useRaw : "boil";
      const timeRaw = o.timeMinutes;
      const timeMinutes =
        timeRaw === null || timeRaw === undefined
          ? null
          : typeof timeRaw === "number" && Number.isFinite(timeRaw)
            ? timeRaw
            : null;
      if (!name) return null;
      return { id, ingredientId, name, country, amountGrams, alphaAcidPercent, use, timeMinutes } as HopRow;
    })
    .filter(Boolean) as HopRow[];
}

type YeastRow = {
  id: string;
  ingredientId: string | null;
  name: string;
  lab?: string | null;
  productId?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
};

function parseYeastJson(value: unknown): YeastRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const o = (row ?? {}) as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : newRowId();
      const ingredientIdRaw = o.ingredientId;
      const ingredientId =
        ingredientIdRaw === null || ingredientIdRaw === undefined
          ? null
          : typeof ingredientIdRaw === "string"
            ? ingredientIdRaw
            : null;
      const name = typeof o.name === "string" ? o.name : "";
      if (!name) return null;
      const lab = typeof o.lab === "string" ? o.lab : null;
      const productId = typeof o.productId === "string" ? o.productId : null;
      const attenuationMin = typeof o.attenuationMin === "number" && Number.isFinite(o.attenuationMin) ? o.attenuationMin : null;
      const attenuationMax = typeof o.attenuationMax === "number" && Number.isFinite(o.attenuationMax) ? o.attenuationMax : null;
      return { id, ingredientId, name, lab, productId, attenuationMin, attenuationMax } as YeastRow;
    })
    .filter(Boolean) as YeastRow[];
}

export default function RecipeEditPage() {
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const roundTo = (n: number, decimals: number) => {
    const f = 10 ** decimals;
    return Math.round(n * f) / f;
  };

  const sections = [
    { id: "basics", label: "Basics" },
    { id: "fermentables", label: "Fermentables" },
    { id: "hops", label: "Hops" },
    { id: "yeast", label: "Yeast" },
    { id: "other", label: "Other ingredients" },
    { id: "notes", label: "Notes" },
    { id: "water", label: "Water chemistry" },
  ] as const;

  const [authLoaded, setAuthLoaded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [name, setName] = useState("");
  const [style, setStyle] = useState("");
  const [notes, setNotes] = useState("");
  const [gristRows, setGristRows] = useState<GristRow[]>([]);
  const [hopsRows, setHopsRows] = useState<HopRow[]>([]);
  const [yeastRows, setYeastRows] = useState<YeastRow[]>([]);

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
        setName(r.name ?? "");
        setStyle(r.style ?? "");
        setNotes(r.notes ?? "");
        setGristRows(parseGristJson(r.gristJson));
        setHopsRows(parseHopsJson(r.hopsJson));
        setYeastRows(parseYeastJson(r.yeastJson));
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

  const onSave = async () => {
    if (!recipeId) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    try {
      const res = await apiFetch(`/api/recipes/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          style: style || null,
          notes: notes || null,
          gristJson: gristRows,
          hopsJson: hopsRows,
          yeastJson: yeastRows,
        }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      const r = (res.data as any).recipe as Recipe;
      setRecipe(r);
      setSaveStatus("Saved.");
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
  const removeYeastRow = (id: string) => setYeastRows((prev) => prev.filter((r) => r.id !== id));
  const updateYeastRow = (id: string, patch: Partial<YeastRow>) =>
    setYeastRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

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
    if (!auth?.userId) return;
    setFermentableSearchError(null);
    setFermentableSearching(true);
    try {
      const res = await apiFetch(
        `/api/ingredients/fermentables?query=${encodeURIComponent(fermentableQuery)}`,
        auth,
      );
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
    if (!auth?.userId) return;
    setHopSearchError(null);
    setHopSearching(true);
    try {
      const res = await apiFetch(`/api/ingredients/hops?query=${encodeURIComponent(hopQuery)}`, auth);
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
    if (!auth?.userId) return;
    setYeastSearchError(null);
    setYeastSearching(true);
    try {
      const res = await apiFetch(`/api/ingredients/yeasts?query=${encodeURIComponent(yeastQuery)}`, auth);
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
      <h1 style={{ marginBottom: 8 }}>Edit recipe</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Recipe ID: <code>{recipeId}</code>
      </p>

      <p className="muted" style={{ marginTop: 0 }}>
        v0 shape: single-page editor with section navigation. Water chemistry is a link-out to the
        dedicated calculator page.
      </p>

      {authLoaded && !canCallAccountScoped ? (
        <p role="alert" className="errorBox">
          Not ready to load this recipe.
        </p>
      ) : null}

      {loading ? <p className="muted">Loading…</p> : null}
      {loadError ? (
        <pre className="errorBox" aria-live="polite">
          {loadError}
        </pre>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
        <nav aria-label="Recipe sections" className="panel" style={{ position: "sticky", top: 16 }}>
          <p className="muted" style={{ marginTop: 0 }}>
            Sections
          </p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.label}</a>
              </li>
            ))}
          </ul>
          <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "12px 0" }} />
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>
              <Link href={`/recipes/${recipeId}/water`}>Open water calculator</Link>
            </li>
            <li>
              <Link href="/recipes">Back to Recipes</Link>
            </li>
          </ul>
        </nav>

        <div style={{ display: "grid", gap: 16 }}>
          <section id="basics" className="panel" aria-labelledby="basics-heading">
            <h2 id="basics-heading" style={{ marginTop: 0 }}>
              Basics
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Loaded/saved via <code>GET</code>/<code>PATCH</code> <code>/api/recipes/:id</code>.
            </p>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <label
                  htmlFor="recipe-name"
                  className="muted"
                  style={{ display: "block", fontSize: 12 }}
                >
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
                <label
                  htmlFor="recipe-style"
                  className="muted"
                  style={{ display: "block", fontSize: 12 }}
                >
                  Style
                </label>
                <input
                  id="recipe-style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                />
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
          </section>

          <section id="fermentables" className="panel" aria-labelledby="fermentables-heading">
            <h2 id="fermentables-heading" style={{ marginTop: 0 }}>
              Fermentables
            </h2>
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
              </div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={clearFermentableSearchResults}
                  disabled={fermentableSearching || (!fermentableSearchError && fermentableResults.length === 0)}
                >
                  Clear search results
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
                Add fermentable
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
                      const borderTop = idx === 0 ? undefined : "1px solid rgba(255,255,255,0.08)";
                      return (
                        <Fragment key={r.id}>
                          <tr>
                            <td colSpan={7} style={{ paddingTop: 8, borderTop }}>
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
                                  <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`grist-name-${r.id}`}>
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
                                  <label
                                    className="muted"
                                    style={{ display: "block", fontSize: 12 }}
                                    htmlFor={`grist-producer-${r.id}`}
                                  >
                                    Producer
                                  </label>
                                  <input
                                    id={`grist-producer-${r.id}`}
                                    value={r.producer ?? ""}
                                    readOnly
                                    style={{ width: "100%", padding: 8 }}
                                    tabIndex={-1}
                                  />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <label
                                    className="muted"
                                    style={{ display: "block", fontSize: 12 }}
                                    htmlFor={`grist-group-${r.id}`}
                                  >
                                    Group
                                  </label>
                                  <input
                                    id={`grist-group-${r.id}`}
                                    value={r.group ?? ""}
                                    readOnly
                                    style={{ width: "100%", padding: 8 }}
                                    tabIndex={-1}
                                  />
                                </div>
                                <div style={{ alignSelf: "start" }}>
                                  <button type="button" onClick={() => removeGristRow(r.id)} aria-label={`Remove fermentable row ${idx + 1}`}>
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={7} style={{ paddingBottom: 8 }}>
                              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
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
          </section>

          <section id="hops" className="panel" aria-labelledby="hops-heading">
            <h2 id="hops-heading" style={{ marginTop: 0 }}>
              Hops
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              v0: pick hops from the database (or enter manually). Stored as a snapshot on the recipe.
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
              </div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={clearHopSearchResults}
                  disabled={hopSearching || (!hopSearchError && hopResults.length === 0)}
                >
                  Clear search results
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
                      const borderTop = idx === 0 ? undefined : "1px solid rgba(255,255,255,0.08)";
                      return (
                        <Fragment key={r.id}>
                          <tr>
                            <td colSpan={6} style={{ paddingTop: 8, borderTop }}>
                              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                                <div style={{ flex: 1, minWidth: 280 }}>
                                  <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`hop-name-${r.id}`}>
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
                                  <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`hop-country-${r.id}`}>
                                    Country
                                  </label>
                                  <input
                                    id={`hop-country-${r.id}`}
                                    value={r.country ?? ""}
                                    readOnly
                                    style={{ width: "100%", padding: 8 }}
                                    tabIndex={-1}
                                  />
                                </div>
                                <div style={{ flex: "0 0 auto" }}>
                                  <button type="button" onClick={() => removeHopRow(r.id)} aria-label={`Remove hop row ${idx + 1}`}>
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>

                          <tr>
                            <td colSpan={6} style={{ paddingBottom: 8 }}>
                              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
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
          </section>

          <section id="yeast" className="panel" aria-labelledby="yeast-heading">
            <h2 id="yeast-heading" style={{ marginTop: 0 }}>
              Yeast
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              v0: select yeast from the database (or enter manually). Stored as a snapshot on the recipe.
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
              </div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={clearYeastSearchResults}
                  disabled={yeastSearching || (!yeastSearchError && yeastResults.length === 0)}
                >
                  Clear search results
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
                      const borderTop = idx === 0 ? undefined : "1px solid rgba(255,255,255,0.08)";
                      return (
                        <tr key={r.id}>
                          <td colSpan={2} style={{ paddingTop: 8, paddingBottom: 8, borderTop }}>
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                              <div style={{ flex: 1, minWidth: 280 }}>
                                <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`yeast-name-${r.id}`}>
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
                                <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`yeast-lab-${r.id}`}>
                                  Lab
                                </label>
                                <input
                                  id={`yeast-lab-${r.id}`}
                                  value={r.lab ?? ""}
                                  readOnly
                                  style={{ width: "100%", padding: 8 }}
                                  tabIndex={-1}
                                />
                              </div>
                              <div style={{ width: 160, maxWidth: "100%" }}>
                                <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`yeast-product-${r.id}`}>
                                  Product ID
                                </label>
                                <input
                                  id={`yeast-product-${r.id}`}
                                  value={r.productId ?? ""}
                                  readOnly
                                  style={{ width: "100%", padding: 8 }}
                                  tabIndex={-1}
                                />
                              </div>
                              <div style={{ width: 160, maxWidth: "100%" }}>
                                <label
                                  className="muted"
                                  style={{ display: "block", fontSize: 12 }}
                                  htmlFor={`yeast-atten-min-${r.id}`}
                                >
                                  Atten min (%)
                                </label>
                                <input
                                  id={`yeast-atten-min-${r.id}`}
                                  value={typeof r.attenuationMin === "number" ? roundTo(r.attenuationMin, 3) : ""}
                                  readOnly
                                  style={{ width: "100%", padding: 8 }}
                                  tabIndex={-1}
                                />
                              </div>
                              <div style={{ width: 160, maxWidth: "100%" }}>
                                <label
                                  className="muted"
                                  style={{ display: "block", fontSize: 12 }}
                                  htmlFor={`yeast-atten-max-${r.id}`}
                                >
                                  Atten max (%)
                                </label>
                                <input
                                  id={`yeast-atten-max-${r.id}`}
                                  value={typeof r.attenuationMax === "number" ? roundTo(r.attenuationMax, 3) : ""}
                                  readOnly
                                  style={{ width: "100%", padding: 8 }}
                                  tabIndex={-1}
                                />
                              </div>
                              <div style={{ flex: "0 0 auto" }}>
                                <button type="button" onClick={() => removeYeastRow(r.id)} aria-label={`Remove yeast row ${idx + 1}`}>
                                  Remove
                                </button>
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
          </section>

          <section id="other" className="panel" aria-labelledby="other-heading">
            <h2 id="other-heading" style={{ marginTop: 0 }}>
              Other ingredients
            </h2>
          </section>

          <section id="notes" className="panel" aria-labelledby="notes-heading">
            <h2 id="notes-heading" style={{ marginTop: 0 }}>
              Notes
            </h2>
            <label htmlFor="recipe-notes" className="muted" style={{ display: "block", fontSize: 12 }}>
              Notes
            </label>
            <textarea
              id="recipe-notes"
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </section>

          <section id="water" className="panel" aria-labelledby="water-heading">
            <h2 id="water-heading" style={{ marginTop: 0 }}>
              Water chemistry
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              The full mash chemistry + water calculator lives on its own page (not embedded here).
            </p>
            <p style={{ marginBottom: 0 }}>
              <Link href={`/recipes/${recipeId}/water`}>Open water calculator</Link>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

