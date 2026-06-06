import React from "react";
import { View } from "react-native";

import { Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { NativeWaterHubScreenModel } from "../../../hooks/waterHub/useNativeWaterHubScreen";
import { WaterHubRecapAdditionsBlock, WaterHubRecapStatsBlock } from "./WaterHubRecapContentBlocks";

export function WaterHubRecapSection(props: { model: NativeWaterHubScreenModel }) {
  const { t, openSections, summary, displayStreams } = props.model;

  return (
    <Accordion.Item value="recap">
      <Card gap="$2" mt="$3">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("recap")}</Heading>
              <Text opacity={0.7}>{openSections.includes("recap") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <Text fontSize={12} opacity={0.8} mb="$2">
            {t("recapSubtitle")}
          </Text>
          {summary && displayStreams ? (
            <View style={{ gap: 12 }}>
              <WaterHubRecapStatsBlock model={props.model} />
              <WaterHubRecapAdditionsBlock model={props.model} />
            </View>
          ) : (
            <Text fontSize={12} opacity={0.8}>{t("noSettingsLoaded")}</Text>
          )}
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
