/** Brewery-vertical RouteIds — gated when brewery is not in the installation profile. */
export const BREWERY_ROUTE_IDS = [
  "dashboard",
  "inventory",
  "recipes",
  "brewdayStepsSettings",
  "waterProfiles",
  "recipeEdit",
  "waterHub",
  "waterMash",
  "waterSparge",
  "waterBoil",
  "yeast",
  "equipment",
  "fermDataIntegration",
  "quality",
] as const;

export type BreweryRouteId = (typeof BREWERY_ROUTE_IDS)[number];

export function isBreweryRouteId(id: string): id is BreweryRouteId {
  return (BREWERY_ROUTE_IDS as readonly string[]).includes(id);
}
