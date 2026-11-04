"use strict";
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

// src/edge.ts
var edge_exports = {};
__export(edge_exports, {
  BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP: () => BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP,
  getBuiltinSegmentOwnerEdge: () => getBuiltinSegmentOwnerEdge,
  isModuleOwnedPathDenied: () => isModuleOwnedPathDenied,
  resolveEnabledModuleCodesEdge: () => resolveEnabledModuleCodesEdge
});
module.exports = __toCommonJS(edge_exports);

// src/edgeEnabledModules.ts
var BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP = [
  { code: "automation", segments: ["vessels"] },
  {
    code: "brewery",
    segments: [
      "recipes",
      "inventory",
      "equipment",
      "water-profiles",
      "brewday-steps-settings",
      "ferm-data-integration"
    ]
  },
  { code: "crp", segments: ["capacity", "schedule", "resources"] },
  {
    code: "mrp",
    segments: ["production-orders", "work-orders", "material-requirements"]
  },
  {
    code: "pim",
    segments: ["products", "categories", "attribute-sets", "channels"]
  }
];
var PLATFORM_ENABLED = /* @__PURE__ */ new Set([
  "automation",
  "pim",
  "mrp",
  "crp"
]);
var REFERENCE_ENABLED = /* @__PURE__ */ new Set([
  "brewery",
  "automation",
  "pim",
  "mrp",
  "crp"
]);
var segmentOwnerCache;
function segmentOwnerMap() {
  if (segmentOwnerCache) return segmentOwnerCache;
  const map = /* @__PURE__ */ new Map();
  for (const entry of BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP) {
    for (const segment of entry.segments) {
      map.set(segment, entry.code);
    }
  }
  segmentOwnerCache = map;
  return map;
}
function getBuiltinSegmentOwnerEdge(segment) {
  return segmentOwnerMap().get(segment);
}
function resolveEnabledModuleCodesEdge(env = process.env) {
  const raw = env["UMBRACULUM_MODULE_PROFILE"]?.trim();
  const profile = raw && raw.length > 0 ? raw : "platform";
  if (profile === "reference") {
    return new Set(REFERENCE_ENABLED);
  }
  if (profile === "platform") {
    return new Set(PLATFORM_ENABLED);
  }
  if (profile === "minimal") {
    return /* @__PURE__ */ new Set();
  }
  return /* @__PURE__ */ new Set();
}
function isModuleOwnedPathDenied(input) {
  const { pathname, locales, env = process.env } = input;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return false;
  let segmentIndex = 0;
  if (locales.includes(parts[0])) {
    segmentIndex = 1;
  }
  const segment = parts[segmentIndex];
  if (!segment) return false;
  const owner = getBuiltinSegmentOwnerEdge(segment);
  if (!owner) return false;
  const enabled = resolveEnabledModuleCodesEdge(env);
  return !enabled.has(owner);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP,
  getBuiltinSegmentOwnerEdge,
  isModuleOwnedPathDenied,
  resolveEnabledModuleCodesEdge
});
