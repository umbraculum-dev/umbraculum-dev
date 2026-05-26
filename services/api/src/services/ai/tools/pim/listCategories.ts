import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { Category } from "@umbraculum/pim-contracts";

import { CategoriesService } from "../../../../modules/pim/services/categoriesService.js";

const ListCategoriesInputSchema = z.object({}).strict();

type ListCategoriesInput = z.infer<typeof ListCategoriesInputSchema>;

interface ListCategoriesOutput {
  categories: readonly Category[];
}

export function createListCategoriesTool(
  prisma: PrismaClient,
): AiTool<ListCategoriesInput, ListCategoriesOutput> {
  const svc = new CategoriesService(prisma);

  return {
    name: "pim.listCategories",
    description: "List flat PIM categories for the active workspace. Empty input.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      ListCategoriesInputSchema.parse(input);
      const { items } = await svc.listCategories(ctx.userId, ctx.workspaceId);
      return { categories: items };
    },
  };
}
