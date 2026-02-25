"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/native.ts
var native_exports = {};
__export(native_exports, {
  nativeLinkingPath: () => nativeLinkingPath,
  routeToNativeTarget: () => routeToNativeTarget
});
module.exports = __toCommonJS(native_exports);

// src/index.ts
function routeToPath(ref) {
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
  const exhaustive = ref;
  throw new Error(`Unhandled route ref: ${String(exhaustive)}`);
}

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
  }
  const exhaustive = ref;
  throw new Error(`Unhandled route ref: ${String(exhaustive)}`);
}
function nativeLinkingPath(ref) {
  return routeToPath(ref);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  nativeLinkingPath,
  routeToNativeTarget
});
