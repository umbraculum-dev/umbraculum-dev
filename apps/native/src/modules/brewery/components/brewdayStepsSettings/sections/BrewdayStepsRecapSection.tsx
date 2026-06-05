import React from "react";
import { View } from "react-native";

import { Card, Heading, Text } from "@umbraculum/ui";

import type { NativeBrewdayStepsSettingsPageModel } from "../../../hooks/brewdayStepsSettings/useNativeBrewdayStepsSettingsPage";
import { SectionToggleButton } from "../nativeUiPrimitives";

export function BrewdayStepsRecapSection(props: { model: NativeBrewdayStepsSettingsPageModel }) {
  const { t, openSections, toggleOpen, recapLines } = props.model;

  return (
    <Card gap="$2">
      <SectionToggleButton chromeless size="$3" onPress={() => toggleOpen("recap")} width="100%" justifyContent="space-between">
        <Heading fontSize={18}>{t("sections.brewdayStepsRecap.title")}</Heading>
        <Text opacity={0.7}>{openSections.includes("recap") ? "▾" : "▸"}</Text>
      </SectionToggleButton>
      {openSections.includes("recap") ? (
        recapLines.length > 0 ? (
          <View style={{ gap: 6 }}>
            {recapLines.map((l) => (
              <Text key={l.sectionId} fontSize={12} opacity={0.85}>
                {l.sectionId}: {l.count}
              </Text>
            ))}
          </View>
        ) : (
          <Text fontSize={12} opacity={0.85}>
            {t("sections.brewdayStepsRecap.empty")}
          </Text>
        )
      ) : null}
    </Card>
  );
}
