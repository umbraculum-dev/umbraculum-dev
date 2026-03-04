import type { ReactNode } from "react";
import React, { useState } from "react";

import { useT } from "@brewery/i18n-react";
import { Card, Collapsible, Text } from "@brewery/ui";
import { View, YStack } from "tamagui";

export interface RecipeImageProps {
  assetKey: string;
  alt: string;
  width: number;
  height: number;
}

export type RenderRecipeImage = (props: RecipeImageProps) => ReactNode;

export interface ManualCellCountHelpBoxProps {
  renderImage: RenderRecipeImage;
}

function StepBlock(props: { step: number; title: string; body: string }) {
  return (
    <View>
      <Text fontSize={14} fontWeight="600" marginBottom="$1">
        {props.step}. {props.title}
      </Text>
      <Text fontSize={12} opacity={0.85}>
        {props.body}
      </Text>
    </View>
  );
}

export function ManualCellCountHelpBox(props: ManualCellCountHelpBoxProps) {
  const { t } = useT("recipes.edit");
  const [expanded, setExpanded] = useState(false);

  return (
    <Card gap="$2" marginTop="$3" background="$background" borderWidth={1} borderColor="$borderColor" padding="$3">
      <Collapsible
        title={t("yeastManualCellCountSummary")}
        expanded={expanded}
        onExpandedChange={setExpanded}
        accessibilityLabel={t("yeastManualCellCountSummary")}
        summary={
          <Text fontSize={16} fontWeight="700">
            {t("yeastManualCellCountSummary")}
          </Text>
        }
      >
        <View style={{ gap: 12, marginTop: 8 }}>
          <Text fontSize={14} fontWeight="600">
            {t("yeastManualCellCountTitle")}
          </Text>

          <StepBlock
            step={0}
            title={t("yeastManualCellCountPrerequisitesTitle")}
            body={t("yeastManualCellCountPrerequisitesBody")}
          />

          <YStack gap="$2">
            <StepBlock step={1} title={t("yeastManualCellCountStep1Title")} body={t("yeastManualCellCountStep1Body")} />
            <View>
              {props.renderImage({
                assetKey: "yeast/dilution-1-100.png",
                alt: t("yeastManualCellCountStep1ImageAlt"),
                width: 320,
                height: 200,
              })}
              <Text fontSize={11} opacity={0.8} marginTop="$1">
                {t("yeastManualCellCountStep1ImageLegend")}
              </Text>
            </View>

            <StepBlock step={2} title={t("yeastManualCellCountStep2Title")} body={t("yeastManualCellCountStep2Body")} />
            <StepBlock step={3} title={t("yeastManualCellCountStep3Title")} body={t("yeastManualCellCountStep3Body")} />
            <View>
              {props.renderImage({
                assetKey: "yeast/hemocytometer-5-squares.png",
                alt: t("yeastManualCellCountStep3ImageAlt"),
                width: 320,
                height: 200,
              })}
            </View>

            <StepBlock step={4} title={t("yeastManualCellCountStep4Title")} body={t("yeastManualCellCountStep4Body")} />
            <StepBlock step={5} title={t("yeastManualCellCountStep5Title")} body={t("yeastManualCellCountStep5Body")} />
            <StepBlock step={6} title={t("yeastManualCellCountStep6Title")} body={t("yeastManualCellCountStep6Body")} />
          </YStack>

          <Text fontSize={14} fontWeight="600">
            {t("yeastManualCellCountGlossaryTitle")}
          </Text>
          <Text fontSize={12} opacity={0.85}>
            {t("yeastManualCellCountGlossary")}
          </Text>

          <Text fontSize={11} opacity={0.8}>
            {t("yeastManualCellCountReference")}
          </Text>
        </View>
      </Collapsible>
    </Card>
  );
}

