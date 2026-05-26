import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import {
  PimDeleteResponseSchema,
  VariantCreateRequestSchema,
  VariantGetResponseSchema,
  VariantListResponseSchema,
  VariantUpdateRequestSchema,
} from "@umbraculum/pim-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { VariantsService } from "../services/variantsService.js";

const ProductIdParamsSchema = z.object({
  productId: z.string().min(1, "productId required"),
});

const VariantIdParamsSchema = z.object({
  variantId: z.string().min(1, "variantId required"),
});

export function pimVariantsRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new VariantsService(app.prisma);

  app.get("/pim/products/:productId/variants", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = ProductIdParamsSchema.parse(req.params);
    const items = await svc.listVariantsForProduct(
      ctx.userId,
      ctx.activeWorkspaceId,
      params.productId,
    );
    return VariantListResponseSchema.parse({ ok: true, items });
  });

  app.get("/pim/variants/:variantId", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = VariantIdParamsSchema.parse(req.params);
    const item = await svc.getVariantById(
      ctx.userId,
      ctx.activeWorkspaceId,
      params.variantId,
    );
    return VariantGetResponseSchema.parse({ ok: true, item });
  });

  zodApp.post(
    "/pim/products/:productId/variants",
    {
      schema: {
        params: ProductIdParamsSchema,
        body: VariantCreateRequestSchema,
        response: {
          201: VariantGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.createVariantForProduct(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.productId,
        req.body,
      );
      return reply.status(201).send(VariantGetResponseSchema.parse({ ok: true, item }));
    },
  );

  zodApp.patch(
    "/pim/variants/:variantId",
    {
      schema: {
        params: VariantIdParamsSchema,
        body: VariantUpdateRequestSchema,
        response: {
          200: VariantGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.updateVariant(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.variantId,
        req.body,
      );
      return VariantGetResponseSchema.parse({ ok: true, item });
    },
  );

  zodApp.delete(
    "/pim/variants/:variantId",
    {
      schema: {
        params: VariantIdParamsSchema,
        response: {
          200: PimDeleteResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      await svc.deleteVariant(ctx.userId, ctx.activeWorkspaceId, req.params.variantId);
      return PimDeleteResponseSchema.parse({ ok: true });
    },
  );
}
