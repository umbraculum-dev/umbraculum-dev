import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  AiChatRequestBodySchema,
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

import { BadRequestError } from "../errors.js";
import { requireActiveWorkspace, requireUser } from "../plugins/requestContext.js";
import { AiSettingsService } from "../services/ai/aiSettingsService.js";
import { AiOrchestrator } from "../services/ai/orchestrator.js";
import { AiProposalService } from "../services/ai/proposalService.js";
import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";

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

    // ----- Chat (SSE) — streaming; not registered on zodApp (see rule 22 SSE exception) -----
    app.post("/ai/chat", async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const parsed = AiChatRequestBodySchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        throw new BadRequestError("invalid_body", "Body must match AiChatRequestBody");
      }
      const { message, sessionId: sessionIdRaw, routeId: routeIdRaw } = parsed.data;
      const sessionId = sessionIdRaw ?? null;
      const routeId = routeIdRaw ?? null;

      const orchestrator = new AiOrchestrator(app.prisma, toolRegistry);

      await orchestrator.preflight({
        workspaceId: ctx.activeWorkspaceId,
        userId: ctx.userId,
        message,
        sessionId,
        routeId,
      });

      reply.raw.setHeader("Content-Type", "text/event-stream");
      reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
      reply.raw.setHeader("Connection", "keep-alive");
      reply.raw.setHeader("X-Accel-Buffering", "no");
      reply.raw.flushHeaders();

      try {
        for await (const event of orchestrator.runChatTurn({
          workspaceId: ctx.activeWorkspaceId,
          userId: ctx.userId,
          message,
          sessionId,
          routeId,
        })) {
          if (req.raw.destroyed) break;
          reply.raw.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
        }
      } finally {
        try {
          reply.raw.end();
        } catch {
          /* socket already closed */
        }
      }
      return reply;
    });

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
        const role = await new (await import("../services/workspacesService.js")).WorkspacesService(
          app.prisma,
        ).getMembershipRole(ctx.userId, workspaceId);
        if (role !== "brewery_admin") {
          throw new BadRequestError("ai_admin_only", "Only workspace admins can view AI usage");
        }

        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const startOfMonth = new Date();
        startOfMonth.setUTCDate(1);
        startOfMonth.setUTCHours(0, 0, 0, 0);
        const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [monthlyAgg, perUser, perUserToday, dailySeries, roleUsageRows, settingsRow, members] =
          await Promise.all([
            app.prisma.aiUsageLedger.aggregate({
              where: { workspaceId, createdAt: { gte: startOfMonth } },
              _sum: { tokensIn: true, tokensOut: true, costMicroUsd: true },
              _count: { id: true },
            }),
            app.prisma.aiUsageLedger.groupBy({
              by: ["userId"],
              where: { workspaceId, createdAt: { gte: startOfMonth } },
              _sum: { tokensIn: true, tokensOut: true, costMicroUsd: true },
              _count: { id: true },
            }),
            app.prisma.aiUsageLedger.groupBy({
              by: ["userId"],
              where: { workspaceId, createdAt: { gte: startOfDay } },
              _sum: { tokensIn: true, tokensOut: true },
            }),
            app.prisma.$queryRawUnsafe<
              { day: Date; tokens_in: bigint | null; tokens_out: bigint | null; calls: bigint }[]
            >(
              `SELECT DATE_TRUNC('day', l.created_at) AS day,
                      COALESCE(SUM(l.tokens_in), 0) AS tokens_in,
                      COALESCE(SUM(l.tokens_out), 0) AS tokens_out,
                      COUNT(l.id)::bigint AS calls
               FROM platform.ai_usage_ledger l
               WHERE l.workspace_id = $1 AND l.created_at >= $2
               GROUP BY 1
               ORDER BY 1 ASC`,
              workspaceId,
              since30d,
            ),
            app.prisma.$queryRawUnsafe<{ role: string; total: bigint }[]>(
              `SELECT wm.role::text AS role,
                      COALESCE(SUM(l.tokens_in + l.tokens_out), 0) AS total
               FROM platform.ai_usage_ledger l
               INNER JOIN platform.workspace_members wm
                 ON wm.workspace_id = l.workspace_id AND wm.user_id = l.user_id
               WHERE l.workspace_id = $1 AND l.created_at >= $2
               GROUP BY wm.role`,
              workspaceId,
              since30d,
            ),
            app.prisma.workspaceAiSettings.findUnique({ where: { workspaceId } }),
            app.prisma.workspaceMember.findMany({
              where: { workspaceId },
              include: { user: { select: { id: true, email: true } } },
            }),
          ]);

        const todayMap = new Map<string, { tokensInToday: number; tokensOutToday: number }>();
        for (const row of perUserToday) {
          todayMap.set(row.userId, {
            tokensInToday: row._sum.tokensIn ?? 0,
            tokensOutToday: row._sum.tokensOut ?? 0,
          });
        }
        const userInfoMap = new Map<string, { email: string; role: string }>();
        for (const m of members) {
          userInfoMap.set(m.user.id, {
            email: m.user.email,
            role: m.role,
          });
        }

        const roleUsage: Record<string, number> = {};
        for (const r of roleUsageRows) roleUsage[r.role] = Number(r.total ?? 0);

        const roleLimits = (settingsRow?.roleLimits ?? {}) as Record<string, number>;
        const perUserDailyCap = settingsRow?.perUserDailyCap ?? 0;
        const ALERT_THRESHOLD = 0.9;

        const roleAlerts: Array<{ role: string; used: number; limit: number; percent: number }> = [];
        for (const [alertRole, limit] of Object.entries(roleLimits)) {
          const limitNum = Number(limit);
          if (limitNum <= 0) continue;
          const used = roleUsage[alertRole] ?? 0;
          if (used / limitNum >= ALERT_THRESHOLD) {
            roleAlerts.push({ role: alertRole, used, limit: limitNum, percent: used / limitNum });
          }
        }

        const userAlerts: Array<{
          userId: string;
          usedToday: number;
          cap: number;
          percent: number;
        }> = [];
        if (perUserDailyCap > 0) {
          for (const [userId, today] of todayMap.entries()) {
            const usedToday = today.tokensInToday + today.tokensOutToday;
            if (usedToday / perUserDailyCap >= ALERT_THRESHOLD) {
              userAlerts.push({
                userId,
                usedToday,
                cap: perUserDailyCap,
                percent: usedToday / perUserDailyCap,
              });
            }
          }
        }

        return WorkspaceAiUsageResponseSchema.parse({
          ok: true,
          monthly: {
            tokensIn: monthlyAgg._sum.tokensIn ?? 0,
            tokensOut: monthlyAgg._sum.tokensOut ?? 0,
            costMicroUsd: Number(monthlyAgg._sum.costMicroUsd ?? 0n),
            callCount: monthlyAgg._count.id,
          },
          dailySeries: dailySeries.map((d) => ({
            day: d.day.toISOString(),
            tokensIn: Number(d.tokens_in ?? 0),
            tokensOut: Number(d.tokens_out ?? 0),
            calls: Number(d.calls ?? 0),
          })),
          roleLimits,
          roleUsage,
          perUserDailyCap,
          byUser: perUser.map((row) => {
            const today = todayMap.get(row.userId) ?? { tokensInToday: 0, tokensOutToday: 0 };
            const info = userInfoMap.get(row.userId);
            return {
              userId: row.userId,
              email: info?.email ?? null,
              role: info?.role ?? null,
              tokensInToday: today.tokensInToday,
              tokensOutToday: today.tokensOutToday,
              tokensInMonth: row._sum.tokensIn ?? 0,
              tokensOutMonth: row._sum.tokensOut ?? 0,
              costMicroUsdMonth: Number(row._sum.costMicroUsd ?? 0n),
              callCountMonth: row._count.id,
            };
          }),
          alerts: { roleAlerts, userAlerts },
        });
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
