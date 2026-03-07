"use client";
import {
  Card,
  Text
} from "../chunk-XF6MCNOA.js";

// src/charts/HydrometerChart.web.tsx
import { useMemo } from "react";
import { XStack, YStack } from "tamagui";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer
} from "victory";
import { jsx, jsxs } from "react/jsx-runtime";
var DEFAULT_GRAVITY_COLOR = "#16a34a";
var DEFAULT_TEMPERATURE_COLOR = "#2563eb";
var DEFAULT_AXIS_COLOR = "#6b7280";
var VictoryChartWithTitle = VictoryChart;
function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function toSeries(points, key) {
  return points.map((point) => {
    const x = parseDate(point.at);
    const raw = point[key];
    return x && typeof raw === "number" ? { x, y: raw } : null;
  }).filter((point) => Boolean(point));
}
function getNumberDomain(values) {
  if (!values.length) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return [min - 1, max + 1];
  const pad = (max - min) * 0.08;
  return [min - pad, max + pad];
}
function clampDomain(domain, minClamp, maxClamp) {
  const [min, max] = domain;
  return [Math.max(minClamp, min), Math.min(maxClamp, max)];
}
function mapRange(value, inMin, inMax, outMin, outMax) {
  const inSpan = Math.max(1e-9, inMax - inMin);
  const outSpan = outMax - outMin;
  const t = (value - inMin) / inSpan;
  return outMin + t * outSpan;
}
function buildTickValues(min, max, count) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (count <= 1) return [min];
  if (min === max) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}
