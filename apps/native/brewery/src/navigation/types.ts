/**
 * Shared navigation types for the React Native app.
 *
 * `AppNavigator.tsx` imports its own screens at the top, so screens that need
 * the param list type must not import from `AppNavigator.tsx` (would cause a
 * circular type/value reference). This file is the single source of truth.
 */

export type TabParamList = {
  Dashboard: undefined;
  Recipes: undefined;
  Inventory: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  SelectWorkspace: undefined;
  RecipeEdit: { recipeId: string };
  BrewSessionsList: { recipeId: string };
  BrewSessionDetail: { recipeId: string; brewSessionId: string };
  RecipeYeast: { recipeId: string };
  WaterHub: { recipeId: string };
  WaterMash: { recipeId: string };
  WaterSparge: { recipeId: string };
  WaterBoil: { recipeId: string };
  About: undefined;
  Ai: undefined;
  Contributing: { topic?: "i18n" | "raw-materials" } | undefined;
  Equipment: undefined;
  BrewdayStepsSettings: undefined;
  FermDataIntegration: undefined;
  WaterProfiles: undefined;
};
