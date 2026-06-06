import { Prisma, type PrismaClient } from "@prisma/client";

import { normalizeBeerJsonRecipeUnits, validateBeerJsonDoc, validateRecipeExtJson } from "../../beerjson/index.js";
import { validateBeerJsonRecipeDomain } from "../../beerjson/recipeDomainValidator.js";
import { BadRequestError, NotFoundError } from "../../errors.js";
import { isObject } from "../../lib/typeGuards.js";
import { resolveStyleKey } from "./recipesReadOps.js";
import type { CreateRecipeInput } from "./recipesTypes.js";
import { assertRecipeLimitForWorkspace } from "./recipesVersionOps.js";
import type { WorkspacesService } from "../workspacesService.js";

export async function createRecipeCore(prisma: PrismaClient, workspaceId: string, input: CreateRecipeInput) {
  const name = input.name.trim();
  if (!name) throw new BadRequestError("invalid_name", "Body.name is required");

  const styleRec = await resolveStyleKey(prisma, input.styleKey);
  const styleKey = styleRec.key;
  const style = styleRec.name;
  const notes = input.notes?.trim() || null;
  const recipeExtJson = (() => {
    try {
      return validateRecipeExtJson(input.recipeExtJson);
    } catch (err) {
      throw new BadRequestError("invalid_recipe_ext_json", `Body.recipeExtJson is invalid: ${String(err)}`);
    }
  })();

  if (input.beerJsonRecipeJson === undefined || input.beerJsonRecipeJson === null) {
    throw new BadRequestError("invalid_recipe_payload", "Body.beerJsonRecipeJson is required");
  }

  const doc = input.beerJsonRecipeJson;
  const before = validateBeerJsonDoc(doc);
  if (!before.ok) {
    throw new BadRequestError("invalid_beerjson_recipe", `BeerJSON is invalid: ${before.errors}`);
  }

  // Normalize: keep DB columns `name`/`notes` in sync with BeerJSON.
  try {
    const docObj = isObject(doc) ? doc : null;
    const beerjson = isObject(docObj?.['beerjson']) ? docObj['beerjson'] : null;
    const recipes = Array.isArray(beerjson?.['recipes']) ? beerjson['recipes'] : null;
    const r0 = recipes && isObject(recipes[0]) ? (recipes[0]) : null;
    if (!r0) {
      throw new Error("BeerJSON is missing beerjson.recipes[0]");
    }
    r0['name'] = name;
    if (notes) r0['notes'] = notes;
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

  const recipeId = crypto.randomUUID();

  return prisma.recipe.create({
    data: {
      id: recipeId,
      workspaceId,
      versionGroupId: recipeId,
      version: 0,
      name,
      style,
      styleKey,
      notes,
      beerJsonRecipeJson: doc,
      ...(recipeExtJson !== undefined
        ? { recipeExtJson: recipeExtJson as Prisma.InputJsonValue }
        : {}),
    },
  });
}

export async function createRecipe(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  userId: string,
  workspaceId: string,
  input: CreateRecipeInput,
) {
  await workspaces.assertMembership(userId, workspaceId);
  await assertRecipeLimitForWorkspace(prisma, workspaceId);
  return createRecipeCore(prisma, workspaceId, input);
}

export async function createRecipeForWorkspace(
  prisma: PrismaClient,
  workspaceId: string,
  input: CreateRecipeInput,
) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true },
  });
  if (!workspace) throw new NotFoundError("workspace_not_found", "Workspace not found");
  return createRecipeCore(prisma, workspaceId, input);
}
