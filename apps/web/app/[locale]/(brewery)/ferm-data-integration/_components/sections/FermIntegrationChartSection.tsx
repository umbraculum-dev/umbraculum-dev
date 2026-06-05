"use client";

import { HydrometerChart } from "@umbraculum/ui/charts/HydrometerChart";

import type { UseFermDataIntegrationPageModel } from "../../_hooks/useFermDataIntegrationPage";
import type { HydrometerReadingPoint } from "../../_lib/fermIntegrationTypes";

type Model = UseFermDataIntegrationPageModel;

export function FermIntegrationChartSection(props: {
  model: Model;
  recentReadings: HydrometerReadingPoint[];
}) {
  const { model, recentReadings } = props;
  const { t } = model;

  if (!recentReadings.length) return null;

  return (
    <HydrometerChart
      points={recentReadings.map((r) => ({
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
