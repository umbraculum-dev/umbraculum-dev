export type AppPlatform = "web" | "native";

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
  | "login";

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
}

export type RouteRef = {
  [K in RouteId]: { id: K; params: RouteParamsById[K] };
}[RouteId];

export type RouteAvailability = "available" | "blocked" | "whitelisted_web_fallback";

export const WEBVIEW_WHITELIST_ROUTE_IDS = ["inventory"] as const satisfies readonly RouteId[];

export function isWebviewWhitelistRouteId(id: RouteId): boolean {
  return (WEBVIEW_WHITELIST_ROUTE_IDS as readonly RouteId[]).includes(id);
}

const NATIVE_AVAILABLE_ROUTE_IDS = ["recipes", "recipeEdit"] as const satisfies readonly RouteId[];

export function getRouteAvailability(id: RouteId, platform: AppPlatform): RouteAvailability {
  if (platform === "web") return "available";

  // Native is "block by default" during the porting phase.
  // Promote routes to "available" as they get real native screens.
  if ((NATIVE_AVAILABLE_ROUTE_IDS as readonly RouteId[]).includes(id)) return "available";
  if (isWebviewWhitelistRouteId(id)) return "whitelisted_web_fallback";
  return "blocked";
}

export function hasWebFallback(id: RouteId, platform: AppPlatform): boolean {
  return getRouteAvailability(id, platform) === "whitelisted_web_fallback";
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

