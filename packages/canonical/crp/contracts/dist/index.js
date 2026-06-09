// src/version.ts
var CONTRACT_VERSION = "0.1.0-alpha.1";
function parseSemVer(input) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(input);
  if (!match) return null;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (!Number.isInteger(major) || !Number.isInteger(minor) || !Number.isInteger(patch)) {
    return null;
  }
  const prerelease = match[4];
  if (prerelease === void 0) {
    return { major, minor, patch };
  }
  return { major, minor, patch, prerelease };
}
function classifyContractVersionSkew(runtime, expected = CONTRACT_VERSION) {
  const r = parseSemVer(runtime);
  const e = parseSemVer(expected);
  if (!r || !e) return "unparseable";
  if (r.major !== e.major) return "major";
  if (r.minor !== e.minor) return "minor";
  if (r.patch !== e.patch) return "patch";
  return "match";
}

// src/shared.ts
import { z } from "zod";
var IsoDateTimeStringSchema = z.string().min(1, "timestamp required").refine((s) => !Number.isNaN(Date.parse(s)), "must be ISO 8601");
var NonEmptyStringSchema = z.string().min(1);
var QuantitySchema = z.number().finite().positive();
var CrpDeleteResponseSchema = z.object({
  ok: z.literal(true)
});
function parseCrpDeleteResponse(payload) {
  return CrpDeleteResponseSchema.parse(payload);
}

// src/resource.ts
import { z as z2 } from "zod";
var ResourceKindSchema = z2.enum([
  "work_center",
  "equipment",
  "labor",
  "external",
  "buffer"
]);
var ResourceStatusSchema = z2.enum(["active", "inactive"]);
var ResourceSchema = z2.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  kind: ResourceKindSchema,
  status: ResourceStatusSchema,
  sourceModule: z2.string().min(1).nullable(),
  sourceRefId: z2.string().min(1).nullable(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var ResourceRefSchema = z2.object({
  resourceId: NonEmptyStringSchema
});
var ResourceListResponseSchema = z2.object({
  ok: z2.literal(true),
  items: z2.array(ResourceSchema)
});
var ResourceGetResponseSchema = z2.object({
  ok: z2.literal(true),
  item: ResourceSchema
});
var CapacityResourceSchema = ResourceSchema;
var CapacityResourceRefSchema = ResourceRefSchema;
var CapacityResourceListResponseSchema = ResourceListResponseSchema;
var CapacityResourceGetResponseSchema = ResourceGetResponseSchema;
function parseResource(payload) {
  return ResourceSchema.parse(payload);
}
function parseResourceListResponse(payload) {
  return ResourceListResponseSchema.parse(payload);
}
function parseResourceGetResponse(payload) {
  return ResourceGetResponseSchema.parse(payload);
}
var parseCapacityResource = parseResource;
var parseCapacityResourceListResponse = parseResourceListResponse;
var parseCapacityResourceGetResponse = parseResourceGetResponse;

// src/calendar.ts
import { z as z3 } from "zod";
var AvailabilityWindowSchema = z3.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  resourceId: NonEmptyStringSchema,
  startsAt: IsoDateTimeStringSchema,
  endsAt: IsoDateTimeStringSchema,
  capacityMinutes: z3.number().int().nonnegative(),
  sourceModule: z3.string().min(1).nullable(),
  sourceRefId: z3.string().min(1).nullable()
}).superRefine((value, ctx) => {
  if (Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "endsAt must be after startsAt"
    });
  }
});
var ResourceCalendarSchema = z3.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  resourceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  timezone: NonEmptyStringSchema,
  windows: z3.array(AvailabilityWindowSchema)
});
var ResourceCalendarListResponseSchema = z3.object({
  ok: z3.literal(true),
  items: z3.array(ResourceCalendarSchema)
});
var AvailabilityWindowListResponseSchema = z3.object({
  ok: z3.literal(true),
  items: z3.array(AvailabilityWindowSchema)
});
var CapacityWindowSchema = AvailabilityWindowSchema;
var CapacityWindowListResponseSchema = AvailabilityWindowListResponseSchema;
function parseAvailabilityWindow(payload) {
  return AvailabilityWindowSchema.parse(payload);
}
function parseResourceCalendar(payload) {
  return ResourceCalendarSchema.parse(payload);
}
function parseResourceCalendarListResponse(payload) {
  return ResourceCalendarListResponseSchema.parse(payload);
}
function parseAvailabilityWindowListResponse(payload) {
  return AvailabilityWindowListResponseSchema.parse(payload);
}
var parseCapacityWindow = parseAvailabilityWindow;
var parseCapacityWindowListResponse = parseAvailabilityWindowListResponse;

