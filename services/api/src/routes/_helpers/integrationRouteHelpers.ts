import type { IntegrationKind } from "@prisma/client";
import type { FastifyRequest } from "fastify";
import { IntegrationWorkspaceIdParamsSchema, IntegrationWorkspaceKindParamsSchema } from "@umbraculum/contracts";

import { ForbiddenError, NotFoundError } from "../../errors.js";
import { requireActiveWorkspace } from "../../plugins/requestContext.js";
import type { IntegrationsService } from "../../services/integrationsService.js";
import type { WorkspacesService } from "../../services/workspacesService.js";
import { integrationPublicPath } from "./integrationResponseMappers.js";

export async function requireIntegrationWorkspaceParam(
  req: FastifyRequest,
  workspaces: WorkspacesService,
): Promise<{ userId: string; workspaceId: string }> {
  const ctx = requireActiveWorkspace(req);
  const params = IntegrationWorkspaceKindParamsSchema.parse(req.params ?? {});
  const { workspaceId } = params;
  if (workspaceId !== ctx.activeWorkspaceId) {
    throw new ForbiddenError("workspace_mismatch", "Active workspace does not match requested workspace");
  }
  await workspaces.assertMembership(ctx.userId, workspaceId);
  return { userId: ctx.userId, workspaceId };
}

export async function requireIntegrationWorkspaceIdParam(
  req: FastifyRequest,
  workspaces: WorkspacesService,
): Promise<{ userId: string; workspaceId: string }> {
  const ctx = requireActiveWorkspace(req);
  const { workspaceId } = IntegrationWorkspaceIdParamsSchema.parse(req.params ?? {});
  if (workspaceId !== ctx.activeWorkspaceId) {
    throw new ForbiddenError("workspace_mismatch", "Active workspace does not match requested workspace");
  }
  await workspaces.assertMembership(ctx.userId, workspaceId);
  return { userId: ctx.userId, workspaceId };
}

export async function requireActiveWorkspaceIntegration(
  integrations: IntegrationsService,
  workspaceId: string,
  kind: IntegrationKind,
  notFoundMessage: string,
) {
  const integration = await integrations.findWorkspaceIntegration(workspaceId, kind);
  if (!integration || integration.revokedAt) {
    throw new NotFoundError("missing_integration", notFoundMessage);
  }
  return integration;
}

export async function buildIntegrationRevealPayload(
  integrations: IntegrationsService,
  workspaceId: string,
  kind: IntegrationKind | string,
) {
  const integration = await integrations.findActiveIntegrationForReveal(workspaceId, kind as IntegrationKind);
  if (!integration) {
    throw new NotFoundError("missing_integration", "Integration not configured");
  }
  const token = integrations.deriveToken({
    integrationId: integration.id,
    tokenVersion: integration.tokenVersion,
  });
  return {
    ok: true as const,
    integrationId: integration.id,
    kind,
    token,
    publicPath: integrationPublicPath(kind, token),
  };
}
