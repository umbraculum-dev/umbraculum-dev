import type { AuthServiceDeps } from "../authService.js";
import { writeCachedSession } from "../sessionCache.js";

export async function cacheSessionForDeps(
  deps: AuthServiceDeps,
  session: {
    id: string;
    userId: string;
    activeWorkspaceId: string | null;
    expiresAt: Date;
  },
) {
  if (!deps.redis) return;
  await writeCachedSession(deps.redis, {
    id: session.id,
    userId: session.userId,
    activeWorkspaceId: session.activeWorkspaceId,
    expiresAt: session.expiresAt,
  });
}
