import type { FastifyInstance, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../errors.js";
import { requireActiveAccountInSession, requireSession } from "./sessionAuth.js";

export type RequestContext = {
  userId: string;
  activeAccountId: string | null;
};

declare module "fastify" {
  interface FastifyRequest {
    requestContext?: RequestContext;
  }
}

export function getOptionalContext(req: FastifyRequest): RequestContext | null {
  if (req.sessionContext) {
    return {
      userId: req.sessionContext.userId,
      activeAccountId: req.sessionContext.activeAccountId ?? null,
    };
  }
  return null;
}

export function requireUser(req: FastifyRequest): RequestContext {
  const s = requireSession(req);
  return { userId: s.userId, activeAccountId: s.activeAccountId };
}

export function requireActiveAccount(req: FastifyRequest): RequestContext & { activeAccountId: string } {
  const s = requireActiveAccountInSession(req);
  return { userId: s.userId, activeAccountId: s.activeAccountId };
}

export async function requestContextPlugin(app: FastifyInstance) {
  app.addHook("onRequest", async (req) => {
    const ctx = getOptionalContext(req);
    if (ctx) req.requestContext = ctx;
  });
}

