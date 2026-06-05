import type { PrismaClient } from "@prisma/client";

import { importBeerprotoAll } from "../../../../seed/sources/beerproto/beerproto.js";

export async function listSyncRuns(prisma: PrismaClient) {
  return prisma.ingredientImportRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 20,
    include: { source: true },
  });
}

export async function runBeerprotoSync(prisma: PrismaClient) {
  return importBeerprotoAll(prisma, { dryRun: false });
}