function formatTime(value) {
  return new Intl.DateTimeFormat(void 0, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(
    value
  );
}
function buildTooltipLabel(activePoints, gravityLabel, temperatureLabel) {
  if (!activePoints.length) return "";
  const time = activePoints[0]?.datum?.x ? formatTime(activePoints[0].datum.x) : "";
  const gravity = activePoints.find((p) => p.childName === "gravity")?.datum?.y;
  const temperatureDatum = activePoints.find((p) => p.childName === "temperature")?.datum;
  const temperature = temperatureDatum?.yRaw ?? temperatureDatum?.y;
  const gravityText = typeof gravity === "number" ? gravity.toFixed(3) : "\u2014";
  const temperatureText = typeof temperature === "number" ? temperature.toFixed(2) : "\u2014";
  return `${time}
${gravityLabel}: ${gravityText}
${temperatureLabel}: ${temperatureText}`;
}
function HydrometerChart({
  points,
  title,
  compact = false,
  gravityLabel,
  temperatureLabel,
  xAxisLabel,
  gravityAxisLabel,
  temperatureAxisLabel
}) {
  const gravitySeries = useMemo(() => toSeries(points, "gravitySg"), [points]);
  const temperatureSeries = useMemo(() => toSeries(points, "temperatureC"), [points]);
  if (!gravitySeries.length && !temperatureSeries.length) return null;
  const gravityDomain = clampDomain(getNumberDomain(gravitySeries.map((p) => p.y)), 0.95, 1.2);
  const temperatureDomain = getNumberDomain(temperatureSeries.map((p) => p.y));
  const [gMin, gMax] = gravityDomain;
  const [tMin, tMax] = temperatureDomain;
  const temperatureSeriesMapped = useMemo(() => {
    if (!temperatureSeries.length) return [];
    return temperatureSeries.map((p) => ({
      x: p.x,
      y: mapRange(p.y, tMin, tMax, gMin, gMax),
      yRaw: p.y
    }));
  }, [temperatureSeries, tMin, tMax, gMin, gMax]);
  const temperatureAxisTickValues = useMemo(() => {
    if (!temperatureSeries.length) return [];
    const temps = buildTickValues(tMin, tMax, 5);
    return temps.map((temp) => mapRange(temp, tMin, tMax, gMin, gMax));
  }, [temperatureSeries.length, tMin, tMax, gMin, gMax]);
  const height = compact ? 220 : 320;
  const padding = compact ? { top: 24, bottom: 50, left: 52, right: 52 } : { top: 30, bottom: 60, left: 60, right: 60 };
  return /* @__PURE__ */ jsxs(YStack, { gap: "$2", marginTop: "$2", children: [
    title ? /* @__PURE__ */ jsx(Text, { fontSize: 12, color: "$gray11", children: title }) : null,
    /* @__PURE__ */ jsxs(Card, { role: "img", "aria-label": title ?? "Hydrometer chart", children: [
      /* @__PURE__ */ jsxs(
        VictoryChartWithTitle,
        {
          height,
          padding,
          domainPadding: { x: 12, y: 12 },
          domain: { y: gravityDomain },
          titleComponent: /* @__PURE__ */ jsx(VictoryLabel, {}),
          containerComponent: /* @__PURE__ */ jsx(
            VictoryVoronoiContainer,
            {
              voronoiDimension: "x",
              labels: ({ activePoints }) => buildTooltipLabel(activePoints ?? [], gravityLabel, temperatureLabel),
              labelComponent: /* @__PURE__ */ jsx(VictoryTooltip, { cornerRadius: 4, flyoutPadding: { top: 6, bottom: 6, left: 8, right: 8 } })
            }
          ),
          children: [
            /* @__PURE__ */ jsx(
              VictoryAxis,
              {
                label: xAxisLabel,
                style: {
                  axis: { stroke: DEFAULT_AXIS_COLOR },
                  tickLabels: { fill: DEFAULT_AXIS_COLOR, fontSize: 10 },
                  axisLabel: { fill: DEFAULT_AXIS_COLOR, fontSize: 11, padding: 30 }
                },
                tickFormat: (value) => new Intl.DateTimeFormat(void 0, { hour: "2-digit", minute: "2-digit" }).format(value)
              }
            ),
            /* @__PURE__ */ jsx(
              VictoryAxis,
              {
                dependentAxis: true,
                label: gravityAxisLabel ?? gravityLabel,
                style: {
                  axis: { stroke: DEFAULT_AXIS_COLOR },
                  tickLabels: { fill: DEFAULT_AXIS_COLOR, fontSize: 10, padding: 2 },
                  axisLabel: { fill: DEFAULT_AXIS_COLOR, fontSize: 11, padding: 46 }
                },
                tickFormat: (value) => value.toFixed(3)
              }
            ),
            /* @__PURE__ */ jsx(
              VictoryAxis,
              {
                dependentAxis: true,
                orientation: "right",
                label: temperatureAxisLabel ?? temperatureLabel,
                tickValues: temperatureAxisTickValues,
                style: {
                  axis: { stroke: DEFAULT_AXIS_COLOR },
                  tickLabels: { fill: DEFAULT_AXIS_COLOR, fontSize: 10, padding: 2 },
                  axisLabel: { fill: DEFAULT_AXIS_COLOR, fontSize: 11, padding: 46 }
                },
                tickFormat: (mapped) => mapRange(mapped, gMin, gMax, tMin, tMax).toFixed(1)
              }
            ),
            gravitySeries.length ? /* @__PURE__ */ jsx(
              VictoryLine,
              {
                name: "gravity",
                data: gravitySeries,
                style: { data: { stroke: DEFAULT_GRAVITY_COLOR, strokeWidth: 2 } }
              }
            ) : null,
            temperatureSeries.length ? /* @__PURE__ */ jsx(
              VictoryLine,
              {
                name: "temperature",
                data: temperatureSeriesMapped,
                style: { data: { stroke: DEFAULT_TEMPERATURE_COLOR, strokeWidth: 2 } }
              }
            ) : null
          ]
        }
      ),
      /* @__PURE__ */ jsxs(XStack, { gap: "$3", flexWrap: "wrap", marginTop: "$2", justifyContent: "flex-start", children: [
        /* @__PURE__ */ jsxs(Text, { fontSize: 12, color: "$gray11", children: [
          gravityLabel,
          " ",
          /* @__PURE__ */ jsx(Text, { color: DEFAULT_GRAVITY_COLOR, children: "\u25CF" })
        ] }),
        /* @__PURE__ */ jsxs(Text, { fontSize: 12, color: "$gray11", children: [
          temperatureLabel,
          " ",
          /* @__PURE__ */ jsx(Text, { color: DEFAULT_TEMPERATURE_COLOR, children: "\u25CF" })
        ] })
      ] })
    ] })
  ] });
}
export {
  HydrometerChart
};
