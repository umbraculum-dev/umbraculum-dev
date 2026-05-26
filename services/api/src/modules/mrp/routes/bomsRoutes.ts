import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import { BomGetResponseSchema, BomListResponseSchema } from "@umbraculum/mrp-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { BomsService } from "../services/bomsService.js";

const BomIdParamsSchema = z.object({
  bomId: z.string().min(1, "bomId required"),
});

export function mrpBomsRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new BomsService(app.prisma);

  zodApp.get(
    "/mrp/boms",
    {
      schema: {
        response: {
          200: BomListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const items = await svc.listBoms(ctx.userId, ctx.activeWorkspaceId);
      return BomListResponseSchema.parse({ ok: true, items });
    },
  );

  zodApp.get(
    "/mrp/boms/:bomId",
    {
      schema: {
        params: BomIdParamsSchema,
        response: {
          200: BomGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.getBomById(ctx.userId, ctx.activeWorkspaceId, req.params.bomId);
      return BomGetResponseSchema.parse({ ok: true, item });
    },
  );
}
