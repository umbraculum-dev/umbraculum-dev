"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AvailabilityWindowListResponseSchema: () => AvailabilityWindowListResponseSchema,
  AvailabilityWindowSchema: () => AvailabilityWindowSchema,
  CONTRACT_VERSION: () => CONTRACT_VERSION,
  CapacityBucketSchema: () => CapacityBucketSchema,
  CapacityConflictListResponseSchema: () => CapacityConflictListResponseSchema,
  CapacityConflictSchema: () => CapacityConflictSchema,
  CapacityConflictSeveritySchema: () => CapacityConflictSeveritySchema,
  CapacityConflictStatusSchema: () => CapacityConflictStatusSchema,
  CapacityLoadBucketSchema: () => CapacityLoadBucketSchema,
  CapacityLoadQuerySchema: () => CapacityLoadQuerySchema,
  CapacityLoadResponseSchema: () => CapacityLoadResponseSchema,
  CapacityLoadSchema: () => CapacityLoadSchema,
  CapacityResourceGetResponseSchema: () => CapacityResourceGetResponseSchema,
  CapacityResourceListResponseSchema: () => CapacityResourceListResponseSchema,
  CapacityResourceRefSchema: () => CapacityResourceRefSchema,
  CapacityResourceSchema: () => CapacityResourceSchema,
  CapacityScheduleGetResponseSchema: () => CapacityScheduleGetResponseSchema,
  CapacityScheduleListResponseSchema: () => CapacityScheduleListResponseSchema,
  CapacityScheduleSchema: () => CapacityScheduleSchema,
  CapacityWindowListResponseSchema: () => CapacityWindowListResponseSchema,
  CapacityWindowSchema: () => CapacityWindowSchema,
  CrpCapacityPlanPdfInputSchema: () => CrpCapacityPlanPdfInputSchema,
  CrpDeleteResponseSchema: () => CrpDeleteResponseSchema,
  CrpExplainCapacityLoadToolInputSchema: () => CrpExplainCapacityLoadToolInputSchema,
  CrpExplainCapacityLoadToolOutputSchema: () => CrpExplainCapacityLoadToolOutputSchema,
  CrpGetScheduleToolInputSchema: () => CrpGetScheduleToolInputSchema,
  CrpGetScheduleToolOutputSchema: () => CrpGetScheduleToolOutputSchema,
  CrpListConflictsToolInputSchema: () => CrpListConflictsToolInputSchema,
  CrpListConflictsToolOutputSchema: () => CrpListConflictsToolOutputSchema,
  CrpListResourcesToolInputSchema: () => CrpListResourcesToolInputSchema,
  CrpListResourcesToolOutputSchema: () => CrpListResourcesToolOutputSchema,
  CrpListScheduledOperationsToolInputSchema: () => CrpListScheduledOperationsToolInputSchema,
  CrpListScheduledOperationsToolOutputSchema: () => CrpListScheduledOperationsToolOutputSchema,
  CrpListSchedulesToolInputSchema: () => CrpListSchedulesToolInputSchema,
  CrpListSchedulesToolOutputSchema: () => CrpListSchedulesToolOutputSchema,
  CrpListWorkCentersToolInputSchema: () => CrpListWorkCentersToolInputSchema,
  CrpListWorkCentersToolOutputSchema: () => CrpListWorkCentersToolOutputSchema,
  CrpResourceLoadCsvInputSchema: () => CrpResourceLoadCsvInputSchema,
  CrpScheduleExportCsvInputSchema: () => CrpScheduleExportCsvInputSchema,
  CrpScheduleableOperationSchema: () => CrpScheduleableOperationSchema,
  IsoDateTimeStringSchema: () => IsoDateTimeStringSchema,
  MrpHandoffBatchResponseSchema: () => MrpHandoffBatchResponseSchema,
  MrpHandoffBatchSchema: () => MrpHandoffBatchSchema,
  NonEmptyStringSchema: () => NonEmptyStringSchema,
  QuantitySchema: () => QuantitySchema,
  ResourceCalendarListResponseSchema: () => ResourceCalendarListResponseSchema,
  ResourceCalendarSchema: () => ResourceCalendarSchema,
  ResourceGetResponseSchema: () => ResourceGetResponseSchema,
  ResourceKindSchema: () => ResourceKindSchema,
  ResourceListResponseSchema: () => ResourceListResponseSchema,
  ResourceRefSchema: () => ResourceRefSchema,
  ResourceSchema: () => ResourceSchema,
  ResourceStatusSchema: () => ResourceStatusSchema,
  ScheduleAssignmentSchema: () => ScheduleAssignmentSchema,
  ScheduleProposalInputSchema: () => ScheduleProposalInputSchema,
  ScheduleProposalOutputSchema: () => ScheduleProposalOutputSchema,
  ScheduleStatusSchema: () => ScheduleStatusSchema,
  ScheduledOperationListResponseSchema: () => ScheduledOperationListResponseSchema,
  ScheduledOperationSchema: () => ScheduledOperationSchema,
  ScheduledOperationStatusSchema: () => ScheduledOperationStatusSchema,
  WorkCenterGetResponseSchema: () => WorkCenterGetResponseSchema,
  WorkCenterListResponseSchema: () => WorkCenterListResponseSchema,
  WorkCenterSchema: () => WorkCenterSchema,
  WorkCenterStatusSchema: () => WorkCenterStatusSchema,
  classifyContractVersionSkew: () => classifyContractVersionSkew,
  parseAvailabilityWindow: () => parseAvailabilityWindow,
  parseAvailabilityWindowListResponse: () => parseAvailabilityWindowListResponse,
  parseCapacityBucket: () => parseCapacityBucket,
  parseCapacityConflict: () => parseCapacityConflict,
  parseCapacityConflictListResponse: () => parseCapacityConflictListResponse,
  parseCapacityLoad: () => parseCapacityLoad,
  parseCapacityLoadBucket: () => parseCapacityLoadBucket,
  parseCapacityLoadResponse: () => parseCapacityLoadResponse,
  parseCapacityResource: () => parseCapacityResource,
  parseCapacityResourceGetResponse: () => parseCapacityResourceGetResponse,
  parseCapacityResourceListResponse: () => parseCapacityResourceListResponse,
  parseCapacitySchedule: () => parseCapacitySchedule,
  parseCapacityScheduleGetResponse: () => parseCapacityScheduleGetResponse,
  parseCapacityScheduleListResponse: () => parseCapacityScheduleListResponse,
  parseCapacityWindow: () => parseCapacityWindow,
  parseCapacityWindowListResponse: () => parseCapacityWindowListResponse,
  parseCrpDeleteResponse: () => parseCrpDeleteResponse,
  parseCrpScheduleableOperation: () => parseCrpScheduleableOperation,
  parseMrpHandoffBatch: () => parseMrpHandoffBatch,
  parseMrpHandoffBatchResponse: () => parseMrpHandoffBatchResponse,
  parseResource: () => parseResource,
  parseResourceCalendar: () => parseResourceCalendar,
  parseResourceCalendarListResponse: () => parseResourceCalendarListResponse,
  parseResourceGetResponse: () => parseResourceGetResponse,
  parseResourceListResponse: () => parseResourceListResponse,
  parseScheduleAssignment: () => parseScheduleAssignment,
  parseScheduleProposalInput: () => parseScheduleProposalInput,
  parseScheduleProposalOutput: () => parseScheduleProposalOutput,
  parseScheduledOperation: () => parseScheduledOperation,
  parseScheduledOperationListResponse: () => parseScheduledOperationListResponse,
  parseSemVer: () => parseSemVer,
  parseWorkCenter: () => parseWorkCenter,
  parseWorkCenterGetResponse: () => parseWorkCenterGetResponse,
  parseWorkCenterListResponse: () => parseWorkCenterListResponse
});
module.exports = __toCommonJS(index_exports);

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
var import_zod = require("zod");
var IsoDateTimeStringSchema = import_zod.z.string().min(1, "timestamp required").refine((s) => !Number.isNaN(Date.parse(s)), "must be ISO 8601");
var NonEmptyStringSchema = import_zod.z.string().min(1);
var QuantitySchema = import_zod.z.number().finite().positive();
var CrpDeleteResponseSchema = import_zod.z.object({
  ok: import_zod.z.literal(true)
});
function parseCrpDeleteResponse(payload) {
  return CrpDeleteResponseSchema.parse(payload);
}

