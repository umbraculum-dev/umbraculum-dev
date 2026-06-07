import { IngredientSyncResponseSchema, IngredientSyncRunsResponseSchema } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "@umbraculum/api-client";
import { toClientPath } from "@umbraculum/api-client/transport";
import { getParsed, postParsed } from "@umbraculum/api-client/transport";
import type { BreweryOpenApiPaths } from "./openapiTypes.js";

type IngredientSyncRunsPath = "/admin/ingredients/sync-runs";
type IngredientSyncRunsGet = BreweryOpenApiPaths[IngredientSyncRunsPath]["get"];

type IngredientSyncPath = "/admin/ingredients/sync";
type IngredientSyncPost = BreweryOpenApiPaths[IngredientSyncPath]["post"];

export type { IngredientSyncRunsGet, IngredientSyncPost };

export async function listIngredientSyncRuns(
  client: ApiClient,
): Promise<{ ok: true; runs: Record<string, unknown>[] }> {
  return getParsed(client, toClientPath("/admin/ingredients/sync-runs"), (data) =>
    IngredientSyncRunsResponseSchema.parse(data),
  );
}

export async function runIngredientSync(
  client: ApiClient,
): Promise<{ ok: true; result: Record<string, unknown> }> {
  return postParsed(client, toClientPath("/admin/ingredients/sync"), {}, (data) =>
    IngredientSyncResponseSchema.parse(data),
  );
}
