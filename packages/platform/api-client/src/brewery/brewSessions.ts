import { BrewSessionDetailResponseSchema, BrewSessionStepLogRequestSchema, BrewSessionStepResponseSchema, BrewSessionStepsPatchRequestSchema, BrewSessionStepsResponseSchema, BrewSessionStopRequestSchema, IntegrationAttachRequestSchema, IntegrationAttachResponseSchema, IntegrationAttachmentsResponseSchema, IntegrationDetachRequestSchema, IntegrationDetachResponseSchema, IntegrationReadingsQuerySchema, IntegrationReadingsResponseSchema, OkResponseSchema } from "@umbraculum/brewery-contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { deleteParsed, getParsed, patchParsed, postParsed } from "../internal/httpJson.js";
import type { BreweryOpenApiPaths } from "../openapiTypes.js";

type BrewSessionDetailPath = "/brew-sessions/{brewSessionId}";
type BrewSessionDetailGet = BreweryOpenApiPaths[BrewSessionDetailPath]["get"];

export type { BrewSessionDetailGet };

type BrewSessionTimerAction = "start" | "pause" | "stop";

function brewSessionPath(brewSessionId: string): string {
  return toClientPath(`/brew-sessions/${encodeURIComponent(brewSessionId)}`);
}

export async function getBrewSession(client: ApiClient, brewSessionId: string) {
  return getParsed(client, brewSessionPath(brewSessionId), (data) =>
    BrewSessionDetailResponseSchema.parse(data),
  );
}

export async function patchBrewSession(
  client: ApiClient,
  brewSessionId: string,
  patch: Record<string, unknown>,
) {
  return patchParsed(client, brewSessionPath(brewSessionId), patch, (data) =>
    BrewSessionDetailResponseSchema.parse(data),
  );
}

export async function deleteBrewSession(client: ApiClient, brewSessionId: string) {
  return deleteParsed(client, brewSessionPath(brewSessionId), (data) => OkResponseSchema.parse(data));
}

export async function startBrewSession(client: ApiClient, brewSessionId: string) {
  return postParsed(client, `${brewSessionPath(brewSessionId)}/start`, {}, (data) =>
    BrewSessionDetailResponseSchema.parse(data),
  );
}

export async function pauseBrewSession(client: ApiClient, brewSessionId: string) {
  return postParsed(client, `${brewSessionPath(brewSessionId)}/pause`, {}, (data) =>
    BrewSessionDetailResponseSchema.parse(data),
  );
}

export async function stopBrewSession(
  client: ApiClient,
  brewSessionId: string,
  body: unknown = { reason: "manual" },
) {
  const parsedBody = BrewSessionStopRequestSchema.parse(body);
  return postParsed(client, `${brewSessionPath(brewSessionId)}/stop`, parsedBody, (data) =>
    BrewSessionDetailResponseSchema.parse(data),
  );
}

export async function patchBrewSessionSteps(
  client: ApiClient,
  brewSessionId: string,
  body: unknown,
) {
  const parsedBody = BrewSessionStepsPatchRequestSchema.parse(body);
  return patchParsed(client, `${brewSessionPath(brewSessionId)}/steps`, parsedBody, (data) =>
    BrewSessionStepsResponseSchema.parse(data),
  );
}

export async function postBrewSessionSteps(
  client: ApiClient,
  brewSessionId: string,
  body: unknown,
) {
  return postParsed(client, `${brewSessionPath(brewSessionId)}/steps`, body, (data) =>
    BrewSessionStepsResponseSchema.parse(data),
  );
}

export async function postBrewSessionStepLog(
  client: ApiClient,
  brewSessionId: string,
  stepId: string,
  body: unknown,
) {
  const parsedBody = BrewSessionStepLogRequestSchema.parse(body);
  return postParsed(
    client,
    `${brewSessionPath(brewSessionId)}/steps/${encodeURIComponent(stepId)}/log`,
    parsedBody,
    (data) => BrewSessionStepResponseSchema.parse(data),
  );
}

export async function patchBrewSessionStep(
  client: ApiClient,
  brewSessionId: string,
  stepId: string,
  body: unknown,
) {
  return patchParsed(
    client,
    `${brewSessionPath(brewSessionId)}/steps/${encodeURIComponent(stepId)}`,
    body,
    (data) => BrewSessionStepResponseSchema.parse(data),
  );
}

export async function postBrewSessionStepTimerAction(
  client: ApiClient,
  brewSessionId: string,
  stepId: string,
  action: BrewSessionTimerAction,
) {
  return postParsed(
    client,
    `${brewSessionPath(brewSessionId)}/steps/${encodeURIComponent(stepId)}/timer/${action}`,
    {},
    (data) => BrewSessionStepResponseSchema.parse(data),
  );
}

export async function listBrewSessionIntegrationAttachments(
  client: ApiClient,
  brewSessionId: string,
) {
  return getParsed(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/attachments`,
    (data) => IntegrationAttachmentsResponseSchema.parse(data),
  );
}

export async function listBrewSessionIntegrationReadings(
  client: ApiClient,
  brewSessionId: string,
  params: { kind: "tilt" | "ispindel" | "rapt"; limit?: number },
) {
  const parsed = IntegrationReadingsQuerySchema.parse(params);
  const sp = new URLSearchParams();
  sp.set("kind", parsed.kind);
  if (parsed.limit !== undefined) sp.set("limit", String(parsed.limit));
  return getParsed(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/readings?${sp.toString()}`,
    (data) => IntegrationReadingsResponseSchema.parse(data),
  );
}

export async function attachBrewSessionIntegration(
  client: ApiClient,
  brewSessionId: string,
  body: unknown,
) {
  const parsedBody = IntegrationAttachRequestSchema.parse(body);
  return postParsed(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/attach`,
    parsedBody,
    (data) => IntegrationAttachResponseSchema.parse(data),
  );
}

export async function detachBrewSessionIntegration(
  client: ApiClient,
  brewSessionId: string,
  body: unknown,
) {
  const parsedBody = IntegrationDetachRequestSchema.parse(body);
  return postParsed(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/detach`,
    parsedBody,
    (data) => IntegrationDetachResponseSchema.parse(data),
  );
}
