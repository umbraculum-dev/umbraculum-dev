"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { H1, H2, SizableText, View, XStack, YStack } from "tamagui";

import {
  ApiClientError,
  listPlatformRecipes,
  listPlatformWorkspaces,
} from "@umbraculum/api-client";

import { BrewSelect } from "../../../_components/BrewSelect";
import { ErrorBox, RecipeEditFieldLabel } from "../../../_components/recipe-edit";
import { RecipeImportForm } from "../../../_components/RecipeImportForm";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { webPlatformApiClient } from "../../../_lib/webApiClient";

type WorkspaceItem = { id: string; name: string };
type RecipeItem = { id: string; name: string };

export default function PlatformRecipesPage() {
  const t = useTranslations("platformRecipes");
  const auth = useRequireAuth();

  const isPlatformAdmin = auth.status === "ready" ? Boolean((auth.me.user as { isPlatformAdmin?: boolean })?.isPlatformAdmin) : false;

  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const [workspacesError, setWorkspacesError] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string>("");

  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [exportRecipeId, setExportRecipeId] = useState<string>("");

  const canLoad = useMemo(() => auth.status === "ready" && isPlatformAdmin, [auth.status, isPlatformAdmin]);

  useEffect(() => {
    if (!canLoad) return;
    let cancelled = false;
    void (async () => {
      setWorkspacesError(null);
      setWorkspacesLoading(true);
      try {
        const data = await listPlatformWorkspaces(webPlatformApiClient());
        if (!cancelled) setWorkspaces(data.workspaces);
      } catch (err) {
        if (!cancelled) {
          setWorkspacesError(
            err instanceof ApiClientError
              ? typeof err.body === "string"
                ? err.body
                : JSON.stringify(err.body)
              : String(err),
          );
        }
      } finally {
        if (!cancelled) setWorkspacesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canLoad]);

  useEffect(() => {
    if (!canLoad || !workspaceId) {
      setRecipes([]);
      setExportRecipeId("");
      return;
    }
    let cancelled = false;
    void (async () => {
      setRecipesLoading(true);
      try {
        const data = await listPlatformRecipes(webPlatformApiClient(), workspaceId);
        const items = Array.isArray(data.recipes)
          ? (data.recipes as RecipeItem[])
          : [];
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
  }, [canLoad, workspaceId]);

  const hasRecipes = recipes.length > 0;
  const singleExportHref = workspaceId && exportRecipeId
    ? `/api/platform/recipes/${encodeURIComponent(exportRecipeId)}/export/beerjson?workspaceId=${encodeURIComponent(workspaceId)}`
    : undefined;
  const bulkExportHref = workspaceId && hasRecipes
    ? `/api/platform/recipes/export/beerjson?workspaceId=${encodeURIComponent(workspaceId)}`
    : undefined;

  if (auth.status === "loading") return <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("loading")}</SizableText>;
  if (auth.status === "error") return <ErrorBox>{auth.error}</ErrorBox>;

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
          <RecipeEditFieldLabel htmlFor="platform-workspace">
            {t("workspaceLabel")}
          </RecipeEditFieldLabel>
          <BrewSelect
            id="platform-workspace"
            value={workspaceId}
            onValueChange={setWorkspaceId}
            options={[
              { value: "", label: t("workspacePlaceholder") },
              ...workspaces.map((w) => ({ value: w.id, label: `${w.name} (${w.id})` })),
            ]}
            disabled={workspacesLoading || workspaces.length === 0}
            width="full"
          />
          {workspacesError ? (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
              {workspacesError}
            </SizableText>
          ) : null}
        </View>
      </View>

      {workspaceId ? (
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
                <BrewSelect
                  id="platform-export-recipe"
                  value={exportRecipeId}
                  onValueChange={setExportRecipeId}
                  options={
                    !hasRecipes
                      ? [{ value: "", label: t("exportNoneAvailable") }]
                      : recipes.map((r) => ({ value: r.id, label: r.name }))
                  }
                  disabled={recipesLoading || !hasRecipes}
                  width="full"
                />
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
            workspaceId={workspaceId}
            canCall={canLoad}
            showImportExportPanel={false}
          />
        </>
      ) : (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("workspaceRequired")}
        </SizableText>
      )}
    </YStack>
  );
}
