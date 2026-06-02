import {
  BillingIntentRequestSchema,
  BillingIntentResponseSchema,
  UpdateWorkspaceAiSettingsRequestSchema,
  WorkspaceAiSettingsResponseSchema,
  WorkspaceAiUsageResponseSchema,
  type BillingIntentRequest,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed, postParsed, putParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type WorkspaceAiSettingsResponse = ReturnType<typeof WorkspaceAiSettingsResponseSchema.parse>;
type WorkspaceAiUsageResponse = ReturnType<typeof WorkspaceAiUsageResponseSchema.parse>;
type BillingIntentResponse = ReturnType<typeof BillingIntentResponseSchema.parse>;

type WorkspaceAiSettingsPath = "/workspaces/{workspaceId}/ai/settings";
type WorkspaceAiSettingsGet = PlatformOpenApiPaths[WorkspaceAiSettingsPath]["get"];
type WorkspaceAiSettingsPut = PlatformOpenApiPaths[WorkspaceAiSettingsPath]["put"];

type WorkspaceAiUsagePath = "/workspaces/{workspaceId}/ai/usage";
type WorkspaceAiUsageGet = PlatformOpenApiPaths[WorkspaceAiUsagePath]["get"];

type BillingIntentPath = "/workspaces/{workspaceId}/billing/intent";
type BillingIntentPost = PlatformOpenApiPaths[BillingIntentPath]["post"];

export type {
  WorkspaceAiSettingsGet,
  WorkspaceAiSettingsPut,
  WorkspaceAiUsageGet,
  BillingIntentPost,
};

function workspaceAiSettingsPath(workspaceId: string): string {
  return toClientPath(`/workspaces/${encodeURIComponent(workspaceId)}/ai/settings`);
}

function workspaceAiUsagePath(workspaceId: string): string {
  return toClientPath(`/workspaces/${encodeURIComponent(workspaceId)}/ai/usage`);
}

function workspaceBillingIntentPath(workspaceId: string): string {
  return toClientPath(`/workspaces/${encodeURIComponent(workspaceId)}/billing/intent`);
}

export async function getWorkspaceAiSettings(
  client: ApiClient,
  workspaceId: string,
): Promise<WorkspaceAiSettingsResponse> {
  return getParsed(client, workspaceAiSettingsPath(workspaceId), (data) =>
    WorkspaceAiSettingsResponseSchema.parse(data),
  );
}

export async function patchWorkspaceAiSettings(
  client: ApiClient,
  workspaceId: string,
  body: unknown,
): Promise<WorkspaceAiSettingsResponse> {
  const parsedBody = UpdateWorkspaceAiSettingsRequestSchema.parse(body);
  return putParsed(client, workspaceAiSettingsPath(workspaceId), parsedBody, (data) =>
    WorkspaceAiSettingsResponseSchema.parse(data),
  );
}

export async function getWorkspaceAiUsage(
  client: ApiClient,
  workspaceId: string,
): Promise<WorkspaceAiUsageResponse> {
  return getParsed(client, workspaceAiUsagePath(workspaceId), (data) =>
    WorkspaceAiUsageResponseSchema.parse(data),
  );
}

export async function createAiUpgradeBillingIntent(
  client: ApiClient,
  workspaceId: string,
  body: BillingIntentRequest,
): Promise<BillingIntentResponse> {
  const parsedBody = BillingIntentRequestSchema.parse(body);
  return postParsed(client, workspaceBillingIntentPath(workspaceId), parsedBody, (data) =>
    BillingIntentResponseSchema.parse(data),
  );
}
