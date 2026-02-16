"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Link } from "../../../src/i18n/navigation";
import { apiFetch } from "../../_lib/apiClient";
import { useRequireAuth } from "../../_lib/useRequireAuth";

type RecipeListItem = { id: string; accountId: string; name: string; style: string | null };
type StyleListItem = { key: string; name: string; code: string; sortOrder: number };

export default function RecipesPage() {
  const t = useTranslations("recipes");
  const c = useTranslations("common");

  const authState = useRequireAuth({ requireActiveAccount: true });

  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newStyleKey, setNewStyleKey] = useState("");
  const [creating, setCreating] = useState(false);

  const canCall = authState.status === "ready";
  const activeAccountId = authState.status === "ready" ? authState.me.activeAccountId : null;

  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [stylesError, setStylesError] = useState<string | null>(null);

  const loadStyles = async () => {
    if (!canCall) return;
    setStylesError(null);
    setStylesLoading(true);
    try {
      const res = await apiFetch("/api/styles");
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const items = (res.data as any)?.styles;
      setStyles(Array.isArray(items) ? (items as StyleListItem[]) : []);
    } catch (err) {
      setStyles([]);
      setStylesError(String(err));
    } finally {
      setStylesLoading(false);
    }
  };

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/api/recipes");
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const items = (res.data as any)?.recipes;
      setRecipes(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(String(err));
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStyles();
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCall) return;
    const name = newName.trim();
    const styleKey = newStyleKey.trim();
    if (!name || !styleKey) return;
    setCreating(true);
    setError(null);
    try {
      const res = await apiFetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, styleKey }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      setNewName("");
      setNewStyleKey("");
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setCreating(false);
    }
  };

  const hasRecipes = useMemo(() => recipes.length > 0, [recipes.length]);

  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>

      <section className="panel" aria-labelledby="recipes-create-heading">
        <h2 id="recipes-create-heading" style={{ marginTop: 0 }}>
          {t("createTitle")}
        </h2>
        <form onSubmit={onCreate}>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor="recipe-name">
                {t("nameLabel")}
              </label>
              <input
                id="recipe-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ width: "100%", padding: 8 }}
                required
              />
            </div>
            <div>
              <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor="recipe-style">
                {t("styleLabel")}
              </label>
              <select
                id="recipe-style"
                value={newStyleKey}
                onChange={(e) => setNewStyleKey(e.target.value)}
                style={{ width: "100%", padding: 8 }}
                disabled={!canCall || stylesLoading || styles.length === 0}
                required
              >
                <option value="">{stylesLoading ? t("stylesLoading") : t("stylePlaceholder")}</option>
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
            <button type="submit" disabled={!canCall || creating || !newName.trim() || !newStyleKey.trim()}>
              {creating ? t("creating") : t("createButton")}
            </button>
            <button type="button" onClick={() => void refresh()} disabled={!canCall || loading}>
              {loading ? t("refreshing") : t("refresh")}
            </button>
          </div>
        </form>
        {error ? (
          <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
            {error}
          </pre>
        ) : null}
      </section>

      <section className="panel" aria-labelledby="recipes-list-heading">
        <h2 id="recipes-list-heading" style={{ marginTop: 0 }}>
          {t("listTitle")}
        </h2>
        {!loading && !hasRecipes ? <p className="muted">{t("noRecipes")}</p> : null}
        {hasRecipes ? (
          <ul style={{ marginBottom: 0 }}>
            {recipes.map((r) => (
              <li key={r.id} style={{ display: "grid", gap: 6, padding: "8px 0" }}>
                <div>
                  <strong>{r.name}</strong> {r.style ? <span className="muted">({r.style})</span> : null}
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href={`/recipes/${r.id}/edit`}>{t("openEditor")}</Link>
                  <Link href={`/recipes/${r.id}/water`}>{t("openWater")}</Link>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <ul>
        <li>
          <Link href="/">{c("backToDashboard")}</Link>
        </li>
      </ul>
    </>
  );
}

