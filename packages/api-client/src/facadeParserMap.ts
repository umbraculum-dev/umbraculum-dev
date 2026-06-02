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
  "/water-calc/salt-additions": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/mash-ph-estimate": "WaterCalcResultOnlyResponseSchema",
  "/water-calc/mash-overall": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/sparge-overall": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/boil-overall": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/sparge-acidification": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/sparge-acidification-manual": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/mash-acidification": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/mash-acidification-manual": "WaterCalcWithDerivationResponseSchema",
  "/water-calc/mash-acidification-target-mash-ph": "WaterCalcResultOnlyResponseSchema",
} as const;

export const AUTOMATION_FACADE_PARSER_MAP = {
  "/automation/vessels": "VesselListResponseSchema",
  "/automation/vessels/{code}": "VesselStateResponseSchema",
} as const;

export const PIM_FACADE_PARSER_MAP = {
  "/pim/products": "ProductListResponseSchema / ProductGetResponseSchema (POST)",
  "/pim/products/{productId}": "ProductGetResponseSchema",
  "/pim/products/{productId}/variants": "VariantListResponseSchema",
  "/pim/attribute-sets": "AttributeSetListResponseSchema",
  "/pim/attribute-sets/{setId}": "AttributeSetGetResponseSchema",
  "/pim/categories": "CategoryListResponseSchema",
} as const;

export const MRP_FACADE_PARSER_MAP = {
  "/mrp/production-orders": "ProductionOrderListResponseSchema",
  "/mrp/production-orders/{orderId}": "ProductionOrderGetResponseSchema",
  "/mrp/production-orders/{orderId}/material-requirements": "MaterialRequirementListResponseSchema",
} as const;

export const CRP_FACADE_PARSER_MAP = {
  "/crp/resources": "ResourceListResponseSchema",
  "/crp/resources/{resourceId}": "ResourceGetResponseSchema",
  "/crp/work-centers": "WorkCenterListResponseSchema",
  "/crp/scheduled-operations": "ScheduledOperationListResponseSchema",
  "/crp/conflicts": "CapacityConflictListResponseSchema",
  "/crp/capacity-load": "CapacityLoadResponseSchema",
} as const;
