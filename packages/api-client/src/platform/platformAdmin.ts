import {
  PlatformAdCreateRequestSchema,
  PlatformAdCreateResponseSchema,
  PlatformAdOkResponseSchema,
  PlatformAdPatchRequestSchema,
  PlatformAdsListResponseSchema,
  PlatformRecipeBulkImportPreviewRequestSchema,
  PlatformRecipeBulkImportPreviewResponseSchema,
  PlatformRecipeBulkImportRequestSchema,
  PlatformRecipeBulkImportResponseSchema,
  PlatformRecipeImportPreviewRequestSchema,
  PlatformRecipeImportPreviewResponseSchema,
  PlatformRecipeImportRequestSchema,
  PlatformRecipeImportResponseSchema,
  PlatformRecipesListQuerySchema,
  PlatformRecipesListResponseSchema,
  PlatformWorkspacesListResponseSchema,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { deleteParsed, getParsed, patchParsed, postParsed } from "../internal/httpJson.js";

export async function listPlatformWorkspaces(client: ApiClient) {
  return getParsed(client, toClientPath("/platform/workspaces"), (data) =>
    PlatformWorkspacesListResponseSchema.parse(data),
  );
}

export async function listPlatformRecipes(client: ApiClient, workspaceId: string) {
  const query = PlatformRecipesListQuerySchema.parse({ workspaceId });
  const qs = `?workspaceId=${encodeURIComponent(query.workspaceId)}`;
  return getParsed(client, `${toClientPath("/platform/recipes/list")}${qs}`, (data) =>
    PlatformRecipesListResponseSchema.parse(data),
  );
}

export async function previewPlatformRecipeImport(client: ApiClient, body: unknown) {
  const parsedBody = PlatformRecipeImportPreviewRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/platform/recipes/import/preview"),
    parsedBody,
    (data) => PlatformRecipeImportPreviewResponseSchema.parse(data),
  );
}

export async function importPlatformRecipe(client: ApiClient, body: unknown) {
  const parsedBody = PlatformRecipeImportRequestSchema.parse(body);
  return postParsed(client, toClientPath("/platform/recipes/import"), parsedBody, (data) =>
    PlatformRecipeImportResponseSchema.parse(data),
  );
}

export async function previewPlatformBulkRecipeImport(client: ApiClient, body: unknown) {
  const parsedBody = PlatformRecipeBulkImportPreviewRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/platform/recipes/import/bulk/preview"),
    parsedBody,
    (data) => PlatformRecipeBulkImportPreviewResponseSchema.parse(data),
  );
}

export async function importPlatformRecipesBulk(client: ApiClient, body: unknown) {
  const parsedBody = PlatformRecipeBulkImportRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/platform/recipes/import/bulk"),
    parsedBody,
    (data) => PlatformRecipeBulkImportResponseSchema.parse(data),
  );
}

export async function listPlatformAds(client: ApiClient) {
  return getParsed(client, toClientPath("/platform/ads"), (data) =>
    PlatformAdsListResponseSchema.parse(data),
  );
}

export async function createPlatformAd(client: ApiClient, body: unknown) {
  const parsedBody = PlatformAdCreateRequestSchema.parse(body);
  return postParsed(client, toClientPath("/platform/ads"), parsedBody, (data) =>
    PlatformAdCreateResponseSchema.parse(data),
  );
}

export async function patchPlatformAd(client: ApiClient, adId: string, body: unknown) {
  const parsedBody = PlatformAdPatchRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath(`/platform/ads/${encodeURIComponent(adId)}`),
    parsedBody,
    (data) => PlatformAdOkResponseSchema.parse(data),
  );
}

export async function deletePlatformAd(client: ApiClient, adId: string) {
  return deleteParsed(
    client,
    toClientPath(`/platform/ads/${encodeURIComponent(adId)}`),
    (data) => PlatformAdOkResponseSchema.parse(data),
  );
}
