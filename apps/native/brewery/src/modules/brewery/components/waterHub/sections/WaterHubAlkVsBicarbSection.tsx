import React from "react";
import { View } from "react-native";

import { Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { NativeWaterHubScreenModel } from "../../../hooks/waterHub/useNativeWaterHubScreen";

export function WaterHubAlkVsBicarbSection(props: { model: NativeWaterHubScreenModel }) {
  const { t, openSections } = props.model;

  return (
    <Accordion.Item value="alkVsBicarb">
      <Card gap="$2" mt="$3">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("alkVsBicarbTitle")}</Heading>
              <Text opacity={0.7}>{openSections.includes("alkVsBicarb") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <Text fontSize={12} opacity={0.8} mb="$2">
            {t("alkVsBicarbSubtitle")}
          </Text>
          <Text fontSize={12} mb="$1">{t("alkVsBicarbPoint1")}</Text>
          <Text fontSize={12} mb="$1">{t("alkVsBicarbPoint2")}</Text>
          <Text fontSize={12} mb="$1">{t("alkVsBicarbPoint3")}</Text>
          <Text fontSize={12}>{t("alkVsBicarbPoint4")}</Text>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
