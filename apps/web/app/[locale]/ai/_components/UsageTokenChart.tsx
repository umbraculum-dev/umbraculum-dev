"use client";

import { useMemo } from "react";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import { YStack } from "tamagui";

interface UsageTokenChartPoint {
  day: string;
  total: number;
  calls: number;
}

interface UsageTokenChartProps {
  data: UsageTokenChartPoint[];
  ariaLabel: string;
}

/**
 * Web-only 30-day token chart for the AI usage dashboard. Native parity
 * for this dashboard is deferred to a future sprint (workspace admins
 * are mostly on web).
 */
export function UsageTokenChart({ data, ariaLabel }: UsageTokenChartProps) {
  const series = useMemo(
    () =>
      data.map((p) => ({
        x: new Date(p.day),
        y: p.total,
        label: `${formatDay(p.day)} • ${new Intl.NumberFormat().format(p.total)} tokens`,
      })),
    [data],
  );

  if (series.length === 0) {
    return null;
  }

  return (
    <YStack
      role="img"
      aria-label={ariaLabel}
      backgroundColor="$background"
      padding="$2"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <VictoryChart
        theme={VictoryTheme.material}
        height={280}
        padding={{ top: 16, right: 24, bottom: 40, left: 56 }}
        containerComponent={
          <VictoryVoronoiContainer
            voronoiDimension="x"
            labels={({ datum }: { datum: { label?: string } }) => datum.label ?? ""}
            labelComponent={<VictoryTooltip cornerRadius={4} flyoutPadding={6} />}
          />
        }
      >
        <VictoryAxis
          tickFormat={(t: Date | number) => formatDayShort(t)}
          style={{ tickLabels: { fontSize: 10 } }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(n: number) =>
            n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)
          }
          style={{ tickLabels: { fontSize: 10 } }}
        />
        <VictoryBar data={series} style={{ data: { fill: "#5b9bd5" } }} />
      </VictoryChart>
    </YStack>
  );
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

function formatDayShort(value: Date | number): string {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}