// src/resource.ts
var import_zod2 = require("zod");
var ResourceKindSchema = import_zod2.z.enum([
  "work_center",
  "equipment",
  "labor",
  "external",
  "buffer"
]);
var ResourceStatusSchema = import_zod2.z.enum(["active", "inactive"]);
var ResourceSchema = import_zod2.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  kind: ResourceKindSchema,
  status: ResourceStatusSchema,
  sourceModule: import_zod2.z.string().min(1).nullable(),
  sourceRefId: import_zod2.z.string().min(1).nullable(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var ResourceRefSchema = import_zod2.z.object({
  resourceId: NonEmptyStringSchema
});
var ResourceListResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
  items: import_zod2.z.array(ResourceSchema)
});
var ResourceGetResponseSchema = import_zod2.z.object({
  ok: import_zod2.z.literal(true),
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
var import_zod3 = require("zod");
var AvailabilityWindowSchema = import_zod3.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  resourceId: NonEmptyStringSchema,
  startsAt: IsoDateTimeStringSchema,
  endsAt: IsoDateTimeStringSchema,
  capacityMinutes: import_zod3.z.number().int().nonnegative(),
  sourceModule: import_zod3.z.string().min(1).nullable(),
  sourceRefId: import_zod3.z.string().min(1).nullable()
}).superRefine((value, ctx) => {
  if (Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "endsAt must be after startsAt"
    });
  }
});
var ResourceCalendarSchema = import_zod3.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  resourceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  timezone: NonEmptyStringSchema,
  windows: import_zod3.z.array(AvailabilityWindowSchema)
});
var ResourceCalendarListResponseSchema = import_zod3.z.object({
  ok: import_zod3.z.literal(true),
  items: import_zod3.z.array(ResourceCalendarSchema)
});
var AvailabilityWindowListResponseSchema = import_zod3.z.object({
  ok: import_zod3.z.literal(true),
  items: import_zod3.z.array(AvailabilityWindowSchema)
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
var import_zod4 = require("zod");
var WorkCenterStatusSchema = import_zod4.z.enum(["active", "inactive"]);
var WorkCenterSchema = import_zod4.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  resourceId: import_zod4.z.string().min(1).nullable(),
  status: WorkCenterStatusSchema,
  sourceModule: import_zod4.z.string().min(1).nullable(),
  sourceRefId: import_zod4.z.string().min(1).nullable(),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema
});
var WorkCenterListResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
  items: import_zod4.z.array(WorkCenterSchema)
});
var WorkCenterGetResponseSchema = import_zod4.z.object({
  ok: import_zod4.z.literal(true),
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
var import_zod5 = require("zod");
var ScheduledOperationStatusSchema = import_zod5.z.enum(["planned", "scheduled", "completed", "cancelled"]);
var ScheduledOperationSchema = import_zod5.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  resourceId: import_zod5.z.string().min(1).nullable(),
  workCenterId: import_zod5.z.string().min(1).nullable(),
  productionOrderId: import_zod5.z.string().min(1).nullable(),
  operationId: import_zod5.z.string().min(1).nullable(),
  operationCode: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  status: ScheduledOperationStatusSchema,
  sourceModule: import_zod5.z.string().min(1).nullable(),
  sourceRefId: import_zod5.z.string().min(1).nullable(),
  startsAt: IsoDateTimeStringSchema,
  endsAt: IsoDateTimeStringSchema,
  plannedDurationMinutes: import_zod5.z.number().int().positive()
}).superRefine((value, ctx) => {
  if (Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "endsAt must be after startsAt"
    });
  }
});
var ScheduledOperationListResponseSchema = import_zod5.z.object({
  ok: import_zod5.z.literal(true),
  items: import_zod5.z.array(ScheduledOperationSchema)
});
function parseScheduledOperation(payload) {
  return ScheduledOperationSchema.parse(payload);
}
function parseScheduledOperationListResponse(payload) {
  return ScheduledOperationListResponseSchema.parse(payload);
}

