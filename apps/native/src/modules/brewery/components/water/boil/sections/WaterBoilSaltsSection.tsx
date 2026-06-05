import React from "react";
import { View } from "react-native";

import { SaltAdditionsEditor } from "@umbraculum/brewery-recipes-ui";
import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { WaterBoilScreenModel } from "../../../../hooks/useWaterBoilScreen";

export function WaterBoilSaltsSection(props: { model: WaterBoilScreenModel }) {
  const {
    t,
    openSections,
    canCall,
    saving,
    saltAdditions,
    setSaltAdditions,
    onSaveSalts,
  } = props.model;

  return (
    <Accordion.Item value="salts">
      <Card gap="$2" mt="$3">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("saltAdditionsHeading")}</Heading>
              <Text opacity={0.7}>{openSections.includes("salts") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <Text fontSize={12} opacity={0.8} mb="$2">
            {t("saltAdditionsBaseHelp")}
          </Text>
          <SaltAdditionsEditor
            rows={saltAdditions}
            onChange={setSaltAdditions}
            idPrefix="boil"
            disabled={!canCall}
          />
          <Button size="$3" mt="$2" chromeless onPress={() => { void onSaveSalts(); }} disabled={!canCall || saving}>
            <Text>{saving ? "Saving…" : "Save salts"}</Text>
          </Button>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
