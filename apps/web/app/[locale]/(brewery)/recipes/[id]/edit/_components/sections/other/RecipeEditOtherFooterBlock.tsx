import {Link} from "../../../../../../../../../src/i18n/navigation";
import {Button, SizableText, XStack} from "tamagui";

import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";

export function RecipeEditOtherFooterBlock({model}: {model: RecipeEditPageModel}) {
  const {t, saving, canCallAccountScoped, onSave} = model;

  return (
    <>
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
          {saving ? "Saving…" : "Save (including other ingredients)"}
        </Button>
      </XStack>

      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
        {t("rawMaterialsCtaPrefix")}{" "}
        <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
      </SizableText>
    </>
  );
}
