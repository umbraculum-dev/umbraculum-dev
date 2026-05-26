import { parse } from "csv-parse/sync";
import type { PrismaClient } from "@prisma/client";

// Historical note: this file previously typed the prisma argument as
// `any` ("PrismaLike = any") to keep editor/host typechecking robust
// when Prisma Client generation was out of sync. That escape hatch
// produced ~108 unsafe-* warnings, and every other file in
// services/api imports `PrismaClient` directly without issue. We
// switched to a typed reference so this importer participates in the
// same type-safety guarantees as the rest of the codebase. If a
// stale Prisma Client ever causes editor friction here, the fix is
// to regenerate the client (`prisma generate`), not to escape-hatch
// this one file.
type PrismaLike = PrismaClient;

type IngredientKind = "fermentable" | "hop" | "yeast";
type ColorUnit = "ebc" | "srm" | "lovibond" | "unknown";

export type BeerprotoResourcePath =
  | "fermentables/malts.csv"
  | "fermentables/sugar.csv"
  | "hops/hops.csv"
  | "culture/yeast.csv";

export type BeerprotoImportOptions = {
  resourcePath: BeerprotoResourcePath;
  dryRun?: boolean;
  /**
   * Force a full fetch + upsert even if upstream resource is unchanged (ETag 304).
   * Useful when we add new mapped fields (e.g. `productId`) and need to backfill.
   */
  force?: boolean;
};

const SOURCE_NAME = "beerproto";
const SOURCE_URL = "https://github.com/beerproto/dataset";
const SOURCE_LICENSE = "MIT";

function rawUrl(resourcePath: string) {
  return `https://raw.githubusercontent.com/beerproto/dataset/master/${resourcePath}`;
}

function now() {
  return new Date();
}

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

function roundTo(n: number, decimals: number) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function roundToOrNull(n: number | null, decimals: number) {
  return typeof n === "number" && Number.isFinite(n) ? roundTo(n, decimals) : null;
}

function ebcToSrm(ebc: number) {
  // docs/modules/verticals/brewery/RAW-MATERIALS-SEEDABLE-SOURCES.md references the BeerProto fermentables README formula.
  return ebc * 0.508;
}

function _srmToEbc(srm: number) {
  return srm * 1.97;
}

function ebcToLovibondApprox(ebc: number) {
  // v0: treat °L approximately equal to SRM for grist compatibility.
  // If we need a more accurate mapping later, we can store the original color unit/value and refine the conversion.
  return ebcToSrm(ebc);
}

