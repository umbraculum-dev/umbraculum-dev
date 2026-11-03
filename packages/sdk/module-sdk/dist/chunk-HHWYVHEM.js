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

export {
  BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP,
  resolveEnabledModuleCodesEdge
};
