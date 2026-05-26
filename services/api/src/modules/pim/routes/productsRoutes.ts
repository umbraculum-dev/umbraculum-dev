import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  ProductGetResponseSchema,
  ProductListResponseSchema,
} from "@umbraculum/pim-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { ProductsService } from "../services/productsService.js";

const ProductIdParamsSchema = z.object({
  productId: z.string().min(1, "productId required"),
});

export function pimProductsRoutes(app: FastifyInstance): void {
  const svc = new ProductsService(app.prisma);

  app.get("/pim/products", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const items = await svc.listProducts(ctx.userId, ctx.activeWorkspaceId);
    return ProductListResponseSchema.parse({ ok: true, items });
  });

  app.get("/pim/products/:productId", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = ProductIdParamsSchema.parse(req.params);
    const item = await svc.getProductById(
      ctx.userId,
      ctx.activeWorkspaceId,
      params.productId,
    );
    return ProductGetResponseSchema.parse({ ok: true, item });
  });
}
