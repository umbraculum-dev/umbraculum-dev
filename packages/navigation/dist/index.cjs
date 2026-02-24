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
  getRouteAvailability: () => getRouteAvailability,
  hasWebFallback: () => hasWebFallback,
  isWebviewWhitelistRouteId: () => isWebviewWhitelistRouteId,
  routeToPath: () => routeToPath
});
module.exports = __toCommonJS(index_exports);
var WEBVIEW_WHITELIST_ROUTE_IDS = ["inventory"];
function isWebviewWhitelistRouteId(id) {
  return WEBVIEW_WHITELIST_ROUTE_IDS.includes(id);
}
function getRouteAvailability(id, platform) {
  if (platform === "web") return "available";
  if (isWebviewWhitelistRouteId(id)) return "whitelisted_web_fallback";
  return "blocked";
}
function hasWebFallback(id, platform) {
  return getRouteAvailability(id, platform) === "whitelisted_web_fallback";
}
function routeToPath(ref) {
  switch (ref.id) {
    case "dashboard":
      return "/";
    case "inventory":
      return "/inventory";
    case "recipes":
      return "/recipes";
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
  }
  const exhaustive = ref;
  throw new Error(`Unhandled route ref: ${String(exhaustive)}`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WEBVIEW_WHITELIST_ROUTE_IDS,
  getRouteAvailability,
  hasWebFallback,
  isWebviewWhitelistRouteId,
  routeToPath
});
