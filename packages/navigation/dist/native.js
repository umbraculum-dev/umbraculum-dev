import {
  routeToPath
} from "./chunk-UL6JRGF6.js";

// src/native.ts
function routeToNativeTarget(ref) {
  switch (ref.id) {
    case "dashboard":
      return { screen: "Dashboard", params: {} };
    case "inventory":
      return { screen: "Inventory", params: {} };
    case "recipes":
      return { screen: "Recipes", params: {} };
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
