import type { Prisma, PrismaClient } from "@prisma/client";

import { getMashPhModelDefaultsV1 } from "../waterCalc/mashPhDefaultsV1.js";

import {
  getQueryString,
  parseSearchPagination,
  workspaceIngredientFilter,
} from "./ingredientsQueryHelpers.js";

export async function searchFermentables(
  prisma: PrismaClient,
  params: { activeWorkspaceId: string | null | undefined; query: string; offset: number; limit: number },
) {
  const q = getQueryString(params.query);
  const filters: Prisma.FermentableWhereInput[] = [workspaceIngredientFilter(params.activeWorkspaceId)];
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
    prisma.fermentable.count({ where }),
    prisma.fermentable.findMany({
      where,
      orderBy: { name: "asc" },
      skip: params.offset,
      take: params.limit,
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

  return { items: computed, total, offset: params.offset, limit: params.limit };
}

export async function searchHops(
  prisma: PrismaClient,
  params: { activeWorkspaceId: string | null | undefined; query: string; offset: number; limit: number },
) {
  const q = getQueryString(params.query);
  const filters: Prisma.HopWhereInput[] = [workspaceIngredientFilter(params.activeWorkspaceId)];
  if (q) {
    filters.push({ name: { contains: q, mode: "insensitive" } });
  }
  const where: Prisma.HopWhereInput = {
    deprecatedAt: null,
    AND: filters,
  };

  const [total, items] = await Promise.all([
    prisma.hop.count({ where }),
    prisma.hop.findMany({
      where,
      orderBy: { name: "asc" },
      skip: params.offset,
      take: params.limit,
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

  return { items, total, offset: params.offset, limit: params.limit };
}

export async function listYeasts(
  prisma: PrismaClient,
  params: { activeWorkspaceId: string | null | undefined; query: string },
) {
  const q = getQueryString(params.query);
  const filters: Prisma.YeastWhereInput[] = [workspaceIngredientFilter(params.activeWorkspaceId)];
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

  const items = await prisma.yeast.findMany({
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

  return { items };
}

export { parseSearchPagination };
