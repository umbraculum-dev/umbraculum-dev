/**
 * Weekly BeerProto sync job (v0).
 *
 * This job is intended to run in production on a schedule (e.g. weekly).
 * It is idempotent and uses ETags to avoid re-downloading unchanged resources.
 */

import { PrismaClient } from "@prisma/client";
import { importBeerprotoAll } from "../seed/sources/beerproto/beerproto.js";

async function main() {
  const prisma = new PrismaClient();
  try {
    await importBeerprotoAll(prisma, { dryRun: false });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

