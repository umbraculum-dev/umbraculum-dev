import { BrewSelect } from "../../../../../_components/BrewSelect";
import { RecipeEditFieldLabel } from "../../../../../_components/recipe-edit";
import { BrewAccordionSection } from "../../../../../_components/BrewAccordionSection";
import { SizableText, View, XStack, YStack } from "tamagui";

import type { useRecipesPage } from "../../_hooks/useRecipesPage";

type RecipesPageModel = ReturnType<typeof useRecipesPage>;

export function RecipesExportSection({ model }: { model: RecipesPageModel }) {
  const { t, openSections, hasRecipes, recipes, exportRecipeId, setExportRecipeId } = model;

  return (
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
  );
}
