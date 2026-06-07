/** OpenAPI-derived path/component types (Phase E — platform catalog + brewery add-on). */
export type {
  components as PlatformOpenApiComponents,
  operations as PlatformOpenApiOperations,
  paths as PlatformOpenApiPaths,
} from "./generated/platform.openapi.js";

export type {
  components as BreweryOpenApiComponents,
  operations as BreweryOpenApiOperations,
  paths as BreweryOpenApiPaths,
} from "./generated/brewery.openapi.js";
