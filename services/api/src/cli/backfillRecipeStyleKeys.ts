/**
 * Backfill `Recipe.styleKey` based on legacy `Recipe.style`.
 *
 * Strategy (deliberately conservative):
 * - If `styleKey` already exists, do nothing.
 * - Else try exact match (case-insensitive) against `BeerStyle.code` or `BeerStyle.name`.
 * - If no match, set to `custom`.
 *
 * Notes:
 * - This intentionally avoids fuzzy matching (e.g. mapping "IPA" to "American IPA"),
 *   because incorrect mappings are worse than a safe "custom" fallback.
 * - This script is idempotent and safe to rerun.
 */

import { PrismaClient } from "@prisma/client";

const CUSTOM_KEY = "custom";

function norm(s: string) {
  return s.trim().toLowerCase();
}

async function main() {
  const prisma = new PrismaClient();
  try {
    // Ensure Custom exists (seed should have done this, but make script robust).
    await prisma.beerStyle.upsert({
      where: { key: CUSTOM_KEY },
      create: {
        key: CUSTOM_KEY,
        source: "system",
        version: "v1",
        code: "custom",
        name: "Custom",
        category: null,
        categoryId: null,
        sortOrder: 1_000_000,
        isActive: true,
      },
      update: { isActive: true },
    });

    const custom = await prisma.beerStyle.findUnique({
      where: { key: CUSTOM_KEY },
      select: { key: true, name: true },
    });
    if (!custom) throw new Error("Custom BeerStyle missing");

    const styles = await prisma.beerStyle.findMany({
      where: { isActive: true },
      select: { key: true, code: true, name: true },
    });

    const byCode = new Map(styles.map((s) => [norm(s.code), s]));
    const byName = new Map(styles.map((s) => [norm(s.name), s]));

    const candidates = await prisma.recipe.findMany({
      where: { styleKey: null },
      select: { id: true, style: true },
    });

    let matched = 0;
    let customed = 0;
    for (const r of candidates) {
      const legacy = typeof r.style === "string" ? r.style : "";
      const k = norm(legacy);
      const style = (k ? byCode.get(k) ?? byName.get(k) : null) ?? custom;

      if (style.key === custom.key) customed++;
      else matched++;

      await prisma.recipe.update({
        where: { id: r.id },
        data: { styleKey: style.key, style: style.name },
      });
    }

     
    console.log(
      JSON.stringify(
        { ok: true, scanned: candidates.length, matched, customed, note: "Recipes with existing styleKey were not touched." },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
   
  console.error(err);
  process.exit(1);
});

