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
function resolveEnabledModuleCodesEdge(env = process.env) {
  const profile = env["UMBRACULUM_MODULE_PROFILE"]?.trim() ?? "minimal";
  if (profile === "reference") {
    return /* @__PURE__ */ new Set(["brewery", "automation", "pim", "mrp", "crp"]);
  }
  if (profile === "platform") {
    return /* @__PURE__ */ new Set(["automation", "pim", "mrp", "crp"]);
  }
  return /* @__PURE__ */ new Set();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP,
  resolveEnabledModuleCodesEdge
});
