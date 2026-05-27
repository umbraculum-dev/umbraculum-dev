import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import {
  CrpExplainCapacityLoadToolInputSchema,
  CrpExplainCapacityLoadToolOutputSchema,
  type CrpExplainCapacityLoadToolInput,
  type CrpExplainCapacityLoadToolOutput,
} from "@umbraculum/crp-contracts";

import { CrpPlanningService } from "../../../../modules/crp/services/planningService.js";

export function createCrpExplainCapacityLoadTool(
  prisma: PrismaClient,
): AiTool<CrpExplainCapacityLoadToolInput, CrpExplainCapacityLoadToolOutput> {
  const svc = new CrpPlanningService(prisma);

  return {
    name: "crp.explainCapacityLoad",
    description:
      "Return read-only CRP capacity-load buckets for all resources or one resource so the assistant can explain planned, available, and overload minutes.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: { resourceId: { type: "string", minLength: 1 } },
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const parsed = CrpExplainCapacityLoadToolInputSchema.parse(input);
      const item = await svc.getCapacityLoad(ctx.userId, ctx.workspaceId, parsed.resourceId);
      return CrpExplainCapacityLoadToolOutputSchema.parse({ ok: true, item });
    },
  };
}
