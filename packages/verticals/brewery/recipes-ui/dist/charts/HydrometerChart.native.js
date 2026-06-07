"use client";
import {
  DEFAULT_AXIS_COLOR,
  DEFAULT_GRAVITY_COLOR,
  DEFAULT_TEMPERATURE_COLOR,
  buildHydrometerTickValues,
  buildHydrometerTooltipLabel,
  clampHydrometerDomain,
  getHydrometerNumberDomain,
  mapHydrometerRange,
  toHydrometerSeries
} from "../chunk-AORPJNSQ.js";

// src/charts/HydrometerChart.native.tsx
import { useMemo } from "react";
import { XStack, YStack } from "tamagui";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer
} from "victory-native";
import { Card, Text } from "@umbraculum/ui";
import { jsx, jsxs } from "react/jsx-runtime";
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
  const gravitySeries = useMemo(() => toHydrometerSeries(points, "gravitySg"), [points]);
  const temperatureSeries = useMemo(() => toHydrometerSeries(points, "temperatureC"), [points]);
  if (!gravitySeries.length && !temperatureSeries.length) return null;
  const gravityDomain = clampHydrometerDomain(getHydrometerNumberDomain(gravitySeries.map((p) => p.y)), 0.95, 1.2);
  const temperatureDomain = getHydrometerNumberDomain(temperatureSeries.map((p) => p.y));
  const [gMin, gMax] = gravityDomain;
  const [tMin, tMax] = temperatureDomain;
  const temperatureSeriesMapped = useMemo(() => {
    if (!temperatureSeries.length) return [];
    return temperatureSeries.map((p) => ({
      x: p.x,
      y: mapHydrometerRange(p.y, tMin, tMax, gMin, gMax),
      yRaw: p.y
    }));
  }, [temperatureSeries, tMin, tMax, gMin, gMax]);
  const temperatureAxisTickValues = useMemo(() => {
    if (!temperatureSeries.length) return [];
    const temps = buildHydrometerTickValues(tMin, tMax, 5);
    return temps.map((temp) => mapHydrometerRange(temp, tMin, tMax, gMin, gMax));
  }, [temperatureSeries.length, tMin, tMax, gMin, gMax]);
  const height = compact ? 220 : 320;
  const padding = compact ? { top: 24, bottom: 50, left: 52, right: 52 } : { top: 30, bottom: 60, left: 60, right: 60 };
  return /* @__PURE__ */ jsxs(YStack, { gap: "$2", marginTop: "$2", children: [
    title ? /* @__PURE__ */ jsx(Text, { fontSize: 12, color: "$gray11", children: title }) : null,
    /* @__PURE__ */ jsxs(Card, { accessibilityRole: "image", accessibilityLabel: title ?? "Hydrometer chart", children: [
      /* @__PURE__ */ jsxs(
        VictoryChart,
        {
          height,
          padding,
          domainPadding: { x: 12, y: 12 },
          domain: { y: gravityDomain },
          containerComponent: /* @__PURE__ */ jsx(
            VictoryVoronoiContainer,
            {
              voronoiDimension: "x",
              labels: ({ activePoints }) => buildHydrometerTooltipLabel(activePoints ?? [], gravityLabel, temperatureLabel),
              labelComponent: /* @__PURE__ */ jsx(VictoryTooltip, { cornerRadius: 4, flyoutPadding: { top: 6, bottom: 6, left: 8, right: 8 } })
            }
          ),
          children: [
            /* @__PURE__ */ jsx(
              VictoryAxis,
              {
                ...xAxisLabel !== void 0 ? { label: xAxisLabel } : {},
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
                tickFormat: (mapped) => mapHydrometerRange(mapped, gMin, gMax, tMin, tMax).toFixed(1)
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
      /* @__PURE__ */ jsxs(XStack, { gap: "$3", flexWrap: "wrap", marginTop: "$2", children: [
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
