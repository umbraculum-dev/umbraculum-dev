"use client";

import { Button, SizableText, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../_components/BrewSelect";
import {
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditSummary,
} from "../../../_components/recipe-edit";
import { type EditorYeastRow } from "../../_lib/beerjsonRecipe";
import { type YeastEditorRowContext } from "./yeastEditorTypes";
import { YeastEditorRowAttenuation } from "./YeastEditorRowAttenuation";
import { YeastEditorRowIdentity } from "./YeastEditorRowIdentity";
import { YeastEditorRowManualCount } from "./YeastEditorRowManualCount";
import { YeastEditorRowPitch } from "./YeastEditorRowPitch";

export function YeastEditorRow(props: { row: EditorYeastRow; idx: number; ctx: YeastEditorRowContext }) {
  const { row: r, idx, ctx } = props;
  const { onRemoveRow, onUpdateRow, t } = ctx;

  return (
    <RecipeEditIngredientCard>
      <XStack gap="$3" flexWrap="wrap" items="flex-end" flexDirection="row">
        <View alignSelf="center">
          <SizableText size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)">
            {idx + 1}
          </SizableText>
        </View>
        <YeastEditorRowIdentity row={r} ctx={ctx} variant="primary" />
        <YeastEditorRowAttenuation row={r} ctx={ctx} />
        <YeastEditorRowPitch row={r} ctx={ctx} variant="amount" />
        <YStack gap="$1" minW={100}>
          <RecipeEditFieldLabel htmlFor={`yeast-oxygenation-${r.id}`}>
            {t("yeastOxygenationLabel")}
          </RecipeEditFieldLabel>
          <BrewSelect
            id={`yeast-oxygenation-${r.id}`}
            value={r.oxygenation === "yes" || r.oxygenation === "no" ? r.oxygenation : ""}
            onValueChange={(v) =>
              onUpdateRow(r.id, {
                oxygenation: v === "yes" || v === "no" ? v : null,
              })
            }
            options={[
              { value: "yes", label: t("yeastOxygenationYes") },
              { value: "no", label: t("yeastOxygenationNo") },
            ]}
            placeholder="—"
          />
        </YStack>
        <Button
          size="$2"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
          onPress={() => onRemoveRow(r.id)}
          aria-label={`Remove yeast row ${idx + 1}`}
        >
          {t("yeastRemove")}
        </Button>
      </XStack>

      <View flexBasis="100%" w="100%" mt="$2">
        <details>
          <RecipeEditSummary>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {t("yeastAdvancedSubsectionHeading")}
            </SizableText>
          </RecipeEditSummary>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb="$1">
            {t("yeastPitchRateAmountNote")}
          </SizableText>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2">
            {t("yeastEstimatedCellsRecalcNote")}
          </SizableText>
          <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
            <YeastEditorRowPitch row={r} ctx={ctx} variant="advanced" />
            <YeastEditorRowManualCount row={r} idx={idx} ctx={ctx} />
          </XStack>
          <XStack gap="$3" flexWrap="wrap" items="flex-end" mt="$2">
            <YeastEditorRowIdentity row={r} ctx={ctx} variant="advanced" />
          </XStack>
        </details>
      </View>
    </RecipeEditIngredientCard>
  );
}
