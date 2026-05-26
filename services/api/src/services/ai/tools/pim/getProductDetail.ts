import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { Product } from "@umbraculum/pim-contracts";

import { ProductsService } from "../../../../modules/pim/services/productsService.js";

const GetProductDetailInputSchema = z.object({
  productId: z.string().min(1, "productId required"),
});

type GetProductDetailInput = z.infer<typeof GetProductDetailInputSchema>;

interface GetProductDetailOutput {
  product: Product;
}

export function createGetProductDetailTool(
  prisma: PrismaClient,
): AiTool<GetProductDetailInput, GetProductDetailOutput> {
  const svc = new ProductsService(prisma);

  return {
    name: "pim.getProductDetail",
    description: "Fetch one PIM product by id in the active workspace.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: { productId: { type: "string" } },
      required: ["productId"],
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const { productId } = GetProductDetailInputSchema.parse(input);
      const product = await svc.getProductById(ctx.userId, ctx.workspaceId, productId);
      return { product };
    },
  };
}
