import { Prisma, type BillingTier, type PrismaClient } from "@prisma/client";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";
import { normalizeBeerJsonRecipeUnits, validateBeerJsonDoc, validateRecipeExtJson } from "../beerjson/index.js";
import { validateBeerJsonRecipeDomain } from "../beerjson/recipeDomainValidator.js";
import { isObject } from "../lib/typeGuards.js";
import { getTierLimits } from "./tierLimitsService.js";

export type CreateRecipeInput = {
  name: string;
  styleKey: string;
  notes?: string | null | undefined;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
};

export type UpdateRecipeInput = {
  name?: string | null | undefined;
  styleKey?: string | null | undefined;
  notes?: string | null | undefined;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
};

export class RecipesService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  private async getWorkspaceTier(workspaceId: string): Promise<BillingTier> {
    const rec = await this.prisma.workspaceBilling.findUnique({
      where: { workspaceId },
      select: { tier: true },
    });
    return rec?.tier ?? "free";
  }

  private async assertRecipeLimitForWorkspace(workspaceId: string): Promise<void> {
    const tier = await this.getWorkspaceTier(workspaceId);
    const limits = getTierLimits(tier);
    const groups = await this.prisma.recipe.groupBy({
      by: ["versionGroupId"],
      where: { workspaceId },
    });
    if (groups.length >= limits.maxRecipesPerWorkspace) {
      throw new ForbiddenError("plan_limit_recipes", "Recipe limit reached. Upgrade to add more.");
    }
  }

  private async listLatestVersionsForWorkspace(workspaceId: string) {
    const groups = await this.prisma.recipe.groupBy({
      by: ["versionGroupId"],
      where: { workspaceId },
      _max: { version: true },
    });

    const latestKeys = groups
      .map((g) => ({
        workspaceId,
        versionGroupId: g.versionGroupId,
        version: g._max.version ?? 0,
      }));

    if (latestKeys.length === 0) return [];

    return this.prisma.recipe.findMany({
      where: { OR: latestKeys },
      orderBy: { updatedAt: "desc" },
    });
  }

  private async resolveStyleKey(styleKeyRaw: string) {
    const styleKey = styleKeyRaw.trim();
    if (!styleKey) throw new BadRequestError("invalid_style_key", "Body.styleKey is required");
    const style = await this.prisma.beerStyle.findUnique({
      where: { key: styleKey },
      select: { key: true, name: true, isActive: true },
    });
    if (!style) throw new BadRequestError("style_not_found", "Style not found");
    if (!style.isActive) throw new BadRequestError("style_inactive", "Style is not active");
    return style;
  }

  async listRecipes(userId: string, workspaceId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);

    return this.listLatestVersionsForWorkspace(workspaceId);
  }

  async getRecipe(userId: string, workspaceId: string, recipeId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);

    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId, workspaceId },
    });
    if (!recipe) throw new NotFoundError("recipe_not_found", "Recipe not found");
    return recipe;
  }

  async listRecipeVersions(userId: string, workspaceId: string, recipeId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);

    const recipe = await this.getRecipe(userId, workspaceId, recipeId);
    const versionGroupId = recipe.versionGroupId ?? recipe.id ?? recipeId;

    return this.prisma.recipe.findMany({
      where: { workspaceId, versionGroupId },
      orderBy: { version: "desc" },
      select: {
        id: true,
        version: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createRecipeVersionFromCurrent(userId: string, workspaceId: string, recipeId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);

    const source = await this.getRecipe(userId, workspaceId, recipeId);
    const versionGroupId = source.versionGroupId ?? source.id ?? recipeId;
    const tier = await this.getWorkspaceTier(workspaceId);
    const limits = getTierLimits(tier);

    return this.prisma.$transaction(async (tx) => {
      const agg = await tx.recipe.aggregate({
        where: { workspaceId, versionGroupId },
        _max: { version: true },
      });

      const maxVersion = agg._max.version ?? 0;
      if (maxVersion >= limits.maxVersionsPerRecipe - 1) {
        throw new ForbiddenError("plan_limit_versions", "Version limit reached. Upgrade to add more versions.");
      }
      if (maxVersion >= 99) {
        throw new BadRequestError(
          "max_versions_reached",
          "Maximum versions reached (0–99)."
        );
      }

      const nextVersion = maxVersion + 1;
      const newRecipeId = crypto.randomUUID();

      const created = await tx.recipe.create({
        data: {
          id: newRecipeId,
          workspaceId,
          versionGroupId,
          version: nextVersion,
          name: source.name,
          style: source.style,
          styleKey: source.styleKey,
          notes: source.notes,
          beerJsonRecipeJson: source.beerJsonRecipeJson ?? Prisma.JsonNull,
          recipeExtJson: source.recipeExtJson ?? Prisma.JsonNull,
        },
      });

      const sourceWater = await tx.recipeWaterSettings.findUnique({
        where: { recipeId: source.id },
      });

      if (sourceWater) {
        const {
          id: _id,
          recipeId: _sourceRecipeId,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ...rest
        } = sourceWater;

        await tx.recipeWaterSettings.create({
          data: {
            ...rest,
            recipeId: newRecipeId,
            workspaceId,
          } as Prisma.RecipeWaterSettingsUncheckedCreateInput,
        });
      }

      return created;
    });
  }

  async duplicateRecipe(userId: string, workspaceId: string, recipeId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    await this.assertRecipeLimitForWorkspace(workspaceId);

    const source = await this.getRecipe(userId, workspaceId, recipeId);

    return this.prisma.$transaction(async (tx) => {
      const newRecipeId = crypto.randomUUID();
      const newName = ((source.name ?? "")).trim() + " - duplicated";

      const doc = source.beerJsonRecipeJson;
      const docCopy: Record<string, unknown> | null =
        isObject(doc) ? (JSON.parse(JSON.stringify(doc)) as Record<string, unknown>) : null;
      const docCopyBeerjson = isObject(docCopy?.['beerjson']) ? docCopy['beerjson'] : null;
      const docCopyRecipes = Array.isArray(docCopyBeerjson?.['recipes']) ? docCopyBeerjson['recipes'] : null;
      if (docCopyRecipes && isObject(docCopyRecipes[0])) {
        (docCopyRecipes[0])['name'] = newName;
      }

      const created = await tx.recipe.create({
        data: {
          id: newRecipeId,
          workspaceId,
          versionGroupId: newRecipeId,
          version: 0,
          name: newName,
          style: source.style,
          styleKey: source.styleKey,
          notes: source.notes,
          beerJsonRecipeJson:
            (docCopy as Prisma.InputJsonValue | undefined) ??
            (source.beerJsonRecipeJson as Prisma.InputJsonValue | null) ??
            Prisma.JsonNull,
          recipeExtJson: source.recipeExtJson ?? Prisma.JsonNull,
        },
      });

      const sourceWater = await tx.recipeWaterSettings.findUnique({
        where: { recipeId: source.id },
      });

      if (sourceWater) {
        const {
          id: _id,
          recipeId: _sourceRecipeId,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ...rest
        } = sourceWater;

        await tx.recipeWaterSettings.create({
          data: {
            ...rest,
            recipeId: newRecipeId,
            workspaceId,
          } as Prisma.RecipeWaterSettingsUncheckedCreateInput,
        });
      }

      return created;
    });
  }

  private async createRecipeCore(workspaceId: string, input: CreateRecipeInput) {
    const name = input.name.trim();
    if (!name) throw new BadRequestError("invalid_name", "Body.name is required");

    const styleRec = await this.resolveStyleKey(input.styleKey);
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

    return this.prisma.recipe.create({
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

  async createRecipe(userId: string, workspaceId: string, input: CreateRecipeInput) {
    await this.workspaces.assertMembership(userId, workspaceId);
    await this.assertRecipeLimitForWorkspace(workspaceId);
    return this.createRecipeCore(workspaceId, input);
  }

  async createRecipeForWorkspace(workspaceId: string, input: CreateRecipeInput) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true },
    });
    if (!workspace) throw new NotFoundError("workspace_not_found", "Workspace not found");
    return this.createRecipeCore(workspaceId, input);
  }

  async getRecipeForWorkspace(recipeId: string, workspaceId: string) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId, workspaceId },
    });
    if (!recipe) throw new NotFoundError("recipe_not_found", "Recipe not found");
    return recipe;
  }

  async listRecipesForWorkspace(workspaceId: string) {
    return this.listLatestVersionsForWorkspace(workspaceId);
  }

  async updateRecipe(userId: string, workspaceId: string, recipeId: string, input: UpdateRecipeInput) {
    await this.workspaces.assertMembership(userId, workspaceId);

    // Ensure workspace scoping is enforced even if IDs collide across workspaces.
    const existing = await this.getRecipe(userId, workspaceId, recipeId);

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
      const styleRec = await this.resolveStyleKey(input.styleKey);
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

    return this.prisma.recipe.update({
      where: { id: recipeId },
      data,
    });
  }

  async deleteRecipe(userId: string, workspaceId: string, recipeId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);

    // Enforce workspace scoping.
    await this.getRecipe(userId, workspaceId, recipeId);

    await this.prisma.recipe.delete({ where: { id: recipeId } });
    return { ok: true as const };
  }
}
