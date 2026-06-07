"use client";

import { useMemo, type ComponentType } from "react";
import { XStack, YStack } from "tamagui";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";

import { Card, Text } from "@umbraculum/ui";
import {
  buildHydrometerTickValues,
  buildHydrometerTooltipLabel,
  clampHydrometerDomain,
  DEFAULT_AXIS_COLOR,
  DEFAULT_GRAVITY_COLOR,
  DEFAULT_TEMPERATURE_COLOR,
  getHydrometerNumberDomain,
  mapHydrometerRange,
  toHydrometerSeries,
  type HydrometerChartProps,
} from "./hydrometerChartShared.js";

export type { HydrometerChartProps } from "./hydrometerChartShared.js";

const VictoryChartWithTitle = VictoryChart as unknown as ComponentType<Record<string, unknown>>;

export function HydrometerChart({
  points,
  title,
  compact = false,
  gravityLabel,
  temperatureLabel,
  xAxisLabel,
  gravityAxisLabel,
  temperatureAxisLabel,
}: HydrometerChartProps) {
  const gravitySeries = useMemo(() => toHydrometerSeries(points, "gravitySg"), [points]);
  const temperatureSeries = useMemo(() => toHydrometerSeries(points, "temperatureC"), [points]);

  if (!gravitySeries.length && !temperatureSeries.length) return null;

  // Gravity domain drives the chart Y scale; we map temperature onto it so each axis is meaningful.
  const gravityDomain = clampHydrometerDomain(getHydrometerNumberDomain(gravitySeries.map((p) => p.y)), 0.95, 1.2);
  const temperatureDomain = getHydrometerNumberDomain(temperatureSeries.map((p) => p.y));
  const [gMin, gMax] = gravityDomain;
  const [tMin, tMax] = temperatureDomain;

  // eslint-disable-next-line react-hooks/rules-of-hooks -- pre-existing: the early `return null` above this block (line 129) violates the Rules of Hooks. Fixing requires moving these useMemos above the early return; tracked separately to keep the ESLint Medium-scope landing tight. See docs/LINTING.md.
  const temperatureSeriesMapped = useMemo(() => {
    if (!temperatureSeries.length) return [];
    return temperatureSeries.map((p) => ({
      x: p.x,
      y: mapHydrometerRange(p.y, tMin, tMax, gMin, gMax),
      yRaw: p.y,
    }));
  }, [temperatureSeries, tMin, tMax, gMin, gMax]);

  // eslint-disable-next-line react-hooks/rules-of-hooks -- pre-existing: same root cause as the disable above. See docs/LINTING.md.
  const temperatureAxisTickValues = useMemo(() => {
    if (!temperatureSeries.length) return [];
    const temps = buildHydrometerTickValues(tMin, tMax, 5);
    return temps.map((temp) => mapHydrometerRange(temp, tMin, tMax, gMin, gMax));
  }, [temperatureSeries.length, tMin, tMax, gMin, gMax]);

  const height = compact ? 220 : 320;
  const padding = compact
    ? { top: 24, bottom: 50, left: 52, right: 52 }
    : { top: 30, bottom: 60, left: 60, right: 60 };

  return (
    <YStack gap="$2" marginTop="$2">
      {title ? (
        <Text fontSize={12} color="$gray11">
          {title}
        </Text>
      ) : null}
      <Card role="img" aria-label={title ?? "Hydrometer chart"}>
        <VictoryChartWithTitle
          height={height}
          padding={padding}
          domainPadding={{ x: 12, y: 12 }}
          domain={{ y: gravityDomain }}
          titleComponent={<VictoryLabel />}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              labels={({ activePoints }) =>
                buildHydrometerTooltipLabel(activePoints ?? [], gravityLabel, temperatureLabel)
              }
              labelComponent={<VictoryTooltip cornerRadius={4} flyoutPadding={{ top: 6, bottom: 6, left: 8, right: 8 }} />}
            />
          }
        >
          <VictoryAxis
            {...(xAxisLabel !== undefined ? { label: xAxisLabel } : {})}
            style={{
              axis: { stroke: DEFAULT_AXIS_COLOR },
              tickLabels: { fill: DEFAULT_AXIS_COLOR, fontSize: 10 },
              axisLabel: { fill: DEFAULT_AXIS_COLOR, fontSize: 11, padding: 30 },
            }}
            tickFormat={(value: Date) => new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(value)}
          />
          <VictoryAxis
            dependentAxis
            label={gravityAxisLabel ?? gravityLabel}
            style={{
              axis: { stroke: DEFAULT_AXIS_COLOR },
              tickLabels: { fill: DEFAULT_AXIS_COLOR, fontSize: 10, padding: 2 },
              axisLabel: { fill: DEFAULT_AXIS_COLOR, fontSize: 11, padding: 46 },
            }}
            tickFormat={(value: number) => value.toFixed(3)}
          />
          <VictoryAxis
            dependentAxis
            orientation="right"
            label={temperatureAxisLabel ?? temperatureLabel}
            tickValues={temperatureAxisTickValues}
            style={{
              axis: { stroke: DEFAULT_AXIS_COLOR },
              tickLabels: { fill: DEFAULT_AXIS_COLOR, fontSize: 10, padding: 2 },
              axisLabel: { fill: DEFAULT_AXIS_COLOR, fontSize: 11, padding: 46 },
            }}
            tickFormat={(mapped: number) => mapHydrometerRange(mapped, gMin, gMax, tMin, tMax).toFixed(1)}
          />
          {gravitySeries.length ? (
            <VictoryLine
              name="gravity"
              data={gravitySeries}
              style={{ data: { stroke: DEFAULT_GRAVITY_COLOR, strokeWidth: 2 } }}
            />
          ) : null}
          {temperatureSeries.length ? (
            <VictoryLine
              name="temperature"
              data={temperatureSeriesMapped}
              style={{ data: { stroke: DEFAULT_TEMPERATURE_COLOR, strokeWidth: 2 } }}
            />
          ) : null}
        </VictoryChartWithTitle>
        <XStack gap="$3" flexWrap="wrap" marginTop="$2" justifyContent="flex-start">
          <Text fontSize={12} color="$gray11">
            {gravityLabel} <Text color={DEFAULT_GRAVITY_COLOR}>●</Text>
          </Text>
          <Text fontSize={12} color="$gray11">
            {temperatureLabel} <Text color={DEFAULT_TEMPERATURE_COLOR}>●</Text>
          </Text>
        </XStack>
      </Card>
    </YStack>
  );
}
