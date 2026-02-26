import React, { useState } from "react";
import { View } from "react-native";

import { useT } from "@brewery/i18n-react";
import { Button, Card, Heading, Text } from "@brewery/ui";

import { RemoteImage } from "../media/RemoteImage";

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
      <Text fontSize={14} fontWeight="600" mb="$1">
        {step}. {title}
      </Text>
      <Text fontSize={12} opacity={0.85}>
        {body}
      </Text>
    </View>
  );
}

/**
 * Collapsible explanatory box for manual yeast cell count methodology (hemocytometer).
 * Documents the 6-step process and formulas to calculate yeast to inoculate (kg).
 */
export function ManualCellCountHelpBox() {
  const { t } = useT("recipes.edit");
  const [expanded, setExpanded] = useState(false);

  return (
    <Card gap="$2" mt="$3" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
      <Button
        onPress={() => setExpanded((v) => !v)}
        chromeless
        size="$4"
        accessibilityRole="button"
        accessibilityLabel={t("yeastManualCellCountSummary")}
        accessibilityState={{ expanded }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <Heading fontSize={16}>{t("yeastManualCellCountSummary")}</Heading>
          <Text fontSize={18} opacity={0.7}>
            {expanded ? "▾" : "▸"}
          </Text>
        </View>
      </Button>
      {expanded ? (
        <View style={{ gap: 12, marginTop: 8 }}>
          <Text fontSize={14} fontWeight="600">
            {t("yeastManualCellCountTitle")}
          </Text>
          <StepBlock
            step={0}
            title={t("yeastManualCellCountPrerequisitesTitle")}
            body={t("yeastManualCellCountPrerequisitesBody")}
          />
          <StepBlock step={1} title={t("yeastManualCellCountStep1Title")} body={t("yeastManualCellCountStep1Body")} />
          <View>
            <RemoteImage
              assetKey="yeast/dilution-1-100.png"
              accessibilityLabel={t("yeastManualCellCountStep1ImageAlt")}
              unavailableText={t("yeastManualCellCountStep1ImageAlt")}
              width={320}
              height={200}
            />
            <Text fontSize={11} opacity={0.8} mt="$1">
              {t("yeastManualCellCountStep1ImageLegend")}
            </Text>
          </View>
          <StepBlock step={2} title={t("yeastManualCellCountStep2Title")} body={t("yeastManualCellCountStep2Body")} />
          <StepBlock step={3} title={t("yeastManualCellCountStep3Title")} body={t("yeastManualCellCountStep3Body")} />
          <View>
            <RemoteImage
              assetKey="yeast/hemocytometer-5-squares.png"
              accessibilityLabel={t("yeastManualCellCountStep3ImageAlt")}
              unavailableText={t("yeastManualCellCountStep3ImageAlt")}
              width={320}
              height={200}
            />
          </View>
          <StepBlock step={4} title={t("yeastManualCellCountStep4Title")} body={t("yeastManualCellCountStep4Body")} />
          <StepBlock step={5} title={t("yeastManualCellCountStep5Title")} body={t("yeastManualCellCountStep5Body")} />
          <StepBlock step={6} title={t("yeastManualCellCountStep6Title")} body={t("yeastManualCellCountStep6Body")} />
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
      ) : null}
    </Card>
  );
}
