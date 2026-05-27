import type { RouteId } from "./index.js";

/**
 * Runtime native route policy. Defaults match the brewery porting-phase baseline;
 * the native app calls `configureNativeRoutePolicy` at bootstrap after
 * `registerNativeModule` aggregation.
 */
let configuredAvailable: readonly RouteId[] | null = null;
let configuredWebFallback: readonly RouteId[] | null = null;

const DEFAULT_NATIVE_AVAILABLE_ROUTE_IDS = [
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
  "brewdayStepsSettings",
] as const satisfies readonly RouteId[];

const DEFAULT_WEBVIEW_WHITELIST_ROUTE_IDS = [
  "inventory",
  "productionOrders",
  "materialRequirements",
  "capacity",
  "schedule",
  "resources",
] as const satisfies readonly RouteId[];

export function configureNativeRoutePolicy(options: {
  availableRouteIds: readonly RouteId[];
  webFallbackRouteIds?: readonly RouteId[];
}): void {
  configuredAvailable = [...options.availableRouteIds];
  configuredWebFallback =
    options.webFallbackRouteIds !== undefined
      ? [...options.webFallbackRouteIds]
      : [...DEFAULT_WEBVIEW_WHITELIST_ROUTE_IDS];
}

export function getNativeAvailableRouteIds(): readonly RouteId[] {
  return configuredAvailable ?? DEFAULT_NATIVE_AVAILABLE_ROUTE_IDS;
}

export function getWebviewWhitelistRouteIds(): readonly RouteId[] {
  return configuredWebFallback ?? DEFAULT_WEBVIEW_WHITELIST_ROUTE_IDS;
}

/** Test-only reset. */
export function clearNativeRoutePolicyForTests(): void {
  configuredAvailable = null;
  configuredWebFallback = null;
}
