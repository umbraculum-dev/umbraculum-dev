import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { RecipesService } from "../services/recipesService.js";
import { exportRecipeStrict } from "../beerjson/strictExport.js";

function safeFilenamePart(v: string) {
  const trimmed = v.trim();
  if (!trimmed) return "";
  return trimmed
    .replaceAll(/[^a-zA-Z0-9._-]+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export async function recipesExportRoutes(app: FastifyInstance) {
  const recipes = new RecipesService(app.prisma);

  app.get("/recipes/:id/export/beerjson", async (req, reply) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const recipeId = typeof params.id === "string" ? params.id : "";

    const recipe = await recipes.getRecipe(ctx.userId, ctx.activeAccountId, recipeId);
    const strictDoc = exportRecipeStrict(recipe as any);

    const namePart = safeFilenamePart((recipe as any)?.name ?? "");
    const filename = namePart ? `${namePart}.beerjson.json` : `recipe-${recipeId}.beerjson.json`;

    reply.header("Content-Type", "application/json; charset=utf-8");
    reply.header("Content-Disposition", `attachment; filename="${filename}"`);
    return strictDoc;
  });

  app.get("/recipes/export/beerjson", async (req, reply) => {
    const ctx = requireActiveAccount(req);
    const list = await recipes.listRecipes(ctx.userId, ctx.activeAccountId);

    const outRecipes: any[] = [];
    for (const r of list as any[]) {
      const strictDoc = exportRecipeStrict(r as any);
      const r0 = (strictDoc as any)?.beerjson?.recipes?.[0] ?? null;
      if (r0) outRecipes.push(r0);
    }

    const doc = { beerjson: { version: 1, recipes: outRecipes } };

    reply.header("Content-Type", "application/json; charset=utf-8");
    reply.header("Content-Disposition", `attachment; filename="recipes.beerjson.json"`);
    return doc;
  });
}

