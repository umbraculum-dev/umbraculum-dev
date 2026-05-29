import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import {
  MaterialRequirementListResponseSchema,
  ProductionOrderGetResponseSchema,
  ProductionOrderListResponseSchema,
  ProductionOrderStatusSchema,
} from "@umbraculum/mrp-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { MaterialRequirementsService } from "../services/materialRequirementsService.js";
import { ProductionOrdersService } from "../services/productionOrdersService.js";

const ProductionOrderIdParamsSchema = z.object({
  orderId: z.string().min(1, "orderId required"),
});

const ProductionOrderListQuerySchema = z
  .object({
    status: ProductionOrderStatusSchema.optional(),
  })
  .strict();

export function mrpProductionOrdersRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const productionOrders = new ProductionOrdersService(app.prisma);
  const materialRequirements = new MaterialRequirementsService(app.prisma);

  zodApp.get(
    "/mrp/production-orders",
    {
      schema: {
        tags: ["mrp"],
        querystring: ProductionOrderListQuerySchema,
        response: {
          200: ProductionOrderListResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const items = await productionOrders.listProductionOrders(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.query.status,
      );
      return ProductionOrderListResponseSchema.parse({ ok: true, items });
    },
  );

  zodApp.get(
    "/mrp/production-orders/:orderId",
    {
      schema: {
        tags: ["mrp"],
        params: ProductionOrderIdParamsSchema,
        response: {
          200: ProductionOrderGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await productionOrders.getProductionOrderById(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.orderId,
      );
      return ProductionOrderGetResponseSchema.parse({ ok: true, item });
    },
  );

  zodApp.get(
    "/mrp/production-orders/:orderId/material-requirements",
    {
      schema: {
        tags: ["mrp"],
        params: ProductionOrderIdParamsSchema,
        response: {
          200: MaterialRequirementListResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const items = await materialRequirements.listMaterialRequirements(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.orderId,
      );
      return MaterialRequirementListResponseSchema.parse({ ok: true, items });
    },
  );
}
