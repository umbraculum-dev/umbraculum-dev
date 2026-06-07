import { EquipmentProfileCreateRequestSchema, EquipmentProfilePatchRequestSchema, EquipmentProfileResponseSchema, EquipmentProfilesListResponseSchema, OkResponseSchema } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "@umbraculum/api-client";
import { toClientPath } from "@umbraculum/api-client/transport";
import { deleteParsed, getParsed, patchParsed, postParsed } from "@umbraculum/api-client/transport";
import type { BreweryOpenApiPaths } from "@umbraculum/api-client";

type EquipmentProfilesListPath = "/equipment-profiles";
type EquipmentProfilesListGet = BreweryOpenApiPaths[EquipmentProfilesListPath]["get"];

export type { EquipmentProfilesListGet };

export async function listEquipmentProfiles(client: ApiClient) {
  return getParsed(client, toClientPath("/equipment-profiles"), (data) =>
    EquipmentProfilesListResponseSchema.parse(data),
  );
}

export async function createEquipmentProfile(client: ApiClient, body: unknown) {
  const parsedBody = EquipmentProfileCreateRequestSchema.parse(body);
  return postParsed(client, toClientPath("/equipment-profiles"), parsedBody, (data) =>
    EquipmentProfileResponseSchema.parse(data),
  );
}

export async function patchEquipmentProfile(client: ApiClient, profileId: string, body: unknown) {
  const parsedBody = EquipmentProfilePatchRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath(`/equipment-profiles/${encodeURIComponent(profileId)}`),
    parsedBody,
    (data) => EquipmentProfileResponseSchema.parse(data),
  );
}

export async function deleteEquipmentProfile(client: ApiClient, profileId: string) {
  return deleteParsed(
    client,
    toClientPath(`/equipment-profiles/${encodeURIComponent(profileId)}`),
    (data) => OkResponseSchema.parse(data),
  );
}
