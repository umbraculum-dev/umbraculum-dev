import { z } from "zod";

import { IsoDateTimeStringSchema, NonEmptyStringSchema } from "./shared.js";

export const ScheduledOperationStatusSchema = z.enum(["planned", "scheduled", "completed", "cancelled"]);

export const ScheduledOperationSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  resourceId: z.string().min(1).nullable(),
  workCenterId: z.string().min(1).nullable(),
  productionOrderId: z.string().min(1).nullable(),
  operationId: z.string().min(1).nullable(),
  operationCode: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  status: ScheduledOperationStatusSchema,
  sourceModule: z.string().min(1).nullable(),
  sourceRefId: z.string().min(1).nullable(),
  startsAt: IsoDateTimeStringSchema,
  endsAt: IsoDateTimeStringSchema,
  plannedDurationMinutes: z.number().int().positive(),
}).superRefine((value, ctx) => {
  if (Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "endsAt must be after startsAt",
    });
  }
});

export const ScheduledOperationListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(ScheduledOperationSchema),
});

export type ScheduledOperationStatus = z.infer<typeof ScheduledOperationStatusSchema>;
export type ScheduledOperation = z.infer<typeof ScheduledOperationSchema>;
export type ScheduledOperationListResponse = z.infer<
  typeof ScheduledOperationListResponseSchema
>;

export function parseScheduledOperation(payload: unknown): ScheduledOperation {
  return ScheduledOperationSchema.parse(payload);
}

export function parseScheduledOperationListResponse(
  payload: unknown,
): ScheduledOperationListResponse {
  return ScheduledOperationListResponseSchema.parse(payload);
}
