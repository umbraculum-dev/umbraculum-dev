"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { loadDevAuthFromStorage, type DevAuth } from "../../../_lib/devAuth";

type Recipe = {
  id: string;
  accountId: string;
  name: string;
  style: string | null;
  notes: string | null;
  gristJson?: unknown;
  createdAt: string;
  updatedAt: string;
};

type GristPotentialKind = "ppg" | "yieldPercent" | "sg";
type GristPotential = { kind: GristPotentialKind; value: number } | null;
type GristMaltClass = "base" | "crystal" | "roast" | "acid";
type GristRow = {
  id: string;
  name: string;
  amountKg: number;
  colorLovibond: number | null;
  potential: GristPotential;
  maltClass: GristMaltClass;
};

function newRowId() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

function parseGristJson(value: unknown): GristRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const o = (row ?? {}) as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : newRowId();
      const name = typeof o.name === "string" ? o.name : "";
      const amountKg = typeof o.amountKg === "number" && Number.isFinite(o.amountKg) ? o.amountKg : 0;
      const colorLovibond =
        o.colorLovibond === null
          ? null
          : typeof o.colorLovibond === "number" && Number.isFinite(o.colorLovibond)
            ? o.colorLovibond
            : null;
      const potentialRaw = o.potential;
      let potential: GristPotential = null;
      if (potentialRaw && typeof potentialRaw === "object") {
        const p = potentialRaw as Record<string, unknown>;
        const kind = p.kind;
        const v = p.value;
        if (
          (kind === "ppg" || kind === "yieldPercent" || kind === "sg") &&
          typeof v === "number" &&
          Number.isFinite(v)
        ) {
          potential = { kind, value: v };
        }
      }
      const maltClassRaw = o.maltClass;
      const maltClass: GristMaltClass =
        maltClassRaw === "base" ||
        maltClassRaw === "crystal" ||
        maltClassRaw === "roast" ||
        maltClassRaw === "acid"
          ? maltClassRaw
          : "base";
      return { id, name, amountKg, colorLovibond, potential, maltClass } as GristRow;
    })
    .filter(Boolean);
}

async function apiFetch(path: string, auth: DevAuth, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "X-User-Id": auth.userId,
      ...(auth.activeAccountId ? { "X-Account-Id": auth.activeAccountId } : {}),
    },
  });
  const data = (await res.json()) as unknown;
  return { ok: res.ok, status: res.status, data };
}

