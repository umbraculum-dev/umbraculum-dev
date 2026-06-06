import {Link} from "../../../../../../../../src/i18n/navigation";
import {SizableText, XStack} from "tamagui";

import {RecipeEditSection} from "../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditWaterSection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    tNav,
    tWater,
    recipeId,
    openSections,
    setSectionOpen
  } = model;

  return (
          <RecipeEditSection
            spaced
            id="water"
            headingId="water-heading"
            label={t("sections.water")}
            open={openSections['water']}
            onOpenChange={(open) => setSectionOpen("water", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("waterHelp")}
            </SizableText>
            <XStack gap="$2" flexWrap="wrap" ai="center" mt="$2">
              <SizableText size="$2" fontFamily="$body" as="span">
                <Link href={`/recipes/${recipeId}/water`}>{t("nav.openWaterCalculator")}</Link>
              </SizableText>
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                ·
              </SizableText>
              <SizableText size="$2" fontFamily="$body" as="span">
                <Link href={`/recipes/${recipeId}/water/mash`}>{tWater("mashWater")}</Link>
              </SizableText>
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
                ·
              </SizableText>
              <SizableText size="$2" fontFamily="$body" as="span">
                <Link href={`/recipes/${recipeId}/water/sparge`}>{tWater("spargeWater")}</Link>
              </SizableText>
            </XStack>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
              {t("waterProfilesManageText")} <Link href="/water-profiles">{tNav("waterProfiles")}</Link>.
            </SizableText>
          </RecipeEditSection>
  );
}
