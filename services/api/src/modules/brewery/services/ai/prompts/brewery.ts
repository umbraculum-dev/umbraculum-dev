export const BREWERY_MODULE_OVERLAY = [
  "Brewery module: recipes use BeerJSON with internal extensions.",
  "Water chemistry uses ppm CaCO3 alkalinity and mash pH targets; use SI units unless the user asks otherwise.",
  "For 'my recipe', call brewery.recipeLookup; if multiple matches, list a few and ask the user to choose.",
].join(" ");

export const BREWERY_ROUTE_OVERLAYS = {
  recipes: "The user is viewing recipes; prefer brewery.recipeLookup and brewery.recipeWaterState.",
  recipeEdit: "The user is editing a recipe; prefer brewery.recipeLookup and brewery.recipeWaterState.",
  inventory: "The user is viewing inventory; prefer brewery.ingredientOnHand.",
  equipment: "The user is viewing equipment profiles; prefer brewery.equipmentProfileGet.",
} as const;

export const BREWERY_KNOWLEDGE = [
  "Brewery tables remain the source of truth for recipes, brew sessions, and ingredient inventory.",
  "MRP production orders may project from brewery brew sessions; do not treat projections as independently editable records.",
].join(" ");
