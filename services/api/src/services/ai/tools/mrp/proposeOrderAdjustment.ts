import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import {
  MrpProposeOrderAdjustmentInputSchema,
  MrpProposeOrderAdjustmentOutputSchema,
  type MrpProposeOrderAdjustmentInput,
  type MrpProposeOrderAdjustmentOutput,
} from "@umbraculum/contracts";

import { ProductionOrdersService } from "../../../../modules/mrp/services/productionOrdersService.js";
import { AiProposalService } from "../../proposalService.js";

export function createMrpProposeOrderAdjustmentTool(
  prisma: PrismaClient,
): AiTool<MrpProposeOrderAdjustmentInput, MrpProposeOrderAdjustmentOutput> {
  const orders = new ProductionOrdersService(prisma);
  const proposals = new AiProposalService(prisma);

  return {
    name: "mrp.proposeOrderAdjustment",
    description:
      "Propose an adjustment to a production order (dates or quantity). Returns a proposal id for human confirmation; does not mutate data.",
    scope: "propose",
    inputSchema: {
      type: "object",
      properties: {
        productionOrderId: { type: "string", format: "uuid" },
        suggestedStartDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        suggestedQuantity: { type: "number", exclusiveMinimum: 0 },
        rationale: { type: "string", maxLength: 500 },
      },
      required: ["productionOrderId"],
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const parsed = MrpProposeOrderAdjustmentInputSchema.parse(input);
      const item = await orders.getProductionOrderById(
        ctx.userId,
        ctx.workspaceId,
        parsed.productionOrderId,
      );
      const changes: Array<{ field: string; from: unknown; to: unknown }> = [];
      const currentStart = item.plannedStartAt?.slice(0, 10) ?? null;
      if (parsed.suggestedStartDate && currentStart !== parsed.suggestedStartDate) {
        changes.push({
          field: "plannedStartAt",
          from: item.plannedStartAt,
          to: `${parsed.suggestedStartDate}T00:00:00.000Z`,
        });
      }
      if (parsed.suggestedQuantity !== undefined && item.quantity !== parsed.suggestedQuantity) {
        changes.push({ field: "quantity", from: item.quantity, to: parsed.suggestedQuantity });
      }
      const summary =
        changes.length > 0
          ? `Proposed changes for order ${item.orderNumber}: ${changes.map((c) => `${c.field} → ${String(c.to)}`).join("; ")}`
          : `No changes suggested for order ${item.orderNumber}`;
      const row = await proposals.create({
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        moduleCode: "mrp",
        proposalType: "orderAdjustment",
        summary,
        payloadJson: {
          productionOrderId: parsed.productionOrderId,
          changes,
          rationale: parsed.rationale ?? null,
        },
      });
      return MrpProposeOrderAdjustmentOutputSchema.parse({
        ok: true,
        proposalId: row.id,
        summary,
      });
    },
  };
}
