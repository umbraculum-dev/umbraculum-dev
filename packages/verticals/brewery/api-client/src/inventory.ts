import { InventoryCreateRequestSchema, InventoryItemResponseSchema, InventoryListResponseSchema, InventoryPatchRequestSchema, OkResponseSchema } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "@umbraculum/api-client";
import { toClientPath } from "@umbraculum/api-client/transport";
import { deleteParsed, getParsed, patchParsed, postParsed } from "@umbraculum/api-client/transport";
import type { BreweryOpenApiPaths } from "./openapiTypes.js";

type InventoryListPath = "/inventory";
type InventoryListGet = BreweryOpenApiPaths[InventoryListPath]["get"];

export type { InventoryListGet };

export async function listInventory(client: ApiClient) {
  return getParsed(client, toClientPath("/inventory"), (data) =>
    InventoryListResponseSchema.parse(data),
  );
}

export async function createInventoryItem(client: ApiClient, body: unknown) {
  const parsedBody = InventoryCreateRequestSchema.parse(body);
  return postParsed(client, toClientPath("/inventory"), parsedBody, (data) =>
    InventoryItemResponseSchema.parse(data),
  );
}

export async function patchInventoryItem(client: ApiClient, itemId: string, body: unknown) {
  const parsedBody = InventoryPatchRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath(`/inventory/${encodeURIComponent(itemId)}`),
    parsedBody,
    (data) => InventoryItemResponseSchema.parse(data),
  );
}

export async function deleteInventoryItem(client: ApiClient, itemId: string) {
  return deleteParsed(
    client,
    toClientPath(`/inventory/${encodeURIComponent(itemId)}`),
    (data) => OkResponseSchema.parse(data),
  );
}
