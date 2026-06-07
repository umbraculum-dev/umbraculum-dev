import { StylesListResponseSchema } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "@umbraculum/api-client";
import { toClientPath } from "@umbraculum/api-client/transport";
import { getParsed } from "@umbraculum/api-client/transport";
import type { BreweryOpenApiPaths } from "./openapiTypes.js";

type StylesListPath = "/styles";
type StylesListGet = BreweryOpenApiPaths[StylesListPath]["get"];

export type { StylesListGet };

export async function listStyles(client: ApiClient) {
  return getParsed(client, toClientPath("/styles"), (data) => StylesListResponseSchema.parse(data));
}
