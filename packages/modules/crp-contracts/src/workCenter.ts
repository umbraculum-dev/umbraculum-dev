import { z } from "zod";

import { IsoDateTimeStringSchema, NonEmptyStringSchema } from "./shared.js";

export const WorkCenterStatusSchema = z.enum(["active", "inactive"]);

export const WorkCenterSchema = z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  resourceId: z.string().min(1).nullable(),
  status: WorkCenterStatusSchema,
  sourceModule: z.string().min(1).nullable(),
  sourceRefId: z.string().min(1).nullable(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
});

export const WorkCenterListResponseSchema = z.object({
  ok: z.literal(true),
  items: z.array(WorkCenterSchema),
});

export const WorkCenterGetResponseSchema = z.object({
  ok: z.literal(true),
  item: WorkCenterSchema,
});

export type WorkCenterStatus = z.infer<typeof WorkCenterStatusSchema>;
export type WorkCenter = z.infer<typeof WorkCenterSchema>;
export type WorkCenterListResponse = z.infer<typeof WorkCenterListResponseSchema>;
export type WorkCenterGetResponse = z.infer<typeof WorkCenterGetResponseSchema>;

export function parseWorkCenter(payload: unknown): WorkCenter {
  return WorkCenterSchema.parse(payload);
}

export function parseWorkCenterListResponse(payload: unknown): WorkCenterListResponse {
  return WorkCenterListResponseSchema.parse(payload);
}

export function parseWorkCenterGetResponse(payload: unknown): WorkCenterGetResponse {
  return WorkCenterGetResponseSchema.parse(payload);
}
