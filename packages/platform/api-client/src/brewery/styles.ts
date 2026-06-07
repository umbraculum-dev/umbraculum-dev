import { StylesListResponseSchema } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed } from "../internal/httpJson.js";
import type { BreweryOpenApiPaths } from "../openapiTypes.js";

type StylesListPath = "/styles";
type StylesListGet = BreweryOpenApiPaths[StylesListPath]["get"];

export type { StylesListGet };

export async function listStyles(client: ApiClient) {
  return getParsed(client, toClientPath("/styles"), (data) => StylesListResponseSchema.parse(data));
}
