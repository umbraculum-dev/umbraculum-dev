import {RecipeEditSection} from "../../../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";
import {RecipeEditOtherFooterBlock} from "./other/RecipeEditOtherFooterBlock";
import {RecipeEditOtherHeaderBlock} from "./other/RecipeEditOtherHeaderBlock";
import {RecipeEditOtherList} from "./other/RecipeEditOtherList";

export function RecipeEditOtherSection({ model }: { model: RecipeEditPageModel }) {
  const { t, openSections, setSectionOpen } = model;

  return (
    <RecipeEditSection
      spaced
      id="other"
      headingId="other-heading"
      label={t("sections.other")}
      open={openSections['other']}
      onOpenChange={(open) => setSectionOpen("other", open)}
    >
      <RecipeEditOtherHeaderBlock model={model} />
      <RecipeEditOtherList model={model} />
      <RecipeEditOtherFooterBlock model={model} />
    </RecipeEditSection>
  );
}
