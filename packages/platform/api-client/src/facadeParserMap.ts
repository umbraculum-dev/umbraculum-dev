/**
 * First-tranche path → contracts parser map (OpenAPI path key → runtime parse).
 * Compile-time path types live on each facade module via PlatformOpenApiPaths.
 */
export const PLATFORM_FACADE_PARSER_MAP = {
  "/auth/me": "parseAuthMeResponse / AuthMeResponseSchema",
  "/auth/login": "AuthLoginResponseSchema",
  "/auth/login/native": "AuthLoginNativeResponseSchema",
  "/auth/logout": "AuthLogoutResponseSchema",
  "/auth/signup": "AuthSignupResponseSchema",
  "/auth/preferences": "AuthPreferencesPatchResponseSchema",
  "/auth/webview-exchange": "AuthWebviewExchangeResponseSchema",
  "/auth/active-workspace": "AuthActiveWorkspaceResponseSchema",
  "/workspaces": "WorkspacesListResponseSchema",
  "/health": "HealthResponseSchema",
  "/workspaces/{workspaceId}/billing": "WorkspaceBillingResponseSchema",
  "/workspaces/{workspaceId}/billing/intent": "BillingIntentResponseSchema",
  "/workspaces/{workspaceId}/ai/settings": "WorkspaceAiSettingsResponseSchema",
  "/workspaces/{workspaceId}/ai/usage": "WorkspaceAiUsageResponseSchema",
  "/ads/slot/{placement}": "AdSlotResponseSchema",
  "/platform/workspaces": "PlatformWorkspacesListResponseSchema",
  "/platform/recipes/list": "PlatformRecipesListResponseSchema",
  "/platform/recipes/import/preview": "PlatformRecipeImportPreviewResponseSchema",
  "/platform/recipes/import": "PlatformRecipeImportResponseSchema",
  "/platform/recipes/import/bulk/preview": "PlatformRecipeBulkImportPreviewResponseSchema",
  "/platform/recipes/import/bulk": "PlatformRecipeBulkImportResponseSchema",
  "/platform/ads": "PlatformAdsListResponseSchema / PlatformAdCreateResponseSchema",
  "/platform/ads/{id}": "PlatformAdOkResponseSchema (PATCH/DELETE)",
  "/workspaces/{workspaceId}/integrations/{kind}": "IntegrationGetResponseSchema / IntegrationCreateResponseSchema",
  "/workspaces/{workspaceId}/integrations/{kind}/reveal": "IntegrationRevealResponseSchema",
  "/workspaces/{workspaceId}/integrations/{kind}/rotate-token": "IntegrationCreateResponseSchema",
  "/workspaces/{workspaceId}/integrations/{kind}/revoke": "IntegrationOkResponseSchema",
  "/workspaces/{workspaceId}/integrations/{kind}/devices": "IntegrationDevicesListResponseSchema",
  "/workspaces/{workspaceId}/integrations/tilt/devices/{deviceId}/attach": "IntegrationDeviceAttachResponseSchema",
  "/workspaces/{workspaceId}/integrations/tilt/devices/{deviceId}/detach": "IntegrationDeviceDetachResponseSchema",
  "/workspaces/{workspaceId}/brew-sessions/recent": "BrewSessionsRecentResponseSchema",
  "/rendering/jobs/{jobId}": "RenderJobStatusResponseSchema",
  "/rendering/jobs/{jobId}/result": "RenderJobResultResponseSchema",
} as const;

export const AUTOMATION_FACADE_PARSER_MAP = {
  "/automation/vessels": "VesselListResponseSchema",
  "/automation/vessels/{code}": "VesselStateResponseSchema",
} as const;

export const PIM_FACADE_PARSER_MAP = {
  "/pim/products": "ProductListResponseSchema / ProductGetResponseSchema (POST)",
  "/pim/products/{productId}": "ProductGetResponseSchema",
  "/pim/products/{productId}/variants": "VariantListResponseSchema",
  "/pim/attributes": "AttributeListResponseSchema / AttributeGetResponseSchema (POST)",
  "/pim/attributes/{attributeId}": "AttributeGetResponseSchema / PimDeleteResponseSchema (DELETE)",
  "/pim/attribute-sets": "AttributeSetListResponseSchema",
  "/pim/attribute-sets/{setId}": "AttributeSetGetResponseSchema",
  "/pim/categories": "CategoryListResponseSchema",
  "/pim/products/{productId}/media-asset-refs":
    "MediaAssetRefListResponseSchema / MediaAssetRefGetResponseSchema (POST)",
  "/pim/media-asset-refs/{mediaAssetRefId}":
    "MediaAssetRefGetResponseSchema / PimDeleteResponseSchema (DELETE)",
} as const;

export const MRP_FACADE_PARSER_MAP = {
  "/mrp/boms": "BomListResponseSchema / BomGetResponseSchema (POST)",
  "/mrp/boms/{bomId}": "BomGetResponseSchema / MrpDeleteResponseSchema (DELETE)",
  "/mrp/work-orders/{orderId}/preview": "WorkOrderPreviewResponseSchema",
  "/mrp/work-orders/{orderId}/render-jobs": "RenderJobSubmitResponseSchema (POST)",
  "/mrp/production-orders/{orderId}/material-requirements/render-jobs":
    "RenderJobSubmitResponseSchema (POST)",
  "/mrp/production-orders/render-jobs": "RenderJobSubmitResponseSchema (POST)",
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
  "/crp/capacity-load/render-jobs": "RenderJobSubmitResponseSchema (POST)",
  "/crp/schedule/render-jobs": "RenderJobSubmitResponseSchema (POST)",
  "/crp/resources/calendar/render-jobs": "RenderJobSubmitResponseSchema (POST)",
  "/crp/conflicts/render-jobs": "RenderJobSubmitResponseSchema (POST)",
} as const;
