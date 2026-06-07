import { BeerJsonExportResponseSchema } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "@umbraculum/api-client";
import { toClientPath } from "@umbraculum/api-client/transport";
import { getBytesParsed } from "@umbraculum/api-client/transport";
import type { BreweryOpenApiPaths } from "@umbraculum/api-client";

type RecipeBeerJsonExportPath = "/recipes/{id}/export/beerjson";
type RecipeBeerJsonExportGet = BreweryOpenApiPaths[RecipeBeerJsonExportPath]["get"];

type RecipesBeerJsonExportPath = "/recipes/export/beerjson";
type RecipesBeerJsonExportGet = BreweryOpenApiPaths[RecipesBeerJsonExportPath]["get"];

export type { RecipeBeerJsonExportGet, RecipesBeerJsonExportGet };

/** Client path for a single-recipe BeerJSON download (use with browser navigation or `exportRecipeBeerJson`). */
export function recipeBeerJsonExportPath(recipeId: string): string {
  return toClientPath(`/recipes/${encodeURIComponent(recipeId)}/export/beerjson`);
}

/** Client path for bulk BeerJSON download. */
export function allRecipesBeerJsonExportPath(): string {
  return toClientPath("/recipes/export/beerjson");
}

function parseBeerJsonExportBody(data: unknown): Buffer {
  if (data instanceof Buffer) return data;
  if (typeof data === "string") return Buffer.from(data, "latin1");
  return BeerJsonExportResponseSchema.parse(data);
}

export async function exportRecipeBeerJson(client: ApiClient, recipeId: string): Promise<Buffer> {
  return getBytesParsed(client, recipeBeerJsonExportPath(recipeId), parseBeerJsonExportBody);
}

export async function exportAllRecipesBeerJson(client: ApiClient): Promise<Buffer> {
  return getBytesParsed(client, allRecipesBeerJsonExportPath(), parseBeerJsonExportBody);
}
