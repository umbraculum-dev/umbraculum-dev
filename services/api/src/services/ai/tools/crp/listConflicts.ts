import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import {
  CrpListConflictsToolInputSchema,
  CrpListConflictsToolOutputSchema,
  type CrpListConflictsToolInput,
  type CrpListConflictsToolOutput,
} from "@umbraculum/crp-contracts";

import { CrpPlanningService } from "../../../../modules/crp/services/planningService.js";

export function createCrpListConflictsTool(
  prisma: PrismaClient,
): AiTool<CrpListConflictsToolInput, CrpListConflictsToolOutput> {
  const svc = new CrpPlanningService(prisma);

  return {
    name: "crp.listConflicts",
    description:
      "List read-only CRP capacity warnings/conflicts in the active workspace. Empty input.",
    scope: "read",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async (input, ctx) => {
      CrpListConflictsToolInputSchema.parse(input);
      const items = await svc.listConflicts(ctx.userId, ctx.workspaceId);
      return CrpListConflictsToolOutputSchema.parse({ ok: true, items });
    },
  };
}
