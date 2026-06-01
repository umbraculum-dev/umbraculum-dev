import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  IdParamsSchema,
  RecipeWaterHubSummaryResponseSchema,
  waterFormatHints,
} from "@umbraculum/contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { RecipeWaterHubSummaryService } from "../../../services/recipeWaterHubSummaryService.js";

export function recipeWaterHubSummaryRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new RecipeWaterHubSummaryService(app.prisma);

  zodApp.get(
    "/recipes/:id/water-hub-summary",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        response: {
          200: RecipeWaterHubSummaryResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const summary = await svc.get(ctx.userId, ctx.activeWorkspaceId, req.params.id);
      return RecipeWaterHubSummaryResponseSchema.parse({
        ok: true,
        summary,
        formatHints: waterFormatHints,
      });
    },
  );
}
