import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import {
  CrpProposeScheduleAdjustmentInputSchema,
  CrpProposeScheduleAdjustmentOutputSchema,
  type CrpProposeScheduleAdjustmentInput,
  type CrpProposeScheduleAdjustmentOutput,
} from "@umbraculum/contracts";

import { AiProposalService } from "../../proposalService.js";

export function createCrpProposeScheduleAdjustmentTool(
  prisma: PrismaClient,
): AiTool<CrpProposeScheduleAdjustmentInput, CrpProposeScheduleAdjustmentOutput> {
  const proposals = new AiProposalService(prisma);

  return {
    name: "crp.proposeScheduleAdjustment",
    description:
      "Propose a schedule or capacity adjustment for CRP planning. Returns a proposal id for human confirmation; does not mutate data.",
    scope: "propose",
    inputSchema: {
      type: "object",
      properties: {
        resourceId: { type: "string", format: "uuid" },
        suggestedDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        rationale: { type: "string", maxLength: 500 },
      },
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const parsed = CrpProposeScheduleAdjustmentInputSchema.parse(input);
      const summary = parsed.suggestedDate
        ? `Propose schedule focus on ${parsed.suggestedDate}${parsed.resourceId ? ` for resource ${parsed.resourceId}` : ""}`
        : `Propose schedule review${parsed.resourceId ? ` for resource ${parsed.resourceId}` : ""}`;
      const row = await proposals.create({
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        moduleCode: "crp",
        proposalType: "scheduleAdjustment",
        summary,
        payloadJson: {
          resourceId: parsed.resourceId ?? null,
          suggestedDate: parsed.suggestedDate ?? null,
          rationale: parsed.rationale ?? null,
        },
      });
      return CrpProposeScheduleAdjustmentOutputSchema.parse({
        ok: true,
        proposalId: row.id,
        summary,
      });
    },
  };
}
