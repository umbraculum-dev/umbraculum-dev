import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { RecipesService } from "../services/recipesService.js";
import { computeRecipeGravityAnalysis } from "../domain/recipeAnalysis/gravityAnalysis.js";

export async function recipesRoutes(app: FastifyInstance) {
  const recipes = new RecipesService(app.prisma);

  app.get("/recipes", async (req) => {
    const ctx = requireActiveAccount(req);
    const list = await recipes.listRecipes(ctx.userId, ctx.activeAccountId);
    return { ok: true, recipes: list };
  });

  app.post("/recipes", async (req) => {
    const ctx = requireActiveAccount(req);
    const body = (req.body ?? {}) as {
      name?: unknown;
      styleKey?: unknown;
      notes?: unknown;
      beerJsonRecipeJson?: unknown;
      recipeExtJson?: unknown;
    };
    const name = typeof body.name === "string" ? body.name : "";
    const styleKey = typeof body.styleKey === "string" ? body.styleKey : "";
    const notes = typeof body.notes === "string" ? body.notes : null;
    const beerJsonRecipeJson = body.beerJsonRecipeJson;
    const recipeExtJson = body.recipeExtJson;

    const created = await recipes.createRecipe(ctx.userId, ctx.activeAccountId, {
      name,
      styleKey,
      notes,
      beerJsonRecipeJson,
      recipeExtJson,
    });
    return { ok: true, recipe: created };
  });

  app.get("/recipes/:id", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";

    const recipe = await recipes.getRecipe(ctx.userId, ctx.activeAccountId, id);
    const waterSettings = await app.prisma.recipeWaterSettings.findUnique({
      where: { recipeId: (recipe as any).id },
    });
    const analysis = computeRecipeGravityAnalysis({
      beerJsonRecipeJson: (recipe as any).beerJsonRecipeJson,
      recipeExtJson: (recipe as any).recipeExtJson,
      recipeWaterSettings: waterSettings,
    });
    return { ok: true, recipe: { ...recipe, analysis } };
  });

  app.patch("/recipes/:id", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";

    const body = (req.body ?? {}) as {
      name?: unknown;
      styleKey?: unknown;
      notes?: unknown;
      beerJsonRecipeJson?: unknown;
      recipeExtJson?: unknown;
    };
    const name = typeof body.name === "string" ? body.name : undefined;
    const styleKey = typeof body.styleKey === "string" ? body.styleKey : undefined;
    const notes = typeof body.notes === "string" ? body.notes : undefined;
    const beerJsonRecipeJson = body.beerJsonRecipeJson;
    const recipeExtJson = body.recipeExtJson;

    const updated = await recipes.updateRecipe(ctx.userId, ctx.activeAccountId, id, {
      name,
      styleKey,
      notes,
      beerJsonRecipeJson,
      recipeExtJson,
    });
    return { ok: true, recipe: updated };
  });

  app.delete("/recipes/:id", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";

    await recipes.deleteRecipe(ctx.userId, ctx.activeAccountId, id);
    return { ok: true };
  });
}

