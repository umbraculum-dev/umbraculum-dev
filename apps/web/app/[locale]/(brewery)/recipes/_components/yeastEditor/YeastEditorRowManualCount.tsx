"use client";

import { useTranslations } from "next-intl";
import { Button, SizableText, View, XStack, YStack } from "tamagui";

import { MathHelpPopover } from "../../../_components/MathHelpPopover";
import {
  RecipeEditFieldLabel,
  RecipeEditReadOnlyValue,
  WarningBox,
} from "../../../_components/recipe-edit";
import { mathExplain } from "../../[id]/edit/_lib/mathExplain";
import { YeastEditorRowManualCountFields } from "./rowManualCount/YeastEditorRowManualCountFields";
import {
  computeLiveCellsPerGram,
  isManualCountCompleteForSave,
} from "./rowManualCount/yeastEditorRowManualCountHelpers";
import type { YeastEditorRowManualCountProps } from "./rowManualCount/yeastEditorRowManualCountTypes";

export type { YeastEditorRowManualCountProps } from "./rowManualCount/yeastEditorRowManualCountTypes";

export function YeastEditorRowManualCount(props: YeastEditorRowManualCountProps) {
  const { row: r, idx, ctx } = props;
  const {
    surfaceMath,
    onSave,
    saving,
    canCallAccountScoped,
    t,
    locale,
    lowViabilityWarning,
    firstManualCountRowIdx,
  } = ctx;
  const tMath = useTranslations("math");

  if (r.format !== "slurry") {
    return null;
  }

  const manualCellCount = r.manualCellCount;
  const manualCountReady = isManualCountCompleteForSave(manualCellCount);

  return (
    <YStack gap="$2" flexBasis="100%" w="100%" mt="$2" pt="$2" borderTopWidth={1} borderColor="var(--border)">
      <SizableText size="$2" fontFamily="$body" color="var(--text)" fontWeight="600">
        {t("yeastManualCountSectionTitle")}
      </SizableText>
      <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" whiteSpace="pre-line">
        {t("yeastManualCountFirstNote")}
      </SizableText>
      <SizableText
        size="$2"
        fontFamily="$body"
        color="var(--text-muted)"
        whiteSpace="pre-line"
        textDecorationLine="underline"
      >
        {t("yeastManualCountDisclaimer")}
      </SizableText>
      <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" fontWeight="600">
        {t("yeastManualCountDirectlyInfluencesAmount")}
      </SizableText>
      <YStack gap="$2">
        <YeastEditorRowManualCountFields {...props} />
        {manualCountReady ? (
          <Button
            size="$2"
            alignSelf="flex-start"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
            onPress={onSave}
            disabled={!canCallAccountScoped || saving}
          >
            {t("yeastManualCountSaveCalculatedValues")}
          </Button>
        ) : null}
        {lowViabilityWarning != null && idx === firstManualCountRowIdx ? (
          <WarningBox mt="$2" role="status" aria-live="polite">
            {t("yeastLowViabilityWarning", { pct: Math.round(lowViabilityWarning) })}
          </WarningBox>
        ) : null}
        {manualCountReady && manualCellCount ? (
          <View className="brew-field-block brew-field-block--computed" mt="$2">
            <YStack gap="$2">
              <YStack gap="$1">
                <XStack gap="$2" alignItems="center" flexWrap="nowrap">
                  <RecipeEditFieldLabel>
                    {t("yeastManualCountCalculatedLiveCellsPerGramLabel")}
                  </RecipeEditFieldLabel>
                  {surfaceMath ? (
                    <MathHelpPopover
                      title={tMath(mathExplain["yeast.manualCountLiveCellsPerGram"].titleKey)}
                      body={tMath("yeast.manualCountLiveCellsPerGram.body")}
                      ariaLabel={tMath("fxLabel", {
                        topic: tMath(mathExplain["yeast.manualCountLiveCellsPerGram"].titleKey),
                      })}
                    />
                  ) : null}
                </XStack>
                <RecipeEditReadOnlyValue>
                  {computeLiveCellsPerGram(manualCellCount).toLocaleString(locale)}
                </RecipeEditReadOnlyValue>
              </YStack>
            </YStack>
          </View>
        ) : null}
      </YStack>
    </YStack>
  );
}
