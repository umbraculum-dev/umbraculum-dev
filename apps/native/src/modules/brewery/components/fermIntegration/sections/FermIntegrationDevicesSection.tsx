import React from "react";
import { View } from "react-native";

import { Card, Heading, Text } from "@umbraculum/ui";

import type { IntegrationDevice, IntegrationKind } from "../../../hooks/fermIntegration/fermIntegrationTypes";
import type { NativeFermDataIntegrationScreenModel } from "../../../hooks/fermIntegration/useNativeFermDataIntegrationScreen";
import { FermIntegrationChartSection } from "./FermIntegrationChartSection";

export function FermIntegrationDevicesSection(props: {
  model: NativeFermDataIntegrationScreenModel;
  kind: IntegrationKind;
  devices: IntegrationDevice[];
}) {
  const { model, kind, devices } = props;
  const { t } = model;

  if (kind !== "tilt") return null;

  return (
    <View style={{ gap: 8 }}>
      <Heading fontSize={14}>{t("sections.integration.devicesTitle")}</Heading>
      {!devices.length ? (
        <Text fontSize={12} opacity={0.75}>
          {t("sections.integration.noDevices")}
        </Text>
      ) : (
        devices.map((d) => (
          <Card key={d.id} gap="$1">
            <Text fontSize={12}>
              {t("sections.integration.device")}: {d.displayName ?? d.deviceKey}
            </Text>
            <Text fontSize={12} opacity={0.8}>
              {t("sections.integration.deviceKey")}: {d.deviceKey}
            </Text>
            {d.lastReading ? (
              <Text fontSize={12} opacity={0.8}>
                {t("sections.integration.lastReading")}:{" "}
                {typeof d.lastReading.temperatureC === "number"
                  ? `${d.lastReading.temperatureC.toFixed(2)} °C`
                  : "—"}
                ,{" "}
                {typeof d.lastReading.gravitySg === "number"
                  ? `SG ${d.lastReading.gravitySg.toFixed(3)}`
                  : "—"}
              </Text>
            ) : (
              <Text fontSize={12} opacity={0.75}>
                {t("sections.integration.noReadingsYet")}
              </Text>
            )}
            <FermIntegrationChartSection model={model} device={d} />
          </Card>
        ))
      )}
    </View>
  );
}
