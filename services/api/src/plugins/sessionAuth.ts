import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import cookie from "@fastify/cookie";

import { UnauthorizedError } from "../errors.js";

export const SESSION_COOKIE_NAME = "sid";

type SessionContext = {
  userId: string;
  activeAccountId: string | null;
  sessionId: string;
};

declare module "fastify" {
  interface FastifyRequest {
    sessionContext?: SessionContext;
  }
}

function readCookieSessionId(req: FastifyRequest): string | null {
  const val = (req.cookies as any)?.[SESSION_COOKIE_NAME];
  if (typeof val !== "string" || !val.trim()) return null;
  return val;
}

export const sessionAuthPlugin = fp(async (app: FastifyInstance) => {
  await app.register(cookie);

  app.addHook("onRequest", async (req) => {
    const sessionId = readCookieSessionId(req);
    if (!sessionId) return;

    const session = await app.prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true, activeAccountId: true, expiresAt: true },
    });
    if (!session) return;

    if (session.expiresAt.getTime() <= Date.now()) {
      // Best-effort cleanup
      await app.prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      return;
    }

    req.sessionContext = {
      sessionId: session.id,
      userId: session.userId,
      activeAccountId: session.activeAccountId ?? null,
    };
  });
});

export function requireSession(req: FastifyRequest): SessionContext {
  const ctx = req.sessionContext;
  if (!ctx) throw new UnauthorizedError("missing_session", "Not authenticated");
  return ctx;
}

export function requireActiveAccountInSession(
  req: FastifyRequest,
): SessionContext & { activeAccountId: string } {
  const ctx = requireSession(req);
  if (!ctx.activeAccountId) {
    throw new UnauthorizedError("missing_active_account", "No active account selected");
  }
  return { ...ctx, activeAccountId: ctx.activeAccountId };
}