// src/schedule.ts
var import_zod6 = require("zod");
var ScheduleStatusSchema = import_zod6.z.enum(["proposed", "accepted", "superseded"]);
var ScheduleAssignmentSchema = import_zod6.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  scheduleId: NonEmptyStringSchema,
  resourceId: NonEmptyStringSchema,
  productionOrderId: import_zod6.z.string().min(1).nullable(),
  operationId: import_zod6.z.string().min(1).nullable(),
  sourceModule: import_zod6.z.string().min(1).nullable(),
  sourceRefId: import_zod6.z.string().min(1).nullable(),
  startsAt: IsoDateTimeStringSchema,
  endsAt: IsoDateTimeStringSchema,
  plannedDurationMinutes: import_zod6.z.number().int().positive()
}).superRefine((value, ctx) => {
  if (Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "endsAt must be after startsAt"
    });
  }
});
var CapacityScheduleSchema = import_zod6.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  code: NonEmptyStringSchema,
  name: NonEmptyStringSchema,
  status: ScheduleStatusSchema,
  horizonStartAt: IsoDateTimeStringSchema,
  horizonEndAt: IsoDateTimeStringSchema,
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
  assignments: import_zod6.z.array(ScheduleAssignmentSchema)
});
var CapacityScheduleListResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
  items: import_zod6.z.array(CapacityScheduleSchema)
});
var CapacityScheduleGetResponseSchema = import_zod6.z.object({
  ok: import_zod6.z.literal(true),
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
var import_zod7 = require("zod");
var CapacityBucketSchema = import_zod7.z.object({
  resourceId: NonEmptyStringSchema,
  resourceCode: NonEmptyStringSchema,
  bucketStartAt: IsoDateTimeStringSchema,
  bucketEndAt: IsoDateTimeStringSchema,
  availableMinutes: import_zod7.z.number().int().nonnegative(),
  plannedMinutes: import_zod7.z.number().int().nonnegative(),
  overloadMinutes: import_zod7.z.number().int().nonnegative()
}).superRefine((value, ctx) => {
  if (Date.parse(value.bucketEndAt) <= Date.parse(value.bucketStartAt)) {
    ctx.addIssue({
      code: "custom",
      path: ["bucketEndAt"],
      message: "bucketEndAt must be after bucketStartAt"
    });
  }
});
var CapacityLoadQuerySchema = import_zod7.z.object({
  resourceId: import_zod7.z.string().min(1).optional()
}).strict();
var CapacityLoadSchema = import_zod7.z.object({
  workspaceId: NonEmptyStringSchema,
  buckets: import_zod7.z.array(CapacityBucketSchema)
});
var CapacityLoadResponseSchema = import_zod7.z.object({
  ok: import_zod7.z.literal(true),
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
var import_zod8 = require("zod");
var CapacityConflictSeveritySchema = import_zod8.z.enum(["info", "warning", "critical"]);
var CapacityConflictStatusSchema = import_zod8.z.enum(["open", "acknowledged", "resolved"]);
var CapacityConflictSchema = import_zod8.z.object({
  id: NonEmptyStringSchema,
  workspaceId: NonEmptyStringSchema,
  severity: CapacityConflictSeveritySchema,
  status: CapacityConflictStatusSchema,
  message: NonEmptyStringSchema,
  resourceId: import_zod8.z.string().min(1).nullable(),
  scheduledOperationId: import_zod8.z.string().min(1).nullable(),
  startsAt: IsoDateTimeStringSchema.nullable(),
  endsAt: IsoDateTimeStringSchema.nullable(),
  createdAt: IsoDateTimeStringSchema
});
var CapacityConflictListResponseSchema = import_zod8.z.object({
  ok: import_zod8.z.literal(true),
  items: import_zod8.z.array(CapacityConflictSchema)
});
function parseCapacityConflict(payload) {
  return CapacityConflictSchema.parse(payload);
}
function parseCapacityConflictListResponse(payload) {
  return CapacityConflictListResponseSchema.parse(payload);
}

// src/proposal.ts
var import_zod10 = require("zod");

// src/mrpHandoff.ts
var import_zod9 = require("zod");
var CrpScheduleableOperationSchema = import_zod9.z.object({
  productionOrderId: NonEmptyStringSchema,
  operationId: NonEmptyStringSchema,
  operationCode: NonEmptyStringSchema,
  requiredResourceKind: import_zod9.z.string().min(1).nullable(),
  plannedDurationMinutes: import_zod9.z.number().int().positive().nullable(),
  earliestStartAt: IsoDateTimeStringSchema.nullable(),
  dueAt: IsoDateTimeStringSchema.nullable(),
  quantity: QuantitySchema,
  unit: NonEmptyStringSchema,
  sourceModule: import_zod9.z.string().min(1).nullable(),
  sourceRefId: import_zod9.z.string().min(1).nullable(),
  preferredResourceId: import_zod9.z.string().min(1).nullable(),
  schedulingNotes: import_zod9.z.array(import_zod9.z.string().min(1))
});
var MrpHandoffBatchSchema = import_zod9.z.object({
  workspaceId: NonEmptyStringSchema,
  sourceModule: import_zod9.z.literal("mrp"),
  operations: import_zod9.z.array(CrpScheduleableOperationSchema)
});
var MrpHandoffBatchResponseSchema = import_zod9.z.object({
  ok: import_zod9.z.literal(true),
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
var ScheduleProposalInputSchema = import_zod10.z.object({
  workspaceId: NonEmptyStringSchema,
  operations: import_zod10.z.array(CrpScheduleableOperationSchema),
  horizonStartAt: import_zod10.z.string().min(1),
  horizonEndAt: import_zod10.z.string().min(1)
}).strict().superRefine((value, ctx) => {
  if (value.operations.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["operations"],
      message: "at least one operation is required"
    });
  }
});
var ScheduleProposalOutputSchema = import_zod10.z.object({
  workspaceId: NonEmptyStringSchema,
  proposedOperations: import_zod10.z.array(ScheduledOperationSchema)
});
function parseScheduleProposalInput(payload) {
  return ScheduleProposalInputSchema.parse(payload);
}
function parseScheduleProposalOutput(payload) {
  return ScheduleProposalOutputSchema.parse(payload);
}

// src/aiTools.ts
var import_zod11 = require("zod");
var CrpListResourcesToolInputSchema = import_zod11.z.object({
  kind: import_zod11.z.enum(["work_center", "equipment", "labor", "external", "buffer"]).optional()
}).strict();
var CrpGetScheduleToolInputSchema = import_zod11.z.object({
  scheduleId: NonEmptyStringSchema
}).strict();
var CrpListSchedulesToolInputSchema = import_zod11.z.object({
  status: import_zod11.z.enum(["proposed", "accepted", "superseded"]).optional()
}).strict();
var CrpListWorkCentersToolInputSchema = import_zod11.z.object({}).strict();
var CrpListScheduledOperationsToolInputSchema = import_zod11.z.object({}).strict();
var CrpExplainCapacityLoadToolInputSchema = import_zod11.z.object({
  resourceId: NonEmptyStringSchema.optional()
}).strict();
var CrpListConflictsToolInputSchema = import_zod11.z.object({}).strict();
var CrpListResourcesToolOutputSchema = CapacityResourceListResponseSchema;
var CrpListSchedulesToolOutputSchema = CapacityScheduleListResponseSchema;
var CrpGetScheduleToolOutputSchema = CapacityScheduleGetResponseSchema;
var CrpListWorkCentersToolOutputSchema = WorkCenterListResponseSchema;
var CrpListScheduledOperationsToolOutputSchema = ScheduledOperationListResponseSchema;
var CrpExplainCapacityLoadToolOutputSchema = CapacityLoadResponseSchema;
var CrpListConflictsToolOutputSchema = CapacityConflictListResponseSchema;

// src/documentTemplates.ts
var import_zod12 = require("zod");
var CrpCapacityPlanPdfInputSchema = import_zod12.z.object({
  workspaceId: NonEmptyStringSchema,
  schedule: CapacityScheduleSchema,
  resources: import_zod12.z.array(CapacityResourceSchema),
  loadBuckets: import_zod12.z.array(CapacityLoadBucketSchema)
});
var CrpResourceLoadCsvInputSchema = import_zod12.z.object({
  workspaceId: NonEmptyStringSchema,
  loadBuckets: import_zod12.z.array(CapacityLoadBucketSchema)
});
var CrpScheduleExportCsvInputSchema = import_zod12.z.object({
  workspaceId: NonEmptyStringSchema,
  schedule: CapacityScheduleSchema
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AvailabilityWindowListResponseSchema,
  AvailabilityWindowSchema,
  CONTRACT_VERSION,
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
  CrpCapacityPlanPdfInputSchema,
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
  CrpResourceLoadCsvInputSchema,
  CrpScheduleExportCsvInputSchema,
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
});
