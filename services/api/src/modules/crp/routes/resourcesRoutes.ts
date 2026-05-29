import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import {
  ResourceGetResponseSchema,
  ResourceKindSchema,
  ResourceListResponseSchema,
} from "@umbraculum/crp-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { CrpResourcesService } from "../services/resourcesService.js";

const ResourceIdParamsSchema = z.object({
  resourceId: z.string().min(1, "resourceId required"),
});

const ResourceListQuerySchema = z
  .object({
    kind: ResourceKindSchema.optional(),
  })
  .strict();

export function crpResourcesRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new CrpResourcesService(app.prisma);

  zodApp.get(
    "/crp/resources",
    {
      schema: {
        tags: ["crp"],
        querystring: ResourceListQuerySchema,
        response: {
          200: ResourceListResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const items = await svc.listResources(ctx.userId, ctx.activeWorkspaceId, req.query.kind);
      return ResourceListResponseSchema.parse({ ok: true, items });
    },
  );

  zodApp.get(
    "/crp/resources/:resourceId",
    {
      schema: {
        tags: ["crp"],
        params: ResourceIdParamsSchema,
        response: {
          200: ResourceGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.getResourceById(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.resourceId,
      );
      return ResourceGetResponseSchema.parse({ ok: true, item });
    },
  );
}
