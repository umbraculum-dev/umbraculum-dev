import { z } from "zod";

import { IsoDateTimeStringSchema, NonEmptyStringSchema } from "./shared.js";

export const ScheduleStatusSchema = z.enum(["proposed", "accepted", "superseded"]);

export const ScheduleAssignmentSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  scheduleId: NonEmptyStringSchema,
  resourceId: NonEmptyStringSchema,
  productionOrderId: z.string().min(1).nullable(),
  operationId: z.string().min(1).nullable(),
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

export const CapacityScheduleSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  status: ScheduleStatusSchema,
  horizonStartAt: IsoDateTimeStringSchema,
  horizonEndAt: IsoDateTimeStringSchema,
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
  assignments: z.array(ScheduleAssignmentSchema),
});

export const CapacityScheduleListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(CapacityScheduleSchema),
});

export const CapacityScheduleGetResponseSchema = z.object({
  ok: z.literal(true),
  item: CapacityScheduleSchema,
});

export type ScheduleStatus = z.infer<typeof ScheduleStatusSchema>;
export type ScheduleAssignment = z.infer<typeof ScheduleAssignmentSchema>;
export type CapacitySchedule = z.infer<typeof CapacityScheduleSchema>;
export type CapacityScheduleListResponse = z.infer<typeof CapacityScheduleListResponseSchema>;
export type CapacityScheduleGetResponse = z.infer<typeof CapacityScheduleGetResponseSchema>;

export function parseScheduleAssignment(payload: unknown): ScheduleAssignment {
  return ScheduleAssignmentSchema.parse(payload);
}

export function parseCapacitySchedule(payload: unknown): CapacitySchedule {
  return CapacityScheduleSchema.parse(payload);
}

export function parseCapacityScheduleListResponse(
  payload: unknown,
): CapacityScheduleListResponse {
  return CapacityScheduleListResponseSchema.parse(payload);
}

export function parseCapacityScheduleGetResponse(
  payload: unknown,
): CapacityScheduleGetResponse {
  return CapacityScheduleGetResponseSchema.parse(payload);
}
