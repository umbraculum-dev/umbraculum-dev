import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import {
  MrpGetProductionOrderToolInputSchema,
  MrpGetProductionOrderToolOutputSchema,
  type MrpGetProductionOrderToolInput,
  type MrpGetProductionOrderToolOutput,
} from "@umbraculum/mrp-contracts";

import { ProductionOrdersService } from "../../../../modules/mrp/services/productionOrdersService.js";

export function createMrpGetProductionOrderTool(
  prisma: PrismaClient,
): AiTool<MrpGetProductionOrderToolInput, MrpGetProductionOrderToolOutput> {
  const svc = new ProductionOrdersService(prisma);

  return {
    name: "mrp.getProductionOrder",
    description:
      "Get one read-only MRP production order by id, including operations and material requirements.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: { productionOrderId: { type: "string", minLength: 1 } },
      required: ["productionOrderId"],
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const parsed = MrpGetProductionOrderToolInputSchema.parse(input);
      const item = await svc.getProductionOrderById(
        ctx.userId,
        ctx.workspaceId,
        parsed.productionOrderId,
      );
      return MrpGetProductionOrderToolOutputSchema.parse({ ok: true, item });
    },
  };
}
