import React from "react";
import { View } from "react-native";

import { Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { NativeWaterHubScreenModel } from "../../../hooks/waterHub/useNativeWaterHubScreen";

export function WaterHubFinalRecapSection(props: { model: NativeWaterHubScreenModel }) {
  const { t, tUnits, openSections, summary, fmt } = props.model;

  return (
    <Accordion.Item value="finalRecap">
      <Card gap="$2" mt="$3">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("finalRecapTitle")}</Heading>
              <Text opacity={0.7}>{openSections.includes("finalRecap") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <Text fontSize={12} opacity={0.8} mb="$2">
            {t("finalRecapSubtitle")}
          </Text>
          <Text fontSize={12}>
            {t("predictedMashPh")} {summary?.finalRecap.predictedMashPh ? fmt("pH", summary.finalRecap.predictedMashPh.value, 2) : "—"}
          </Text>
          <Text fontSize={12} mt="$2">{t("residualAlkalinity")}</Text>
          <Text fontSize={12} opacity={0.8}>
            {t("raMashOverall")}: {summary?.finalRecap.residualAlkalinityMashOverallPpmCaCO3 != null ? fmt("ppm_as_CaCO3", summary.finalRecap.residualAlkalinityMashOverallPpmCaCO3, 0) : "—"} {tUnits("ppmAsCaCO3")}
          </Text>
          <Text fontSize={12} opacity={0.8}>
            {t("raMerged")}: {summary?.finalRecap.residualAlkalinityMergedPpmCaCO3 != null ? fmt("ppm_as_CaCO3", summary.finalRecap.residualAlkalinityMergedPpmCaCO3, 0) : "—"} {tUnits("ppmAsCaCO3")}
          </Text>
          <Text fontSize={12} mt="$2">
            {t("styleExpectedRa")}: {summary?.finalRecap.styleExpectedRa ? `${fmt("ppm_as_CaCO3", summary.finalRecap.styleExpectedRa.min, 0)}..${fmt("ppm_as_CaCO3", summary.finalRecap.styleExpectedRa.max, 0)} ${tUnits("ppmAsCaCO3")} · ${t(summary.finalRecap.styleExpectedRa.rationaleKey)}` : t("styleExpectedRaNa")}
          </Text>
          <Text fontSize={12} opacity={0.8} mt="$2">
            {t("finalRecapCaveat")}
          </Text>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
