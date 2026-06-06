import {Link} from "../../../../../../../../src/i18n/navigation";
import {Button, SizableText, View, XStack} from "tamagui";

import {RecipeEditSection} from "../../../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";
import {RecipeEditFermentablesList} from "./fermentables/RecipeEditFermentablesList";
import {RecipeEditFermentablesToolbar} from "./fermentables/RecipeEditFermentablesToolbar";

export function RecipeEditFermentablesSection({model}: {model: RecipeEditPageModel}) {
  const {
    t,
    tUnits,
    openSections,
    setSectionOpen,
    saving,
    canCallAccountScoped,
    onSave,
    gristTotals,
  } = model;

  return (
    <RecipeEditSection
      spaced
      id="fermentables"
      headingId="fermentables-heading"
      label={t("sections.fermentables")}
      open={openSections.fermentables}
      onOpenChange={(open) => setSectionOpen("fermentables", open)}
    >
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        Enter your grist here. Water calculator can import a read-only snapshot.
      </SizableText>

      <RecipeEditFermentablesToolbar model={model} />

      <View borderTopWidth={1} borderColor="var(--border)" my="$3" />

      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite">
        {t("gristTotalKg", { value: gristTotals.totalKg.toFixed(3), unit: tUnits("kg") })}
        {gristTotals.weightedAvgLovibond !== null ? (
          <> · {t("gristAvgColor", { value: gristTotals.weightedAvgLovibond.toFixed(1), unit: tUnits("lovibond") })}</>
        ) : null}
      </SizableText>

      <RecipeEditFermentablesList model={model} />

      <XStack mt="$3" justify="flex-end">
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
          onPress={() => { void onSave(); }}
          disabled={!canCallAccountScoped || saving}
        >
          {saving ? "Saving…" : "Save (including grist)"}
        </Button>
      </XStack>

      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
        {t("rawMaterialsCtaPrefix")}{" "}
        <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
      </SizableText>
    </RecipeEditSection>
  );
}
