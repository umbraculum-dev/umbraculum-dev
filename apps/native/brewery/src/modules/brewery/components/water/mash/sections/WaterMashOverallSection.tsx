import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { WaterMashScreenModel } from "../../../../hooks/useWaterMashScreen";
import { formatFixed } from "../../shared/waterNativeFormatters";

export function WaterMashOverallSection(props: { model: WaterMashScreenModel }) {
  const {
    locale,
    t,
    openSections,
    overallResult,
    overallStatus,
    savingOverall,
    canCall,
    onComputeAndSave,
  } = props.model;

  return (
    <Accordion.Item value="overall">
      <Card gap="$2" mt="$3">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("overallResultHeading")}</Heading>
              <Text opacity={0.7}>{openSections.includes("overall") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <Button
            size="$3"
            onPress={() => { void onComputeAndSave(); }}
            disabled={!canCall || savingOverall}
          >
            <Text>{savingOverall ? "Calculating…" : "Compute & save"}</Text>
          </Button>
          {overallStatus ? <Text fontSize={12} mt="$2">{overallStatus}</Text> : null}
          {overallResult ? (
            <View style={{ marginTop: 12, gap: 4 }}>
              <Text fontSize={12}>
                pH: {formatFixed(locale, (overallResult['ph'] as { value?: number })?.value ?? 0, 2)}
              </Text>
              <Text fontSize={12}>
                Final alkalinity: {formatFixed(locale, (overallResult['finalAlkalinityPpmCaCO3'] as number) ?? 0, 0)} ppm
              </Text>
            </View>
          ) : null}
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
