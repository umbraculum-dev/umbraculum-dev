import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { Product } from "@umbraculum/pim-contracts";

import { ProductsService } from "../../../../modules/pim/services/productsService.js";

const SearchProductsInputSchema = z.object({
  query: z.string().min(1, "query required"),
});

type SearchProductsInput = z.infer<typeof SearchProductsInputSchema>;

interface SearchProductsOutput {
  products: readonly Product[];
}

export function createSearchProductsTool(
  prisma: PrismaClient,
): AiTool<SearchProductsInput, SearchProductsOutput> {
  const svc = new ProductsService(prisma);

  return {
    name: "pim.searchProducts",
    description:
      "Search products in the active workspace by SKU or name (case-insensitive substring).",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const { query } = SearchProductsInputSchema.parse(input);
      const all = await svc.listProducts(ctx.userId, ctx.workspaceId);
      const q = query.toLowerCase();
      const products = all.filter(
        (p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
      );
      return { products };
    },
  };
}
