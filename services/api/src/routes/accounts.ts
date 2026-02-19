import type { FastifyInstance } from "fastify";
import { BadRequestError } from "../errors.js";
import { requireActiveAccount, requireUser } from "../plugins/requestContext.js";
import { AccountsService } from "../services/accountsService.js";

const ALLOWED_BRAND_KEYS = ["default", "acme", "forest"] as const;
type BrandKey = (typeof ALLOWED_BRAND_KEYS)[number];

function assertBrandKey(v: unknown): BrandKey {
  return typeof v === "string" && (ALLOWED_BRAND_KEYS as readonly string[]).includes(v) ? (v as BrandKey) : "default";
}

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

  app.patch("/accounts/:id/brand", async (req) => {
    const ctx = requireUser(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const accountId = typeof params.id === "string" ? params.id : "";
    if (!accountId) throw new BadRequestError("invalid_account_id", "Params.id is required");

    const role = await accounts.assertMembership(ctx.userId, accountId);
    if (role !== "brewery_admin") {
      throw new BadRequestError("not_admin", "Admin role required");
    }

    const body = (req.body ?? {}) as { brandKey?: unknown };
    const brandKey = assertBrandKey(body.brandKey);

    const updated = await app.prisma.account.update({
      where: { id: accountId },
      data: { brandKey },
      select: { id: true, name: true, brandKey: true },
    });
    return { ok: true, account: updated };
  });

  // Example account-scoped endpoint pattern (not used yet):
  app.get("/accounts/active", async (req) => {
    const ctx = requireActiveAccount(req);
    const role = await accounts.assertMembership(ctx.userId, ctx.activeAccountId);
    return { ok: true, activeAccountId: ctx.activeAccountId, role };
  });
}

