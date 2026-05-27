import type { FastifyInstance } from "fastify";
import { AiChatRequestBodySchema } from "@umbraculum/contracts";

import { BadRequestError } from "../errors.js";
import { requireActiveWorkspace, requireUser } from "../plugins/requestContext.js";
import { AiSettingsService } from "../services/ai/aiSettingsService.js";
import { AiOrchestrator } from "../services/ai/orchestrator.js";
import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";

function assertWorkspaceId(v: unknown): string {
  const id = typeof v === "string" ? v.trim() : "";
  if (!id) throw new BadRequestError("invalid_workspace_id", "Params.workspaceId is required");
  return id;
}

/**
 * Build the AI routes. The boot wiring (in `app.ts`) constructs the tool
 * registry once at process start and passes it in here so we don't recreate
 * it per request.
 */
export function aiRoutes(toolRegistry: AiToolRegistry) {
  return function aiRoutesImpl(app: FastifyInstance) {
    const settings = new AiSettingsService(app.prisma);

    // ----- Chat (SSE) -----
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

      // Run preflight BEFORE writing SSE headers, so 402/403/429 propagate
      // to Fastify's error handler as proper HTTP status codes. Errors
      // raised inside the SSE stream (Anthropic call failures, tool failures)
      // are converted to in-stream `event: error` frames by the generator.
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
      // We've written the SSE stream directly; tell Fastify we're done.
      return reply;
    });

    // ----- Settings (admin read+write; member read) -----
    app.get("/workspaces/:workspaceId/ai/settings", async (req) => {
      const ctx = requireUser(req);
      const params = (req.params ?? {}) as { workspaceId?: unknown };
      const workspaceId = assertWorkspaceId(params.workspaceId);
      const row = await settings.getOrCreate(ctx.userId, workspaceId);
      return { ok: true, settings: settings.toDto(row) };
    });

    app.put("/workspaces/:workspaceId/ai/settings", async (req) => {
      const ctx = requireUser(req);
      const params = (req.params ?? {}) as { workspaceId?: unknown };
      const workspaceId = assertWorkspaceId(params.workspaceId);
      const body = (req.body ?? {}) as {
        provider?: unknown;
        apiKey?: unknown;
        enabled?: unknown;
        roleLimits?: unknown;
        perUserDailyCap?: unknown;
        dataEgressAccepted?: unknown;
      };
      const input: Parameters<typeof settings.update>[2] = {};
      if (body.provider !== undefined) {
        if (body.provider !== "anthropic") {
          throw new BadRequestError("invalid_provider", "Body.provider must be 'anthropic' in v0");
        }
        input.provider = "anthropic";
      }
      if (body.apiKey !== undefined) {
        if (typeof body.apiKey !== "string") {
          throw new BadRequestError("invalid_api_key", "Body.apiKey must be a string");
        }
        input.apiKey = body.apiKey;
      }
      if (body.enabled !== undefined) {
        if (typeof body.enabled !== "boolean") {
          throw new BadRequestError("invalid_enabled", "Body.enabled must be a boolean");
        }
        input.enabled = body.enabled;
      }
      if (body.roleLimits !== undefined) {
        if (body.roleLimits === null || typeof body.roleLimits !== "object") {
          throw new BadRequestError("invalid_role_limits", "Body.roleLimits must be an object");
        }
        const cast = body.roleLimits as Record<string, unknown>;
        const cleaned: Record<string, number> = {};
        for (const [k, v] of Object.entries(cast)) {
          if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
            throw new BadRequestError(
              "invalid_role_limits",
              `Body.roleLimits["${k}"] must be a non-negative number`,
            );
          }
          cleaned[k] = Math.floor(v);
        }
        input.roleLimits = cleaned;
      }
      if (body.perUserDailyCap !== undefined) {
        if (
          typeof body.perUserDailyCap !== "number" ||
          !Number.isFinite(body.perUserDailyCap) ||
          body.perUserDailyCap < 0
        ) {
          throw new BadRequestError(
            "invalid_per_user_daily_cap",
            "Body.perUserDailyCap must be a non-negative number",
          );
        }
        input.perUserDailyCap = Math.floor(body.perUserDailyCap);
      }
      if (body.dataEgressAccepted !== undefined) {
        if (typeof body.dataEgressAccepted !== "boolean") {
          throw new BadRequestError(
            "invalid_data_egress_accepted",
            "Body.dataEgressAccepted must be a boolean",
          );
        }
        input.dataEgressAccepted = body.dataEgressAccepted;
      }
      const updated = await settings.update(ctx.userId, workspaceId, input);
      return { ok: true, settings: settings.toDto(updated) };
    });

    // ----- Usage (admin-only) -----
    app.get("/workspaces/:workspaceId/ai/usage", async (req) => {
      const ctx = requireUser(req);
      const params = (req.params ?? {}) as { workspaceId?: unknown };
      const workspaceId = assertWorkspaceId(params.workspaceId);
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
      // 30-day rolling window for chart + role usage.
      const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [monthlyAgg, perUser, perUserToday, dailySeries, roleUsageRows, settings, members] =
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
             FROM ai_usage_ledger l
             WHERE l.workspace_id = $1 AND l.created_at >= $2
             GROUP BY 1
             ORDER BY 1 ASC`,
            workspaceId,
            since30d,
          ),
          app.prisma.$queryRawUnsafe<{ role: string; total: bigint }[]>(
            `SELECT wm.role::text AS role,
                    COALESCE(SUM(l.tokens_in + l.tokens_out), 0) AS total
             FROM ai_usage_ledger l
             INNER JOIN workspace_members wm
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

      const roleLimits = (settings?.roleLimits ?? {}) as Record<string, number>;
      const perUserDailyCap = settings?.perUserDailyCap ?? 0;
      const ALERT_THRESHOLD = 0.9;

      const roleAlerts: Array<{ role: string; used: number; limit: number; percent: number }> = [];
      for (const [role, limit] of Object.entries(roleLimits)) {
        const limitNum = Number(limit);
        if (limitNum <= 0) continue;
        const used = roleUsage[role] ?? 0;
        if (used / limitNum >= ALERT_THRESHOLD) {
          roleAlerts.push({ role, used, limit: limitNum, percent: used / limitNum });
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

      return {
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
      };
    });
  };
}
