import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { NativeWaterHubScreenModel } from "../../../hooks/waterHub/useNativeWaterHubScreen";

export function WaterHubLinksSection(props: { model: NativeWaterHubScreenModel }) {
  const {
    t,
    openSections,
    mashLast,
    spargeLast,
    boilLast,
    navigateToWaterMash,
    navigateToWaterSparge,
    navigateToWaterBoil,
    navigateToWaterProfiles,
  } = props.model;

  return (
    <Accordion.Item value="links">
      <Card gap="$2" mt="$2">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("chooseArea")}</Heading>
              <Text opacity={0.7}>{openSections.includes("links") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <View style={{ gap: 12 }}>
            <View style={{ gap: 4 }}>
              <Button size="$4" width="100%" onPress={navigateToWaterMash}>
                <Text fontSize={14}>{t("mashWater")}</Text>
              </Button>
              <Text fontSize={12} opacity={0.7}>
                {t("lastCalculated")}: {mashLast}
              </Text>
            </View>

            <View style={{ gap: 4 }}>
              <Button size="$4" width="100%" onPress={navigateToWaterSparge}>
                <Text fontSize={14}>{t("spargeWater")}</Text>
              </Button>
              <Text fontSize={12} opacity={0.7}>
                {t("lastCalculated")}: {spargeLast}
              </Text>
            </View>

            <View style={{ gap: 4 }}>
              <Button size="$4" width="100%" onPress={navigateToWaterBoil}>
                <Text fontSize={14}>{t("additionalBoilWater")}</Text>
              </Button>
              <Text fontSize={12} opacity={0.7}>
                {t("lastCalculated")}: {boilLast}
              </Text>
            </View>

            <Text fontSize={12} opacity={0.8}>
              {t("manageProfilesOn")}{" "}
              <Text onPress={navigateToWaterProfiles} color="$blue10">
                {t("waterProfilesLink")}
              </Text>
            </Text>
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
