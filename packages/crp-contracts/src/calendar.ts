import { z } from "zod";

import { IsoDateTimeStringSchema, NonEmptyStringSchema } from "./shared.js";

export const AvailabilityWindowSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  resourceId: NonEmptyStringSchema,
  startsAt: IsoDateTimeStringSchema,
  endsAt: IsoDateTimeStringSchema,
  capacityMinutes: z.number().int().nonnegative(),
  sourceModule: z.string().min(1).nullable(),
  sourceRefId: z.string().min(1).nullable(),
}).superRefine((value, ctx) => {
  if (Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "endsAt must be after startsAt",
    });
  }
});

export const ResourceCalendarSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  resourceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  timezone: NonEmptyStringSchema,
  windows: z.array(AvailabilityWindowSchema),
});

export const ResourceCalendarListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(ResourceCalendarSchema),
});

export const AvailabilityWindowListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(AvailabilityWindowSchema),
});

export const CapacityWindowSchema = AvailabilityWindowSchema;
export const CapacityWindowListResponseSchema = AvailabilityWindowListResponseSchema;

export type AvailabilityWindow = z.infer<typeof AvailabilityWindowSchema>;
export type ResourceCalendar = z.infer<typeof ResourceCalendarSchema>;
export type ResourceCalendarListResponse = z.infer<typeof ResourceCalendarListResponseSchema>;
export type AvailabilityWindowListResponse = z.infer<
  typeof AvailabilityWindowListResponseSchema
>;
export type CapacityWindow = AvailabilityWindow;
export type CapacityWindowListResponse = AvailabilityWindowListResponse;

export function parseAvailabilityWindow(payload: unknown): AvailabilityWindow {
  return AvailabilityWindowSchema.parse(payload);
}

export function parseResourceCalendar(payload: unknown): ResourceCalendar {
  return ResourceCalendarSchema.parse(payload);
}

export function parseResourceCalendarListResponse(
  payload: unknown,
): ResourceCalendarListResponse {
  return ResourceCalendarListResponseSchema.parse(payload);
}

export function parseAvailabilityWindowListResponse(
  payload: unknown,
): AvailabilityWindowListResponse {
  return AvailabilityWindowListResponseSchema.parse(payload);
}

export const parseCapacityWindow = parseAvailabilityWindow;
export const parseCapacityWindowListResponse = parseAvailabilityWindowListResponse;
