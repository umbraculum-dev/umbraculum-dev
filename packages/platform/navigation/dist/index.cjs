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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  WEBVIEW_WHITELIST_ROUTE_IDS: () => WEBVIEW_WHITELIST_ROUTE_IDS,
  buildWebFallbackRouteRef: () => buildWebFallbackRouteRef,
  clearNativeRoutePolicyForTests: () => clearNativeRoutePolicyForTests,
  configureNativeRoutePolicy: () => configureNativeRoutePolicy,
  getRouteAvailability: () => getRouteAvailability,
  hasWebFallback: () => hasWebFallback,
  isWebviewWhitelistRouteId: () => isWebviewWhitelistRouteId,
  prefixLocalePath: () => prefixLocalePath,
  routeToLocalePath: () => routeToLocalePath,
  routeToPath: () => routeToPath
});
module.exports = __toCommonJS(index_exports);

// src/nativeRoutePolicy.ts
var configuredAvailable = null;
var configuredWebFallback = null;
var DEFAULT_NATIVE_AVAILABLE_ROUTE_IDS = [
  "recipes",
  "recipeEdit",
  "equipment",
  "waterHub",
  "waterMash",
  "waterSparge",
  "waterBoil",
  "waterProfiles",
  "fermDataIntegration",
  "yeast",
  "brewdayStepsSettings"
];
var DEFAULT_WEBVIEW_WHITELIST_ROUTE_IDS = [
  "inventory",
  "productionOrders",
  "materialRequirements",
  "capacity",
  "schedule",
  "resources"
];
function configureNativeRoutePolicy(options) {
  configuredAvailable = [...options.availableRouteIds];
  configuredWebFallback = options.webFallbackRouteIds !== void 0 ? [...options.webFallbackRouteIds] : [...DEFAULT_WEBVIEW_WHITELIST_ROUTE_IDS];
}
function getNativeAvailableRouteIds() {
  return configuredAvailable ?? DEFAULT_NATIVE_AVAILABLE_ROUTE_IDS;
}
function getWebviewWhitelistRouteIds() {
  return configuredWebFallback ?? DEFAULT_WEBVIEW_WHITELIST_ROUTE_IDS;
}
function clearNativeRoutePolicyForTests() {
  configuredAvailable = null;
  configuredWebFallback = null;
}

// src/index.ts
var WEBVIEW_WHITELIST_ROUTE_IDS = [
  "inventory",
  "productionOrders",
  "materialRequirements",
  "capacity",
  "schedule",
  "resources"
];
function isWebviewWhitelistRouteId(id) {
  return getWebviewWhitelistRouteIds().includes(id);
}
function getRouteAvailability(id, platform) {
  if (platform === "web") return "available";
  if (getNativeAvailableRouteIds().includes(id)) return "available";
  if (isWebviewWhitelistRouteId(id)) return "whitelisted_web_fallback";
  return "blocked";
}
function hasWebFallback(id, platform) {
  return getRouteAvailability(id, platform) === "whitelisted_web_fallback";
}
function buildWebFallbackRouteRef(id) {
  switch (id) {
    case "inventory":
      return { id: "inventory", params: {} };
    case "productionOrders":
      return { id: "productionOrders", params: {} };
    case "materialRequirements":
      return { id: "materialRequirements", params: {} };
    case "capacity":
      return { id: "capacity", params: {} };
    case "schedule":
      return { id: "schedule", params: {} };
    case "resources":
      return { id: "resources", params: {} };
    default:
      return null;
  }
}
function routeToPath(ref) {
  switch (ref.id) {
    case "dashboard":
      return "/";
    case "inventory":
      return "/inventory";
    case "recipes":
      return "/recipes";
    case "brewdayStepsSettings":
      return "/brewday-steps-settings";
    case "waterProfiles":
      return "/water-profiles";
    case "recipeEdit":
      return `/recipes/${ref.params.recipeId}/edit`;
    case "waterHub":
      return `/recipes/${ref.params.recipeId}/water`;
    case "waterMash":
      return `/recipes/${ref.params.recipeId}/water/mash`;
    case "waterSparge":
      return `/recipes/${ref.params.recipeId}/water/sparge`;
    case "waterBoil":
      return `/recipes/${ref.params.recipeId}/water/boil`;
    case "yeast":
      return `/recipes/${ref.params.recipeId}/yeast`;
    case "equipment":
      return "/equipment";
    case "fermDataIntegration":
      return "/ferm-data-integration";
    case "quality":
      return "/quality";
    case "login":
      return "/login";
    case "vessels":
      return "/vessels";
    case "vesselDetail":
      return `/vessels/${ref.params.vesselCode}`;
    case "products":
      return "/products";
    case "productDetail":
      return `/products/${ref.params.productId}`;
    case "categories":
      return "/categories";
    case "attributeSets":
      return "/attribute-sets";
    case "attributeSetDetail":
      return `/attribute-sets/${ref.params.setId}`;
    case "productionOrders":
      return "/production-orders";
    case "productionOrderDetail":
      return `/production-orders/${ref.params.orderId}`;
    case "materialRequirements":
      return "/material-requirements";
    case "capacity":
      return "/capacity";
    case "schedule":
      return "/schedule";
    case "resources":
      return "/resources";
    case "resourceDetail":
      return `/resources/${ref.params.resourceId}`;
  }
  const exhaustive = ref;
  throw new Error(`Unhandled route ref: ${String(exhaustive)}`);
}
function prefixLocalePath(pathname, locale) {
  const l = String(locale || "").replace(/^\/+|\/+$/g, "");
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (!l) return p;
  if (p === `/${l}` || p.startsWith(`/${l}/`)) return p;
  if (p === "/") return `/${l}`;
  return `/${l}${p}`;
}
function routeToLocalePath(ref, locale) {
  return prefixLocalePath(routeToPath(ref), locale);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WEBVIEW_WHITELIST_ROUTE_IDS,
  buildWebFallbackRouteRef,
  clearNativeRoutePolicyForTests,
  configureNativeRoutePolicy,
  getRouteAvailability,
  hasWebFallback,
  isWebviewWhitelistRouteId,
  prefixLocalePath,
  routeToLocalePath,
  routeToPath
});
