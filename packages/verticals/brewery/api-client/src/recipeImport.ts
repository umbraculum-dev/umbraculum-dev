import { RecipeBulkImportPreviewResponseSchema, RecipeBulkImportRequestSchema, RecipeBulkImportResponseSchema, RecipeImportPreviewResponseSchema, RecipeImportRequestSchema, RecipeImportResponseSchema } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "@umbraculum/api-client";
import { toClientPath } from "@umbraculum/api-client/transport";
import { postParsed } from "@umbraculum/api-client/transport";
import type { BreweryOpenApiPaths } from "@umbraculum/api-client";

type RecipeImportPreviewPath = "/recipes/import/preview";
type RecipeImportPreviewPost = BreweryOpenApiPaths[RecipeImportPreviewPath]["post"];

type RecipeImportPath = "/recipes/import";
type RecipeImportPost = BreweryOpenApiPaths[RecipeImportPath]["post"];

type RecipeBulkImportPreviewPath = "/recipes/import/bulk/preview";
type RecipeBulkImportPreviewPost = BreweryOpenApiPaths[RecipeBulkImportPreviewPath]["post"];

type RecipeBulkImportPath = "/recipes/import/bulk";
type RecipeBulkImportPost = BreweryOpenApiPaths[RecipeBulkImportPath]["post"];

export type {
  RecipeImportPreviewPost,
  RecipeImportPost,
  RecipeBulkImportPreviewPost,
  RecipeBulkImportPost,
};

export async function previewRecipeImport(client: ApiClient, body: unknown) {
  const parsedBody = RecipeImportRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/recipes/import/preview"),
    parsedBody,
    (data) => RecipeImportPreviewResponseSchema.parse(data),
  );
}

export async function importRecipe(client: ApiClient, body: unknown) {
  const parsedBody = RecipeImportRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/recipes/import"),
    parsedBody,
    (data) => RecipeImportResponseSchema.parse(data),
  );
}

export async function previewBulkRecipeImport(client: ApiClient, body: unknown) {
  const parsedBody = RecipeBulkImportRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/recipes/import/bulk/preview"),
    parsedBody,
    (data) => RecipeBulkImportPreviewResponseSchema.parse(data),
  );
}

export async function importRecipesBulk(client: ApiClient, body: unknown) {
  const parsedBody = RecipeBulkImportRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/recipes/import/bulk"),
    parsedBody,
    (data) => RecipeBulkImportResponseSchema.parse(data),
  );
}
