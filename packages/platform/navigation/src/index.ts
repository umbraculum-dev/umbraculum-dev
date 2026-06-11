import {
  clearNativeRoutePolicyForTests,
  configureNativeRoutePolicy,
  getNativeAvailableRouteIds,
  getWebviewWhitelistRouteIds,
} from "./nativeRoutePolicy.js";

export type AppPlatform = "web" | "native";

// TODO(post-audit): canonical-module RouteIds added before the module-driven
// navigation registry (automation/PIM in Week 1, MRP/CRP in Wave 3) are
// hardcoded module-knowledge in the navigation package. The follow-on RFC
// ("module-driven navigation registry" — to be authored after Week 1 lands)
// should derive these from `@umbraculum/module-sdk`'s
// `listRegisteredWebModules()` so the navigation package no longer ships per-
// module branches. Tracked alongside
// `docs/design/web-route-group-audit.md` §5 ("D3 outcome").
export type RouteId =
  | "dashboard"
  | "inventory"
  | "recipes"
  | "brewdayStepsSettings"
  | "waterProfiles"
  | "recipeEdit"
  | "waterHub"
  | "waterMash"
  | "waterSparge"
  | "waterBoil"
  | "yeast"
  | "equipment"
  | "fermDataIntegration"
  | "quality"
  | "login"
  // Automation module — Week 1 audit (RFC-0006).
  | "vessels"
  | "vesselDetail"
  // PIM module — Week 1 audit (RFC-0006).
  | "products"
  | "productDetail"
  | "categories"
  | "attributeSets"
  | "attributeSetDetail"
  // MRP module — Wave 3 read-only alpha experience.
  | "productionOrders"
  | "productionOrderDetail"
  | "materialRequirements"
  // CRP module — Wave 3 read-only alpha experience.
  | "capacity"
  | "schedule"
  | "resources"
  | "resourceDetail";

export interface RouteParamsById {
  dashboard: Record<string, never>;
  inventory: Record<string, never>;
  recipes: Record<string, never>;
  brewdayStepsSettings: Record<string, never>;
  waterProfiles: Record<string, never>;
  recipeEdit: { recipeId: string };
  waterHub: { recipeId: string };
  waterMash: { recipeId: string };
  waterSparge: { recipeId: string };
  waterBoil: { recipeId: string };
  yeast: { recipeId: string };
  equipment: Record<string, never>;
  fermDataIntegration: Record<string, never>;
  quality: Record<string, never>;
  login: { next?: RouteRef };
  vessels: Record<string, never>;
  vesselDetail: { vesselCode: string };
  products: Record<string, never>;
  productDetail: { productId: string };
  categories: Record<string, never>;
  attributeSets: Record<string, never>;
  attributeSetDetail: { setId: string };
  productionOrders: Record<string, never>;
  productionOrderDetail: { orderId: string };
  materialRequirements: Record<string, never>;
  capacity: Record<string, never>;
  schedule: Record<string, never>;
  resources: Record<string, never>;
  resourceDetail: { resourceId: string };
}

export type RouteRef = {
  [K in RouteId]: { id: K; params: RouteParamsById[K] };
}[RouteId];

export type RouteAvailability = "available" | "blocked" | "whitelisted_web_fallback";

export const WEBVIEW_WHITELIST_ROUTE_IDS = [
  "inventory",
  "productionOrders",
  "materialRequirements",
  "capacity",
  "schedule",
  "resources",
] as const satisfies readonly RouteId[];

export {
  BREWERY_ROUTE_IDS,
  isBreweryRouteId,
  type BreweryRouteId,
} from "./breweryRouteIds.js";
export { clearNativeRoutePolicyForTests, configureNativeRoutePolicy };

export function isWebviewWhitelistRouteId(id: RouteId): boolean {
  return (getWebviewWhitelistRouteIds() as readonly RouteId[]).includes(id);
}

export function getRouteAvailability(id: RouteId, platform: AppPlatform): RouteAvailability {
  if (platform === "web") return "available";

  // Native is "block by default" during the porting phase.
  // Promote routes via registerNativeModule + configureNativeRoutePolicy at app bootstrap.
  if ((getNativeAvailableRouteIds() as readonly RouteId[]).includes(id)) return "available";
  if (isWebviewWhitelistRouteId(id)) return "whitelisted_web_fallback";
  return "blocked";
}

export function hasWebFallback(id: RouteId, platform: AppPlatform): boolean {
  return getRouteAvailability(id, platform) === "whitelisted_web_fallback";
}

/** Build a RouteRef for system-browser web fallback (empty-params routes only). */
export function buildWebFallbackRouteRef(id: RouteId): RouteRef | null {
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

export function routeToPath(ref: RouteRef): string {
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

  const exhaustive: never = ref;
  throw new Error(`Unhandled route ref: ${String(exhaustive)}`);
}

export function prefixLocalePath(pathname: string, locale: string): string {
  const l = String(locale || "").replace(/^\/+|\/+$/g, "");
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (!l) return p;
  if (p === `/${l}` || p.startsWith(`/${l}/`)) return p;
  if (p === "/") return `/${l}`;
  return `/${l}${p}`;
}

export function routeToLocalePath(ref: RouteRef, locale: string): string {
  return prefixLocalePath(routeToPath(ref), locale);
}

export interface AppRouter {
  push(ref: RouteRef): void;
  replace(ref: RouteRef): void;
  back(): void;

  isAvailable(ref: RouteRef, platform: AppPlatform): boolean;
  href(ref: RouteRef): string;
}

