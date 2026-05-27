import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import {
  CrpListWorkCentersToolInputSchema,
  CrpListWorkCentersToolOutputSchema,
  type CrpListWorkCentersToolInput,
  type CrpListWorkCentersToolOutput,
} from "@umbraculum/crp-contracts";

import { CrpPlanningService } from "../../../../modules/crp/services/planningService.js";

export function createCrpListWorkCentersTool(
  prisma: PrismaClient,
): AiTool<CrpListWorkCentersToolInput, CrpListWorkCentersToolOutput> {
  const svc = new CrpPlanningService(prisma);

  return {
    name: "crp.listWorkCenters",
    description:
      "List read-only CRP work centers in the active workspace, including brewery equipment-profile projections when present. Empty input.",
    scope: "read",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async (input, ctx) => {
      CrpListWorkCentersToolInputSchema.parse(input);
      const items = await svc.listWorkCenters(ctx.userId, ctx.workspaceId);
      return CrpListWorkCentersToolOutputSchema.parse({ ok: true, items });
    },
  };
}
