"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { RecipeImportForm } from "../../../_components/RecipeImportForm";

type AccountItem = { id: string; name: string };
type RecipeItem = { id: string; name: string };

export default function PlatformRecipesPage() {
  const t = useTranslations("platformRecipes");
  const auth = useRequireAuth();

  const isPlatformAdmin = auth.status === "ready" ? Boolean((auth.me.user as { isPlatformAdmin?: boolean })?.isPlatformAdmin) : false;

  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string>("");

  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [exportRecipeId, setExportRecipeId] = useState<string>("");

  const canLoad = useMemo(() => auth.status === "ready" && isPlatformAdmin, [auth.status, isPlatformAdmin]);

  useEffect(() => {
    if (!canLoad) return;
    let cancelled = false;
    (async () => {
      setAccountsError(null);
      setAccountsLoading(true);
      try {
        const res = await apiFetch("/api/platform/accounts");
        if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
        const list = (res.data as { accounts?: AccountItem[] })?.accounts;
        if (!cancelled) setAccounts(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!cancelled) setAccountsError(String(err));
      } finally {
        if (!cancelled) setAccountsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canLoad]);

  useEffect(() => {
    if (!canLoad || !accountId) {
      setRecipes([]);
      setExportRecipeId("");
      return;
    }
    let cancelled = false;
    (async () => {
      setRecipesLoading(true);
      try {
        const res = await apiFetch(`/api/platform/recipes/list?accountId=${encodeURIComponent(accountId)}`);
        if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
        const list = (res.data as { recipes?: RecipeItem[] })?.recipes;
        const items = Array.isArray(list) ? list : [];
        if (!cancelled) {
          setRecipes(items);
          setExportRecipeId((prev) => (items.some((r) => r.id === prev) ? prev : items[0]?.id ?? ""));
        }
      } catch {
        if (!cancelled) setRecipes([]);
      } finally {
        if (!cancelled) setRecipesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canLoad, accountId]);

  const hasRecipes = recipes.length > 0;
  const singleExportHref = accountId && exportRecipeId
    ? `/api/platform/recipes/${encodeURIComponent(exportRecipeId)}/export/beerjson?accountId=${encodeURIComponent(accountId)}`
    : undefined;
  const bulkExportHref = accountId && hasRecipes
    ? `/api/platform/recipes/export/beerjson?accountId=${encodeURIComponent(accountId)}`
    : undefined;

  if (auth.status === "loading") return <p className="brew-muted">{t("loading")}</p>;
  if (auth.status === "error") return <pre className="brew-error-box" role="alert">{auth.error}</pre>;

  if (!isPlatformAdmin) {
    return (
      <section className="brew-panel" style={{ maxWidth: 900 }}>
        <h1 style={{ marginTop: 0 }}>{t("title")}</h1>
        <p className="brew-muted" style={{ marginBottom: 0 }}>
          {t("notAuthorized")}
        </p>
      </section>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 900 }}>
      <section className="brew-panel">
        <h1 style={{ marginTop: 0 }}>{t("title")}</h1>
        <p className="brew-muted" style={{ marginTop: 0 }}>
          {t("subtitle")}
        </p>

        <div style={{ marginTop: 12 }}>
          <label className="brew-muted" style={{ display: "block", fontSize: 12 }} htmlFor="platform-account">
            {t("accountLabel")}
          </label>
          <select
            id="platform-account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={accountsLoading || accounts.length === 0}
            style={{ width: "100%", maxWidth: 400, padding: 8 }}
          >
            <option value="">{t("accountPlaceholder")}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id})
              </option>
            ))}
          </select>
          {accountsError ? (
            <p className="brew-muted" style={{ marginTop: 6 }}>{accountsError}</p>
          ) : null}
        </div>
      </section>

      {accountId ? (
        <>
          <section className="brew-panel" aria-labelledby="platform-export-heading">
            <h2 id="platform-export-heading" style={{ marginTop: 0 }}>
              {t("exportSectionTitle")}
            </h2>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ minWidth: 200 }}>
                <label className="brew-muted" style={{ display: "block", fontSize: 12 }} htmlFor="platform-export-recipe">
                  {t("exportSingleLabel")}
                </label>
                <select
                  id="platform-export-recipe"
                  value={exportRecipeId}
                  onChange={(e) => setExportRecipeId(e.target.value)}
                  disabled={recipesLoading || !hasRecipes}
                  style={{ width: "100%", padding: 8 }}
                >
                  {!hasRecipes ? <option value="">{t("exportNoneAvailable")}</option> : null}
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <a
                href={singleExportHref}
                aria-disabled={!singleExportHref}
                onClick={(e) => { if (!singleExportHref) e.preventDefault(); }}
              >
                {t("exportSingleCta")}
              </a>
              <a
                href={bulkExportHref}
                aria-disabled={!bulkExportHref}
                onClick={(e) => { if (!bulkExportHref) e.preventDefault(); }}
              >
                {t("exportBulkCta")}
              </a>
            </div>
            <p className="brew-muted" style={{ marginTop: 10, marginBottom: 0 }}>
              {t("exportFullNote")}
            </p>
          </section>

          <RecipeImportForm
            apiBasePath="/api/platform/recipes"
            accountId={accountId}
            canCall={canLoad}
            showImportExportPanel={false}
          />
        </>
      ) : (
        <p className="brew-muted">{t("accountRequired")}</p>
      )}
    </div>
  );
}
