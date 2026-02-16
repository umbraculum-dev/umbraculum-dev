import type { FastifyInstance, FastifyRequest } from "fastify";
import { BadRequestError, UnauthorizedError } from "../errors.js";
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

function getHeader(req: FastifyRequest, name: string): string | undefined {
  const val = req.headers[name.toLowerCase()];
  if (!val) return undefined;
  if (Array.isArray(val)) return val[0];
  return String(val);
}

export function getOptionalContext(req: FastifyRequest): RequestContext | null {
  // Primary (production): session cookie -> sessionContext
  if (req.sessionContext) {
    return {
      userId: req.sessionContext.userId,
      activeAccountId: req.sessionContext.activeAccountId ?? null,
    };
  }

  // Dev fallback only: header-based auth (temporary migration window)
  const allowDevHeaders = process.env.NODE_ENV === "development";
  if (!allowDevHeaders) return null;

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
  // Prefer real auth (cookie session). Keep dev-header fallback for a short migration window.
  if (req.sessionContext) {
    const s = requireSession(req);
    return { userId: s.userId, activeAccountId: s.activeAccountId };
  }

  // Dev-only fallback (legacy headers)
  if (process.env.NODE_ENV !== "development") {
    throw new UnauthorizedError("missing_session", "Not authenticated");
  }
  const ctx = getOptionalContext(req);
  if (!ctx) throw new UnauthorizedError("missing_auth", "Not authenticated");
  return ctx;
}

export function requireActiveAccount(req: FastifyRequest): RequestContext & { activeAccountId: string } {
  // Prefer real auth (cookie session).
  if (req.sessionContext) {
    const s = requireActiveAccountInSession(req);
    return { userId: s.userId, activeAccountId: s.activeAccountId };
  }

  // Dev-only fallback (legacy headers)
  const ctx = requireUser(req);
  if (!ctx.activeAccountId) throw new UnauthorizedError("missing_active_account", "No active account selected");
  return { ...ctx, activeAccountId: ctx.activeAccountId };
}

export async function requestContextPlugin(app: FastifyInstance) {
  app.addHook("onRequest", async (req) => {
    const ctx = getOptionalContext(req);
    if (ctx) req.requestContext = ctx;
  });
}

