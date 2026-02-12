import type { FastifyInstance, FastifyRequest } from "fastify";
import { BadRequestError, UnauthorizedError } from "../errors.js";

export type RequestContext = {
  userId: string;
  activeAccountId: string | null;
};

declare module "fastify" {
  interface FastifyRequest {
    requestContext?: RequestContext;
  }
}

function getHeader(req: FastifyRequest, name: string): string | undefined {
  const val = req.headers[name.toLowerCase()];
  if (!val) return undefined;
  if (Array.isArray(val)) return val[0];
  return String(val);
}

export function getOptionalContext(req: FastifyRequest): RequestContext | null {
  const userId = getHeader(req, "x-user-id");
  const activeAccountId = getHeader(req, "x-account-id");

  if (!userId && !activeAccountId) return null;
  if (!userId) throw new BadRequestError("missing_user_id", "Missing header: X-User-Id");

  return {
    userId,
    activeAccountId: activeAccountId ?? null,
  };
}

export function requireUser(req: FastifyRequest): RequestContext {
  const ctx = getOptionalContext(req);
  if (!ctx) throw new UnauthorizedError("missing_auth", "Missing auth headers");
  return ctx;
}

export function requireActiveAccount(req: FastifyRequest): RequestContext & { activeAccountId: string } {
  const ctx = requireUser(req);
  if (!ctx.activeAccountId) {
    throw new BadRequestError("missing_account_id", "Missing header: X-Account-Id");
  }
  return { ...ctx, activeAccountId: ctx.activeAccountId };
}

export async function requestContextPlugin(app: FastifyInstance) {
  app.addHook("onRequest", async (req) => {
    const ctx = getOptionalContext(req);
    if (ctx) req.requestContext = ctx;
  });
}