export default function RecipeEditPage() {
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const sections = [
    { id: "basics", label: "Basics" },
    { id: "fermentables", label: "Fermentables" },
    { id: "hops", label: "Hops" },
    { id: "yeast", label: "Yeast" },
    { id: "other", label: "Other ingredients" },
    { id: "notes", label: "Notes" },
    { id: "water", label: "Water chemistry" },
  ] as const;

  const [authLoaded, setAuthLoaded] = useState(false);
  const [auth, setAuth] = useState<DevAuth | null>(null);
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

  useEffect(() => {
    setAuth(loadDevAuthFromStorage());
    setAuthLoaded(true);
  }, []);

  const canCallAccountScoped = useMemo(
    () => Boolean(auth?.userId && auth?.activeAccountId && recipeId),
    [auth, recipeId],
  );

  useEffect(() => {
    if (!canCallAccountScoped) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      setSaveStatus(null);
      try {
        const res = await apiFetch(`/api/recipes/${recipeId}`, auth as DevAuth);
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const r = (res.data as any).recipe as Recipe;
        if (cancelled) return;
        setRecipe(r);
        setName(r.name ?? "");
        setStyle(r.style ?? "");
        setNotes(r.notes ?? "");
        setGristRows(parseGristJson(r.gristJson));
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
  }, [auth, canCallAccountScoped, recipeId]);

  const onSave = async () => {
    if (!auth?.userId || !auth.activeAccountId || !recipeId) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    try {
      const res = await apiFetch(`/api/recipes/${recipeId}`, auth, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          style: style || null,
          notes: notes || null,
          gristJson: gristRows,
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
      { id: newRowId(), name: "", amountKg: 0, colorLovibond: null, potential: null, maltClass: "base" },
    ]);
  };
  const removeGristRow = (id: string) => {
    setGristRows((prev) => prev.filter((r) => r.id !== id));
  };
  const updateGristRow = (id: string, patch: Partial<GristRow>) => {
    setGristRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
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

      {authLoaded && (!auth?.userId || !auth?.activeAccountId) ? (
        <p role="alert" className="errorBox">
          Missing dev headers. Go to the dashboard and click <strong>Save headers</strong> (User +
          Active account), then come back here.
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

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button type="button" onClick={addGristRow} disabled={!canCallAccountScoped}>
                Add fermentable
              </button>
              <button type="button" onClick={onSave} disabled={!canCallAccountScoped || saving}>
                {saving ? "Saving…" : "Save (including grist)"}
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
                  <thead>
                    <tr>
                      <th align="left">Name</th>
                      <th align="right">kg</th>
                      <th align="right">°L</th>
                      <th align="left">Malt class</th>
                      <th align="left">Potential</th>
                      <th align="right">Value</th>
                      <th align="left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gristRows.map((r, idx) => (
                      <tr key={r.id}>
                        <td>
                          <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`grist-name-${r.id}`}>
                            Fermentable name
                          </label>
                          <input
                            id={`grist-name-${r.id}`}
                            value={r.name}
                            onChange={(e) => updateGristRow(r.id, { name: e.target.value })}
                            style={{ width: "100%", padding: 8 }}
                            autoComplete="off"
                          />
                        </td>
                        <td align="right">
                          <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`grist-kg-${r.id}`}>
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
                        </td>
                        <td align="right">
                          <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`grist-lov-${r.id}`}>
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
                        </td>
                        <td>
                          <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`grist-class-${r.id}`}>
                            Malt class
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
                        </td>
                        <td>
                          <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`grist-pot-kind-${r.id}`}>
                            Potential kind
                          </label>
                          <select
                            id={`grist-pot-kind-${r.id}`}
                            value={r.potential?.kind ?? ""}
                            onChange={(e) => {
                              const kind = e.target.value as GristPotentialKind | "";
                              if (!kind) return updateGristRow(r.id, { potential: null });
                              updateGristRow(r.id, { potential: { kind, value: r.potential?.value ?? 0 } });
                            }}
                            style={{ width: 160, padding: 8 }}
                          >
                            <option value="">(none)</option>
                            <option value="ppg">PPG</option>
                            <option value="yieldPercent">Yield %</option>
                            <option value="sg">SG (e.g. 1.037)</option>
                          </select>
                        </td>
                        <td align="right">
                          <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor={`grist-pot-val-${r.id}`}>
                            Potential value
                          </label>
                          <input
                            id={`grist-pot-val-${r.id}`}
                            type="number"
                            inputMode="decimal"
                            step={0.001}
                            value={r.potential?.value ?? ""}
                            onChange={(e) => {
                              const v = e.target.value === "" ? null : Number(e.target.value);
                              if (!r.potential) return;
                              if (v === null) return updateGristRow(r.id, { potential: null });
                              updateGristRow(r.id, { potential: { ...r.potential, value: v } });
                            }}
                            disabled={!r.potential}
                            style={{ width: 140, padding: 8 }}
                          />
                        </td>
                        <td>
                          <button type="button" onClick={() => removeGristRow(r.id)} aria-label={`Remove fermentable row ${idx + 1}`}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
                No fermentables yet.
              </p>
            )}
          </section>

          <section id="hops" className="panel" aria-labelledby="hops-heading">
            <h2 id="hops-heading" style={{ marginTop: 0 }}>
              Hops
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              v0 will use a seedable hops database for pickers (alpha/beta ranges, origin).
            </p>
          </section>

          <section id="yeast" className="panel" aria-labelledby="yeast-heading">
            <h2 id="yeast-heading" style={{ marginTop: 0 }}>
              Yeast
            </h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Yeast can start as a stub and be wired to a dataset later.
            </p>
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

