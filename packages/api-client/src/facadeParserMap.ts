/**
 * First-tranche path → contracts parser map (OpenAPI path key → runtime parse).
 * Compile-time path types live on each facade module via PlatformOpenApiPaths / BreweryOpenApiPaths.
 */
export const PLATFORM_FACADE_PARSER_MAP = {
  "/auth/me": "parseAuthMeResponse / AuthMeResponseSchema",
  "/auth/login": "AuthLoginResponseSchema",
  "/auth/login/native": "AuthLoginNativeResponseSchema",
  "/workspaces": "WorkspacesListResponseSchema",
  "/health": "HealthResponseSchema",
  "/workspaces/{workspaceId}/billing": "WorkspaceBillingResponseSchema",
  "/workspaces/{workspaceId}/integrations/{kind}/devices": "IntegrationDevicesListResponseSchema",
  "/rendering/jobs/{jobId}": "RenderJobStatusResponseSchema",
  "/rendering/jobs/{jobId}/result": "RenderJobResultResponseSchema",
} as const;

export const BREWERY_FACADE_PARSER_MAP = {
  "/recipes": "parseRecipesListResponse",
  "/recipes/{id}": "RecipeResponseSchema",
  "/recipes/{recipeId}/brew-sessions": "parseBrewSessionsListResponse",
  "/recipes/{id}/water-hub-summary": "parseRecipeWaterHubSummaryResponse",
  "/water-profiles": "parseWaterProfilesResponse / WaterProfileResponseSchema",
  "/water-profiles/{id}/verify": "OkResponseSchema",
  "/water-profiles/{id}/unverify": "OkResponseSchema",
  "/water-profiles/{id}": "OkResponseSchema (DELETE)",
  "/recipes/{id}/water-settings": "RecipeWaterSettingsGetResponseSchema / RecipeWaterSettingsPutResponseSchema",
  "/recipes/{id}/water-settings/mash/compute-and-save": "parseMashComputeAndSaveResponse",
  "/recipes/{id}/water-settings/sparge/compute-and-save": "parseSpargeComputeAndSaveResponse",
  "/recipes/{id}/water-settings/boil/compute-and-save": "parseBoilComputeAndSaveResponse",
} as const;
