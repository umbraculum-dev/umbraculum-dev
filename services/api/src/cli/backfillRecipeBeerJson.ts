/**
 * Backfill `Recipe.beerJsonRecipeJson` from legacy recipe JSON columns.
 *
 * Strategy:
 * - If `beerJsonRecipeJson` already exists, do nothing.
 * - Else generate a minimal valid BeerJSON document from:
 *   - `Recipe.name`, `Recipe.notes`
 *   - `Recipe.gristJson`, `Recipe.hopsJson`, `Recipe.yeastJson`, `Recipe.miscJson`
 *
 * Notes:
 * - This is intentionally conservative and idempotent.
 * - We keep legacy columns intact for the migration window.
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { buildBeerJsonDocumentFromLegacy, validateBeerJsonDoc } from "../beerjson/index.js";

async function main() {
  const prisma = new PrismaClient();
  const dryRun = process.env.DRY_RUN === "1";
  try {
    const candidates = await prisma.recipe.findMany({
      where: { beerJsonRecipeJson: { equals: Prisma.DbNull } },
      select: {
        id: true,
        name: true,
        notes: true,
        gristJson: true,
        hopsJson: true,
        yeastJson: true,
        miscJson: true,
      },
    });

    let updated = 0;
    let failed = 0;

    for (const r of candidates) {
      try {
        const doc = buildBeerJsonDocumentFromLegacy({
          recipe: { name: r.name, notes: r.notes ?? null },
          gristJson: r.gristJson,
          hopsJson: r.hopsJson,
          yeastJson: r.yeastJson,
          miscJson: r.miscJson,
        });
        const v = validateBeerJsonDoc(doc);
        if (!v.ok) throw new Error(v.errors);

        if (!dryRun) {
          await prisma.recipe.update({
            where: { id: r.id },
            data: { beerJsonRecipeJson: doc as any },
          });
        }
        updated += 1;
      } catch (err) {
        failed += 1;
        // eslint-disable-next-line no-console
        console.error(JSON.stringify({ recipeId: r.id, error: String(err) }));
      }
    }

    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ ok: true, dryRun, scanned: candidates.length, updated, failed }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

