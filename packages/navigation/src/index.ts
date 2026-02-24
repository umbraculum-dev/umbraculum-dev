export type AppPlatform = "web" | "native";

export type RouteId =
  | "dashboard"
  | "inventory"
  | "recipes"
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

export function getRouteAvailability(id: RouteId, platform: AppPlatform): RouteAvailability {
  if (platform === "web") return "available";

  // Native is "block by default" during the porting phase.
  // Promote routes to "available" as they get real native screens.
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

export interface AppRouter {
  push(ref: RouteRef): void;
  replace(ref: RouteRef): void;
  back(): void;

  isAvailable(ref: RouteRef, platform: AppPlatform): boolean;
  href(ref: RouteRef): string;
}

