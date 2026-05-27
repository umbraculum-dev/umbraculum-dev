import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import {
  CrpListResourcesToolInputSchema,
  CrpListResourcesToolOutputSchema,
  type CrpListResourcesToolInput,
  type CrpListResourcesToolOutput,
} from "@umbraculum/crp-contracts";

import { CrpResourcesService } from "../../../../modules/crp/services/resourcesService.js";

export function createCrpListResourcesTool(
  prisma: PrismaClient,
): AiTool<CrpListResourcesToolInput, CrpListResourcesToolOutput> {
  const svc = new CrpResourcesService(prisma);

  return {
    name: "crp.listResources",
    description:
      "List read-only CRP resources in the active workspace, including automation vessel projections when present.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {
        kind: {
          type: "string",
          enum: ["work_center", "equipment", "labor", "external", "buffer"],
        },
      },
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const parsed = CrpListResourcesToolInputSchema.parse(input);
      const items = await svc.listResources(ctx.userId, ctx.workspaceId, parsed.kind);
      return CrpListResourcesToolOutputSchema.parse({ ok: true, items });
    },
  };
}
