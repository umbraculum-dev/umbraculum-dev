import {
  BrewdaySettingsPatchRequestSchema,
  BrewdaySettingsResponseSchema,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed, patchParsed } from "../internal/httpJson.js";
import type { BreweryOpenApiPaths } from "../openapiTypes.js";

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
