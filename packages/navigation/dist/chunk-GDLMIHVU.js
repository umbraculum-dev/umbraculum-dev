// src/index.ts
var WEBVIEW_WHITELIST_ROUTE_IDS = ["inventory"];
function isWebviewWhitelistRouteId(id) {
  return WEBVIEW_WHITELIST_ROUTE_IDS.includes(id);
}
var NATIVE_AVAILABLE_ROUTE_IDS = [
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
function getRouteAvailability(id, platform) {
  if (platform === "web") return "available";
  if (NATIVE_AVAILABLE_ROUTE_IDS.includes(id)) return "available";
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
  WEBVIEW_WHITELIST_ROUTE_IDS,
  isWebviewWhitelistRouteId,
  getRouteAvailability,
  hasWebFallback,
  routeToPath,
  prefixLocalePath,
  routeToLocalePath
};
