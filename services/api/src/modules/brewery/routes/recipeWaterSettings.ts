import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import { IdParamsSchema, RecipeWaterSettingsGetResponseSchema, RecipeWaterSettingsPutRequestSchema, RecipeWaterSettingsPutResponseSchema } from "@umbraculum/brewery-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { RecipeWaterSettingsService } from "../services/recipeWaterSettingsService.js";

export function recipeWaterSettingsRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new RecipeWaterSettingsService(app.prisma);

  zodApp.get(
    "/recipes/:id/water-settings",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        response: {
          200: RecipeWaterSettingsGetResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const settings = await svc.get(ctx.userId, ctx.activeWorkspaceId, req.params.id);
      return RecipeWaterSettingsGetResponseSchema.parse({ ok: true, settings });
    },
  );

  zodApp.put(
    "/recipes/:id/water-settings",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        body: RecipeWaterSettingsPutRequestSchema,
        response: {
          200: RecipeWaterSettingsPutResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const upserted = await svc.upsert(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.id,
        svc.toUpsertInputFromPutBody(req.body as Record<string, unknown>),
      );

      return RecipeWaterSettingsPutResponseSchema.parse({ ok: true, settings: upserted });
    },
  );
}
