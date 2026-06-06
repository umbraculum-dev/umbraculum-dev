import type { IntegrationKind } from "@prisma/client";
import {
  IntegrationCreateResponseSchema,
  IntegrationDevicesListResponseSchema,
  IntegrationGetResponseSchema,
  IntegrationOkResponseSchema,
} from "@umbraculum/contracts";

import { NotFoundError } from "../../errors.js";
import type { IntegrationsService } from "../../services/integrationsService.js";
import {
  integrationPublicPath,
  mapIntegrationDeviceDto,
  toIntegrationGetDto,
} from "./integrationResponseMappers.js";
import { requireActiveWorkspaceIntegration } from "./integrationRouteHelpers.js";

export async function getIntegrationForWorkspace(
  integrations: IntegrationsService,
  workspaceId: string,
  kind: IntegrationKind,
) {
  const integration = await integrations.findWorkspaceIntegration(workspaceId, kind);
  return IntegrationGetResponseSchema.parse({ ok: true, integration: toIntegrationGetDto(integration) });
}

export async function createOrRotateIntegration(
  integrations: IntegrationsService,
  workspaceId: string,
  kind: IntegrationKind,
) {
  const existing = await integrations.findWorkspaceIntegration(workspaceId, kind);
  if (existing && !existing.revokedAt) {
    const rotated = await integrations.rotateIntegrationToken(existing.id);
    return IntegrationCreateResponseSchema.parse({
      ok: true,
      integrationId: existing.id,
      token: rotated.token,
      publicPath: integrationPublicPath(kind, rotated.token),
    });
  }
  const created = await integrations.createIntegration(workspaceId, kind);
  return IntegrationCreateResponseSchema.parse({
    ok: true,
    integrationId: created.integration.id,
    token: created.token,
    publicPath: integrationPublicPath(kind, created.token),
  });
}

export async function rotateIntegrationToken(
  integrations: IntegrationsService,
  workspaceId: string,
  kind: IntegrationKind,
  notFoundMessage: string,
) {
  const integration = await requireActiveWorkspaceIntegration(
    integrations,
    workspaceId,
    kind,
    notFoundMessage,
  );
  const rotated = await integrations.rotateIntegrationToken(integration.id);
  return IntegrationCreateResponseSchema.parse({
    ok: true,
    integrationId: integration.id,
    token: rotated.token,
    publicPath: integrationPublicPath(kind, rotated.token),
  });
}

export async function revokeIntegration(
  integrations: IntegrationsService,
  workspaceId: string,
  kind: IntegrationKind,
  notFoundMessage: string,
) {
  const integration = await requireActiveWorkspaceIntegration(
    integrations,
    workspaceId,
    kind,
    notFoundMessage,
  );
  await integrations.revokeIntegration(integration.id);
  return IntegrationOkResponseSchema.parse({ ok: true });
}

export async function listIntegrationDevices(
  integrations: IntegrationsService,
  workspaceId: string,
  kind: IntegrationKind,
  options: { includeReadings: boolean; readingsTake: number },
) {
  const integration = await integrations.findWorkspaceIntegration(workspaceId, kind);
  if (!integration || integration.revokedAt) {
    return IntegrationDevicesListResponseSchema.parse({ ok: true, devices: [] });
  }
  const devices = await integrations.listIntegrationDevices(integration.id, options.readingsTake);
  return IntegrationDevicesListResponseSchema.parse({
    ok: true,
    devices: devices.map((d) => mapIntegrationDeviceDto(d, { includeReadings: options.includeReadings })),
  });
}

export async function rotateExistingIntegration(
  integrations: IntegrationsService,
  workspaceId: string,
  kind: IntegrationKind,
) {
  const integration = await integrations.findWorkspaceIntegration(workspaceId, kind);
  if (!integration || integration.revokedAt) {
    throw new NotFoundError("missing_integration", "Integration not configured");
  }
  return rotateIntegrationToken(integrations, workspaceId, kind, "Integration not configured");
}

export async function revokeExistingIntegration(
  integrations: IntegrationsService,
  workspaceId: string,
  kind: IntegrationKind,
) {
  const integration = await integrations.findWorkspaceIntegration(workspaceId, kind);
  if (!integration || integration.revokedAt) {
    throw new NotFoundError("missing_integration", "Integration not configured");
  }
  return revokeIntegration(integrations, workspaceId, kind, "Integration not configured");
}