// src/workCenter.ts
import { z as z4 } from "zod";
var WorkCenterStatusSchema = z4.enum(["active", "inactive"]);
var WorkCenterSchema = z4.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  resourceId: z4.string().min(1).nullable(),
  status: WorkCenterStatusSchema,
  sourceModule: z4.string().min(1).nullable(),
  sourceRefId: z4.string().min(1).nullable(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var WorkCenterListResponseSchema = z4.object({
  ok: z4.literal(true),
  items: z4.array(WorkCenterSchema)
});
var WorkCenterGetResponseSchema = z4.object({
  ok: z4.literal(true),
  item: WorkCenterSchema
});
function parseWorkCenter(payload) {
  return WorkCenterSchema.parse(payload);
}
function parseWorkCenterListResponse(payload) {
  return WorkCenterListResponseSchema.parse(payload);
}
function parseWorkCenterGetResponse(payload) {
  return WorkCenterGetResponseSchema.parse(payload);
}

// src/scheduledOperation.ts
import { z as z5 } from "zod";
var ScheduledOperationStatusSchema = z5.enum(["planned", "scheduled", "completed", "cancelled"]);
var ScheduledOperationSchema = z5.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  resourceId: z5.string().min(1).nullable(),
  workCenterId: z5.string().min(1).nullable(),
  productionOrderId: z5.string().min(1).nullable(),
  operationId: z5.string().min(1).nullable(),
  operationCode: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  status: ScheduledOperationStatusSchema,
  sourceModule: z5.string().min(1).nullable(),
  sourceRefId: z5.string().min(1).nullable(),
  startsAt: IsoDateTimeStringSchema,
  endsAt: IsoDateTimeStringSchema,
  plannedDurationMinutes: z5.number().int().positive()
}).superRefine((value, ctx) => {
  if (Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "endsAt must be after startsAt"
    });
  }
});
var ScheduledOperationListResponseSchema = z5.object({
  ok: z5.literal(true),
  items: z5.array(ScheduledOperationSchema)
});
function parseScheduledOperation(payload) {
  return ScheduledOperationSchema.parse(payload);
}
function parseScheduledOperationListResponse(payload) {
  return ScheduledOperationListResponseSchema.parse(payload);
}

// src/schedule.ts
import { z as z6 } from "zod";
var ScheduleStatusSchema = z6.enum(["proposed", "accepted", "superseded"]);
var ScheduleAssignmentSchema = z6.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  scheduleId: NonEmptyStringSchema,
  resourceId: NonEmptyStringSchema,
  productionOrderId: z6.string().min(1).nullable(),
  operationId: z6.string().min(1).nullable(),
  sourceModule: z6.string().min(1).nullable(),
  sourceRefId: z6.string().min(1).nullable(),
  startsAt: IsoDateTimeStringSchema,
  endsAt: IsoDateTimeStringSchema,
  plannedDurationMinutes: z6.number().int().positive()
}).superRefine((value, ctx) => {
  if (Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "endsAt must be after startsAt"
    });
  }
});
var CapacityScheduleSchema = z6.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  status: ScheduleStatusSchema,
  horizonStartAt: IsoDateTimeStringSchema,
  horizonEndAt: IsoDateTimeStringSchema,
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
  assignments: z6.array(ScheduleAssignmentSchema)
});
var CapacityScheduleListResponseSchema = z6.object({
  ok: z6.literal(true),
  items: z6.array(CapacityScheduleSchema)
});
var CapacityScheduleGetResponseSchema = z6.object({
  ok: z6.literal(true),
  item: CapacityScheduleSchema
});
function parseScheduleAssignment(payload) {
  return ScheduleAssignmentSchema.parse(payload);
}
function parseCapacitySchedule(payload) {
  return CapacityScheduleSchema.parse(payload);
}
function parseCapacityScheduleListResponse(payload) {
  return CapacityScheduleListResponseSchema.parse(payload);
}
function parseCapacityScheduleGetResponse(payload) {
  return CapacityScheduleGetResponseSchema.parse(payload);
}

