"use client";

import { SizableText } from "tamagui";

import { HydrometerChart } from "@umbraculum/brewery-recipes-ui/charts/HydrometerChart";
import { CodeInline } from "../../../../../../../../../_shared-layout/_components/CodeInline";
import type { BrewSessionDetailPageModel } from "../../../_hooks/useBrewSessionDetailPage";

export function BrewSessionHydrometerReadingBlock({ model }: { model: BrewSessionDetailPageModel }) {
  const {
    t,
    hydrometerChartPoints,
    hydrometerLastReading,
  } = model;

  return (
    <>
      {hydrometerLastReading ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("hydrometerLastReading")}:{" "}
          <CodeInline>
            {typeof hydrometerLastReading.temperatureC === "number"
              ? `${hydrometerLastReading.temperatureC.toFixed(2)} °C`
              : "—"},{" "}
            {typeof hydrometerLastReading.gravitySg === "number"
              ? `SG ${hydrometerLastReading.gravitySg.toFixed(3)}`
              : "—"}
          </CodeInline>
        </SizableText>
      ) : (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("hydrometerNoReadings")}
        </SizableText>
      )}

      {hydrometerChartPoints.length ? (
        <HydrometerChart
          points={hydrometerChartPoints}
          title={t("hydrometerChartTitle")}
          gravityLabel={t("hydrometerChartGravity")}
          temperatureLabel={t("hydrometerChartTemperature")}
          xAxisLabel={t("hydrometerChartXAxis")}
          gravityAxisLabel={t("hydrometerChartGravityAxis")}
          temperatureAxisLabel={t("hydrometerChartTemperatureAxis")}
        />
      ) : null}
    </>
  );
}
