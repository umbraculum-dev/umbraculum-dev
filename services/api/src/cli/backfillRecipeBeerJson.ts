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
import { validateBeerJsonDoc, validateRecipeExtJson } from "../beerjson/index.js";

async function main() {
  const prisma = new PrismaClient();
  const dryRun = process.env.DRY_RUN === "1";
  try {
    const candidates = await prisma.recipe.findMany({
      where: {
        OR: [
          { beerJsonRecipeJson: { equals: Prisma.DbNull } },
          { beerJsonRecipeJson: { equals: Prisma.JsonNull } },
          { recipeExtJson: { equals: Prisma.DbNull } },
          { recipeExtJson: { equals: Prisma.JsonNull } },
        ],
      },
      select: {
        id: true,
        name: true,
        notes: true,
        beerJsonRecipeJson: true,
        recipeExtJson: true,
      },
    });

    let updated = 0;
    let failed = 0;

    for (const r of candidates) {
      try {
        const hasBeerJson = r.beerJsonRecipeJson !== null;
        if (!hasBeerJson) {
          throw new Error("Missing beerJsonRecipeJson; cannot backfill without legacy columns (already dropped).");
        }
        const v = validateBeerJsonDoc(r.beerJsonRecipeJson);
        if (!v.ok) throw new Error(v.errors);

        const nextRecipeExtJson = r.recipeExtJson === null ? validateRecipeExtJson({ version: 1 }) : validateRecipeExtJson(r.recipeExtJson);

        if (!dryRun) {
          await prisma.recipe.update({
            where: { id: r.id },
            data: { recipeExtJson: nextRecipeExtJson as any },
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

