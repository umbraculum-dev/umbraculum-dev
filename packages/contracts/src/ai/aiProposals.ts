import { z } from "zod";

export const AiProposalStatusSchema = z.enum(["pending", "applied", "rejected"]);
export type AiProposalStatus = z.infer<typeof AiProposalStatusSchema>;

export const AiProposalDtoSchema = z
  .object({
    id: z.string().uuid(),
    workspaceId: z.string().uuid(),
    userId: z.string().uuid(),
    moduleCode: z.string().min(1).max(32),
    proposalType: z.string().min(1).max(64),
    summary: z.string().min(1).max(2000),
    payloadJson: z.record(z.string(), z.unknown()),
    status: AiProposalStatusSchema,
    createdAt: z.string(),
    appliedAt: z.string().nullable(),
    rejectedAt: z.string().nullable(),
  })
  .strict();

export type AiProposalDto = z.infer<typeof AiProposalDtoSchema>;

export const AiProposalListResponseSchema = z
  .object({
    ok: z.literal(true),
    items: z.array(AiProposalDtoSchema),
  })
  .strict();

export const AiProposalActionResponseSchema = z
  .object({
    ok: z.literal(true),
    proposal: AiProposalDtoSchema,
    appliedPreviewOnly: z.boolean().optional(),
  })
  .strict();

export const MrpProposeOrderAdjustmentInputSchema = z
  .object({
    productionOrderId: z.string().uuid(),
    suggestedStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    suggestedQuantity: z.number().positive().optional(),
    rationale: z.string().max(500).optional(),
  })
  .strict();

export const MrpProposeOrderAdjustmentOutputSchema = z
  .object({
    ok: z.literal(true),
    proposalId: z.string().uuid(),
    summary: z.string(),
  })
  .strict();

export const CrpProposeScheduleAdjustmentInputSchema = z
  .object({
    resourceId: z.string().uuid().optional(),
    suggestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    rationale: z.string().max(500).optional(),
  })
  .strict();

export const CrpProposeScheduleAdjustmentOutputSchema = z
  .object({
    ok: z.literal(true),
    proposalId: z.string().uuid(),
    summary: z.string(),
  })
  .strict();

export type MrpProposeOrderAdjustmentInput = z.infer<typeof MrpProposeOrderAdjustmentInputSchema>;
export type MrpProposeOrderAdjustmentOutput = z.infer<typeof MrpProposeOrderAdjustmentOutputSchema>;
export type CrpProposeScheduleAdjustmentInput = z.infer<
  typeof CrpProposeScheduleAdjustmentInputSchema
>;
export type CrpProposeScheduleAdjustmentOutput = z.infer<
  typeof CrpProposeScheduleAdjustmentOutputSchema
>;
