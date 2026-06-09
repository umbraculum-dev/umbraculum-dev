import { z } from "zod";

import { CapacityConflictSchema } from "./conflict.js";
import { CapacityLoadBucketSchema } from "./capacityLoad.js";
import { ResourceSchema } from "./resource.js";
import { ScheduledOperationSchema } from "./scheduledOperation.js";
import { NonEmptyStringSchema } from "./shared.js";

export const CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF = "crp:capacity-load-xlsx@v1";
export const CRP_SCHEDULE_PDF_TEMPLATE_REF = "crp:schedule-pdf@v1";
export const CRP_RESOURCE_CALENDAR_CSV_TEMPLATE_REF = "crp:resource-calendar-csv@v1";
export const CRP_CONFLICT_REPORT_PDF_TEMPLATE_REF = "crp:conflict-report-pdf@v1";

export const CrpCapacityLoadXlsxInputSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  loadBuckets: z.array(CapacityLoadBucketSchema),
});

export const CrpSchedulePdfInputSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  generatedAt: NonEmptyStringSchema,
  resources: z.array(ResourceSchema),
  scheduledOperations: z.array(ScheduledOperationSchema),
  loadBuckets: z.array(CapacityLoadBucketSchema),
});

export const CrpResourceCalendarCsvInputSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  resources: z.array(ResourceSchema),
  loadBuckets: z.array(CapacityLoadBucketSchema),
});

export const CrpConflictReportPdfInputSchema = z.object({
  workspaceId: NonEmptyStringSchema,
  generatedAt: NonEmptyStringSchema,
  conflicts: z.array(CapacityConflictSchema),
  loadBuckets: z.array(CapacityLoadBucketSchema),
});

export type CrpCapacityLoadXlsxInput = z.infer<typeof CrpCapacityLoadXlsxInputSchema>;
export type CrpSchedulePdfInput = z.infer<typeof CrpSchedulePdfInputSchema>;
export type CrpResourceCalendarCsvInput = z.infer<typeof CrpResourceCalendarCsvInputSchema>;
export type CrpConflictReportPdfInput = z.infer<typeof CrpConflictReportPdfInputSchema>;
