"use strict";
"use client";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/charts/HydrometerChart.web.tsx
var HydrometerChart_web_exports = {};
__export(HydrometerChart_web_exports, {
  HydrometerChart: () => HydrometerChart
});
module.exports = __toCommonJS(HydrometerChart_web_exports);
var import_react = require("react");
var import_tamagui = require("tamagui");
var import_victory = require("victory");
var import_ui = require("@umbraculum/ui");

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

// src/charts/HydrometerChart.web.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var VictoryChartWithTitle = import_victory.VictoryChart;
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
  const gravitySeries = (0, import_react.useMemo)(() => toHydrometerSeries(points, "gravitySg"), [points]);
  const temperatureSeries = (0, import_react.useMemo)(() => toHydrometerSeries(points, "temperatureC"), [points]);
  if (!gravitySeries.length && !temperatureSeries.length) return null;
  const gravityDomain = clampHydrometerDomain(getHydrometerNumberDomain(gravitySeries.map((p) => p.y)), 0.95, 1.2);
  const temperatureDomain = getHydrometerNumberDomain(temperatureSeries.map((p) => p.y));
  const [gMin, gMax] = gravityDomain;
  const [tMin, tMax] = temperatureDomain;
  const temperatureSeriesMapped = (0, import_react.useMemo)(() => {
    if (!temperatureSeries.length) return [];
    return temperatureSeries.map((p) => ({
      x: p.x,
      y: mapHydrometerRange(p.y, tMin, tMax, gMin, gMax),
      yRaw: p.y
    }));
  }, [temperatureSeries, tMin, tMax, gMin, gMax]);
  const temperatureAxisTickValues = (0, import_react.useMemo)(() => {
    if (!temperatureSeries.length) return [];
    const temps = buildHydrometerTickValues(tMin, tMax, 5);
    return temps.map((temp) => mapHydrometerRange(temp, tMin, tMax, gMin, gMax));
  }, [temperatureSeries.length, tMin, tMax, gMin, gMax]);
  const height = compact ? 220 : 320;
  const padding = compact ? { top: 24, bottom: 50, left: 52, right: 52 } : { top: 30, bottom: 60, left: 60, right: 60 };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_tamagui.YStack, { gap: "$2", marginTop: "$2", children: [
    title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, { fontSize: 12, color: "$gray11", children: title }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Card, { role: "img", "aria-label": title ?? "Hydrometer chart", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        VictoryChartWithTitle,
        {
          height,
          padding,
          domainPadding: { x: 12, y: 12 },
          domain: { y: gravityDomain },
          titleComponent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_victory.VictoryLabel, {}),
          containerComponent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_victory.VictoryVoronoiContainer,
            {
              voronoiDimension: "x",
              labels: ({ activePoints }) => buildHydrometerTooltipLabel(activePoints ?? [], gravityLabel, temperatureLabel),
              labelComponent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_victory.VictoryTooltip, { cornerRadius: 4, flyoutPadding: { top: 6, bottom: 6, left: 8, right: 8 } })
            }
          ),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_victory.VictoryAxis,
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_victory.VictoryAxis,
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_victory.VictoryAxis,
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
            gravitySeries.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_victory.VictoryLine,
              {
                name: "gravity",
                data: gravitySeries,
                style: { data: { stroke: DEFAULT_GRAVITY_COLOR, strokeWidth: 2 } }
              }
            ) : null,
            temperatureSeries.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_victory.VictoryLine,
              {
                name: "temperature",
                data: temperatureSeriesMapped,
                style: { data: { stroke: DEFAULT_TEMPERATURE_COLOR, strokeWidth: 2 } }
              }
            ) : null
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_tamagui.XStack, { gap: "$3", flexWrap: "wrap", marginTop: "$2", justifyContent: "flex-start", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Text, { fontSize: 12, color: "$gray11", children: [
          gravityLabel,
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, { color: DEFAULT_GRAVITY_COLOR, children: "\u25CF" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Text, { fontSize: 12, color: "$gray11", children: [
          temperatureLabel,
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Text, { color: DEFAULT_TEMPERATURE_COLOR, children: "\u25CF" })
        ] })
      ] })
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HydrometerChart
});
