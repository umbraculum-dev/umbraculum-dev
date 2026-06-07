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

export {
  configureNativeRoutePolicy,
  clearNativeRoutePolicyForTests,
  WEBVIEW_WHITELIST_ROUTE_IDS,
  isWebviewWhitelistRouteId,
  getRouteAvailability,
  hasWebFallback,
  buildWebFallbackRouteRef,
  routeToPath,
  prefixLocalePath,
  routeToLocalePath
};
