import React from "react";
import { View } from "react-native";

import { Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { WaterBoilScreenModel } from "../../../../hooks/useWaterBoilScreen";
import {
  WaterBoilAcidificationActionsBlock,
  WaterBoilAcidificationResultsBlock,
} from "./acidification/WaterBoilAcidificationActionsResultsBlocks";
import {
  WaterBoilAcidificationInputsBlock,
  WaterBoilAcidificationModeBlock,
  WaterBoilAcidificationProfileBlock,
} from "./acidification/WaterBoilAcidificationFieldBlocks";

export function WaterBoilAcidificationSection(props: { model: WaterBoilScreenModel }) {
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
            <WaterBoilAcidificationProfileBlock model={props.model} />
            <WaterBoilAcidificationModeBlock model={props.model} />
            <WaterBoilAcidificationInputsBlock model={props.model} />
            <WaterBoilAcidificationActionsBlock model={props.model} />
            <WaterBoilAcidificationResultsBlock model={props.model} />
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
