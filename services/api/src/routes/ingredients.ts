import type { FastifyInstance } from "fastify";
import { ForbiddenError } from "../errors.js";
import { requireActiveAccount, requireUser } from "../plugins/requestContext.js";
import { AccountsService } from "../services/accountsService.js";
import { importBeerprotoAll } from "../seed/sources/beerproto/beerproto.js";
import { getMashPhModelDefaultsV1 } from "../domain/waterCalc/mashPhDefaultsV1.js";

function isAdminRole(role: string | null) {
  return role === "brewery_admin";
}

function getQueryString(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim();
}

export async function ingredientsRoutes(app: FastifyInstance) {
  const accounts = new AccountsService(app.prisma);

  app.get("/ingredients/fermentables", async (req) => {
    const ctx = requireUser(req);
    const q = getQueryString((req.query as any)?.query);

    const items = await app.prisma.fermentable.findMany({
      where: {
        deprecatedAt: null,
        ...(ctx.activeAccountId ? { OR: [{ accountId: null }, { accountId: ctx.activeAccountId }] } : { accountId: null }),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { producer: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
      take: 50,
      select: {
        id: true,
        accountId: true,
        name: true,
        producer: true,
        group: true,
        type: true,
        notes: true,
        country: true,
        colorEbc: true,
        colorLovibond: true,
        yieldPercent: true,
        ppg: true,
        mashDiPh: true,
        mashTaToPh57_mEqPerKg: true,
        mashPhModelKey: true,
        mashPhModelSource: true,
        mashPhModelVersion: true,
      },
    });

    const computed = items.map((it) => {
      const defaults = getMashPhModelDefaultsV1({
        name: it.name,
        group: it.group ?? null,
        type: it.type ?? null,
        notes: it.notes ?? null,
        colorEbc: typeof it.colorEbc === "number" && Number.isFinite(it.colorEbc) ? it.colorEbc : null,
      });
      return {
        ...it,
        mashDiPh: it.mashDiPh ?? defaults.mashDiPh,
        mashTaToPh57_mEqPerKg: it.mashTaToPh57_mEqPerKg ?? defaults.mashTaToPh57_mEqPerKg,
        mashPhModelKey: it.mashPhModelKey ?? defaults.mashPhModelKey,
        mashPhModelSource: it.mashPhModelSource ?? defaults.mashPhModelSource,
        mashPhModelVersion: it.mashPhModelVersion ?? defaults.mashPhModelVersion,
      };
    });

    return { ok: true, items: computed };
  });

  app.get("/ingredients/hops", async (req) => {
    const ctx = requireUser(req);
    const q = getQueryString((req.query as any)?.query);

    const items = await app.prisma.hop.findMany({
      where: {
        deprecatedAt: null,
        ...(ctx.activeAccountId ? { OR: [{ accountId: null }, { accountId: ctx.activeAccountId }] } : { accountId: null }),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: { name: "asc" },
      take: 50,
      select: {
        id: true,
        accountId: true,
        name: true,
        country: true,
        type: true,
        alphaMin: true,
        alphaMax: true,
        betaMin: true,
        betaMax: true,
      },
    });

    return { ok: true, items };
  });

  app.get("/ingredients/yeasts", async (req) => {
    const ctx = requireUser(req);
    const q = getQueryString((req.query as any)?.query);

    const items = await app.prisma.yeast.findMany({
      where: {
        deprecatedAt: null,
        ...(ctx.activeAccountId ? { OR: [{ accountId: null }, { accountId: ctx.activeAccountId }] } : { accountId: null }),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { lab: { contains: q, mode: "insensitive" } },
                { productId: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
      take: 50,
      select: {
        id: true,
        accountId: true,
        name: true,
        lab: true,
        productId: true,
        type: true,
        form: true,
        attenuationMin: true,
        attenuationMax: true,
        tempMinC: true,
        tempMaxC: true,
      },
    });

    return { ok: true, items };
  });

  app.get("/admin/ingredients/sync-runs", async (req) => {
    const ctx = requireActiveAccount(req);
    const role = await accounts.assertMembership(ctx.userId, ctx.activeAccountId);
    if (!isAdminRole(role)) throw new ForbiddenError("not_admin", "Admin role required");

    const runs = await app.prisma.ingredientImportRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
      include: { source: true },
    });
    return { ok: true, runs };
  });

  app.post("/admin/ingredients/sync", async (req) => {
    const ctx = requireActiveAccount(req);
    const role = await accounts.assertMembership(ctx.userId, ctx.activeAccountId);
    if (!isAdminRole(role)) throw new ForbiddenError("not_admin", "Admin role required");

    const result = await importBeerprotoAll(app.prisma, { dryRun: false });
    return { ok: true, result };
  });
}

