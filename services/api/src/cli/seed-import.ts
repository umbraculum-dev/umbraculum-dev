/**
 * Ingredient seed/import CLI (scaffold).
 *
 * This is intentionally minimal for now: it exists as an entrypoint and a place
 * to hang source-specific importers later.
 *
 * Source of truth for the strategy and licensing constraints:
 * - docs/RAW-MATERIALS-SEEDABLE-SOURCES.md
 * - src/seed/README.md
 */

import { PrismaClient } from "@prisma/client";
import { importBeerprotoAll, importBeerprotoResource, type BeerprotoResourcePath } from "../seed/sources/beerproto/beerproto.js";

type Args = {
  source?: string;
  path?: string;
  resource?: string;
  dryRun: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--source") args.source = argv[++i];
    else if (a === "--path") args.path = argv[++i];
    else if (a === "--resource") args.resource = argv[++i];
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  // eslint-disable-next-line no-console
  console.log(
    [
      "seed-import",
      "",
      "Usage:",
      "  npm run seed:import -- --source beerproto",
      "  npm run seed:import -- --source beerproto --resource fermentables/malts.csv",
      "  npm run seed:import -- --help",
      "",
      "Flags:",
      "  --source   Source name (e.g. beerproto)",
      "  --resource BeerProto resource path (optional)",
      "  --path     Reserved for future local dataset imports",
      "  --dry-run  Parse/validate only (no DB writes)",
      "",
      "Notes:",
      "  - This command writes into staging tables, normalizes, and upserts canonical tables.",
      "  - Licensing constraints are tracked in docs/RAW-MATERIALS-SEEDABLE-SOURCES.md.",
    ].join("\n"),
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.source) {
    printHelp();
    process.exit(1);
  }

  if (args.path) {
    // eslint-disable-next-line no-console
    console.log("Note: --path is currently ignored; BeerProto imports fetch from upstream.");
  }

  const prisma = new PrismaClient();
  try {
    if (args.source === "beerproto") {
      if (args.resource) {
        await importBeerprotoResource(prisma, {
          resourcePath: args.resource as BeerprotoResourcePath,
          dryRun: args.dryRun,
        });
      } else {
        await importBeerprotoAll(prisma, { dryRun: args.dryRun });
      }
    } else {
      throw new Error(`Unsupported --source: ${args.source}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

