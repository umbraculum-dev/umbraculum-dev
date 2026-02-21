"use client";

import React from "react";
import { SizableText, View, YStack } from "tamagui";

import { RecipeEditSummary } from "../../_components/recipe-edit";

type ManualCellCountHelpBoxProps = {
  t: (key: string) => string;
};

/**
 * Collapsible explanatory box for manual yeast cell count methodology (hemocytometer).
 * Documents the 6-step process and formulas to calculate yeast to inoculate (kg).
 */
export function ManualCellCountHelpBox({ t }: ManualCellCountHelpBoxProps) {
  return (
    <details
      className="brew-field-block brew-field-block--computed"
      mt="$3"
      aria-labelledby="yeast-manual-cell-count-heading"
    >
      <RecipeEditSummary>
        <h3 id="yeast-manual-cell-count-heading" style={{ display: "inline", margin: 0, fontWeight: "inherit" }}>
          {t("yeastManualCellCountSummary")}
        </h3>
      </RecipeEditSummary>
      <View mt="$2" mb="$1">
        <SizableText size="$2" fontFamily="$body" color="var(--text)" fontWeight="600">
          {t("yeastManualCellCountTitle")}
        </SizableText>
      </View>
      <View mt="$2">
        <StepBlock step={0} title={t("yeastManualCellCountPrerequisitesTitle")} body={t("yeastManualCellCountPrerequisitesBody")} />
      </View>
      <YStack gap="$2" mt="$2">
        <StepBlock step={1} title={t("yeastManualCellCountStep1Title")} body={t("yeastManualCellCountStep1Body")} />
        <View mt="$2">
          <img
            src="/media/yeast/dilution-1-100.png"
            alt={t("yeastManualCellCountStep1ImageAlt")}
            loading="lazy"
            style={{ maxWidth: 320, width: "100%", height: "auto" }}
          />
          <SizableText size="$1" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}>
            {t("yeastManualCellCountStep1ImageLegend")}
          </SizableText>
        </View>
        <StepBlock step={2} title={t("yeastManualCellCountStep2Title")} body={t("yeastManualCellCountStep2Body")} />
        <StepBlock step={3} title={t("yeastManualCellCountStep3Title")} body={t("yeastManualCellCountStep3Body")} />
        <View mt="$2">
          <img
            src="/media/yeast/hemocytometer-5-squares.png"
            alt={t("yeastManualCellCountStep3ImageAlt")}
            loading="lazy"
            style={{ maxWidth: 320, width: "100%", height: "auto" }}
          />
        </View>
        <StepBlock step={4} title={t("yeastManualCellCountStep4Title")} body={t("yeastManualCellCountStep4Body")} />
        <StepBlock step={5} title={t("yeastManualCellCountStep5Title")} body={t("yeastManualCellCountStep5Body")} />
        <StepBlock step={6} title={t("yeastManualCellCountStep6Title")} body={t("yeastManualCellCountStep6Body")} />
      </YStack>
      <View mt="$3">
        <SizableText size="$2" fontFamily="$body" color="var(--text)" fontWeight="600">
          {t("yeastManualCellCountGlossaryTitle")}
        </SizableText>
        <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt="$1" whiteSpace="pre-line">
          {t("yeastManualCellCountGlossary")}
        </SizableText>
      </View>
      <SizableText size="$1" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
        {t("yeastManualCellCountReference")}
      </SizableText>
    </details>
  );
}

function StepBlock({
  step,
  title,
  body,
}: {
  step: number;
  title: string;
  body: string;
}) {
  return (
    <View>
      <SizableText size="$2" fontFamily="$body" color="var(--text)" fontWeight="600">
        {step}. {title}
      </SizableText>
      <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt="$1" whiteSpace="pre-line">
        {body}
      </SizableText>
    </View>
  );
}
