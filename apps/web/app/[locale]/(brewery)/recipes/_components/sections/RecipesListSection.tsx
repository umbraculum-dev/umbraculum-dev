import { Link } from "../../../../../../src/i18n/navigation";
import { BrewAccordionSection } from "../../../../../_components/BrewAccordionSection";
import { Button, SizableText, View, XStack, YStack } from "tamagui";

import type { useRecipesPage } from "../../_hooks/useRecipesPage";

type RecipesPageModel = ReturnType<typeof useRecipesPage>;

export function RecipesListSection({ model }: { model: RecipesPageModel }) {
  const {
    t,
    openSections,
    loading,
    canCall,
    hasRecipes,
    pageRecipes,
    page,
    setPage,
    pageCount,
    deleteConfirmId,
    setDeleteConfirmId,
    deletingId,
    onAskDelete,
    onDelete,
  } = model;

  return (
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
  );
}
