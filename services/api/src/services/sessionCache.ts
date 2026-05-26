import type { RedisClientType } from "redis";

type CachedSession = {
  id: string;
  userId: string;
  activeWorkspaceId: string | null;
  expiresAtIso: string;
};

function getSessionCacheKey(sessionId: string): string {
  return `session:${sessionId}`;
}

export async function readCachedSession(
  redis: RedisClientType,
  sessionId: string,
): Promise<{ id: string; userId: string; activeWorkspaceId: string | null; expiresAt: Date } | null> {
  try {
    const raw = await redis.get(getSessionCacheKey(sessionId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CachedSession>;
    if (typeof parsed.id !== "string" || !parsed.id) return null;
    if (typeof parsed.userId !== "string" || !parsed.userId) return null;
    if (parsed.activeWorkspaceId !== null && typeof parsed.activeWorkspaceId !== "string") return null;
    if (typeof parsed.expiresAtIso !== "string" || !parsed.expiresAtIso) return null;

    const expiresAt = new Date(parsed.expiresAtIso);
    if (Number.isNaN(expiresAt.getTime())) return null;

    return {
      id: parsed.id,
      userId: parsed.userId,
      activeWorkspaceId: parsed.activeWorkspaceId ?? null,
      expiresAt,
    };
  } catch {
    return null;
  }
}

export async function writeCachedSession(
  redis: RedisClientType,
  session: { id: string; userId: string; activeWorkspaceId: string | null; expiresAt: Date },
): Promise<void> {
  const ttlSeconds = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);
  if (ttlSeconds <= 0) return;

  const payload: CachedSession = {
    id: session.id,
    userId: session.userId,
    activeWorkspaceId: session.activeWorkspaceId ?? null,
    expiresAtIso: session.expiresAt.toISOString(),
  };

  try {
    await redis.set(getSessionCacheKey(session.id), JSON.stringify(payload), { EX: ttlSeconds });
  } catch {
    // Best-effort cache.
  }
}

export async function deleteCachedSession(redis: RedisClientType, sessionId: string): Promise<void> {
  try {
    await redis.del(getSessionCacheKey(sessionId));
  } catch {
    // Best-effort cache.
  }
}

