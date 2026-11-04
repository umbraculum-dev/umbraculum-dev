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

export {
  BUILTIN_WEB_MODULE_SEGMENT_OWNERSHIP,
  getBuiltinSegmentOwnerEdge,
  resolveEnabledModuleCodesEdge,
  isModuleOwnedPathDenied
};
