import React from "react";
import { View } from "react-native";

import { SaltAdditionsEditor } from "@umbraculum/brewery-recipes-ui";
import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { WaterSpargeScreenModel } from "../../../../hooks/useWaterSpargeScreen";

export function WaterSpargeSaltsSection(props: { model: WaterSpargeScreenModel }) {
  const {
    openSections,
    t,
    canCall,
    saltAdditions,
    setSaltAdditions,
    saving,
    onSaveSalts,
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
          <Text fontSize={12} opacity={0.8} mb="$2">
            {t("saltAdditionsHelp")}
          </Text>
          <SaltAdditionsEditor
            rows={saltAdditions}
            onChange={setSaltAdditions}
            idPrefix="sparge"
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
