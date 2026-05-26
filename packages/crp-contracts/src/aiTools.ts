import { z } from "zod";

import { CapacityLoadResponseSchema } from "./capacityLoad.js";
import { CapacityResourceListResponseSchema } from "./resource.js";
import {
  CapacityScheduleGetResponseSchema,
  CapacityScheduleListResponseSchema,
} from "./schedule.js";
import { NonEmptyStringSchema } from "./shared.js";

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

export const CrpExplainCapacityLoadToolInputSchema = z
  .object({
    resourceId: NonEmptyStringSchema.optional(),
  })
  .strict();

export const CrpListResourcesToolOutputSchema = CapacityResourceListResponseSchema;
export const CrpListSchedulesToolOutputSchema = CapacityScheduleListResponseSchema;
export const CrpGetScheduleToolOutputSchema = CapacityScheduleGetResponseSchema;
export const CrpExplainCapacityLoadToolOutputSchema = CapacityLoadResponseSchema;

export type CrpListResourcesToolInput = z.infer<typeof CrpListResourcesToolInputSchema>;
export type CrpListSchedulesToolInput = z.infer<typeof CrpListSchedulesToolInputSchema>;
export type CrpGetScheduleToolInput = z.infer<typeof CrpGetScheduleToolInputSchema>;
export type CrpExplainCapacityLoadToolInput = z.infer<
  typeof CrpExplainCapacityLoadToolInputSchema
>;
export type CrpListResourcesToolOutput = z.infer<typeof CrpListResourcesToolOutputSchema>;
export type CrpListSchedulesToolOutput = z.infer<typeof CrpListSchedulesToolOutputSchema>;
export type CrpGetScheduleToolOutput = z.infer<typeof CrpGetScheduleToolOutputSchema>;
export type CrpExplainCapacityLoadToolOutput = z.infer<
  typeof CrpExplainCapacityLoadToolOutputSchema
>;
