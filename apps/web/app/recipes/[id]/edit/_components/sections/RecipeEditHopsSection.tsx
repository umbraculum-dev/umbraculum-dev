import {SizableText} from "tamagui";

import {RecipeEditSection} from "../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";
import {RecipeEditHopsRows} from "./RecipeEditHopsRows";
import {RecipeEditHopsSearch} from "./RecipeEditHopsSearch";

export function RecipeEditHopsSection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    openSections,
    setSectionOpen,
  } = model;

  return (
          <RecipeEditSection
            spaced
            id="hops"
            headingId="hops-heading"
            label={t("sections.hops")}
            open={openSections['hops']}
            onOpenChange={(open) => setSectionOpen("hops", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {t("hopsHelp")}
            </SizableText>

            <RecipeEditHopsSearch model={model} />

            <RecipeEditHopsRows model={model} />
          </RecipeEditSection>
  );
}
