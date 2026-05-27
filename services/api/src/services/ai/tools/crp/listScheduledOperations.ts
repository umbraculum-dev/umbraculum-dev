import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import {
  CrpListScheduledOperationsToolInputSchema,
  CrpListScheduledOperationsToolOutputSchema,
  type CrpListScheduledOperationsToolInput,
  type CrpListScheduledOperationsToolOutput,
} from "@umbraculum/crp-contracts";

import { CrpPlanningService } from "../../../../modules/crp/services/planningService.js";

export function createCrpListScheduledOperationsTool(
  prisma: PrismaClient,
): AiTool<CrpListScheduledOperationsToolInput, CrpListScheduledOperationsToolOutput> {
  const svc = new CrpPlanningService(prisma);

  return {
    name: "crp.listScheduledOperations",
    description:
      "List read-only CRP scheduled operations in the active workspace, including timed brewery brew-session step projections. Empty input.",
    scope: "read",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async (input, ctx) => {
      CrpListScheduledOperationsToolInputSchema.parse(input);
      const items = await svc.listScheduledOperations(ctx.userId, ctx.workspaceId);
      return CrpListScheduledOperationsToolOutputSchema.parse({ ok: true, items });
    },
  };
}
