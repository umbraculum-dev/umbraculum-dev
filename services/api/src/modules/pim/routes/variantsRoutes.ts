import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  VariantGetResponseSchema,
  VariantListResponseSchema,
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
}
