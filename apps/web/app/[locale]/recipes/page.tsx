"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Accordion, Button, H1, Input, SizableText, View, XStack, YStack } from "tamagui";

import { Link } from "../../../src/i18n/navigation";
import { BrewSelect } from "../../_components/BrewSelect";
import { ErrorBox, RecipeEditFieldLabel } from "../../_components/recipe-edit";
import { BrewAccordionSection } from "../../_components/BrewAccordionSection";
import { apiFetch } from "../../_lib/apiClient";
import { useRequireAuth } from "../../_lib/useRequireAuth";

type RecipeListItem = {
  id: string;
  accountId: string;
  name: string;
  style: string | null;
  version?: number;
};
type StyleListItem = { key: string; name: string; code: string; sortOrder: number };

export default function RecipesPage() {
  const t = useTranslations("recipes");
  const tImport = useTranslations("recipes.import");

  const authState = useRequireAuth({ requireActiveWorkspace: true });

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

  const [openSections, setOpenSections] = useState<string[]>([]);

  const canCall = authState.status === "ready";
  const activeWorkspaceId = authState.status === "ready" ? authState.me.activeWorkspaceId : null;

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
    <YStack gap="$3">
      <H1 mb="$2">{t("title")}</H1>

      <YStack gap="$0">
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <BrewAccordionSection
            value="create"
            headingId="recipes-create-heading"
            title={t("createTitle")}
            open={openSections.includes("create")}
          >
            <form onSubmit={onCreate}>
              <XStack gap="$3" flexWrap="wrap" ai="flex-end">
                <View flex={1} minWidth={200}>
                  <YStack gap="$1.5">
                    <RecipeEditFieldLabel htmlFor="recipe-name">{t("nameLabel")}</RecipeEditFieldLabel>
                    <Input
                      id="recipe-name"
                      value={newName}
                      onChangeText={setNewName}
                      required
                      size="$3"
                      w="100%"
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                    />
                  </YStack>
                </View>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="recipe-style">{t("styleLabel")}</RecipeEditFieldLabel>
                  <BrewSelect
                    id="recipe-style"
                    value={newStyleKey}
                    onValueChange={setNewStyleKey}
                    options={[
                      { value: "", label: stylesLoading ? t("stylesLoading") : t("stylePlaceholder") },
                      ...styles.map((s) => ({
                        value: s.key,
                        label: s.key === "custom" ? s.name : `${s.code} — ${s.name}`,
                      })),
                    ]}
                    disabled={!canCall || stylesLoading || styles.length === 0}
                    width="full"
                  />
                  {stylesError ? (
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
                      {String(stylesError)}
                    </SizableText>
                  ) : null}
                </YStack>
              </XStack>
              <XStack gap="$3" mt="$3" alignItems="center">
                <Button
                  as="button"
                  type="submit"
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  disabled={!canCall || creating || !newName.trim() || !newStyleKey.trim()}
                >
                  {creating ? t("creating") : t("createButton")}
                </Button>
                <Button
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  onPress={() => void refresh()}
                  disabled={!canCall || loading}
                >
                  {loading ? t("refreshing") : t("refresh")}
                </Button>
              </XStack>
            </form>
            {error ? <ErrorBox mt="$3">{error}</ErrorBox> : null}
          </BrewAccordionSection>

          <BrewAccordionSection
            value="import"
            headingId="recipes-import-heading"
            title={tImport("title")}
            open={openSections.includes("import")}
            spaced
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {tImport("subtitle")}
            </SizableText>
            <SizableText size="$2" fontFamily="$body" mb={0}>
              <Link href="/recipes/import">{tImport("cta")}</Link>
            </SizableText>
          </BrewAccordionSection>

          <BrewAccordionSection
            value="list"
            headingId="recipes-list-heading"
            title={t("listTitle")}
            open={openSections.includes("list")}
            spaced
          >
            {!loading && !hasRecipes ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                {t("noRecipes")}
              </SizableText>
            ) : null}
            {hasRecipes ? (
              <ul className="brew-recipe-list">
                {pageRecipes.map((r) => (
                  <li key={r.id} className="brew-recipe-list-row">
                    <YStack gap="$1.5">
                      <XStack justifyContent="space-between" alignItems="flex-start" columnGap="$3" rowGap="$0.5">
                        <SizableText flex={1} fontFamily="$body">
                          <SizableText fontWeight="bold">{r.name}</SizableText>
                          {r.style ? <SizableText color="var(--text-muted)"> ({r.style})</SizableText> : null}
                          {typeof r.version === "number" ? (
                            <SizableText color="var(--text-muted)">
                              {" "}
                              · {t("versionShort")}{" "}
                              <SizableText color="var(--text-muted)" fontWeight="bold" as="span">
                                {String(r.version).padStart(2, "0")}
                              </SizableText>
                            </SizableText>
                          ) : null}
                        </SizableText>
                        <Button
                          size="$3"
                          chromeless
                          color="var(--danger)"
                          onPress={() => onAskDelete(r.id)}
                          disabled={!canCall || deletingId === r.id}
                          className="brew-recipe-list-delete-button"
                        >
                          {t("delete.cta")}
                        </Button>
                      </XStack>
                      <XStack gap="$3" flexWrap="wrap">
                        <Link href={`/recipes/${r.id}/edit`}>{t("openEditor")}</Link>
                        <Link href={`/recipes/${r.id}/water`}>{t("openWater")}</Link>
                        <Link href={`/recipes/${r.id}/versions`}>{t("openVersions")}</Link>
                      </XStack>
                      {deleteConfirmId === r.id ? (
                        <View className="brew-error-box" role="alert" mt="$1.5">
                          <SizableText size="$2" fontFamily="$body" mt={0} mb="$2">
                            <SizableText fontWeight="bold">{t("delete.confirmTitle")}</SizableText>
                            <SizableText color="var(--text-muted)"> {t("delete.confirmBody")}</SizableText>
                          </SizableText>
                          <XStack gap="$3" flexWrap="wrap" alignItems="center">
                            <Button
                              size="$3"
                              bg="var(--surface-2)"
                              borderWidth={1}
                              borderColor="var(--border)"
                              color="var(--text)"
                              onPress={() => void onDelete(r.id)}
                              disabled={!canCall || deletingId === r.id}
                            >
                              {deletingId === r.id ? t("delete.deleting") : t("delete.confirmCta")}
                            </Button>
                            <Button
                              size="$3"
                              bg="var(--surface-2)"
                              borderWidth={1}
                              borderColor="var(--border)"
                              color="var(--text)"
                              onPress={() => setDeleteConfirmId(null)}
                              disabled={deletingId === r.id}
                            >
                              {t("delete.cancel")}
                            </Button>
                          </XStack>
                        </View>
                      ) : null}
                    </YStack>
                  </li>
                ))}
              </ul>
            ) : null}

            {hasRecipes && pageCount > 1 ? (
              <nav aria-label={t("pagination.ariaLabel")}>
                <XStack gap="$3" mt="$3" alignItems="center">
                  <Button
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    {t("pagination.prev")}
                  </Button>
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite">
                    {t("pagination.status", { page, pages: pageCount })}
                  </SizableText>
                  <Button
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    onPress={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={page >= pageCount}
                  >
                    {t("pagination.next")}
                  </Button>
                </XStack>
              </nav>
            ) : null}
          </BrewAccordionSection>

          <BrewAccordionSection
            value="export"
            headingId="recipes-export-heading"
            title={t("export.title")}
            open={openSections.includes("export")}
            spaced
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("export.subtitle")}
            </SizableText>

            <XStack gap="$3" flexWrap="wrap" ai="flex-end">
              <View flex={1} minWidth={180}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="export-recipe">{t("export.selectLabel")}</RecipeEditFieldLabel>
                  <BrewSelect
                    id="export-recipe"
                    value={exportRecipeId}
                    onValueChange={setExportRecipeId}
                    options={
                      hasRecipes
                        ? recipes.map((r) => ({ value: r.id, label: r.name }))
                        : [{ value: "", label: t("export.noneAvailable") }]
                    }
                    disabled={!hasRecipes}
                    width="full"
                  />
                </YStack>
              </View>
              <a
                href={exportRecipeId ? `/api/recipes/${exportRecipeId}/export/beerjson` : undefined}
                aria-disabled={!exportRecipeId}
                onClick={(e) => {
                  if (!exportRecipeId) e.preventDefault();
                }}
                className="brew-link-contents"
              >
                {t("export.exportSelectedCta")}
              </a>
              <a
                href={hasRecipes ? "/api/recipes/export/beerjson" : undefined}
                aria-disabled={!hasRecipes}
                onClick={(e) => {
                  if (!hasRecipes) e.preventDefault();
                }}
                className="brew-link-contents"
              >
                {t("export.exportAllCta")}
              </a>
            </XStack>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2.5" mb={0}>
              {t("export.strictNote")}
            </SizableText>
          </BrewAccordionSection>
        </Accordion>
      </YStack>
    </YStack>
  );
}