// src/capacityLoad.ts
import { z as z7 } from "zod";
var CapacityBucketSchema = z7.object({
  resourceId: NonEmptyStringSchema,
  resourceCode: NonEmptyStringSchema,
  bucketStartAt: IsoDateTimeStringSchema,
  bucketEndAt: IsoDateTimeStringSchema,
  availableMinutes: z7.number().int().nonnegative(),
  plannedMinutes: z7.number().int().nonnegative(),
  overloadMinutes: z7.number().int().nonnegative()
}).superRefine((value, ctx) => {
  if (Date.parse(value.bucketEndAt) <= Date.parse(value.bucketStartAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["bucketEndAt"],
      message: "bucketEndAt must be after bucketStartAt"
    });
  }
});
var CapacityLoadQuerySchema = z7.object({
  resourceId: z7.string().min(1).optional()
}).strict();
var CapacityLoadSchema = z7.object({
  workspaceId: NonEmptyStringSchema,
  buckets: z7.array(CapacityBucketSchema)
});
var CapacityLoadResponseSchema = z7.object({
  ok: z7.literal(true),
  item: CapacityLoadSchema
});
var CapacityLoadBucketSchema = CapacityBucketSchema;
function parseCapacityBucket(payload) {
  return CapacityBucketSchema.parse(payload);
}
function parseCapacityLoad(payload) {
  return CapacityLoadSchema.parse(payload);
}
function parseCapacityLoadResponse(payload) {
  return CapacityLoadResponseSchema.parse(payload);
}
var parseCapacityLoadBucket = parseCapacityBucket;

// src/conflict.ts
import { z as z8 } from "zod";
var CapacityConflictSeveritySchema = z8.enum(["info", "warning", "critical"]);
var CapacityConflictStatusSchema = z8.enum(["open", "acknowledged", "resolved"]);
var CapacityConflictSchema = z8.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  severity: CapacityConflictSeveritySchema,
  status: CapacityConflictStatusSchema,
  message: NonEmptyStringSchema,
  resourceId: z8.string().min(1).nullable(),
  scheduledOperationId: z8.string().min(1).nullable(),
  startsAt: IsoDateTimeStringSchema.nullable(),
  endsAt: IsoDateTimeStringSchema.nullable(),
  createdAt: IsoDateTimeStringSchema
});
var CapacityConflictListResponseSchema = z8.object({
  ok: z8.literal(true),
  items: z8.array(CapacityConflictSchema)
});
function parseCapacityConflict(payload) {
  return CapacityConflictSchema.parse(payload);
}
function parseCapacityConflictListResponse(payload) {
  return CapacityConflictListResponseSchema.parse(payload);
}

// src/proposal.ts
import { z as z10 } from "zod";

// src/mrpHandoff.ts
import { z as z9 } from "zod";
var CrpScheduleableOperationSchema = z9.object({
  productionOrderId: NonEmptyStringSchema,
  operationId: NonEmptyStringSchema,
  operationCode: NonEmptyStringSchema,
  requiredResourceKind: z9.string().min(1).nullable(),
  plannedDurationMinutes: z9.number().int().positive().nullable(),
  earliestStartAt: IsoDateTimeStringSchema.nullable(),
  dueAt: IsoDateTimeStringSchema.nullable(),
  quantity: QuantitySchema,
  unit: NonEmptyStringSchema,
  sourceModule: z9.string().min(1).nullable(),
  sourceRefId: z9.string().min(1).nullable(),
  preferredResourceId: z9.string().min(1).nullable(),
  schedulingNotes: z9.array(z9.string().min(1))
});
var MrpHandoffBatchSchema = z9.object({
  workspaceId: NonEmptyStringSchema,
  sourceModule: z9.literal("mrp"),
  operations: z9.array(CrpScheduleableOperationSchema)
});
var MrpHandoffBatchResponseSchema = z9.object({
  ok: z9.literal(true),
  item: MrpHandoffBatchSchema
});
function parseCrpScheduleableOperation(payload) {
  return CrpScheduleableOperationSchema.parse(payload);
}
function parseMrpHandoffBatch(payload) {
  return MrpHandoffBatchSchema.parse(payload);
}
function parseMrpHandoffBatchResponse(payload) {
  return MrpHandoffBatchResponseSchema.parse(payload);
}

