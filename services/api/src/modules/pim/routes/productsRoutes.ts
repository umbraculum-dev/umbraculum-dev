import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import {
  PimDeleteResponseSchema,
  ProductCreateRequestSchema,
  ProductGetResponseSchema,
  ProductListResponseSchema,
  ProductUpdateRequestSchema,
} from "@umbraculum/pim-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { ProductsService } from "../services/productsService.js";

const ProductIdParamsSchema = z.object({
  productId: z.string().min(1, "productId required"),
});

export function pimProductsRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
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

  zodApp.post(
    "/pim/products",
    {
      schema: {
        body: ProductCreateRequestSchema,
        response: {
          201: ProductGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.createProduct(ctx.userId, ctx.activeWorkspaceId, req.body);
      return reply.status(201).send(ProductGetResponseSchema.parse({ ok: true, item }));
    },
  );

  zodApp.patch(
    "/pim/products/:productId",
    {
      schema: {
        params: ProductIdParamsSchema,
        body: ProductUpdateRequestSchema,
        response: {
          200: ProductGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.updateProduct(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.productId,
        req.body,
      );
      return ProductGetResponseSchema.parse({ ok: true, item });
    },
  );

  zodApp.delete(
    "/pim/products/:productId",
    {
      schema: {
        params: ProductIdParamsSchema,
        response: {
          200: PimDeleteResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      await svc.deleteProduct(ctx.userId, ctx.activeWorkspaceId, req.params.productId);
      return PimDeleteResponseSchema.parse({ ok: true });
    },
  );
}
