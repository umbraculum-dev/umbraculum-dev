import {
  HealthResponseSchema,
  WorkspacesListResponseSchema,
  WorkspaceCreateRequestSchema,
  WorkspaceCreateResponseSchema,
  type WorkspaceCreateRequest,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed, postParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type WorkspacesListResponse = ReturnType<typeof WorkspacesListResponseSchema.parse>;
type WorkspaceCreateResponse = ReturnType<typeof WorkspaceCreateResponseSchema.parse>;
type HealthResponse = ReturnType<typeof HealthResponseSchema.parse>;

type WorkspacesListPath = "/workspaces";
type WorkspacesListGet = PlatformOpenApiPaths[WorkspacesListPath]["get"];
type WorkspacesCreatePost = PlatformOpenApiPaths[WorkspacesListPath]["post"];

type HealthPath = "/health";
type HealthGet = PlatformOpenApiPaths[HealthPath]["get"];

export type { WorkspacesListGet, WorkspacesCreatePost, HealthGet };

export async function listWorkspaces(client: ApiClient): Promise<WorkspacesListResponse> {
  return getParsed(client, toClientPath("/workspaces"), (data) =>
    WorkspacesListResponseSchema.parse(data),
  );
}

export async function createWorkspace(
  client: ApiClient,
  body: WorkspaceCreateRequest,
): Promise<WorkspaceCreateResponse> {
  const parsedBody = WorkspaceCreateRequestSchema.parse(body);
  return postParsed(client, toClientPath("/workspaces"), parsedBody, (data) =>
    WorkspaceCreateResponseSchema.parse(data),
  );
}

export async function getHealth(client: ApiClient): Promise<HealthResponse> {
  return getParsed(client, toClientPath("/health"), (data) => HealthResponseSchema.parse(data));
}
