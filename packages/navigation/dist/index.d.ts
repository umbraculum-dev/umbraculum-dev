type AppPlatform = "web" | "native";
type RouteId = "dashboard" | "inventory" | "recipes" | "recipeEdit" | "waterHub" | "waterMash" | "waterSparge" | "waterBoil" | "yeast" | "equipment" | "fermDataIntegration" | "quality" | "login";
interface RouteParamsById {
    dashboard: Record<string, never>;
    inventory: Record<string, never>;
    recipes: Record<string, never>;
    recipeEdit: {
        recipeId: string;
    };
    waterHub: {
        recipeId: string;
    };
    waterMash: {
        recipeId: string;
    };
    waterSparge: {
        recipeId: string;
    };
    waterBoil: {
        recipeId: string;
    };
    yeast: {
        recipeId: string;
    };
    equipment: Record<string, never>;
    fermDataIntegration: Record<string, never>;
    quality: Record<string, never>;
    login: {
        next?: RouteRef;
    };
}
type RouteRef = {
    [K in RouteId]: {
        id: K;
        params: RouteParamsById[K];
    };
}[RouteId];
type RouteAvailability = "available" | "blocked" | "whitelisted_web_fallback";
declare const WEBVIEW_WHITELIST_ROUTE_IDS: readonly ["inventory"];
declare function isWebviewWhitelistRouteId(id: RouteId): boolean;
declare function getRouteAvailability(id: RouteId, platform: AppPlatform): RouteAvailability;
declare function hasWebFallback(id: RouteId, platform: AppPlatform): boolean;
declare function routeToPath(ref: RouteRef): string;
interface AppRouter {
    push(ref: RouteRef): void;
    replace(ref: RouteRef): void;
    back(): void;
    isAvailable(ref: RouteRef, platform: AppPlatform): boolean;
    href(ref: RouteRef): string;
}

export { type AppPlatform, type AppRouter, type RouteAvailability, type RouteId, type RouteParamsById, type RouteRef, WEBVIEW_WHITELIST_ROUTE_IDS, getRouteAvailability, hasWebFallback, isWebviewWhitelistRouteId, routeToPath };
