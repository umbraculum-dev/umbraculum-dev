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

type Args = {
  source?: string;
  path?: string;
  dryRun: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--source") args.source = argv[++i];
    else if (a === "--path") args.path = argv[++i];
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
      "seed-import (scaffold)",
      "",
      "Usage:",
      "  npm run seed:import -- --source beerproto --path ./seed-sources/beerproto",
      "  npm run seed:import -- --help",
      "",
      "Flags:",
      "  --source   Source name (e.g. beerproto)",
      "  --path     Local path to the dataset",
      "  --dry-run  Parse/validate only (no DB writes)",
      "",
      "Notes:",
      "  - This command will later write into staging tables, normalize, and upsert canonical tables.",
      "  - Licensing constraints are tracked in docs/RAW-MATERIALS-SEEDABLE-SOURCES.md.",
    ].join("\n"),
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.source || !args.path) {
    printHelp();
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log("seed-import scaffold:");
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(args, null, 2));

  // TODO: implement source-specific parsers under src/seed/sources/.
  // TODO: add Prisma staging + canonical models (see src/seed/README.md).
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

