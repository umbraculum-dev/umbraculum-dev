import React from "react";
import { View } from "react-native";

import { Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { WaterSpargeScreenModel } from "../../../../hooks/useWaterSpargeScreen";
import {
  WaterSpargeAcidificationInputsBlock,
  WaterSpargeAcidificationModeBlock,
  WaterSpargeAcidificationProfileBlock,
} from "./acidification/WaterSpargeAcidificationFieldBlocks";
import {
  WaterSpargeAcidificationActionsBlock,
  WaterSpargeAcidificationResultsBlock,
} from "./acidification/WaterSpargeAcidificationActionsResultsBlocks";

export function WaterSpargeAcidificationSection(props: { model: WaterSpargeScreenModel }) {
  const { openSections, t } = props.model;

  return (
    <Accordion.Item value="acidification">
      <Card gap="$2" mt="$2">
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
            <WaterSpargeAcidificationProfileBlock model={props.model} />
            <WaterSpargeAcidificationModeBlock model={props.model} />
            <WaterSpargeAcidificationInputsBlock model={props.model} />
            <WaterSpargeAcidificationActionsBlock model={props.model} />
            <WaterSpargeAcidificationResultsBlock model={props.model} />
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
