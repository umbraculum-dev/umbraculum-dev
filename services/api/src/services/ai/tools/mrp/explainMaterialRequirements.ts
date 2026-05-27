import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import {
  MrpExplainMaterialRequirementsToolInputSchema,
  MrpExplainMaterialRequirementsToolOutputSchema,
  type MrpExplainMaterialRequirementsToolInput,
  type MrpExplainMaterialRequirementsToolOutput,
} from "@umbraculum/mrp-contracts";

import { MaterialRequirementsService } from "../../../../modules/mrp/services/materialRequirementsService.js";

export function createMrpExplainMaterialRequirementsTool(
  prisma: PrismaClient,
): AiTool<MrpExplainMaterialRequirementsToolInput, MrpExplainMaterialRequirementsToolOutput> {
  const svc = new MaterialRequirementsService(prisma);

  return {
    name: "mrp.explainMaterialRequirements",
    description:
      "List read-only material requirements for one MRP production order so the assistant can explain ingredients, quantities, and availability assumptions.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: { productionOrderId: { type: "string", minLength: 1 } },
      required: ["productionOrderId"],
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const parsed = MrpExplainMaterialRequirementsToolInputSchema.parse(input);
      const items = await svc.listMaterialRequirements(
        ctx.userId,
        ctx.workspaceId,
        parsed.productionOrderId,
      );
      return MrpExplainMaterialRequirementsToolOutputSchema.parse({ ok: true, items });
    },
  };
}
