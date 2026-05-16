import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import cookie from "@fastify/cookie";

import { UnauthorizedError } from "../errors.js";
import { deleteCachedSession, readCachedSession, writeCachedSession } from "../services/sessionCache.js";

export const SESSION_COOKIE_NAME = "sid";

type SessionContext = {
  userId: string;
  activeWorkspaceId: string | null;
  sessionId: string;
};

declare module "fastify" {
  interface FastifyRequest {
    sessionContext?: SessionContext;
  }
}

function readCookieSessionId(req: FastifyRequest): string | null {
  const cookies = (req.cookies ?? {}) as Record<string, string | undefined>;
  const val = cookies[SESSION_COOKIE_NAME];
  if (typeof val !== "string" || !val.trim()) return null;
  return val;
}

export function readBearerToken(req: FastifyRequest): string | null {
  const auth = req.headers.authorization;
  if (typeof auth !== "string" || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  return token || null;
}

export const sessionAuthPlugin = fp(async (app: FastifyInstance) => {
  await app.register(cookie);

  app.addHook("onRequest", async (req) => {
    const sessionId = readCookieSessionId(req) ?? readBearerToken(req);
    if (!sessionId) return;

    const redis = app.redis;
    if (redis) {
      const cached = await readCachedSession(redis, sessionId);
      if (cached) {
        if (cached.expiresAt.getTime() <= Date.now()) {
          await deleteCachedSession(redis, sessionId);
          return;
        }

        req.sessionContext = {
          sessionId: cached.id,
          userId: cached.userId,
          activeWorkspaceId: cached.activeWorkspaceId ?? null,
        };
        return;
      }
    }

    const session = await app.prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true, activeWorkspaceId: true, expiresAt: true },
    });
    if (!session) return;

    if (session.expiresAt.getTime() <= Date.now()) {
      // Best-effort cleanup
      await app.prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      if (redis) await deleteCachedSession(redis, sessionId);
      return;
    }

    if (redis) {
      await writeCachedSession(redis, {
        id: session.id,
        userId: session.userId,
        activeWorkspaceId: session.activeWorkspaceId ?? null,
        expiresAt: session.expiresAt,
      });
    }

    req.sessionContext = {
      sessionId: session.id,
      userId: session.userId,
      activeWorkspaceId: session.activeWorkspaceId ?? null,
    };
  });
});

export function requireSession(req: FastifyRequest): SessionContext {
  const ctx = req.sessionContext;
  if (!ctx) throw new UnauthorizedError("missing_session", "Not authenticated");
  return ctx;
}

export function requireActiveWorkspaceInSession(
  req: FastifyRequest,
): SessionContext & { activeWorkspaceId: string } {
  const ctx = requireSession(req);
  if (!ctx.activeWorkspaceId) {
    throw new UnauthorizedError("missing_active_workspace", "No active workspace selected");
  }
  return { ...ctx, activeWorkspaceId: ctx.activeWorkspaceId };
}

