export interface HydrometerPoint {
  at: string;
  gravitySg: number | null;
  temperatureC: number | null;
}

export interface HydrometerSeriesPoint {
  x: Date;
  y: number;
}

/**
 * Hydrometer chart data with timestamps + gravity/temp readings.
 */
export interface HydrometerChartProps {
  points: HydrometerPoint[];
  title?: string;
  compact?: boolean;
  gravityLabel: string;
  temperatureLabel: string;
  xAxisLabel?: string;
  gravityAxisLabel?: string;
  temperatureAxisLabel?: string;
}

export const DEFAULT_GRAVITY_COLOR = "#16a34a";
export const DEFAULT_TEMPERATURE_COLOR = "#2563eb";
export const DEFAULT_AXIS_COLOR = "#6b7280";

export function parseHydrometerDate(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toHydrometerSeries(
  points: HydrometerPoint[],
  key: "gravitySg" | "temperatureC",
): HydrometerSeriesPoint[] {
  return points
    .map((point) => {
      const x = parseHydrometerDate(point.at);
      const raw = point[key];
      return x && typeof raw === "number" ? { x, y: raw } : null;
    })
    .filter((point): point is HydrometerSeriesPoint => Boolean(point));
}

export function getHydrometerNumberDomain(values: number[]): [number, number] {
  if (!values.length) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [min - 1, max + 1];
  const pad = (max - min) * 0.08;
  return [min - pad, max + pad];
}

export function clampHydrometerDomain(
  domain: [number, number],
  minClamp: number,
  maxClamp: number,
): [number, number] {
  const [min, max] = domain;
  return [Math.max(minClamp, min), Math.min(maxClamp, max)];
}

export function mapHydrometerRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  const inSpan = Math.max(1e-9, inMax - inMin);
  const outSpan = outMax - outMin;
  const t = (value - inMin) / inSpan;
  return outMin + t * outSpan;
}

export function buildHydrometerTickValues(min: number, max: number, count: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (count <= 1) return [min];
  if (min === max) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}

export function formatHydrometerTime(value: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function buildHydrometerTooltipLabel(
  activePoints: Array<{ childName?: string; datum?: { x: Date; y: number; yRaw?: number } }>,
  gravityLabel: string,
  temperatureLabel: string,
): string {
  if (!activePoints.length) return "";
  const time = activePoints[0]?.datum?.x ? formatHydrometerTime(activePoints[0].datum.x) : "";
  const gravity = activePoints.find((p) => p.childName === "gravity")?.datum?.y;
  const temperatureDatum = activePoints.find((p) => p.childName === "temperature")?.datum;
  const temperature = temperatureDatum?.yRaw ?? temperatureDatum?.y;

  const gravityText = typeof gravity === "number" ? gravity.toFixed(3) : "—";
  const temperatureText = typeof temperature === "number" ? temperature.toFixed(2) : "—";

  return `${time}\n${gravityLabel}: ${gravityText}\n${temperatureLabel}: ${temperatureText}`;
}
