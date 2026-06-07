import React from "react";

import { HydrometerChart } from "@umbraculum/brewery-recipes-ui/charts/HydrometerChart";

import type { IntegrationDevice } from "../../../hooks/fermIntegration/fermIntegrationTypes";
import type { NativeFermDataIntegrationScreenModel } from "../../../hooks/fermIntegration/useNativeFermDataIntegrationScreen";

export function FermIntegrationChartSection(props: {
  model: NativeFermDataIntegrationScreenModel;
  device: IntegrationDevice;
}) {
  const { model, device } = props;
  const { t } = model;

  if (!device.recentReadings?.length) return null;

  return (
    <HydrometerChart
      points={device.recentReadings.map((r) => ({
        at: String(r.recordedAt ?? r.receivedAt ?? ""),
        gravitySg: typeof r.gravitySg === "number" ? r.gravitySg : null,
        temperatureC: typeof r.temperatureC === "number" ? r.temperatureC : null,
      }))}
      compact
      title={t("sections.integration.deviceChartTitle")}
      gravityLabel={t("sections.integration.chartGravity")}
      temperatureLabel={t("sections.integration.chartTemperature")}
      xAxisLabel={t("sections.integration.chartXAxis")}
      gravityAxisLabel={t("sections.integration.chartGravityAxis")}
      temperatureAxisLabel={t("sections.integration.chartTemperatureAxis")}
    />
  );
}
