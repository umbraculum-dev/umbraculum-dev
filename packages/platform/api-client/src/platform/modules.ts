import { WorkspaceBillingResponseSchema } from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

export * from "./integrations.js";

type WorkspaceBillingResponse = ReturnType<typeof WorkspaceBillingResponseSchema.parse>;

type BillingStatusPath = "/workspaces/{workspaceId}/billing";
type BillingStatusGet = PlatformOpenApiPaths[BillingStatusPath]["get"];

export type { BillingStatusGet };

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
