import type { FastifyInstance } from "fastify";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { RecipeWaterHubSummaryService } from "../services/recipeWaterHubSummaryService.js";
import { waterFormatHints } from "@umbraculum/contracts";

export function recipeWaterHubSummaryRoutes(app: FastifyInstance) {
  const svc = new RecipeWaterHubSummaryService(app.prisma);

  app.get("/recipes/:id/water-hub-summary", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const recipeId = typeof params.id === "string" ? params.id : "";

    const summary = await svc.get(ctx.userId, ctx.activeWorkspaceId, recipeId);
    return { ok: true, summary, formatHints: waterFormatHints };
  });
}

