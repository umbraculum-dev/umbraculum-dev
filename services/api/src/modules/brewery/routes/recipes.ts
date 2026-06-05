import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  IdParamsSchema,
  OkResponseSchema,
  RecipeCreateRequestSchema,
  RecipeListResponseSchema,
  RecipePatchRequestSchema,
  RecipeResponseSchema,
  RecipeVersionsResponseSchema,
} from "@umbraculum/contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { RecipesService } from "../../../services/recipesService.js";

export function recipesRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const recipes = new RecipesService(app.prisma);

  zodApp.get(
    "/recipes",
    {
      schema: {
        tags: ["brewery"],
        response: {
          200: RecipeListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const list = await recipes.listRecipes(ctx.userId, ctx.activeWorkspaceId);
      return RecipeListResponseSchema.parse({ ok: true, recipes: list });
    },
  );

  zodApp.post(
    "/recipes",
    {
      schema: {
        tags: ["brewery"],
        body: RecipeCreateRequestSchema,
        response: {
          200: RecipeResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;
      const created = await recipes.createRecipe(ctx.userId, ctx.activeWorkspaceId, {
        name: body.name,
        styleKey: body.styleKey ?? "",
        notes: body.notes ?? null,
        beerJsonRecipeJson: body.beerJsonRecipeJson,
        recipeExtJson: body.recipeExtJson,
      });
      return RecipeResponseSchema.parse({ ok: true, recipe: created });
    },
  );

  zodApp.get(
    "/recipes/:id",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        response: {
          200: RecipeResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const recipe = await recipes.getRecipeWithAnalysis(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.id,
      );
      return RecipeResponseSchema.parse({ ok: true, recipe });
    },
  );

  zodApp.get(
    "/recipes/:id/versions",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        response: {
          200: RecipeVersionsResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const versions = await recipes.listRecipeVersions(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.id,
      );
      return RecipeVersionsResponseSchema.parse({ ok: true, versions });
    },
  );

  zodApp.post(
    "/recipes/:id/versions",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        response: {
          200: RecipeResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const created = await recipes.createRecipeVersionFromCurrent(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.id,
      );
      return RecipeResponseSchema.parse({ ok: true, recipe: created });
    },
  );

  zodApp.post(
    "/recipes/:id/duplicate",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        response: {
          200: RecipeResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const created = await recipes.duplicateRecipe(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.id,
      );
      return RecipeResponseSchema.parse({ ok: true, recipe: created });
    },
  );

  zodApp.patch(
    "/recipes/:id",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        body: RecipePatchRequestSchema,
        response: {
          200: RecipeResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;
      const updated = await recipes.updateRecipe(ctx.userId, ctx.activeWorkspaceId, req.params.id, {
        name: body.name,
        styleKey: body.styleKey,
        notes: body.notes,
        beerJsonRecipeJson: body.beerJsonRecipeJson,
        recipeExtJson: body.recipeExtJson,
      });
      return RecipeResponseSchema.parse({ ok: true, recipe: updated });
    },
  );

  zodApp.delete(
    "/recipes/:id",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        response: {
          200: OkResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      await recipes.deleteRecipe(ctx.userId, ctx.activeWorkspaceId, req.params.id);
      return { ok: true as const };
    },
  );
}
