import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { NativeWaterHubScreenModel } from "../../../hooks/waterHub/useNativeWaterHubScreen";

export function WaterHubStatusSection(props: { model: NativeWaterHubScreenModel }) {
  const {
    t,
    openSections,
    summary,
    fmt,
    canCall,
    loading,
    profilesLoaded,
    refresh,
  } = props.model;

  return (
    <Accordion.Item value="status">
      <Card gap="$2" mt="$3">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("quickStatus")}</Heading>
              <Text opacity={0.7}>{openSections.includes("status") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <View style={{ gap: 8 }}>
            <Text fontSize={12}>{t("mashAcidMode")}: {summary?.status.mashAcidificationMode ?? "—"}</Text>
            <Text fontSize={12}>{t("spargeAcidMode")}: {summary?.status.spargeAcidificationMode ?? "—"}</Text>
            <Text fontSize={12}>
              {t("mashOverallSnapshot")}:{" "}
              {summary?.status.mashOverallSnapshot
                ? `pH (${summary.status.mashOverallSnapshot.ph.kind}) ${fmt("pH", summary.status.mashOverallSnapshot.ph.value, 2)} · Final alkalinity ${fmt("ppm_as_CaCO3", summary.status.mashOverallSnapshot.finalAlkalinityPpmCaCO3, 0)}`
                : "—"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Button
                size="$3"
                onPress={() => void refresh()}
                disabled={!canCall || loading}
              >
                <Text>{loading ? t("refreshing") : t("refresh")}</Text>
              </Button>
              <Text fontSize={12} opacity={0.8}>
                {profilesLoaded ? t("profilesLoaded") : t("profilesNotLoaded")}
              </Text>
            </View>
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
