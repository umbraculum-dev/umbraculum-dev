// src/charts/hydrometerChartShared.ts
var DEFAULT_GRAVITY_COLOR = "#16a34a";
var DEFAULT_TEMPERATURE_COLOR = "#2563eb";
var DEFAULT_AXIS_COLOR = "#6b7280";
function parseHydrometerDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function toHydrometerSeries(points, key) {
  return points.map((point) => {
    const x = parseHydrometerDate(point.at);
    const raw = point[key];
    return x && typeof raw === "number" ? { x, y: raw } : null;
  }).filter((point) => Boolean(point));
}
function getHydrometerNumberDomain(values) {
  if (!values.length) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [min - 1, max + 1];
  const pad = (max - min) * 0.08;
  return [min - pad, max + pad];
}
function clampHydrometerDomain(domain, minClamp, maxClamp) {
  const [min, max] = domain;
  return [Math.max(minClamp, min), Math.min(maxClamp, max)];
}
function mapHydrometerRange(value, inMin, inMax, outMin, outMax) {
  const inSpan = Math.max(1e-9, inMax - inMin);
  const outSpan = outMax - outMin;
  const t = (value - inMin) / inSpan;
  return outMin + t * outSpan;
}
function buildHydrometerTickValues(min, max, count) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (count <= 1) return [min];
  if (min === max) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}
function formatHydrometerTime(value) {
  return new Intl.DateTimeFormat(void 0, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}
function buildHydrometerTooltipLabel(activePoints, gravityLabel, temperatureLabel) {
  if (!activePoints.length) return "";
  const time = activePoints[0]?.datum?.x ? formatHydrometerTime(activePoints[0].datum.x) : "";
  const gravity = activePoints.find((p) => p.childName === "gravity")?.datum?.y;
  const temperatureDatum = activePoints.find((p) => p.childName === "temperature")?.datum;
  const temperature = temperatureDatum?.yRaw ?? temperatureDatum?.y;
  const gravityText = typeof gravity === "number" ? gravity.toFixed(3) : "\u2014";
  const temperatureText = typeof temperature === "number" ? temperature.toFixed(2) : "\u2014";
  return `${time}
${gravityLabel}: ${gravityText}
${temperatureLabel}: ${temperatureText}`;
}

export {
  DEFAULT_GRAVITY_COLOR,
  DEFAULT_TEMPERATURE_COLOR,
  DEFAULT_AXIS_COLOR,
  toHydrometerSeries,
  getHydrometerNumberDomain,
  clampHydrometerDomain,
  mapHydrometerRange,
  buildHydrometerTickValues,
  buildHydrometerTooltipLabel
};
