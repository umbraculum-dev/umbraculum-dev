import type { FastifyInstance } from "fastify";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { RecipesService } from "../services/recipesService.js";
import { exportRecipeStrict } from "../beerjson/strictExport.js";
import { isObject } from "../lib/typeGuards.js";

function safeFilenamePart(v: string) {
  const trimmed = v.trim();
  if (!trimmed) return "";
  return trimmed
    .replaceAll(/[^a-zA-Z0-9._-]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export function recipesExportRoutes(app: FastifyInstance) {
  const recipes = new RecipesService(app.prisma);

  app.get("/recipes/:id/export/beerjson", async (req, reply) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const recipeId = typeof params.id === "string" ? params.id : "";

    const recipe = await recipes.getRecipe(ctx.userId, ctx.activeWorkspaceId, recipeId);
    const strictDoc = exportRecipeStrict(recipe);

    const namePart = safeFilenamePart(recipe.name ?? "");
    const filename = namePart ? `${namePart}.beerjson.json` : `recipe-${recipeId}.beerjson.json`;

    reply.header("Content-Type", "application/json; charset=utf-8");
    reply.header("Content-Disposition", `attachment; filename="${filename}"`);
    return strictDoc;
  });

  app.get("/recipes/export/beerjson", async (req, reply) => {
    const ctx = requireActiveWorkspace(req);
    const list = await recipes.listRecipes(ctx.userId, ctx.activeWorkspaceId);

    const outRecipes: unknown[] = [];
    for (const r of list) {
      const strictDoc = exportRecipeStrict(r);
      const beerjson = isObject(strictDoc) && isObject(strictDoc['beerjson']) ? strictDoc['beerjson'] : null;
      const recipesArr: unknown[] = beerjson && Array.isArray(beerjson['recipes']) ? beerjson['recipes'] : [];
      const r0 = recipesArr[0] ?? null;
      if (r0) outRecipes.push(r0);
    }

    const doc = { beerjson: { version: 1, recipes: outRecipes } };

    reply.header("Content-Type", "application/json; charset=utf-8");
    reply.header("Content-Disposition", `attachment; filename="recipes.beerjson.json"`);
    return doc;
  });
}
