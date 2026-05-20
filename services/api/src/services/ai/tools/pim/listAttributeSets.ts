import type { AiTool } from "@umbraculum/contracts";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { AttributeSet } from "@umbraculum/pim-contracts";

import { AttributeSetsService } from "../../../../modules/pim/services/attributeSetsService.js";

const ListAttributeSetsInputSchema = z.object({}).strict();

type ListAttributeSetsInput = z.infer<typeof ListAttributeSetsInputSchema>;

interface ListAttributeSetsOutput {
  attributeSets: readonly AttributeSet[];
}

export function createListAttributeSetsTool(
  prisma: PrismaClient,
): AiTool<ListAttributeSetsInput, ListAttributeSetsOutput> {
  const svc = new AttributeSetsService(prisma);

  return {
    name: "pim.listAttributeSets",
    description: "List PIM attribute sets for the active workspace. Empty input.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      ListAttributeSetsInputSchema.parse(input);
      const attributeSets = await svc.listAttributeSets(ctx.userId, ctx.workspaceId);
      return { attributeSets };
    },
  };
}
