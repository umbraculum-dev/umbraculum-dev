import {
  AttributeSetGetResponseSchema,
  AttributeSetListResponseSchema,
  type AttributeSetGetResponse,
  type AttributeSetListResponse,
} from "@umbraculum/pim-contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type PimAttributeSetsListPath = "/pim/attribute-sets";
type PimAttributeSetsListGet = PlatformOpenApiPaths[PimAttributeSetsListPath]["get"];

type PimAttributeSetDetailPath = "/pim/attribute-sets/{setId}";
type PimAttributeSetDetailGet = PlatformOpenApiPaths[PimAttributeSetDetailPath]["get"];

export type { PimAttributeSetsListGet, PimAttributeSetDetailGet };

export async function listAttributeSets(client: ApiClient): Promise<AttributeSetListResponse> {
  return getParsed(client, toClientPath("/pim/attribute-sets"), (data) =>
    AttributeSetListResponseSchema.parse(data),
  );
}

export async function getAttributeSet(
  client: ApiClient,
  setId: string,
): Promise<AttributeSetGetResponse> {
  return getParsed(
    client,
    toClientPath(`/pim/attribute-sets/${encodeURIComponent(setId)}`),
    (data) => AttributeSetGetResponseSchema.parse(data),
  );
}
