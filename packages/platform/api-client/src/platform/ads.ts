import {
  AdSlotParamsSchema,
  AdSlotQuerySchema,
  AdSlotResponseSchema,
  type AdSlotResponse,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type AdSlotPath = "/ads/slot/{placement}";
type AdSlotGet = PlatformOpenApiPaths[AdSlotPath]["get"];

export type { AdSlotGet, AdSlotResponse };

export type GetAdSlotOptions = {
  platform?: "web";
};

export async function getAdSlot(
  client: ApiClient,
  placement: string,
  options: GetAdSlotOptions = {},
): Promise<AdSlotResponse> {
  const parsedPlacement = AdSlotParamsSchema.parse({ placement }).placement;
  const query = AdSlotQuerySchema.parse(options);
  const qs = query.platform ? `?platform=${encodeURIComponent(query.platform)}` : "";
  return getParsed(
    client,
    `${toClientPath(`/ads/slot/${encodeURIComponent(parsedPlacement)}`)}${qs}`,
    (data) => AdSlotResponseSchema.parse(data),
  );
}
