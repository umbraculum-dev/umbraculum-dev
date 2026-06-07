import React from "react";
import { View } from "react-native";

import { Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { WaterMashScreenModel } from "../../../../hooks/useWaterMashScreen";
import {
  WaterMashAcidificationInputsBlock,
  WaterMashAcidificationModeBlock,
} from "./acidification/WaterMashAcidificationFieldBlocks";
import {
  WaterMashAcidificationActionsBlock,
  WaterMashAcidificationResultsBlock,
} from "./acidification/WaterMashAcidificationActionsResultsBlocks";

export function WaterMashAcidificationSection(props: { model: WaterMashScreenModel }) {
  const { openSections, t } = props.model;

  return (
    <Accordion.Item value="acidification">
      <Card gap="$2" mt="$3">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("acidificationHeading")}</Heading>
              <Text opacity={0.7}>{openSections.includes("acidification") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <View style={{ gap: 12 }}>
            <WaterMashAcidificationModeBlock model={props.model} />
            <WaterMashAcidificationInputsBlock model={props.model} />
            <WaterMashAcidificationActionsBlock model={props.model} />
            <WaterMashAcidificationResultsBlock model={props.model} />
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
