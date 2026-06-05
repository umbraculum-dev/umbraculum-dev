import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { SaltAdditionsEditor } from "@umbraculum/brewery-recipes-ui";
import { Accordion } from "tamagui";

import type { WaterMashScreenModel } from "../../../../hooks/useWaterMashScreen";

export function WaterMashSaltsSection(props: { model: WaterMashScreenModel }) {
  const {
    t,
    openSections,
    saltAdditions,
    setSaltAdditions,
    canCall,
    saveSettings,
  } = props.model;

  return (
    <Accordion.Item value="salts">
      <Card gap="$2" mt="$3">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("saltAdditionsManualV0")}</Heading>
              <Text opacity={0.7}>{openSections.includes("salts") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <SaltAdditionsEditor
            rows={saltAdditions}
            onChange={setSaltAdditions}
            idPrefix="mash"
            disabled={!canCall}
          />
          <Button
            size="$3"
            mt="$2"
            onPress={() => { void saveSettings({ mashSaltAdditionsJson: saltAdditions }); }}
            disabled={!canCall}
          >
            <Text>Save</Text>
          </Button>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
