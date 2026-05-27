import { z } from "zod";

import { CapacityLoadResponseSchema } from "./capacityLoad.js";
import { CapacityConflictListResponseSchema } from "./conflict.js";
import { CapacityResourceListResponseSchema } from "./resource.js";
import {
  CapacityScheduleGetResponseSchema,
  CapacityScheduleListResponseSchema,
} from "./schedule.js";
import { ScheduledOperationListResponseSchema } from "./scheduledOperation.js";
import { NonEmptyStringSchema } from "./shared.js";
import { WorkCenterListResponseSchema } from "./workCenter.js";

export const CrpListResourcesToolInputSchema = z
  .object({
    kind: z.enum(["work_center", "equipment", "labor", "external", "buffer"]).optional(),
  })
  .strict();

export const CrpGetScheduleToolInputSchema = z
  .object({
    scheduleId: NonEmptyStringSchema,
  })
  .strict();

export const CrpListSchedulesToolInputSchema = z
  .object({
    status: z.enum(["proposed", "accepted", "superseded"]).optional(),
  })
  .strict();

export const CrpListWorkCentersToolInputSchema = z.object({}).strict();

export const CrpListScheduledOperationsToolInputSchema = z.object({}).strict();

export const CrpExplainCapacityLoadToolInputSchema = z
  .object({
    resourceId: NonEmptyStringSchema.optional(),
  })
  .strict();

export const CrpListConflictsToolInputSchema = z.object({}).strict();

export const CrpListResourcesToolOutputSchema = CapacityResourceListResponseSchema;
export const CrpListSchedulesToolOutputSchema = CapacityScheduleListResponseSchema;
export const CrpGetScheduleToolOutputSchema = CapacityScheduleGetResponseSchema;
export const CrpListWorkCentersToolOutputSchema = WorkCenterListResponseSchema;
export const CrpListScheduledOperationsToolOutputSchema = ScheduledOperationListResponseSchema;
export const CrpExplainCapacityLoadToolOutputSchema = CapacityLoadResponseSchema;
export const CrpListConflictsToolOutputSchema = CapacityConflictListResponseSchema;

export type CrpListResourcesToolInput = z.infer<typeof CrpListResourcesToolInputSchema>;
export type CrpListSchedulesToolInput = z.infer<typeof CrpListSchedulesToolInputSchema>;
export type CrpGetScheduleToolInput = z.infer<typeof CrpGetScheduleToolInputSchema>;
export type CrpListWorkCentersToolInput = z.infer<typeof CrpListWorkCentersToolInputSchema>;
export type CrpListScheduledOperationsToolInput = z.infer<
  typeof CrpListScheduledOperationsToolInputSchema
>;
export type CrpExplainCapacityLoadToolInput = z.infer<
  typeof CrpExplainCapacityLoadToolInputSchema
>;
export type CrpListConflictsToolInput = z.infer<typeof CrpListConflictsToolInputSchema>;
export type CrpListResourcesToolOutput = z.infer<typeof CrpListResourcesToolOutputSchema>;
export type CrpListSchedulesToolOutput = z.infer<typeof CrpListSchedulesToolOutputSchema>;
export type CrpGetScheduleToolOutput = z.infer<typeof CrpGetScheduleToolOutputSchema>;
export type CrpListWorkCentersToolOutput = z.infer<typeof CrpListWorkCentersToolOutputSchema>;
export type CrpListScheduledOperationsToolOutput = z.infer<
  typeof CrpListScheduledOperationsToolOutputSchema
>;
export type CrpExplainCapacityLoadToolOutput = z.infer<
  typeof CrpExplainCapacityLoadToolOutputSchema
>;
export type CrpListConflictsToolOutput = z.infer<typeof CrpListConflictsToolOutputSchema>;
