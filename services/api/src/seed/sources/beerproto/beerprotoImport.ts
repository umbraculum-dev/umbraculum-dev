import { importFermentableRow } from "./beerprotoFermentables.js";
import { importHopRow } from "./beerprotoHops.js";
import {
  SOURCE_LICENSE,
  SOURCE_NAME,
  SOURCE_URL,
  fetchCsvIfChanged,
  kindForResource,
  now,
  parseCsvRows,
  toStringOrNull,
  type BeerprotoImportOptions,
  type BeerprotoResourcePath,
  type PrismaLike,
} from "./beerprotoTypes.js";
import { importYeastRow } from "./beerprotoYeasts.js";

export async function importBeerprotoResource(prisma: PrismaLike, opts: BeerprotoImportOptions) {
  const kind = kindForResource(opts.resourcePath);
  const run = await prisma.ingredientImportRun.create({
    data: {
      sourceId: (await prisma.ingredientSource.findUnique({
        where: { sourceName_resourcePath: { sourceName: SOURCE_NAME, resourcePath: opts.resourcePath } },
      }))?.id ?? (await prisma.ingredientSource.create({
        data: { sourceName: SOURCE_NAME, sourceUrl: SOURCE_URL, sourceLicense: SOURCE_LICENSE, resourcePath: opts.resourcePath },
      })).id,
      status: "running",
    },
  });

  try {
    const fetched = await fetchCsvIfChanged(prisma, opts.resourcePath, kind, opts.force === true);
    if (!fetched.changed) {
      await prisma.ingredientImportRun.update({
        where: { id: run.id },
        data: { status: "skipped_not_modified", finishedAt: now(), statsJson: { resourcePath: opts.resourcePath } },
      });
      return { ok: true as const, status: "skipped_not_modified" as const };
    }

    const rows = parseCsvRows(fetched.csvText);
    let created = 0;
    let updated = 0;
    let staged = 0;

    for (const row of rows) {
      const sourceKey = toStringOrNull(row["ID"]);
      const name = toStringOrNull(row["Name"]);
      if (!sourceKey || !name) continue;

      if (opts.dryRun !== true) {
        await prisma.ingredientStagingRow.create({
          data: {
            importRunId: run.id,
            kind,
            sourceKey,
            rawPayloadJson: row,
          },
        });
        staged++;
      }

      const rowCtx = { row, sourceKey, name, dryRun: opts.dryRun === true };
      let rowStats: { created: number; updated: number };
      if (kind === "fermentable") {
        rowStats = await importFermentableRow(prisma, rowCtx);
      } else if (kind === "hop") {
        rowStats = await importHopRow(prisma, rowCtx);
      } else {
        rowStats = await importYeastRow(prisma, rowCtx);
      }
      created += rowStats.created;
      updated += rowStats.updated;
    }

    await prisma.ingredientImportRun.update({
      where: { id: run.id },
      data: {
        status: "ok",
        finishedAt: now(),
        statsJson: { resourcePath: opts.resourcePath, kind, rows: rows.length, staged, created, updated },
      },
    });
    await prisma.ingredientSource.update({
      where: { id: fetched.sourceId },
      data: { lastAppliedAt: now() },
    });

    return { ok: true as const, status: "ok" as const, stats: { created, updated, staged, rows: rows.length } };
  } catch (err) {
    await prisma.ingredientImportRun.update({
      where: { id: run.id },
      data: { status: "error", finishedAt: now(), error: String(err) },
    });
    throw err;
  }
}

export async function importBeerprotoAll(prisma: PrismaLike, opts?: { dryRun?: boolean; force?: boolean }) {
  const resources: BeerprotoResourcePath[] = [
    "fermentables/malts.csv",
    "fermentables/sugar.csv",
    "hops/hops.csv",
    "culture/yeast.csv",
  ];

  const results = [];
  for (const resourcePath of resources) {
    results.push(
      await importBeerprotoResource(prisma, {
        resourcePath,
        dryRun: opts?.dryRun === true,
        force: opts?.force === true,
      }),
    );
  }
  return { ok: true as const, results };
}
