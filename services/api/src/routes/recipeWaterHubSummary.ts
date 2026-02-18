import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { RecipeWaterHubSummaryService } from "../services/recipeWaterHubSummaryService.js";

export async function recipeWaterHubSummaryRoutes(app: FastifyInstance) {
  const svc = new RecipeWaterHubSummaryService(app.prisma);

  app.get("/recipes/:id/water-hub-summary", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const recipeId = typeof params.id === "string" ? params.id : "";

    const summary = await svc.get(ctx.userId, ctx.activeAccountId, recipeId);
    return { ok: true, summary };
  });
}

