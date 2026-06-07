import { BrewdaySettingsPatchRequestSchema, BrewdaySettingsResponseSchema } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "@umbraculum/api-client";
import { toClientPath } from "@umbraculum/api-client/transport";
import { getParsed, patchParsed } from "@umbraculum/api-client/transport";
import type { BreweryOpenApiPaths } from "@umbraculum/api-client";

type BrewdaySettingsPath = "/brewday-settings";
type BrewdaySettingsGet = BreweryOpenApiPaths[BrewdaySettingsPath]["get"];

export type { BrewdaySettingsGet };

export async function getBrewdaySettings(client: ApiClient) {
  return getParsed(client, toClientPath("/brewday-settings"), (data) =>
    BrewdaySettingsResponseSchema.parse(data),
  );
}

export async function patchBrewdaySettings(client: ApiClient, body: unknown) {
  const parsedBody = BrewdaySettingsPatchRequestSchema.parse(body);
  return patchParsed(client, toClientPath("/brewday-settings"), parsedBody, (data) =>
    BrewdaySettingsResponseSchema.parse(data),
  );
}
