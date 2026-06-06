import {Link} from "../../../../../../../../src/i18n/navigation";
import {SizableText, View} from "tamagui";

import {formatFixed} from "../../../../../../../../src/i18n/format";
import {RecipeEditSection} from "../../../../../../../_components/recipe-edit";
import {YeastEditor} from "../../../../_components/YeastEditor";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditYeastSection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    tAnalysis,
    tUnits,
    locale,
    recipeId,
    openSections,
    setSectionOpen,
    yeastRows,
    yeastAttenuationOverrides
  } = model;

  return (
          <RecipeEditSection
            spaced
            id="yeast"
            headingId="yeast-heading"
            label={t("sections.yeast")}
            open={openSections['yeast']}
            onOpenChange={(open) => setSectionOpen("yeast", open)}
          >
            <View mt="$3">
              <YeastEditor
                yeastRows={yeastRows}
                yeastAttenuationOverrides={yeastAttenuationOverrides}
                readOnly
                recipeId={recipeId}
                t={t}
                tAnalysis={tAnalysis}
                tUnits={tUnits}
                locale={locale}
                formatFixed={formatFixed}
              />
            </View>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
              {t("rawMaterialsCtaPrefix")}{" "}
              <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
            </SizableText>
          </RecipeEditSection>
  );
}
