import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import { BoilComputeAndSaveRequestSchema, BoilComputeAndSaveResponseSchema, IdParamsSchema, MashComputeAndSaveRequestSchema, MashComputeAndSaveResponseSchema, SpargeComputeAndSaveRequestSchema, SpargeComputeAndSaveResponseSchema } from "@umbraculum/brewery-contracts";
import { waterFormatHints } from "@umbraculum/contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { RecipeWaterComputeAndSaveService } from "../services/recipeWaterComputeAndSaveService.js";
import {
  mapBoilComputeAndSaveBody,
  mapMashComputeAndSaveBody,
  mapSpargeComputeAndSaveBody,
} from "./recipeWaterComputeAndSaveBodyMappers.js";

export function recipeWaterComputeAndSaveRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new RecipeWaterComputeAndSaveService(app.prisma);

  zodApp.post(
    "/recipes/:id/water-settings/mash/compute-and-save",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        body: MashComputeAndSaveRequestSchema,
        response: {
          200: MashComputeAndSaveResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const input = mapMashComputeAndSaveBody(req.body as Record<string, unknown>);
      const computed = await svc.computeAndSaveMash(ctx.userId, ctx.activeWorkspaceId, req.params.id, input);
      return MashComputeAndSaveResponseSchema.parse({
        ok: true,
        version: 1,
        ...computed,
        formatHints: waterFormatHints,
      });
    },
  );

  zodApp.post(
    "/recipes/:id/water-settings/sparge/compute-and-save",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        body: SpargeComputeAndSaveRequestSchema,
        response: {
          200: SpargeComputeAndSaveResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const input = mapSpargeComputeAndSaveBody(req.body as Record<string, unknown>);
      const computed = await svc.computeAndSaveSparge(ctx.userId, ctx.activeWorkspaceId, req.params.id, input);
      return SpargeComputeAndSaveResponseSchema.parse({
        ok: true,
        version: 1,
        ...computed,
        formatHints: waterFormatHints,
      });
    },
  );

  zodApp.post(
    "/recipes/:id/water-settings/boil/compute-and-save",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        body: BoilComputeAndSaveRequestSchema,
        response: {
          200: BoilComputeAndSaveResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const input = mapBoilComputeAndSaveBody(req.body as Record<string, unknown>);
      const computed = await svc.computeAndSaveBoil(ctx.userId, ctx.activeWorkspaceId, req.params.id, input);
      return BoilComputeAndSaveResponseSchema.parse({
        ok: true,
        version: 1,
        ...computed,
        formatHints: waterFormatHints,
      });
    },
  );
}
