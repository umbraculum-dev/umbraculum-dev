import type { FastifyInstance, FastifyRequest } from "fastify";
import { requireActiveWorkspaceInSession, requireSession } from "./sessionAuth.js";

export type RequestContext = {
  userId: string;
  activeWorkspaceId: string | null;
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
      activeWorkspaceId: req.sessionContext.activeWorkspaceId ?? null,
    };
  }
  return null;
}

export function requireUser(req: FastifyRequest): RequestContext {
  const s = requireSession(req);
  return { userId: s.userId, activeWorkspaceId: s.activeWorkspaceId };
}

export function requireActiveWorkspace(req: FastifyRequest): RequestContext & { activeWorkspaceId: string } {
  const s = requireActiveWorkspaceInSession(req);
  return { userId: s.userId, activeWorkspaceId: s.activeWorkspaceId };
}

export function requestContextPlugin(app: FastifyInstance) {
  app.addHook("onRequest", (req, _reply, done) => {
    const ctx = getOptionalContext(req);
    if (ctx) req.requestContext = ctx;
    done();
  });
}

