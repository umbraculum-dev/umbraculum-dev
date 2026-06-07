import {
  routeToPath
} from "./chunk-Y7D2EQHA.js";

// src/native.ts
function routeToNativeTarget(ref) {
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
    case "vessels":
    case "vesselDetail":
    case "products":
    case "productDetail":
    case "categories":
    case "attributeSets":
    case "attributeSetDetail":
    case "productionOrders":
    case "productionOrderDetail":
    case "materialRequirements":
    case "capacity":
    case "schedule":
    case "resources":
    case "resourceDetail":
      throw new Error(
        `routeToNativeTarget(${ref.id}): no native target \u2014 this RouteId is web-only and must be gated by getRouteAvailability(_, "native") === "blocked"`
      );
  }
  const exhaustive = ref;
  throw new Error(`Unhandled route ref: ${String(exhaustive)}`);
}
function nativeLinkingPath(ref) {
  return routeToPath(ref);
}
export {
  nativeLinkingPath,
  routeToNativeTarget
};
