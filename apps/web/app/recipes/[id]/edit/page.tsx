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
  createdAt: string;
  updatedAt: string;
};

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
              v0 will use a seedable fermentables database for pickers (malt/extract/sugar).
            </p>
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

