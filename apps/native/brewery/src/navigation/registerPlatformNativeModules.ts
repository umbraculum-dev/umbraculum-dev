import {
  aggregateNativeAvailableRouteIds,
  clearNativeModuleRegistryForTests,
  registerNativeModule,
} from "@umbraculum/module-sdk/native";
import {
  clearNativeRoutePolicyForTests,
  configureNativeRoutePolicy,
  type RouteId,
  WEBVIEW_WHITELIST_ROUTE_IDS,
} from "@umbraculum/navigation";

const BREWERY_NATIVE_ROUTE_IDS = [
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

let bootstrapped = false;

/**
 * Register installed native modules and sync route availability policy.
 * Idempotent — safe to call once at app entry.
 *
 * This binary is the brewery vertical app, so brewery is always registered.
 * Do not call `isModuleEnabled` from the main `@umbraculum/module-sdk` barrel —
 * that pulls install-profile Node `fs` into the Metro graph and breaks Expo Go.
 */
export function registerPlatformNativeModules(): void {
  if (bootstrapped) return;

  registerNativeModule({
    code: "brewery",
    availableRouteIds: [...BREWERY_NATIVE_ROUTE_IDS],
    tabEntry: { labelKey: "nav.recipes", order: 10 },
  });

  const available = aggregateNativeAvailableRouteIds() as RouteId[];
  configureNativeRoutePolicy({
    availableRouteIds: available,
    webFallbackRouteIds: [...WEBVIEW_WHITELIST_ROUTE_IDS],
  });

  bootstrapped = true;
}

/** Test-only reset (vitest). */
export function resetPlatformNativeModulesForTests(): void {
  bootstrapped = false;
  clearNativeModuleRegistryForTests();
  clearNativeRoutePolicyForTests();
}
