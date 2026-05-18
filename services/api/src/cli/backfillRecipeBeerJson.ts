/**
 * Backfill `Recipe.recipeExtJson` (and verify `Recipe.beerJsonRecipeJson`) after BeerJSON-first cutover.
 *
 * Strategy:
 * - Validate that `beerJsonRecipeJson` exists and is a valid BeerJSON document.
 * - Ensure `recipeExtJson` is present (at least `{ version: 1 }`).
 *
 * Notes:
 * - This is intentionally conservative and idempotent.
 * - Legacy recipe JSON columns were removed; this script does not attempt to regenerate BeerJSON.
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { validateBeerJsonDoc, validateRecipeExtJson } from "../beerjson/index.js";

async function main() {
  const prisma = new PrismaClient();
  const dryRun = process.env['DRY_RUN'] === "1";
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
            data: { recipeExtJson: nextRecipeExtJson as Prisma.InputJsonValue },
          });
        }
        updated += 1;
      } catch (err) {
        failed += 1;
         
        console.error(JSON.stringify({ recipeId: r.id, error: String(err) }));
      }
    }

     
    console.log(JSON.stringify({ ok: true, dryRun, scanned: candidates.length, updated, failed }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
   
  console.error(err);
  process.exit(1);
});

