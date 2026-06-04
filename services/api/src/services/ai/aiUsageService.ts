import type { PrismaClient } from "@prisma/client";
import { WorkspaceAiUsageResponseSchema } from "@umbraculum/contracts";

import { BadRequestError } from "../../errors.js";
import { WorkspacesService } from "../workspacesService.js";

const ALERT_THRESHOLD = 0.9;

export class AiUsageService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async getWorkspaceUsage(userId: string, workspaceId: string) {
    const role = await this.workspaces.getMembershipRole(userId, workspaceId);
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
        this.prisma.aiUsageLedger.aggregate({
          where: { workspaceId, createdAt: { gte: startOfMonth } },
          _sum: { tokensIn: true, tokensOut: true, costMicroUsd: true },
          _count: { id: true },
        }),
        this.prisma.aiUsageLedger.groupBy({
          by: ["userId"],
          where: { workspaceId, createdAt: { gte: startOfMonth } },
          _sum: { tokensIn: true, tokensOut: true, costMicroUsd: true },
          _count: { id: true },
        }),
        this.prisma.aiUsageLedger.groupBy({
          by: ["userId"],
          where: { workspaceId, createdAt: { gte: startOfDay } },
          _sum: { tokensIn: true, tokensOut: true },
        }),
        this.prisma.$queryRawUnsafe<
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
        this.prisma.$queryRawUnsafe<{ role: string; total: bigint }[]>(
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
        this.prisma.workspaceAiSettings.findUnique({ where: { workspaceId } }),
        this.prisma.workspaceMember.findMany({
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
      for (const [alertUserId, today] of todayMap.entries()) {
        const usedToday = today.tokensInToday + today.tokensOutToday;
        if (usedToday / perUserDailyCap >= ALERT_THRESHOLD) {
          userAlerts.push({
            userId: alertUserId,
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
  }
}
