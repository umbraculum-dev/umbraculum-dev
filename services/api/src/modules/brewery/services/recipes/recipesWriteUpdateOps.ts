import { Prisma, type PrismaClient } from "@prisma/client";

import { normalizeBeerJsonRecipeUnits, validateBeerJsonDoc, validateRecipeExtJson } from "../../../../beerjson/index.js";
import { validateBeerJsonRecipeDomain } from "../../../../beerjson/recipeDomainValidator.js";
import { BadRequestError } from "../../../../errors.js";
import { isObject } from "../../../../lib/typeGuards.js";
import type { WorkspacesService } from "../../../../services/workspacesService.js";
import { getRecipe, resolveStyleKey } from "./recipesReadOps.js";
import type { UpdateRecipeInput } from "./recipesTypes.js";

export async function updateRecipe(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  recipeId: string,
  input: UpdateRecipeInput,
) {
  await workspaces.assertMembership(userId, workspaceId);

  // Ensure workspace scoping is enforced even if IDs collide across workspaces.
  const existing = await getRecipe(prisma, workspaces, userId, workspaceId, recipeId);

  const data: Prisma.RecipeUncheckedUpdateInput = {};

  const hasBeerJson = input.beerJsonRecipeJson !== undefined && input.beerJsonRecipeJson !== null;

  if (input.name !== undefined) {
    const name = (input.name ?? "").trim();
    if (!name) throw new BadRequestError("invalid_name", "Body.name must be a non-empty string");
    data.name = name;
  }

  if (input.styleKey !== undefined) {
    if (input.styleKey === null) {
      throw new BadRequestError("invalid_style_key", "Body.styleKey cannot be null");
    }
    const styleRec = await resolveStyleKey(prisma, input.styleKey);
    data.styleKey = styleRec.key;
    data.style = styleRec.name;
  }
  if (input.notes !== undefined) data.notes = input.notes?.trim() || null;

  if (hasBeerJson) {
    const nextName = (typeof data.name === "string" ? data.name : null) ?? existing.name;
    const nextNotes =
      (typeof data.notes === "string" ? data.notes : data.notes === null ? null : undefined) ??
      existing.notes ??
      null;
    const doc = input.beerJsonRecipeJson;
    const before = validateBeerJsonDoc(doc);
    if (!before.ok) {
      throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${before.errors}`);
    }
    // Normalize BeerJSON name/notes to match DB columns.
    try {
      const docObj = isObject(doc) ? doc : null;
      const beerjson = isObject(docObj?.['beerjson']) ? docObj['beerjson'] : null;
      const recipes = Array.isArray(beerjson?.['recipes']) ? beerjson['recipes'] : null;
      const r0 = recipes && isObject(recipes[0]) ? (recipes[0]) : null;
      if (!r0) {
        throw new Error("BeerJSON is missing beerjson.recipes[0]");
      }
      r0['name'] = nextName;
      if (nextNotes) r0['notes'] = nextNotes;
      else delete r0['notes'];
    } catch (err) {
      throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${String(err)}`);
    }
    const after = validateBeerJsonDoc(doc);
    if (!after.ok) {
      throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${after.errors}`);
    }

    normalizeBeerJsonRecipeUnits(doc);
    const afterUnits = validateBeerJsonDoc(doc);
    if (!afterUnits.ok) {
      throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${afterUnits.errors}`);
    }

    // Enforce supported domain rules directly on BeerJSON (no legacy-row mapping).
    validateBeerJsonRecipeDomain(doc);

    data.beerJsonRecipeJson = doc as Prisma.InputJsonValue;
  }

  if (input.recipeExtJson !== undefined) {
    if (input.recipeExtJson === null) {
      data.recipeExtJson = Prisma.JsonNull;
    } else {
      try {
        const v = validateRecipeExtJson(input.recipeExtJson);
        if (v === undefined) {
          // no-op
        } else {
          data.recipeExtJson = v as Prisma.InputJsonValue;
        }
      } catch (err) {
        throw new BadRequestError("invalid_recipe_ext_json", `Body.recipeExtJson is invalid: ${String(err)}`);
      }
    }
  }

  if (Object.keys(data).length === 0) {
    throw new BadRequestError("no_updates", "No updatable fields provided");
  }

  if (!hasBeerJson && (data.name !== undefined || data.notes !== undefined)) {
    // Keep BeerJSON in sync when only name/notes change.
    const nextName = (typeof data.name === "string" ? data.name : null) ?? existing.name;
    const nextNotes =
      (typeof data.notes === "string" ? data.notes : data.notes === null ? null : undefined) ??
      existing.notes ??
      null;

    const doc = existing.beerJsonRecipeJson;
    if (isObject(doc)) {
      const before = validateBeerJsonDoc(doc);
      if (!before.ok) {
        throw new BadRequestError("invalid_beerjson_recipe", `Stored BeerJSON is invalid: ${before.errors}`);
      }
      try {
        const beerjson = isObject(doc['beerjson']) ? doc['beerjson'] : null;
        const recipes = Array.isArray(beerjson?.['recipes']) ? beerjson['recipes'] : null;
        const r0 = recipes && isObject(recipes[0]) ? (recipes[0] as Record<string, unknown>) : null;
        if (!r0) {
          throw new Error("BeerJSON is missing beerjson.recipes[0]");
        }
        r0['name'] = nextName;
        if (nextNotes) r0['notes'] = nextNotes;
        else delete r0['notes'];
      } catch (err) {
        throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${String(err)}`);
      }
      const after = validateBeerJsonDoc(doc);
      if (!after.ok) {
        throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${after.errors}`);
      }
      data.beerJsonRecipeJson = doc;
    } else {
      throw new BadRequestError("invalid_beerjson_recipe", "Stored BeerJSON is missing; cannot patch name/notes.");
    }
  }

  return prisma.recipe.update({
    where: { id: recipeId },
    data,
  });
}

export async function deleteRecipe(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  recipeId: string,
) {
  await workspaces.assertMembership(userId, workspaceId);

  // Enforce workspace scoping.
  await getRecipe(prisma, workspaces, userId, workspaceId, recipeId);

  await prisma.recipe.delete({ where: { id: recipeId } });
  return { ok: true as const };
}
