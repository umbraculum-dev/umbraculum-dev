import { z } from "zod";

import { IsoDateTimeStringSchema, NonEmptyStringSchema } from "./shared.js";

export const CapacityConflictSeveritySchema = z.enum(["info", "warning", "critical"]);
export const CapacityConflictStatusSchema = z.enum(["open", "acknowledged", "resolved"]);

export const CapacityConflictSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  severity: CapacityConflictSeveritySchema,
  status: CapacityConflictStatusSchema,
  message: NonEmptyStringSchema,
  resourceId: z.string().min(1).nullable(),
  scheduledOperationId: z.string().min(1).nullable(),
  startsAt: IsoDateTimeStringSchema.nullable(),
  endsAt: IsoDateTimeStringSchema.nullable(),
  createdAt: IsoDateTimeStringSchema,
});

export const CapacityConflictListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(CapacityConflictSchema),
});

export type CapacityConflictSeverity = z.infer<typeof CapacityConflictSeveritySchema>;
export type CapacityConflictStatus = z.infer<typeof CapacityConflictStatusSchema>;
export type CapacityConflict = z.infer<typeof CapacityConflictSchema>;
export type CapacityConflictListResponse = z.infer<
  typeof CapacityConflictListResponseSchema
>;

export function parseCapacityConflict(payload: unknown): CapacityConflict {
  return CapacityConflictSchema.parse(payload);
}

export function parseCapacityConflictListResponse(
  payload: unknown,
): CapacityConflictListResponse {
  return CapacityConflictListResponseSchema.parse(payload);
}
