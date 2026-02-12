import type { FastifyInstance } from "fastify";
import { BadRequestError } from "../errors.js";
import { requireActiveAccount, requireUser } from "../plugins/requestContext.js";
import { AccountsService } from "../services/accountsService.js";

export async function accountsRoutes(app: FastifyInstance) {
  const accounts = new AccountsService(app.prisma);

  app.get("/me", async (req) => {
    const ctx = requireUser(req);
    const role = ctx.activeAccountId
      ? await accounts.getMembershipRole(ctx.userId, ctx.activeAccountId)
      : null;

    return {
      ok: true,
      userId: ctx.userId,
      activeAccountId: ctx.activeAccountId,
      role,
    };
  });

  app.get("/accounts", async (req) => {
    const ctx = requireUser(req);
    const list = await accounts.listAccountsForUser(ctx.userId);
    return { ok: true, accounts: list };
  });

  app.post("/accounts", async (req) => {
    const ctx = requireUser(req);
    const body = (req.body ?? {}) as { name?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) throw new BadRequestError("invalid_name", "Body.name is required");

    const created = await accounts.createAccountForUser(ctx.userId, name);
    return { ok: true, account: created };
  });

  // Example account-scoped endpoint pattern (not used yet):
  app.get("/accounts/active", async (req) => {
    const ctx = requireActiveAccount(req);
    const role = await accounts.assertMembership(ctx.userId, ctx.activeAccountId);
    return { ok: true, activeAccountId: ctx.activeAccountId, role };
  });
}

