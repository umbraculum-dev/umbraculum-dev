import { z } from "zod";

import { CrpScheduleableOperationSchema } from "./mrpHandoff.js";
import { ScheduledOperationSchema } from "./scheduledOperation.js";
import { NonEmptyStringSchema } from "./shared.js";

export const ScheduleProposalInputSchema = z
  .object({
    workspaceId: NonEmptyStringSchema,
    operations: z.array(CrpScheduleableOperationSchema),
    horizonStartAt: z.string().min(1),
    horizonEndAt: z.string().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.operations.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["operations"],
        message: "at least one operation is required",
      });
    }
  });

export const ScheduleProposalOutputSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  proposedOperations: z.array(ScheduledOperationSchema),
});

export type ScheduleProposalInput = z.infer<typeof ScheduleProposalInputSchema>;
export type ScheduleProposalOutput = z.infer<typeof ScheduleProposalOutputSchema>;

export function parseScheduleProposalInput(payload: unknown): ScheduleProposalInput {
  return ScheduleProposalInputSchema.parse(payload);
}

export function parseScheduleProposalOutput(payload: unknown): ScheduleProposalOutput {
  return ScheduleProposalOutputSchema.parse(payload);
}
