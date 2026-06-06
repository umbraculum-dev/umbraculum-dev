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
export type PrismaLike = PrismaClient;

export type IngredientKind = "fermentable" | "hop" | "yeast";
export type ColorUnit = "ebc" | "srm" | "lovibond" | "unknown";

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

export const SOURCE_NAME = "beerproto";
export const SOURCE_URL = "https://github.com/beerproto/dataset";
export const SOURCE_LICENSE = "MIT";

export function rawUrl(resourcePath: string) {
  return `https://raw.githubusercontent.com/beerproto/dataset/master/${resourcePath}`;
}

export function now() {
  return new Date();
}

export function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function toStringOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

export function roundTo(n: number, decimals: number) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

export function roundToOrNull(n: number | null, decimals: number) {
  return typeof n === "number" && Number.isFinite(n) ? roundTo(n, decimals) : null;
}

export function ebcToSrm(ebc: number) {
  // docs/modules/verticals/brewery/RAW-MATERIALS-SEEDABLE-SOURCES.md references the BeerProto fermentables README formula.
  return ebc * 0.508;
}

export function _srmToEbc(srm: number) {
  return srm * 1.97;
}

export function ebcToLovibondApprox(ebc: number) {
  // v0: treat °L approximately equal to SRM for grist compatibility.
  // If we need a more accurate mapping later, we can store the original color unit/value and refine the conversion.
  return ebcToSrm(ebc);
}

export async function fetchCsvIfChanged(
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

export function parseCsvRows(csvText: string): Array<Record<string, string>> {
  const trimmed = csvText.replace(/^\uFEFF/, ""); // strip BOM if present
  const rows = parse(trimmed, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }) as Array<Record<string, string>>;
  return Array.isArray(rows) ? rows : [];
}

export function kindForResource(resourcePath: BeerprotoResourcePath): IngredientKind {
  if (resourcePath.startsWith("fermentables/")) return "fermentable";
  if (resourcePath.startsWith("hops/")) return "hop";
  return "yeast";
}

export function pickColorUnit(standard: string | null): ColorUnit {
  // BeerProto fermentables README says values are stored as EBC where possible.
  // Keep this as 'unknown' unless we see strong evidence in the source row.
  if (!standard) return "unknown";
  if (standard.toLowerCase().includes("ebc")) return "ebc";
  return "unknown";
}

export function upsertSourceMap(
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

export type BeerprotoRowImportCtx = {
  row: Record<string, string>;
  sourceKey: string;
  name: string;
  dryRun: boolean;
};