// src/proposal.ts
var ScheduleProposalInputSchema = z10.object({
  workspaceId: NonEmptyStringSchema,
  operations: z10.array(CrpScheduleableOperationSchema),
  horizonStartAt: z10.string().min(1),
  horizonEndAt: z10.string().min(1)
}).strict().superRefine((value, ctx) => {
  if (value.operations.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["operations"],
      message: "at least one operation is required"
    });
  }
});
var ScheduleProposalOutputSchema = z10.object({
  workspaceId: NonEmptyStringSchema,
  proposedOperations: z10.array(ScheduledOperationSchema)
});
function parseScheduleProposalInput(payload) {
  return ScheduleProposalInputSchema.parse(payload);
}
function parseScheduleProposalOutput(payload) {
  return ScheduleProposalOutputSchema.parse(payload);
}

// src/aiTools.ts
import { z as z11 } from "zod";
var CrpListResourcesToolInputSchema = z11.object({
  kind: z11.enum(["work_center", "equipment", "labor", "external", "buffer"]).optional()
}).strict();
var CrpGetScheduleToolInputSchema = z11.object({
  scheduleId: NonEmptyStringSchema
}).strict();
var CrpListSchedulesToolInputSchema = z11.object({
  status: z11.enum(["proposed", "accepted", "superseded"]).optional()
}).strict();
var CrpListWorkCentersToolInputSchema = z11.object({}).strict();
var CrpListScheduledOperationsToolInputSchema = z11.object({}).strict();
var CrpExplainCapacityLoadToolInputSchema = z11.object({
  resourceId: NonEmptyStringSchema.optional()
}).strict();
var CrpListConflictsToolInputSchema = z11.object({}).strict();
var CrpListResourcesToolOutputSchema = CapacityResourceListResponseSchema;
var CrpListSchedulesToolOutputSchema = CapacityScheduleListResponseSchema;
var CrpGetScheduleToolOutputSchema = CapacityScheduleGetResponseSchema;
var CrpListWorkCentersToolOutputSchema = WorkCenterListResponseSchema;
var CrpListScheduledOperationsToolOutputSchema = ScheduledOperationListResponseSchema;
var CrpExplainCapacityLoadToolOutputSchema = CapacityLoadResponseSchema;
var CrpListConflictsToolOutputSchema = CapacityConflictListResponseSchema;

