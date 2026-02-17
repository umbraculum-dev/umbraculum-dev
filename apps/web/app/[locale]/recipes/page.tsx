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
  const tImport = useTranslations("recipes.import");

  const authState = useRequireAuth({ requireActiveAccount: true });

  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [exportRecipeId, setExportRecipeId] = useState("");

  const pageSize = 20;
  const [page, setPage] = useState(1);

  const [newName, setNewName] = useState("");
  const [newStyleKey, setNewStyleKey] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      setDeleteConfirmId(null);
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

  useEffect(() => {
    if (exportRecipeId) return;
    if (recipes.length === 0) return;
    setExportRecipeId(recipes[0]?.id ?? "");
  }, [exportRecipeId, recipes]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(recipes.length / pageSize)), [pageSize, recipes.length]);

  useEffect(() => {
    if (page < 1) return setPage(1);
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

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

  const onAskDelete = (id: string) => {
    setError(null);
    setDeleteConfirmId((cur) => (cur === id ? null : id));
  };

  const onDelete = async (id: string) => {
    if (!canCall) return;
    setError(null);
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      await refresh();
      if (exportRecipeId === id) setExportRecipeId("");
    } catch (err) {
      setError(String(err));
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const hasRecipes = useMemo(() => recipes.length > 0, [recipes.length]);
  const pageRecipes = useMemo(() => recipes.slice((page - 1) * pageSize, page * pageSize), [page, pageSize, recipes]);

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

      <section className="panel" aria-labelledby="recipes-import-heading" style={{ marginTop: 16 }}>
        <h2 id="recipes-import-heading" style={{ marginTop: 0 }}>
          {tImport("title")}
        </h2>
        <p className="muted" style={{ marginTop: 0 }}>
          {tImport("subtitle")}
        </p>
        <p style={{ marginBottom: 0 }}>
          <Link href="/recipes/import">{tImport("cta")}</Link>
        </p>
      </section>

      <section className="panel" aria-labelledby="recipes-list-heading" style={{ marginTop: 16 }}>
        <h2 id="recipes-list-heading" style={{ marginTop: 0 }}>
          {t("listTitle")}
        </h2>
        {!loading && !hasRecipes ? <p className="muted">{t("noRecipes")}</p> : null}
        {hasRecipes ? (
          <ul className="recipeList" style={{ marginBottom: 0 }}>
            {pageRecipes.map((r) => (
              <li key={r.id} className="recipeListRow" style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", columnGap: 12, rowGap: 2, alignItems: "start" }}>
                  <div>
                    <strong>{r.name}</strong> {r.style ? <span className="muted">({r.style})</span> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onAskDelete(r.id)}
                    disabled={!canCall || deletingId === r.id}
                    className="recipeListDeleteButton"
                    style={{ alignSelf: "start", justifySelf: "end" }}
                  >
                    {t("delete.cta")}
                  </button>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", gridColumn: "1 / 2" }}>
                    <Link href={`/recipes/${r.id}/edit`}>{t("openEditor")}</Link>
                    <Link href={`/recipes/${r.id}/water`}>{t("openWater")}</Link>
                  </div>
                </div>
                {deleteConfirmId === r.id ? (
                  <div className="errorBox" role="alert" style={{ marginTop: 6 }}>
                    <p style={{ marginTop: 0, marginBottom: 8 }}>
                      <strong>{t("delete.confirmTitle")}</strong>{" "}
                      <span className="muted">{t("delete.confirmBody")}</span>
                    </p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <button type="button" onClick={() => void onDelete(r.id)} disabled={!canCall || deletingId === r.id}>
                        {deletingId === r.id ? t("delete.deleting") : t("delete.confirmCta")}
                      </button>
                      <button type="button" onClick={() => setDeleteConfirmId(null)} disabled={deletingId === r.id}>
                        {t("delete.cancel")}
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {hasRecipes && pageCount > 1 ? (
          <nav aria-label={t("pagination.ariaLabel")} style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              {t("pagination.prev")}
            </button>
            <span className="muted" aria-live="polite">
              {t("pagination.status", { page, pages: pageCount })}
            </span>
            <button type="button" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>
              {t("pagination.next")}
            </button>
          </nav>
        ) : null}
      </section>

      <section className="panel" aria-labelledby="recipes-export-heading" style={{ marginTop: 16 }}>
        <h2 id="recipes-export-heading" style={{ marginTop: 0 }}>
          {t("export.title")}
        </h2>
        <p className="muted" style={{ marginTop: 0 }}>
          {t("export.subtitle")}
        </p>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr auto auto", alignItems: "end" }}>
          <div>
            <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor="export-recipe">
              {t("export.selectLabel")}
            </label>
            <select
              id="export-recipe"
              value={exportRecipeId}
              onChange={(e) => setExportRecipeId(e.target.value)}
              disabled={!hasRecipes}
              style={{ width: "100%", padding: 8 }}
            >
              {hasRecipes ? null : <option value="">{t("export.noneAvailable")}</option>}
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <a
            href={exportRecipeId ? `/api/recipes/${exportRecipeId}/export/beerjson` : undefined}
            aria-disabled={!exportRecipeId}
            onClick={(e) => {
              if (!exportRecipeId) e.preventDefault();
            }}
          >
            {t("export.exportSelectedCta")}
          </a>
          <a
            href={hasRecipes ? "/api/recipes/export/beerjson" : undefined}
            aria-disabled={!hasRecipes}
            onClick={(e) => {
              if (!hasRecipes) e.preventDefault();
            }}
          >
            {t("export.exportAllCta")}
          </a>
        </div>
        <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
          {t("export.strictNote")}
        </p>
      </section>
    </>
  );
}

