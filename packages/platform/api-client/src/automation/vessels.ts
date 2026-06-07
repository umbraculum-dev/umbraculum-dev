import {
  VesselListResponseSchema,
  VesselStateResponseSchema,
  type VesselListResponse,
  type VesselStateResponse,
} from "@umbraculum/automation-contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type AutomationVesselsListPath = "/automation/vessels";
type AutomationVesselsListGet = PlatformOpenApiPaths[AutomationVesselsListPath]["get"];

type AutomationVesselDetailPath = "/automation/vessels/{code}";
type AutomationVesselDetailGet = PlatformOpenApiPaths[AutomationVesselDetailPath]["get"];

export type { AutomationVesselsListGet, AutomationVesselDetailGet };

export async function listVessels(client: ApiClient): Promise<VesselListResponse> {
  return getParsed(client, toClientPath("/automation/vessels"), (data) =>
    VesselListResponseSchema.parse(data),
  );
}

export async function getVessel(client: ApiClient, code: string): Promise<VesselStateResponse> {
  return getParsed(
    client,
    toClientPath(`/automation/vessels/${encodeURIComponent(code)}`),
    (data) => VesselStateResponseSchema.parse(data),
  );
}