async function fetchCsvIfChanged(
  prisma: PrismaLike,
  resourcePath: BeerprotoResourcePath,
  kind: IngredientKind,
  force: boolean,
) {
  const url = rawUrl(resourcePath);

  const source = await prisma.ingredientSource.upsert({
    where: { sourceName_resourcePath: { sourceName: SOURCE_NAME, resourcePath } },
    create: { sourceName: SOURCE_NAME, sourceUrl: SOURCE_URL, sourceLicense: SOURCE_LICENSE, resourcePath },
    update: { sourceUrl: SOURCE_URL, sourceLicense: SOURCE_LICENSE },
  });

  const headers: Record<string, string> = {};
  // If `force` is set, do not send If-None-Match so we don't get a 304.
  // This allows backfilling new mapped fields without waiting for upstream changes.
  if (!force && source.etag) headers["If-None-Match"] = source.etag;

  const res = await fetch(url, { headers });
  if (res.status === 304) {
    // Bootstrap safety: if we have no mapped records for this kind, force a full fetch
    // so the canonical tables can be populated even if a prior dry-run cached the ETag.
    const mappedCount = await prisma.ingredientSourceMap.count({ where: { kind, sourceName: SOURCE_NAME } });
    if (mappedCount === 0) {
      const forced = await fetch(url);
      if (!forced.ok) {
        const text = await forced.text();
        throw new Error(
          `BeerProto forced fetch failed (${forced.status}) for ${resourcePath}: ${text.slice(0, 500)}`,
        );
      }
      const forcedEtag = forced.headers.get("etag");
      const forcedText = await forced.text();
      await prisma.ingredientSource.update({
        where: { id: source.id },
        data: { etag: forcedEtag ?? source.etag, lastCheckedAt: now() },
      });
      return { changed: true as const, sourceId: source.id, etag: forcedEtag ?? source.etag, csvText: forcedText };
    }

    await prisma.ingredientSource.update({
      where: { id: source.id },
      data: { lastCheckedAt: now() },
    });
    return { changed: false as const, sourceId: source.id, etag: source.etag };
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BeerProto fetch failed (${res.status}) for ${resourcePath}: ${text.slice(0, 500)}`);
  }

  const etag = res.headers.get("etag");
  const text = await res.text();

  await prisma.ingredientSource.update({
    where: { id: source.id },
    data: { etag: etag ?? source.etag, lastCheckedAt: now() },
  });

  return { changed: true as const, sourceId: source.id, etag: etag ?? source.etag, csvText: text };
}

function parseCsvRows(csvText: string): Array<Record<string, string>> {
  const trimmed = csvText.replace(/^\uFEFF/, ""); // strip BOM if present
  const rows = parse(trimmed, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as Array<Record<string, string>>;
  return Array.isArray(rows) ? rows : [];
}

function kindForResource(resourcePath: BeerprotoResourcePath): IngredientKind {
  if (resourcePath.startsWith("fermentables/")) return "fermentable";
  if (resourcePath.startsWith("hops/")) return "hop";
  return "yeast";
}

function pickColorUnit(standard: string | null): ColorUnit {
  // BeerProto fermentables README says values are stored as EBC where possible.
  // Keep this as 'unknown' unless we see strong evidence in the source row.
  if (!standard) return "unknown";
  if (standard.toLowerCase().includes("ebc")) return "ebc";
  return "unknown";
}

function upsertSourceMap(
  prisma: PrismaLike,
  input: { kind: IngredientKind; sourceKey: string; fermentableId?: string; hopId?: string; yeastId?: string },
) {
  return prisma.ingredientSourceMap.upsert({
    where: { kind_sourceName_sourceKey: { kind: input.kind, sourceName: SOURCE_NAME, sourceKey: input.sourceKey } },
    create: {
      kind: input.kind,
      sourceName: SOURCE_NAME,
      sourceKey: input.sourceKey,
      ...(input.fermentableId !== undefined ? { fermentableId: input.fermentableId } : {}),
      ...(input.hopId !== undefined ? { hopId: input.hopId } : {}),
      ...(input.yeastId !== undefined ? { yeastId: input.yeastId } : {}),
      confidence: 1.0,
      lastSeenAt: now(),
    },
    update: {
      ...(input.fermentableId !== undefined ? { fermentableId: input.fermentableId } : {}),
      ...(input.hopId !== undefined ? { hopId: input.hopId } : {}),
      ...(input.yeastId !== undefined ? { yeastId: input.yeastId } : {}),
      lastSeenAt: now(),
    },
  });
}

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

      if (kind === "fermentable") {
        const producer = toStringOrNull(row["Producer"]);
        const group = toStringOrNull(row["Group"]);
        const type = toStringOrNull(row["Type"]);
        const country = toStringOrNull(row["Country"]);
        const notes = toStringOrNull(row["Notes"]);
        const standard = toStringOrNull(row["Standard (ASBC/EBC/ION)"]);

        const yieldPercent = roundToOrNull(toNumberOrNull(row["Extract, F.G. dry (%)"]), 3);
        const potentialSgRaw = toNumberOrNull(row["Potential (SG)"]);
        const colorEbcRaw = toNumberOrNull(row["Color (EBC)"]);

        const colorEbc = roundToOrNull(colorEbcRaw, 3);
        const colorSrm = typeof colorEbc === "number" ? roundTo(ebcToSrm(colorEbc), 3) : null;
        const colorLovibond = typeof colorEbc === "number" ? roundTo(ebcToLovibondApprox(colorEbc), 3) : null;

        const potentialSgUnrounded =
          typeof potentialSgRaw === "number" && Number.isFinite(potentialSgRaw)
            ? potentialSgRaw
            : typeof yieldPercent === "number"
              ? 1 + ((yieldPercent / 100) * 46) / 1000
              : null;

        const potentialSg = roundToOrNull(potentialSgUnrounded, 3);
        const ppgUnrounded =
          typeof potentialSgUnrounded === "number"
            ? (potentialSgUnrounded - 1) * 1000
            : typeof yieldPercent === "number"
              ? (yieldPercent / 100) * 46
              : null;
        const ppg = roundToOrNull(ppgUnrounded, 3);

        if (opts.dryRun === true) continue;

        const existingMap = await prisma.ingredientSourceMap.findUnique({
          where: { kind_sourceName_sourceKey: { kind: "fermentable", sourceName: SOURCE_NAME, sourceKey } },
        });

        const data = {
          name,
          producer,
          group,
          type,
          country,
          notes,
          standard,
          colorEbc,
          colorOriginal: colorEbc,
          colorOriginalUnit: pickColorUnit(standard),
          colorLovibond,
          colorSrm,
          potentialSg,
          yieldPercent,
          ppg,
        };

        let fermentableId: string;
        if (existingMap?.fermentableId) {
          fermentableId = existingMap.fermentableId;
          await prisma.fermentable.update({ where: { id: fermentableId }, data });
          updated++;
        } else {
          const createdRec = await prisma.fermentable.create({ data });
          fermentableId = createdRec.id;
          created++;
        }

        await upsertSourceMap(prisma, { kind: "fermentable", sourceKey, fermentableId });
      } else if (kind === "hop") {
        const country = toStringOrNull(row["Country"]);
        const purpose = toStringOrNull(row["Purpose"]);
        const notes = toStringOrNull(row["Description"]);

        const alphaMin = roundToOrNull(toNumberOrNull(row["Alpha Acid Low (%)"]), 3);
        const alphaMax = roundToOrNull(toNumberOrNull(row["Alpha Acid High (%)"]), 3);
        const betaMin = roundToOrNull(toNumberOrNull(row["Beta Acid Low (%)"]), 3);
        const betaMax = roundToOrNull(toNumberOrNull(row["Beta Acid High (%)"]), 3);

        if (opts.dryRun === true) continue;

        const existingMap = await prisma.ingredientSourceMap.findUnique({
          where: { kind_sourceName_sourceKey: { kind: "hop", sourceName: SOURCE_NAME, sourceKey } },
        });

        const data = {
          name,
          country,
          type: purpose,
          notes,
          alphaMin,
          alphaMax,
          betaMin,
          betaMax,
        };

        let hopId: string;
        if (existingMap?.hopId) {
          hopId = existingMap.hopId;
          await prisma.hop.update({ where: { id: hopId }, data });
          updated++;
        } else {
          const createdRec = await prisma.hop.create({ data });
          hopId = createdRec.id;
          created++;
        }

        await upsertSourceMap(prisma, { kind: "hop", sourceKey, hopId });
      } else {
        const lab = toStringOrNull(row["Producer"]);
        const productId = toStringOrNull(row["Product ID"]);
        const type = toStringOrNull(row["Type"]);
        const form = toStringOrNull(row["Form"]);
        const species = toStringOrNull(row["Species"]);
        const endPhMin = roundToOrNull(toNumberOrNull(row["End pH Min"]), 3);
        const endPhMax = roundToOrNull(toNumberOrNull(row["End pH Max"]), 3);
        const flavorAroma = toStringOrNull(row["Flavor/Aroma"]);
        const pitch = toStringOrNull(row["Pitch"]);
        const pitchTempC = roundToOrNull(toNumberOrNull(row["Pitch Temp ©"]), 3);
        const tolerancePercent = roundToOrNull(toNumberOrNull(row["Tolerance (%)"]), 3);
        const notes = toStringOrNull(row["Description"]);

        const attenuationMin = roundToOrNull(toNumberOrNull(row["Attenuation Min (%)"]), 3);
        const attenuationMax = roundToOrNull(toNumberOrNull(row["Attenuation Max (%)"]), 3);
        const flocculationPercent = roundToOrNull(toNumberOrNull(row["Flocculation (%)"]), 3);
        const tempMinC = roundToOrNull(toNumberOrNull(row["Temperature Min ©"]), 3);
        const tempMaxC = roundToOrNull(toNumberOrNull(row["Temperature Max ©"]), 3);
        const bestFor = toStringOrNull(row["Best For"]);

        if (opts.dryRun === true) continue;

        const existingMap = await prisma.ingredientSourceMap.findUnique({
          where: { kind_sourceName_sourceKey: { kind: "yeast", sourceName: SOURCE_NAME, sourceKey } },
        });

        const data = {
          name,
          lab,
          productId,
          type,
          form,
          species,
          endPhMin,
          endPhMax,
          flavorAroma,
          pitch,
          pitchTempC,
          tolerancePercent,
          notes,
          attenuationMin,
          attenuationMax,
          flocculationPercent,
          tempMinC,
          tempMaxC,
          bestFor,
        };

        let yeastId: string;
        if (existingMap?.yeastId) {
          yeastId = existingMap.yeastId;
          await prisma.yeast.update({ where: { id: yeastId }, data });
          updated++;
        } else {
          const createdRec = await prisma.yeast.create({ data });
          yeastId = createdRec.id;
          created++;
        }

        await upsertSourceMap(prisma, { kind: "yeast", sourceKey, yeastId });
      }
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

