type AppPlatform = "web" | "native";
type RouteId = "dashboard" | "inventory" | "recipes" | "brewdayStepsSettings" | "waterProfiles" | "recipeEdit" | "waterHub" | "waterMash" | "waterSparge" | "waterBoil" | "yeast" | "equipment" | "fermDataIntegration" | "quality" | "login" | "vessels" | "vesselDetail" | "products" | "productDetail" | "categories" | "attributeSets" | "attributeSetDetail" | "productionOrders" | "productionOrderDetail" | "materialRequirements" | "capacity" | "schedule" | "resources" | "resourceDetail";
interface RouteParamsById {
    dashboard: Record<string, never>;
    inventory: Record<string, never>;
    recipes: Record<string, never>;
    brewdayStepsSettings: Record<string, never>;
    waterProfiles: Record<string, never>;
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
    vessels: Record<string, never>;
    vesselDetail: {
        vesselCode: string;
    };
    products: Record<string, never>;
    productDetail: {
        productId: string;
    };
    categories: Record<string, never>;
    attributeSets: Record<string, never>;
    attributeSetDetail: {
        setId: string;
    };
    productionOrders: Record<string, never>;
    productionOrderDetail: {
        orderId: string;
    };
    materialRequirements: Record<string, never>;
    capacity: Record<string, never>;
    schedule: Record<string, never>;
    resources: Record<string, never>;
    resourceDetail: {
        resourceId: string;
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
declare function prefixLocalePath(pathname: string, locale: string): string;
declare function routeToLocalePath(ref: RouteRef, locale: string): string;
interface AppRouter {
    push(ref: RouteRef): void;
    replace(ref: RouteRef): void;
    back(): void;
    isAvailable(ref: RouteRef, platform: AppPlatform): boolean;
    href(ref: RouteRef): string;
}

export { type AppPlatform, type AppRouter, type RouteAvailability, type RouteId, type RouteParamsById, type RouteRef, WEBVIEW_WHITELIST_ROUTE_IDS, getRouteAvailability, hasWebFallback, isWebviewWhitelistRouteId, prefixLocalePath, routeToLocalePath, routeToPath };
