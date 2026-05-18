import type { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { ForbiddenError } from "../errors.js";
import { requireActiveWorkspace, requireUser } from "../plugins/requestContext.js";
import { WorkspacesService } from "../services/workspacesService.js";
import { importBeerprotoAll } from "../seed/sources/beerproto/beerproto.js";
import { getMashPhModelDefaultsV1 } from "../domain/waterCalc/mashPhDefaultsV1.js";

function isAdminRole(role: string | null) {
  return role === "brewery_admin";
}

function getQueryString(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim();
}

function getQueryInt(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return null;
  return n;
}

function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function ingredientsRoutes(app: FastifyInstance) {
  const workspaces = new WorkspacesService(app.prisma);

  app.get("/ingredients/fermentables", async (req) => {
    const ctx = requireUser(req);
    const query = (req.query ?? {}) as Record<string, unknown>;
    const q = getQueryString(query.query);
    const offsetRaw = getQueryInt(query.offset);
    const limitRaw = getQueryInt(query.limit);
    const offset = offsetRaw != null && offsetRaw >= 0 ? offsetRaw : 0;
    const limit = limitRaw != null ? clampInt(limitRaw, 1, 50) : 50;

    const filters: Prisma.FermentableWhereInput[] = [
      ctx.activeWorkspaceId
        ? { OR: [{ workspaceId: null }, { workspaceId: ctx.activeWorkspaceId }] }
        : { workspaceId: null },
    ];
    if (q) {
      filters.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { producer: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    const where: Prisma.FermentableWhereInput = {
      deprecatedAt: null,
      AND: filters,
    };

    const [total, items] = await Promise.all([
      app.prisma.fermentable.count({ where }),
      app.prisma.fermentable.findMany({
        where,
        orderBy: { name: "asc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          workspaceId: true,
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
      }),
    ]);

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

    return { ok: true, items: computed, total, offset, limit };
  });

  app.get("/ingredients/hops", async (req) => {
    const ctx = requireUser(req);
    const query = (req.query ?? {}) as Record<string, unknown>;
    const q = getQueryString(query.query);
    const offsetRaw = getQueryInt(query.offset);
    const limitRaw = getQueryInt(query.limit);
    const offset = offsetRaw != null && offsetRaw >= 0 ? offsetRaw : 0;
    const limit = limitRaw != null ? clampInt(limitRaw, 1, 50) : 50;

    const filters: Prisma.HopWhereInput[] = [
      ctx.activeWorkspaceId
        ? { OR: [{ workspaceId: null }, { workspaceId: ctx.activeWorkspaceId }] }
        : { workspaceId: null },
    ];
    if (q) {
      filters.push({ name: { contains: q, mode: "insensitive" } });
    }
    const where: Prisma.HopWhereInput = {
      deprecatedAt: null,
      AND: filters,
    };

    const [total, items] = await Promise.all([
      app.prisma.hop.count({ where }),
      app.prisma.hop.findMany({
        where,
        orderBy: { name: "asc" },
        skip: offset,
        take: limit,
        select: {
          id: true,
          workspaceId: true,
          name: true,
          country: true,
          type: true,
          alphaMin: true,
          alphaMax: true,
          betaMin: true,
          betaMax: true,
        },
      }),
    ]);

    return { ok: true, items, total, offset, limit };
  });

  app.get("/ingredients/yeasts", async (req) => {
    const ctx = requireUser(req);
    const query = (req.query ?? {}) as Record<string, unknown>;
    const q = getQueryString(query.query);

    const filters: Prisma.YeastWhereInput[] = [
      ctx.activeWorkspaceId
        ? { OR: [{ workspaceId: null }, { workspaceId: ctx.activeWorkspaceId }] }
        : { workspaceId: null },
    ];
    if (q) {
      filters.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { lab: { contains: q, mode: "insensitive" } },
          { productId: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    const where: Prisma.YeastWhereInput = {
      deprecatedAt: null,
      AND: filters,
    };

    const items = await app.prisma.yeast.findMany({
      where,
      orderBy: { name: "asc" },
      take: 50,
      select: {
        id: true,
        workspaceId: true,
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
    const ctx = requireActiveWorkspace(req);
    const role = await workspaces.assertMembership(ctx.userId, ctx.activeWorkspaceId);
    if (!isAdminRole(role)) throw new ForbiddenError("not_admin", "Admin role required");

    const runs = await app.prisma.ingredientImportRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
      include: { source: true },
    });
    return { ok: true, runs };
  });

  app.post("/admin/ingredients/sync", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const role = await workspaces.assertMembership(ctx.userId, ctx.activeWorkspaceId);
    if (!isAdminRole(role)) throw new ForbiddenError("not_admin", "Admin role required");

    const result = await importBeerprotoAll(app.prisma, { dryRun: false });
    return { ok: true, result };
  });
}

