import {
  IntegrationDevicesListResponseSchema,
  WorkspaceBillingResponseSchema,
  type IntegrationKind,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type WorkspaceBillingResponse = ReturnType<typeof WorkspaceBillingResponseSchema.parse>;
type IntegrationDevicesListResponse = ReturnType<typeof IntegrationDevicesListResponseSchema.parse>;

type BillingStatusPath = "/workspaces/{workspaceId}/billing";
type BillingStatusGet = PlatformOpenApiPaths[BillingStatusPath]["get"];

type IntegrationDevicesPath = "/workspaces/{workspaceId}/integrations/{kind}/devices";
type IntegrationDevicesGet = PlatformOpenApiPaths[IntegrationDevicesPath]["get"];

export type { BillingStatusGet, IntegrationDevicesGet };

export async function getWorkspaceBilling(
  client: ApiClient,
  workspaceId: string,
): Promise<WorkspaceBillingResponse> {
  return getParsed(
    client,
    toClientPath(`/workspaces/${encodeURIComponent(workspaceId)}/billing`),
    (data) => WorkspaceBillingResponseSchema.parse(data),
  );
}

export async function listIntegrationDevices(
  client: ApiClient,
  workspaceId: string,
  kind: IntegrationKind,
): Promise<IntegrationDevicesListResponse> {
  return getParsed(
    client,
    toClientPath(
      `/workspaces/${encodeURIComponent(workspaceId)}/integrations/${encodeURIComponent(kind)}/devices`,
    ),
    (data) => IntegrationDevicesListResponseSchema.parse(data),
  );
}
