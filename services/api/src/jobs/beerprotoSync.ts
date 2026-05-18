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
    // In production this should typically run with ETag caching.
    // Set BEERPROTO_FORCE_SYNC=1 to backfill new mapped fields.
    const force = process.env['BEERPROTO_FORCE_SYNC'] === "1";
    await importBeerprotoAll(prisma, { dryRun: false, force });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
   
  console.error(err);
  process.exit(1);
});

