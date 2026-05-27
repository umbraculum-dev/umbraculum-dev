import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import {
  MrpListProductionOrdersToolInputSchema,
  MrpListProductionOrdersToolOutputSchema,
  type MrpListProductionOrdersToolInput,
  type MrpListProductionOrdersToolOutput,
} from "@umbraculum/mrp-contracts";

import { ProductionOrdersService } from "../../../../modules/mrp/services/productionOrdersService.js";

export function createMrpListProductionOrdersTool(
  prisma: PrismaClient,
): AiTool<MrpListProductionOrdersToolInput, MrpListProductionOrdersToolOutput> {
  const svc = new ProductionOrdersService(prisma);

  return {
    name: "mrp.listProductionOrders",
    description:
      "List read-only MRP production orders in the active workspace, including brewery-projected orders when present.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["planned", "released", "in_progress", "completed", "cancelled"],
        },
      },
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const parsed = MrpListProductionOrdersToolInputSchema.parse(input);
      const items = await svc.listProductionOrders(ctx.userId, ctx.workspaceId, parsed.status);
      return MrpListProductionOrdersToolOutputSchema.parse({ ok: true, items });
    },
  };
}
