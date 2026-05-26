import { z } from "zod";

import { CapacityLoadBucketSchema } from "./capacityLoad.js";
import { CapacityResourceSchema } from "./resource.js";
import { CapacityScheduleSchema } from "./schedule.js";
import { NonEmptyStringSchema } from "./shared.js";

export const CrpCapacityPlanPdfInputSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  schedule: CapacityScheduleSchema,
  resources: z.array(CapacityResourceSchema),
  loadBuckets: z.array(CapacityLoadBucketSchema),
});

export const CrpResourceLoadCsvInputSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  loadBuckets: z.array(CapacityLoadBucketSchema),
});

export const CrpScheduleExportCsvInputSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  schedule: CapacityScheduleSchema,
});

export type CrpCapacityPlanPdfInput = z.infer<typeof CrpCapacityPlanPdfInputSchema>;
export type CrpResourceLoadCsvInput = z.infer<typeof CrpResourceLoadCsvInputSchema>;
export type CrpScheduleExportCsvInput = z.infer<typeof CrpScheduleExportCsvInputSchema>;
