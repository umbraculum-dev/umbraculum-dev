import {Link} from "../../../../../../src/i18n/navigation";
import {Button, SizableText, View, XStack, YStack} from "tamagui";

import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";
import {RecipeEditHopsRowCard} from "./RecipeEditHopsRowCard";

export function RecipeEditHopsRows({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    saving,
    hopsRows,
    canCallAccountScoped,
    onSave,
    addHopRow,
  } = model;

  return (
    <>
      <XStack gap="$3" items="center" mt="$3">
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
          onPress={() => addHopRow()}
          disabled={!canCallAccountScoped}
        >
          Add hop
        </Button>
      </XStack>

      {hopsRows.length ? (
        <View overflowX="auto" mt="$3">
          <YStack gap="$3">
            {hopsRows.map((r, idx) => (
              <RecipeEditHopsRowCard key={r.id} model={model} row={r} idx={idx} />
            ))}
          </YStack>
        </View>
      ) : (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
          No hops yet.
        </SizableText>
      )}

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
          {saving ? "Saving…" : "Save (including hops)"}
        </Button>
      </XStack>

      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
        {t("rawMaterialsCtaPrefix")}{" "}
        <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
      </SizableText>
    </>
  );
}
