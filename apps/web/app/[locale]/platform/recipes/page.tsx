"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { H1, H2, SizableText, View, XStack, YStack } from "tamagui";

import { apiFetch } from "../../../_lib/apiClient";
import { RecipeEditFieldLabel } from "../../../_components/recipe-edit";
import { RecipeImportForm } from "../../../_components/RecipeImportForm";
import { useRequireAuth } from "../../../_lib/useRequireAuth";

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
      <YStack maxWidth={900}>
        <View className="brew-panel">
          <H1 mt={0}>{t("title")}</H1>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
            {t("notAuthorized")}
          </SizableText>
        </View>
      </YStack>
    );
  }

  return (
    <YStack gap="$4" maxWidth={900}>
      <View className="brew-panel">
        <H1 mt={0}>{t("title")}</H1>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
          {t("subtitle")}
        </SizableText>

        <View mt="$3">
          <RecipeEditFieldLabel htmlFor="platform-account">
            {t("accountLabel")}
          </RecipeEditFieldLabel>
          <select
            id="platform-account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={accountsLoading || accounts.length === 0}
            className="brew-recipe-edit-select brew-recipe-edit-select-full brew-select-max400"
          >
            <option value="">{t("accountPlaceholder")}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.id})
              </option>
            ))}
          </select>
          {accountsError ? (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
              {accountsError}
            </SizableText>
          ) : null}
        </View>
      </View>

      {accountId ? (
        <>
          <View className="brew-panel" aria-labelledby="platform-export-heading">
            <H2 id="platform-export-heading" mt={0}>
              {t("exportSectionTitle")}
            </H2>
            <XStack gap="$3" alignItems="center" flexWrap="wrap">
              <View minWidth={200}>
                <RecipeEditFieldLabel htmlFor="platform-export-recipe">
                  {t("exportSingleLabel")}
                </RecipeEditFieldLabel>
                <select
                  id="platform-export-recipe"
                  value={exportRecipeId}
                  onChange={(e) => setExportRecipeId(e.target.value)}
                  disabled={recipesLoading || !hasRecipes}
                  className="brew-recipe-edit-select brew-recipe-edit-select-full"
                >
                  {!hasRecipes ? <option value="">{t("exportNoneAvailable")}</option> : null}
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </View>
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
            </XStack>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2.5" mb={0}>
              {t("exportFullNote")}
            </SizableText>
          </View>

          <RecipeImportForm
            apiBasePath="/api/platform/recipes"
            accountId={accountId}
            canCall={canLoad}
            showImportExportPanel={false}
          />
        </>
      ) : (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("accountRequired")}
        </SizableText>
      )}
    </YStack>
  );
}
