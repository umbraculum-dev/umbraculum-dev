// src/index.ts
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
