import {
  BrewSessionsRecentQuerySchema,
  BrewSessionsRecentResponseSchema,
  IntegrationCreateResponseSchema,
  IntegrationDeviceAttachRequestSchema,
  IntegrationDeviceAttachResponseSchema,
  IntegrationDeviceDetachResponseSchema,
  IntegrationDevicesListResponseSchema,
  IntegrationGetResponseSchema,
  IntegrationKindSchema,
  IntegrationOkResponseSchema,
  IntegrationRevealResponseSchema,
  type IntegrationKind,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed, postParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type IntegrationGetPath = "/workspaces/{workspaceId}/integrations/{kind}";
type IntegrationGetGet = PlatformOpenApiPaths[IntegrationGetPath]["get"];

type IntegrationDevicesPath = "/workspaces/{workspaceId}/integrations/{kind}/devices";
type IntegrationDevicesGet = PlatformOpenApiPaths[IntegrationDevicesPath]["get"];

type BrewSessionsRecentPath = "/workspaces/{workspaceId}/brew-sessions/recent";
type BrewSessionsRecentGet = PlatformOpenApiPaths[BrewSessionsRecentPath]["get"];

export type { IntegrationGetGet, IntegrationDevicesGet, BrewSessionsRecentGet };

export type ListIntegrationDevicesOptions = {
  includeReadings?: boolean;
  readingsLimit?: number;
};

function workspaceIntegrationPath(workspaceId: string, kind: IntegrationKind): string {
  const parsedKind = IntegrationKindSchema.parse(kind);
  return toClientPath(
    `/workspaces/${encodeURIComponent(workspaceId)}/integrations/${encodeURIComponent(parsedKind)}`,
  );
}

export async function getWorkspaceIntegration(
  client: ApiClient,
  workspaceId: string,
  kind: IntegrationKind,
) {
  return getParsed(client, workspaceIntegrationPath(workspaceId, kind), (data) =>
    IntegrationGetResponseSchema.parse(data),
  );
}

export async function createWorkspaceIntegration(
  client: ApiClient,
  workspaceId: string,
  kind: IntegrationKind,
) {
  return postParsed(client, workspaceIntegrationPath(workspaceId, kind), {}, (data) =>
    IntegrationCreateResponseSchema.parse(data),
  );
}

export async function revealIntegrationToken(
  client: ApiClient,
  workspaceId: string,
  kind: IntegrationKind,
) {
  return getParsed(client, `${workspaceIntegrationPath(workspaceId, kind)}/reveal`, (data) =>
    IntegrationRevealResponseSchema.parse(data),
  );
}

export async function rotateIntegrationToken(
  client: ApiClient,
  workspaceId: string,
  kind: IntegrationKind,
) {
  return postParsed(
    client,
    `${workspaceIntegrationPath(workspaceId, kind)}/rotate-token`,
    {},
    (data) => IntegrationCreateResponseSchema.parse(data),
  );
}

export async function revokeIntegration(
  client: ApiClient,
  workspaceId: string,
  kind: IntegrationKind,
) {
  return postParsed(
    client,
    `${workspaceIntegrationPath(workspaceId, kind)}/revoke`,
    {},
    (data) => IntegrationOkResponseSchema.parse(data),
  );
}

export async function listIntegrationDevices(
  client: ApiClient,
  workspaceId: string,
  kind: IntegrationKind,
  options?: ListIntegrationDevicesOptions,
) {
  const sp = new URLSearchParams();
  if (options?.includeReadings) sp.set("includeReadings", "true");
  if (options?.readingsLimit !== undefined) sp.set("readingsLimit", String(options.readingsLimit));
  const query = sp.toString();
  const path = `${workspaceIntegrationPath(workspaceId, kind)}/devices${query ? `?${query}` : ""}`;
  return getParsed(client, path, (data) => IntegrationDevicesListResponseSchema.parse(data));
}

export async function attachTiltDevice(
  client: ApiClient,
  workspaceId: string,
  deviceId: string,
  body: unknown,
) {
  const parsedBody = IntegrationDeviceAttachRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath(
      `/workspaces/${encodeURIComponent(workspaceId)}/integrations/tilt/devices/${encodeURIComponent(deviceId)}/attach`,
    ),
    parsedBody,
    (data) => IntegrationDeviceAttachResponseSchema.parse(data),
  );
}

export async function detachTiltDevice(
  client: ApiClient,
  workspaceId: string,
  deviceId: string,
) {
  return postParsed(
    client,
    toClientPath(
      `/workspaces/${encodeURIComponent(workspaceId)}/integrations/tilt/devices/${encodeURIComponent(deviceId)}/detach`,
    ),
    {},
    (data) => IntegrationDeviceDetachResponseSchema.parse(data),
  );
}

export async function listRecentBrewSessions(
  client: ApiClient,
  workspaceId: string,
  params?: { limit?: number },
) {
  const parsed = BrewSessionsRecentQuerySchema.parse(params ?? {});
  const sp = new URLSearchParams();
  if (parsed.limit !== undefined) sp.set("limit", String(parsed.limit));
  const query = sp.toString();
  return getParsed(
    client,
    `${toClientPath(`/workspaces/${encodeURIComponent(workspaceId)}/brew-sessions/recent`)}${query ? `?${query}` : ""}`,
    (data) => BrewSessionsRecentResponseSchema.parse(data),
  );
}
