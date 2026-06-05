import type { PrismaClient } from "@prisma/client";

/**
 * Aggregate the workspace's trailing 30-day token usage per role.
 */
export async function readRoleUsage(
  prisma: PrismaClient,
  workspaceId: string,
): Promise<Record<string, number>> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const rows = await prisma.$queryRawUnsafe<{ role: string; total: bigint }[]>(
    `SELECT wm.role::text AS role, COALESCE(SUM(l.tokens_in + l.tokens_out), 0) AS total
     FROM platform.ai_usage_ledger l
     INNER JOIN platform.workspace_members wm ON wm.workspace_id = l.workspace_id AND wm.user_id = l.user_id
     WHERE l.workspace_id = $1 AND l.created_at >= $2
     GROUP BY wm.role`,
    workspaceId,
    since,
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.role] = Number(r.total ?? 0);
  return out;
}

/**
 * Aggregate today's token usage (UTC) for a single user.
 */
export async function readUserDailyUsage(
  prisma: PrismaClient,
  workspaceId: string,
  userId: string,
): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const result = await prisma.aiUsageLedger.aggregate({
    where: { workspaceId, userId, createdAt: { gte: startOfDay } },
    _sum: { tokensIn: true, tokensOut: true },
  });
  const tIn = result._sum.tokensIn ?? 0;
  const tOut = result._sum.tokensOut ?? 0;
  return tIn + tOut;
}
