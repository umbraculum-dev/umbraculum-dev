"use client";

import { SizableText, View, XStack, YStack } from "tamagui";

type HydrometerPoint = {
  at: string;
  gravitySg: number | null;
  temperatureC: number | null;
};

type SeriesPoint = { x: number; y: number };

function parseTimeMs(value: string): number | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : t;
}

function buildSeries(
  points: HydrometerPoint[],
  valueKey: "gravitySg" | "temperatureC",
  width: number,
  height: number,
  pad: number
): SeriesPoint[] {
  const series = points
    .map((p) => ({
      timeMs: parseTimeMs(p.at),
      value: typeof p[valueKey] === "number" ? (p[valueKey] as number) : null,
    }))
    .filter((p) => p.timeMs !== null && p.value !== null) as { timeMs: number; value: number }[];

  if (series.length === 0) return [];

  const minX = Math.min(...series.map((p) => p.timeMs));
  const maxX = Math.max(...series.map((p) => p.timeMs));
  const minY = Math.min(...series.map((p) => p.value));
  const maxY = Math.max(...series.map((p) => p.value));
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1e-6, maxY - minY);

  return series.map((p) => ({
    x: pad + ((p.timeMs - minX) / spanX) * (width - pad * 2),
    y: height - pad - ((p.value - minY) / spanY) * (height - pad * 2),
  }));
}

function buildPath(points: SeriesPoint[]): string | null {
  if (points.length < 2) return null;
  return points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
}

export interface HydrometerChartProps {
  points: HydrometerPoint[];
  title?: string;
  compact?: boolean;
  gravityLabel: string;
  temperatureLabel: string;
}

export function HydrometerChart({
  points,
  title,
  compact = false,
  gravityLabel,
  temperatureLabel,
}: HydrometerChartProps) {
  if (!points.length) return null;
  const width = 240;
  const height = compact ? 90 : 140;
  const pad = 6;

  const gravitySeries = buildSeries(points, "gravitySg", width, height, pad);
  const tempSeries = buildSeries(points, "temperatureC", width, height, pad);
  const gravityPath = buildPath(gravitySeries);
  const tempPath = buildPath(tempSeries);

  return (
    <YStack gap="$2" mt="$2">
      {title ? (
        <SizableText size="$2" fontFamily="$body" color="var(--text-muted)">
          {title}
        </SizableText>
      ) : null}
      <View
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$2"
        p="$2"
        bg="var(--surface-2)"
        role="img"
        aria-label={title ?? "Hydrometer chart"}
      >
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {gravityPath ? <path d={gravityPath} fill="none" stroke="var(--success)" strokeWidth="2" /> : null}
          {tempPath ? <path d={tempPath} fill="none" stroke="var(--info)" strokeWidth="2" /> : null}
        </svg>
        <XStack gap="$3" flexWrap="wrap" mt="$2">
          <SizableText size="$1" fontFamily="$body" color="var(--text-muted)">
            {gravityLabel} <SizableText as="span" color="var(--success)">●</SizableText>
          </SizableText>
          <SizableText size="$1" fontFamily="$body" color="var(--text-muted)">
            {temperatureLabel} <SizableText as="span" color="var(--info)">●</SizableText>
          </SizableText>
        </XStack>
      </View>
    </YStack>
  );
}
