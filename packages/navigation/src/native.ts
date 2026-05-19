import type { RouteRef } from "./index.js";
import { routeToPath } from "./index.js";

/**
 * Framework-agnostic native navigation target.
 * React Navigation (or any other navigator) should map `screen` strings to actual screens in `apps/native`.
 */
export interface NativeRouteTarget {
  /**
   * Stable screen identifier (owned by the native app).
   */
  screen: string;
  /**
   * Native screen params (serializable).
   */
  params: Record<string, unknown>;
}

/**
 * Map a shared route ref into a native navigation target.
 *
 * Note: This function intentionally avoids importing React Navigation types so `@umbraculum/navigation` stays framework-agnostic.
 */
export function routeToNativeTarget(ref: RouteRef): NativeRouteTarget {
  switch (ref.id) {
    case "dashboard":
      return { screen: "Dashboard", params: {} };
    case "inventory":
      return { screen: "Inventory", params: {} };
    case "recipes":
      return { screen: "Recipes", params: {} };
    case "brewdayStepsSettings":
      return { screen: "BrewdayStepsSettings", params: {} };
    case "waterProfiles":
      return { screen: "WaterProfiles", params: {} };
    case "recipeEdit":
      return { screen: "RecipeEdit", params: { recipeId: ref.params.recipeId } };
    case "waterHub":
      return { screen: "WaterHub", params: { recipeId: ref.params.recipeId } };
    case "waterMash":
      return { screen: "WaterMash", params: { recipeId: ref.params.recipeId } };
    case "waterSparge":
      return { screen: "WaterSparge", params: { recipeId: ref.params.recipeId } };
    case "waterBoil":
      return { screen: "WaterBoil", params: { recipeId: ref.params.recipeId } };
    case "yeast":
      return { screen: "Yeast", params: { recipeId: ref.params.recipeId } };
    case "equipment":
      return { screen: "Equipment", params: {} };
    case "fermDataIntegration":
      return { screen: "FermDataIntegration", params: {} };
    case "quality":
      return { screen: "Quality", params: {} };
    case "login":
      return { screen: "Login", params: ref.params.next ? { next: ref.params.next } : {} };
  }

  const exhaustive: never = ref;
  throw new Error(`Unhandled route ref: ${String(exhaustive)}`);
}

/**
 * Convert a shared route ref into a deep-link path usable by native linking configuration.
 *
 * - Returns a non-locale-prefixed path (same as `routeToPath()`).
 * - The native app should prepend its own scheme/host and handle locale separately.
 */
export function nativeLinkingPath(ref: RouteRef): string {
  return routeToPath(ref);
}