// src/documentTemplates.ts
import { z as z12 } from "zod";
var CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF = "crp:capacity-load-xlsx@v1";
var CRP_SCHEDULE_PDF_TEMPLATE_REF = "crp:schedule-pdf@v1";
var CRP_RESOURCE_CALENDAR_CSV_TEMPLATE_REF = "crp:resource-calendar-csv@v1";
var CRP_CONFLICT_REPORT_PDF_TEMPLATE_REF = "crp:conflict-report-pdf@v1";
var CrpCapacityLoadXlsxInputSchema = z12.object({
  workspaceId: NonEmptyStringSchema,
  loadBuckets: z12.array(CapacityLoadBucketSchema)
});
var CrpSchedulePdfInputSchema = z12.object({
  workspaceId: NonEmptyStringSchema,
  generatedAt: NonEmptyStringSchema,
  resources: z12.array(ResourceSchema),
  scheduledOperations: z12.array(ScheduledOperationSchema),
  loadBuckets: z12.array(CapacityLoadBucketSchema)
});
var CrpResourceCalendarCsvInputSchema = z12.object({
  workspaceId: NonEmptyStringSchema,
  resources: z12.array(ResourceSchema),
  loadBuckets: z12.array(CapacityLoadBucketSchema)
});
var CrpConflictReportPdfInputSchema = z12.object({
  workspaceId: NonEmptyStringSchema,
  generatedAt: NonEmptyStringSchema,
  conflicts: z12.array(CapacityConflictSchema),
  loadBuckets: z12.array(CapacityLoadBucketSchema)
});
export {
  AvailabilityWindowListResponseSchema,
  AvailabilityWindowSchema,
  CONTRACT_VERSION,
  CRP_CAPACITY_LOAD_XLSX_TEMPLATE_REF,
  CRP_CONFLICT_REPORT_PDF_TEMPLATE_REF,
  CRP_RESOURCE_CALENDAR_CSV_TEMPLATE_REF,
  CRP_SCHEDULE_PDF_TEMPLATE_REF,
  CapacityBucketSchema,
  CapacityConflictListResponseSchema,
  CapacityConflictSchema,
  CapacityConflictSeveritySchema,
  CapacityConflictStatusSchema,
  CapacityLoadBucketSchema,
  CapacityLoadQuerySchema,
  CapacityLoadResponseSchema,
  CapacityLoadSchema,
  CapacityResourceGetResponseSchema,
  CapacityResourceListResponseSchema,
  CapacityResourceRefSchema,
  CapacityResourceSchema,
  CapacityScheduleGetResponseSchema,
  CapacityScheduleListResponseSchema,
  CapacityScheduleSchema,
  CapacityWindowListResponseSchema,
  CapacityWindowSchema,
  CrpCapacityLoadXlsxInputSchema,
  CrpConflictReportPdfInputSchema,
  CrpDeleteResponseSchema,
  CrpExplainCapacityLoadToolInputSchema,
  CrpExplainCapacityLoadToolOutputSchema,
  CrpGetScheduleToolInputSchema,
  CrpGetScheduleToolOutputSchema,
  CrpListConflictsToolInputSchema,
  CrpListConflictsToolOutputSchema,
  CrpListResourcesToolInputSchema,
  CrpListResourcesToolOutputSchema,
  CrpListScheduledOperationsToolInputSchema,
  CrpListScheduledOperationsToolOutputSchema,
  CrpListSchedulesToolInputSchema,
  CrpListSchedulesToolOutputSchema,
  CrpListWorkCentersToolInputSchema,
  CrpListWorkCentersToolOutputSchema,
  CrpResourceCalendarCsvInputSchema,
  CrpSchedulePdfInputSchema,
  CrpScheduleableOperationSchema,
  IsoDateTimeStringSchema,
  MrpHandoffBatchResponseSchema,
  MrpHandoffBatchSchema,
  NonEmptyStringSchema,
  QuantitySchema,
  ResourceCalendarListResponseSchema,
  ResourceCalendarSchema,
  ResourceGetResponseSchema,
  ResourceKindSchema,
  ResourceListResponseSchema,
  ResourceRefSchema,
  ResourceSchema,
  ResourceStatusSchema,
  ScheduleAssignmentSchema,
  ScheduleProposalInputSchema,
  ScheduleProposalOutputSchema,
  ScheduleStatusSchema,
  ScheduledOperationListResponseSchema,
  ScheduledOperationSchema,
  ScheduledOperationStatusSchema,
  WorkCenterGetResponseSchema,
  WorkCenterListResponseSchema,
  WorkCenterSchema,
  WorkCenterStatusSchema,
  classifyContractVersionSkew,
  parseAvailabilityWindow,
  parseAvailabilityWindowListResponse,
  parseCapacityBucket,
  parseCapacityConflict,
  parseCapacityConflictListResponse,
  parseCapacityLoad,
  parseCapacityLoadBucket,
  parseCapacityLoadResponse,
  parseCapacityResource,
  parseCapacityResourceGetResponse,
  parseCapacityResourceListResponse,
  parseCapacitySchedule,
  parseCapacityScheduleGetResponse,
  parseCapacityScheduleListResponse,
  parseCapacityWindow,
  parseCapacityWindowListResponse,
  parseCrpDeleteResponse,
  parseCrpScheduleableOperation,
  parseMrpHandoffBatch,
  parseMrpHandoffBatchResponse,
  parseResource,
  parseResourceCalendar,
  parseResourceCalendarListResponse,
  parseResourceGetResponse,
  parseResourceListResponse,
  parseScheduleAssignment,
  parseScheduleProposalInput,
  parseScheduleProposalOutput,
  parseScheduledOperation,
  parseScheduledOperationListResponse,
  parseSemVer,
  parseWorkCenter,
  parseWorkCenterGetResponse,
  parseWorkCenterListResponse
};
