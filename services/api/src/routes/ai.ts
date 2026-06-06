import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  AiProposalActionResponseSchema,
  AiProposalGetResponseSchema,
  AiProposalIdParamsSchema,
  AiProposalListResponseSchema,
  ErrorResponseSchema,
  UpdateWorkspaceAiSettingsRequestSchema,
  WorkspaceAiSettingsParamsSchema,
  WorkspaceAiSettingsResponseSchema,
  WorkspaceAiUsageResponseSchema,
} from "@umbraculum/contracts";

import { requireActiveWorkspace, requireUser } from "../plugins/requestContext.js";
import { AiSettingsService } from "../services/ai/aiSettingsService.js";
import { AiUsageService } from "../services/ai/aiUsageService.js";
import { AiOrchestrator } from "../services/ai/orchestrator.js";
import { AiProposalService } from "../services/ai/proposalService.js";
import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";
import { registerAiChatRoute } from "./_helpers/aiChatRouteHandler.js";

/**
 * Build the AI routes. The boot wiring (in `app.ts`) constructs the tool
 * registry once at process start and passes it in here so we don't recreate
 * it per request.
 */
export function aiRoutes(toolRegistry: AiToolRegistry) {
  return function aiRoutesImpl(app: FastifyInstance) {
    const zodApp = app.withTypeProvider<ZodTypeProvider>();
    const settings = new AiSettingsService(app.prisma);
    const proposals = new AiProposalService(app.prisma);
    const usage = new AiUsageService(app.prisma);
    const orchestrator = new AiOrchestrator(app.prisma, toolRegistry);

    registerAiChatRoute(app, orchestrator);

    zodApp.get(
      "/workspaces/:workspaceId/ai/settings",
      {
        schema: {
          tags: ["ai"],
          params: WorkspaceAiSettingsParamsSchema,
          response: {
            200: WorkspaceAiSettingsResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      async (req) => {
        const ctx = requireUser(req);
        const { workspaceId } = req.params;
        const row = await settings.getOrCreate(ctx.userId, workspaceId);
        return WorkspaceAiSettingsResponseSchema.parse({ ok: true, settings: settings.toDto(row) });
      },
    );

    zodApp.put(
      "/workspaces/:workspaceId/ai/settings",
      {
        schema: {
          tags: ["ai"],
          params: WorkspaceAiSettingsParamsSchema,
          body: UpdateWorkspaceAiSettingsRequestSchema,
          response: {
            200: WorkspaceAiSettingsResponseSchema,
            400: ErrorResponseSchema,
            401: ErrorResponseSchema,
            403: ErrorResponseSchema,
          },
        },
      },
      async (req) => {
        const ctx = requireUser(req);
        const { workspaceId } = req.params;
        const updated = await settings.update(ctx.userId, workspaceId, req.body);
        return WorkspaceAiSettingsResponseSchema.parse({ ok: true, settings: settings.toDto(updated) });
      },
    );

    zodApp.get(
      "/workspaces/:workspaceId/ai/usage",
      {
        schema: {
          tags: ["ai"],
          params: WorkspaceAiSettingsParamsSchema,
          response: {
            200: WorkspaceAiUsageResponseSchema,
            400: ErrorResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      async (req) => {
        const ctx = requireUser(req);
        const { workspaceId } = req.params;
        return usage.getWorkspaceUsage(ctx.userId, workspaceId);
      },
    );

    zodApp.get(
      "/ai/proposals",
      {
        schema: {
          tags: ["ai"],
          response: {
            200: AiProposalListResponseSchema,
            401: ErrorResponseSchema,
          },
        },
      },
      async (req) => {
        const ctx = requireActiveWorkspace(req);
        const rows = await proposals.list(ctx.userId, ctx.activeWorkspaceId);
        return AiProposalListResponseSchema.parse({
          ok: true,
          items: rows.map((r) => proposals.toDto(r)),
        });
      },
    );

    zodApp.get(
      "/ai/proposals/:id",
      {
        schema: {
          tags: ["ai"],
          params: AiProposalIdParamsSchema,
          response: {
            200: AiProposalGetResponseSchema,
            400: ErrorResponseSchema,
            401: ErrorResponseSchema,
            404: ErrorResponseSchema,
          },
        },
      },
      async (req) => {
        const ctx = requireActiveWorkspace(req);
        const { id } = req.params;
        const row = await proposals.getById(ctx.userId, ctx.activeWorkspaceId, id);
        return AiProposalGetResponseSchema.parse({ ok: true, proposal: proposals.toDto(row) });
      },
    );

    zodApp.post(
      "/ai/proposals/:id/apply",
      {
        schema: {
          tags: ["ai"],
          params: AiProposalIdParamsSchema,
          response: {
            200: AiProposalActionResponseSchema,
            400: ErrorResponseSchema,
            401: ErrorResponseSchema,
            404: ErrorResponseSchema,
          },
        },
      },
      async (req) => {
        const ctx = requireActiveWorkspace(req);
        const { id } = req.params;
        const { row, appliedPreviewOnly } = await proposals.apply(
          ctx.userId,
          ctx.activeWorkspaceId,
          id,
        );
        return AiProposalActionResponseSchema.parse({
          ok: true,
          proposal: proposals.toDto(row),
          ...(appliedPreviewOnly ? { appliedPreviewOnly: true } : {}),
        });
      },
    );

    zodApp.post(
      "/ai/proposals/:id/reject",
      {
        schema: {
          tags: ["ai"],
          params: AiProposalIdParamsSchema,
          response: {
            200: AiProposalActionResponseSchema,
            400: ErrorResponseSchema,
            401: ErrorResponseSchema,
            404: ErrorResponseSchema,
          },
        },
      },
      async (req) => {
        const ctx = requireActiveWorkspace(req);
        const { id } = req.params;
        const row = await proposals.reject(ctx.userId, ctx.activeWorkspaceId, id);
        return AiProposalActionResponseSchema.parse({ ok: true, proposal: proposals.toDto(row) });
      },
    );
  };
}
