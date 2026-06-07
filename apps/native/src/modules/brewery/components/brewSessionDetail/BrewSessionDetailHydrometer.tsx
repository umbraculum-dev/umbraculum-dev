import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, SelectField, Text } from "@umbraculum/ui";
import { HydrometerChart } from "@umbraculum/brewery-recipes-ui/charts/HydrometerChart";

import type { BrewSessionDetailScreenModel } from "../../hooks/brewSessionDetail/useBrewSessionDetailScreen";
import type { IntegrationKind } from "../../hooks/brewSessionDetail/brewSessionDetailTypes";

export function BrewSessionDetailHydrometer(props: { model: BrewSessionDetailScreenModel }) {
  const { model } = props;
  const {
    t,
    hydrometerKind,
    setHydrometerKind,
    kindOptions,
    devices,
    deviceOptions,
    selectedDeviceId,
    setSelectedDeviceId,
    attachHydrometer,
    detachHydrometer,
    attached,
    working,
    lastReading,
    chartPoints,
    hydrometerError,
  } = model;

  return (
    <Card gap="$2" mb="$3">
      <Heading fontSize={16}>{t("hydrometerSectionTitle")}</Heading>
      <Text fontSize={12} opacity={0.8}>
        {t("hydrometerSectionSubtitle")}
      </Text>

      <View style={{ gap: 8 }}>
        <Text fontSize={12}>{t("hydrometerKindLabel")}</Text>
        <SelectField
          value={hydrometerKind}
          onValueChange={(value) => setHydrometerKind(value as IntegrationKind)}
          options={kindOptions}
          width="full"
          aria-label={t("hydrometerKindLabel")}
        />
      </View>

      {hydrometerKind !== "tilt" ? (
        <Card borderWidth={1} borderColor="$yellow10" bg="rgba(234,179,8,0.18)">
          <Text fontSize={12} color="$yellow10">
            {t("hydrometerNotSupportedYet")}
          </Text>
        </Card>
      ) : null}

      <View style={{ gap: 8 }}>
        <Text fontSize={12}>{t("hydrometerDeviceLabel")}</Text>
        <SelectField
          value={selectedDeviceId}
          onValueChange={(value) => setSelectedDeviceId(value)}
          options={deviceOptions}
          placeholder={t("hydrometerDevicePlaceholder")}
          width="full"
          aria-label={t("hydrometerDeviceLabel")}
        />
        {!devices.length ? (
          <Text fontSize={12} opacity={0.8}>
            {t("hydrometerNoDevices")}
          </Text>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Button onPress={() => { void attachHydrometer(); }} disabled={!selectedDeviceId || working !== null}>
          <Text>{t("hydrometerAttach")}</Text>
        </Button>
        <Button onPress={() => { void detachHydrometer(); }} disabled={!attached || working !== null} background="$background" borderWidth={1}>
          <Text>{t("hydrometerDetach")}</Text>
        </Button>
      </View>

      <Text fontSize={12} opacity={0.8}>
        {attached ? t("hydrometerAttachedTo", { device: attached.device.displayName ?? attached.device.deviceKey }) : t("hydrometerNotAttached")}
      </Text>

      <View style={{ gap: 6 }}>
        <Text fontSize={12}>{t("hydrometerLastReading")}</Text>
        {lastReading ? (
          <Text fontSize={12} opacity={0.8}>
            {typeof lastReading.temperatureC === "number" ? `${lastReading.temperatureC.toFixed(2)} °C` : "—"},{" "}
            {typeof lastReading.gravitySg === "number" ? `SG ${lastReading.gravitySg.toFixed(3)}` : "—"}
          </Text>
        ) : (
          <Text fontSize={12} opacity={0.8}>
            {t("hydrometerNoReadings")}
          </Text>
        )}
      </View>

      {chartPoints.length ? (
        <HydrometerChart
          points={chartPoints}
          title={t("hydrometerChartTitle")}
          gravityLabel={t("hydrometerChartGravity")}
          temperatureLabel={t("hydrometerChartTemperature")}
          xAxisLabel={t("hydrometerChartXAxis")}
          gravityAxisLabel={t("hydrometerChartGravityAxis")}
          temperatureAxisLabel={t("hydrometerChartTemperatureAxis")}
        />
      ) : null}

      {hydrometerError ? (
        <Text fontSize={12} color="$red10">
          {hydrometerError}
        </Text>
      ) : null}
    </Card>
  );
}
