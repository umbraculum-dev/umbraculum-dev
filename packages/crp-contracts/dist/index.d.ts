import { z } from 'zod';

/**
 * Wire-level contract version of `@umbraculum/crp-contracts`.
 *
 * Wave 1 baseline: contracts + read-only API skeletons.
 */
declare const CONTRACT_VERSION: "0.1.0-alpha.1";
interface SemVer {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly prerelease?: string;
}
declare function parseSemVer(input: string): SemVer | null;
type VersionMismatchSeverity = "match" | "patch" | "minor" | "major" | "unparseable";
declare function classifyContractVersionSkew(runtime: string, expected?: string): VersionMismatchSeverity;

/** ISO 8601 timestamp string validated at parse time. */
declare const IsoDateTimeStringSchema: z.ZodString;
declare const NonEmptyStringSchema: z.ZodString;
declare const QuantitySchema: z.ZodNumber;
declare const CrpDeleteResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
type CrpDeleteResponse = z.infer<typeof CrpDeleteResponseSchema>;
declare function parseCrpDeleteResponse(payload: unknown): CrpDeleteResponse;

declare const ResourceKindSchema: z.ZodEnum<{
    work_center: "work_center";
    equipment: "equipment";
    labor: "labor";
    external: "external";
    buffer: "buffer";
}>;
declare const ResourceStatusSchema: z.ZodEnum<{
    active: "active";
    inactive: "inactive";
}>;
declare const ResourceSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    kind: z.ZodEnum<{
        work_center: "work_center";
        equipment: "equipment";
        labor: "labor";
        external: "external";
        buffer: "buffer";
    }>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
    sourceModule: z.ZodNullable<z.ZodString>;
    sourceRefId: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
declare const ResourceRefSchema: z.ZodObject<{
    resourceId: z.ZodString;
}, z.core.$strip>;
declare const ResourceListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        kind: z.ZodEnum<{
            work_center: "work_center";
            equipment: "equipment";
            labor: "labor";
            external: "external";
            buffer: "buffer";
        }>;
        status: z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const ResourceGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        kind: z.ZodEnum<{
            work_center: "work_center";
            equipment: "equipment";
            labor: "labor";
            external: "external";
            buffer: "buffer";
        }>;
        status: z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
type ResourceKind = z.infer<typeof ResourceKindSchema>;
type ResourceStatus = z.infer<typeof ResourceStatusSchema>;
type Resource = z.infer<typeof ResourceSchema>;
type ResourceRef = z.infer<typeof ResourceRefSchema>;
type ResourceListResponse = z.infer<typeof ResourceListResponseSchema>;
type ResourceGetResponse = z.infer<typeof ResourceGetResponseSchema>;
declare const CapacityResourceSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    kind: z.ZodEnum<{
        work_center: "work_center";
        equipment: "equipment";
        labor: "labor";
        external: "external";
        buffer: "buffer";
    }>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
    sourceModule: z.ZodNullable<z.ZodString>;
    sourceRefId: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
declare const CapacityResourceRefSchema: z.ZodObject<{
    resourceId: z.ZodString;
}, z.core.$strip>;
declare const CapacityResourceListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        kind: z.ZodEnum<{
            work_center: "work_center";
            equipment: "equipment";
            labor: "labor";
            external: "external";
            buffer: "buffer";
        }>;
        status: z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const CapacityResourceGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        kind: z.ZodEnum<{
            work_center: "work_center";
            equipment: "equipment";
            labor: "labor";
            external: "external";
            buffer: "buffer";
        }>;
        status: z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
type CapacityResource = Resource;
type CapacityResourceRef = ResourceRef;
type CapacityResourceListResponse = ResourceListResponse;
type CapacityResourceGetResponse = ResourceGetResponse;
declare function parseResource(payload: unknown): Resource;
declare function parseResourceListResponse(payload: unknown): ResourceListResponse;
declare function parseResourceGetResponse(payload: unknown): ResourceGetResponse;
declare const parseCapacityResource: typeof parseResource;
declare const parseCapacityResourceListResponse: typeof parseResourceListResponse;
declare const parseCapacityResourceGetResponse: typeof parseResourceGetResponse;

declare const AvailabilityWindowSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    resourceId: z.ZodString;
    startsAt: z.ZodString;
    endsAt: z.ZodString;
    capacityMinutes: z.ZodNumber;
    sourceModule: z.ZodNullable<z.ZodString>;
    sourceRefId: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const ResourceCalendarSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    resourceId: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    timezone: z.ZodString;
    windows: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        resourceId: z.ZodString;
        startsAt: z.ZodString;
        endsAt: z.ZodString;
        capacityMinutes: z.ZodNumber;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const ResourceCalendarListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        resourceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        timezone: z.ZodString;
        windows: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            resourceId: z.ZodString;
            startsAt: z.ZodString;
            endsAt: z.ZodString;
            capacityMinutes: z.ZodNumber;
            sourceModule: z.ZodNullable<z.ZodString>;
            sourceRefId: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const AvailabilityWindowListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        resourceId: z.ZodString;
        startsAt: z.ZodString;
        endsAt: z.ZodString;
        capacityMinutes: z.ZodNumber;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const CapacityWindowSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    resourceId: z.ZodString;
    startsAt: z.ZodString;
    endsAt: z.ZodString;
    capacityMinutes: z.ZodNumber;
    sourceModule: z.ZodNullable<z.ZodString>;
    sourceRefId: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const CapacityWindowListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        resourceId: z.ZodString;
        startsAt: z.ZodString;
        endsAt: z.ZodString;
        capacityMinutes: z.ZodNumber;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type AvailabilityWindow = z.infer<typeof AvailabilityWindowSchema>;
type ResourceCalendar = z.infer<typeof ResourceCalendarSchema>;
type ResourceCalendarListResponse = z.infer<typeof ResourceCalendarListResponseSchema>;
type AvailabilityWindowListResponse = z.infer<typeof AvailabilityWindowListResponseSchema>;
type CapacityWindow = AvailabilityWindow;
type CapacityWindowListResponse = AvailabilityWindowListResponse;
declare function parseAvailabilityWindow(payload: unknown): AvailabilityWindow;
declare function parseResourceCalendar(payload: unknown): ResourceCalendar;
declare function parseResourceCalendarListResponse(payload: unknown): ResourceCalendarListResponse;
declare function parseAvailabilityWindowListResponse(payload: unknown): AvailabilityWindowListResponse;
declare const parseCapacityWindow: typeof parseAvailabilityWindow;
declare const parseCapacityWindowListResponse: typeof parseAvailabilityWindowListResponse;

declare const WorkCenterStatusSchema: z.ZodEnum<{
    active: "active";
    inactive: "inactive";
}>;
declare const WorkCenterSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    resourceId: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>;
    sourceModule: z.ZodNullable<z.ZodString>;
    sourceRefId: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
declare const WorkCenterListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        resourceId: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const WorkCenterGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        resourceId: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
type WorkCenterStatus = z.infer<typeof WorkCenterStatusSchema>;
type WorkCenter = z.infer<typeof WorkCenterSchema>;
type WorkCenterListResponse = z.infer<typeof WorkCenterListResponseSchema>;
type WorkCenterGetResponse = z.infer<typeof WorkCenterGetResponseSchema>;
declare function parseWorkCenter(payload: unknown): WorkCenter;
declare function parseWorkCenterListResponse(payload: unknown): WorkCenterListResponse;
declare function parseWorkCenterGetResponse(payload: unknown): WorkCenterGetResponse;

declare const ScheduledOperationStatusSchema: z.ZodEnum<{
    planned: "planned";
    scheduled: "scheduled";
    completed: "completed";
    cancelled: "cancelled";
}>;
declare const ScheduledOperationSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    resourceId: z.ZodNullable<z.ZodString>;
    workCenterId: z.ZodNullable<z.ZodString>;
    productionOrderId: z.ZodNullable<z.ZodString>;
    operationId: z.ZodNullable<z.ZodString>;
    operationCode: z.ZodString;
    name: z.ZodString;
    status: z.ZodEnum<{
        planned: "planned";
        scheduled: "scheduled";
        completed: "completed";
        cancelled: "cancelled";
    }>;
    sourceModule: z.ZodNullable<z.ZodString>;
    sourceRefId: z.ZodNullable<z.ZodString>;
    startsAt: z.ZodString;
    endsAt: z.ZodString;
    plannedDurationMinutes: z.ZodNumber;
}, z.core.$strip>;
declare const ScheduledOperationListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        resourceId: z.ZodNullable<z.ZodString>;
        workCenterId: z.ZodNullable<z.ZodString>;
        productionOrderId: z.ZodNullable<z.ZodString>;
        operationId: z.ZodNullable<z.ZodString>;
        operationCode: z.ZodString;
        name: z.ZodString;
        status: z.ZodEnum<{
            planned: "planned";
            scheduled: "scheduled";
            completed: "completed";
            cancelled: "cancelled";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        startsAt: z.ZodString;
        endsAt: z.ZodString;
        plannedDurationMinutes: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
type ScheduledOperationStatus = z.infer<typeof ScheduledOperationStatusSchema>;
type ScheduledOperation = z.infer<typeof ScheduledOperationSchema>;
type ScheduledOperationListResponse = z.infer<typeof ScheduledOperationListResponseSchema>;
declare function parseScheduledOperation(payload: unknown): ScheduledOperation;
declare function parseScheduledOperationListResponse(payload: unknown): ScheduledOperationListResponse;

declare const ScheduleStatusSchema: z.ZodEnum<{
    proposed: "proposed";
    accepted: "accepted";
    superseded: "superseded";
}>;
declare const ScheduleAssignmentSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    scheduleId: z.ZodString;
    resourceId: z.ZodString;
    productionOrderId: z.ZodNullable<z.ZodString>;
    operationId: z.ZodNullable<z.ZodString>;
    sourceModule: z.ZodNullable<z.ZodString>;
    sourceRefId: z.ZodNullable<z.ZodString>;
    startsAt: z.ZodString;
    endsAt: z.ZodString;
    plannedDurationMinutes: z.ZodNumber;
}, z.core.$strip>;
declare const CapacityScheduleSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    status: z.ZodEnum<{
        proposed: "proposed";
        accepted: "accepted";
        superseded: "superseded";
    }>;
    horizonStartAt: z.ZodString;
    horizonEndAt: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    assignments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        scheduleId: z.ZodString;
        resourceId: z.ZodString;
        productionOrderId: z.ZodNullable<z.ZodString>;
        operationId: z.ZodNullable<z.ZodString>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        startsAt: z.ZodString;
        endsAt: z.ZodString;
        plannedDurationMinutes: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const CapacityScheduleListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        status: z.ZodEnum<{
            proposed: "proposed";
            accepted: "accepted";
            superseded: "superseded";
        }>;
        horizonStartAt: z.ZodString;
        horizonEndAt: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        assignments: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            scheduleId: z.ZodString;
            resourceId: z.ZodString;
            productionOrderId: z.ZodNullable<z.ZodString>;
            operationId: z.ZodNullable<z.ZodString>;
            sourceModule: z.ZodNullable<z.ZodString>;
            sourceRefId: z.ZodNullable<z.ZodString>;
            startsAt: z.ZodString;
            endsAt: z.ZodString;
            plannedDurationMinutes: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const CapacityScheduleGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        status: z.ZodEnum<{
            proposed: "proposed";
            accepted: "accepted";
            superseded: "superseded";
        }>;
        horizonStartAt: z.ZodString;
        horizonEndAt: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        assignments: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            scheduleId: z.ZodString;
            resourceId: z.ZodString;
            productionOrderId: z.ZodNullable<z.ZodString>;
            operationId: z.ZodNullable<z.ZodString>;
            sourceModule: z.ZodNullable<z.ZodString>;
            sourceRefId: z.ZodNullable<z.ZodString>;
            startsAt: z.ZodString;
            endsAt: z.ZodString;
            plannedDurationMinutes: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
type ScheduleStatus = z.infer<typeof ScheduleStatusSchema>;
type ScheduleAssignment = z.infer<typeof ScheduleAssignmentSchema>;
type CapacitySchedule = z.infer<typeof CapacityScheduleSchema>;
type CapacityScheduleListResponse = z.infer<typeof CapacityScheduleListResponseSchema>;
type CapacityScheduleGetResponse = z.infer<typeof CapacityScheduleGetResponseSchema>;
declare function parseScheduleAssignment(payload: unknown): ScheduleAssignment;
declare function parseCapacitySchedule(payload: unknown): CapacitySchedule;
declare function parseCapacityScheduleListResponse(payload: unknown): CapacityScheduleListResponse;
declare function parseCapacityScheduleGetResponse(payload: unknown): CapacityScheduleGetResponse;

declare const CapacityBucketSchema: z.ZodObject<{
    resourceId: z.ZodString;
    resourceCode: z.ZodString;
    bucketStartAt: z.ZodString;
    bucketEndAt: z.ZodString;
    availableMinutes: z.ZodNumber;
    plannedMinutes: z.ZodNumber;
    overloadMinutes: z.ZodNumber;
}, z.core.$strip>;
declare const CapacityLoadQuerySchema: z.ZodObject<{
    resourceId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
declare const CapacityLoadSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    buckets: z.ZodArray<z.ZodObject<{
        resourceId: z.ZodString;
        resourceCode: z.ZodString;
        bucketStartAt: z.ZodString;
        bucketEndAt: z.ZodString;
        availableMinutes: z.ZodNumber;
        plannedMinutes: z.ZodNumber;
        overloadMinutes: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const CapacityLoadResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        workspaceId: z.ZodString;
        buckets: z.ZodArray<z.ZodObject<{
            resourceId: z.ZodString;
            resourceCode: z.ZodString;
            bucketStartAt: z.ZodString;
            bucketEndAt: z.ZodString;
            availableMinutes: z.ZodNumber;
            plannedMinutes: z.ZodNumber;
            overloadMinutes: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const CapacityLoadBucketSchema: z.ZodObject<{
    resourceId: z.ZodString;
    resourceCode: z.ZodString;
    bucketStartAt: z.ZodString;
    bucketEndAt: z.ZodString;
    availableMinutes: z.ZodNumber;
    plannedMinutes: z.ZodNumber;
    overloadMinutes: z.ZodNumber;
}, z.core.$strip>;
type CapacityBucket = z.infer<typeof CapacityBucketSchema>;
type CapacityLoad = z.infer<typeof CapacityLoadSchema>;
type CapacityLoadQuery = z.infer<typeof CapacityLoadQuerySchema>;
type CapacityLoadResponse = z.infer<typeof CapacityLoadResponseSchema>;
type CapacityLoadBucket = CapacityBucket;
declare function parseCapacityBucket(payload: unknown): CapacityBucket;
declare function parseCapacityLoad(payload: unknown): CapacityLoad;
declare function parseCapacityLoadResponse(payload: unknown): CapacityLoadResponse;
declare const parseCapacityLoadBucket: typeof parseCapacityBucket;

declare const CapacityConflictSeveritySchema: z.ZodEnum<{
    info: "info";
    warning: "warning";
    critical: "critical";
}>;
declare const CapacityConflictStatusSchema: z.ZodEnum<{
    open: "open";
    acknowledged: "acknowledged";
    resolved: "resolved";
}>;
declare const CapacityConflictSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    severity: z.ZodEnum<{
        info: "info";
        warning: "warning";
        critical: "critical";
    }>;
    status: z.ZodEnum<{
        open: "open";
        acknowledged: "acknowledged";
        resolved: "resolved";
    }>;
    message: z.ZodString;
    resourceId: z.ZodNullable<z.ZodString>;
    scheduledOperationId: z.ZodNullable<z.ZodString>;
    startsAt: z.ZodNullable<z.ZodString>;
    endsAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
}, z.core.$strip>;
declare const CapacityConflictListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        severity: z.ZodEnum<{
            info: "info";
            warning: "warning";
            critical: "critical";
        }>;
        status: z.ZodEnum<{
            open: "open";
            acknowledged: "acknowledged";
            resolved: "resolved";
        }>;
        message: z.ZodString;
        resourceId: z.ZodNullable<z.ZodString>;
        scheduledOperationId: z.ZodNullable<z.ZodString>;
        startsAt: z.ZodNullable<z.ZodString>;
        endsAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
type CapacityConflictSeverity = z.infer<typeof CapacityConflictSeveritySchema>;
type CapacityConflictStatus = z.infer<typeof CapacityConflictStatusSchema>;
type CapacityConflict = z.infer<typeof CapacityConflictSchema>;
type CapacityConflictListResponse = z.infer<typeof CapacityConflictListResponseSchema>;
declare function parseCapacityConflict(payload: unknown): CapacityConflict;
declare function parseCapacityConflictListResponse(payload: unknown): CapacityConflictListResponse;

declare const ScheduleProposalInputSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    operations: z.ZodArray<z.ZodObject<{
        productionOrderId: z.ZodString;
        operationId: z.ZodString;
        operationCode: z.ZodString;
        requiredResourceKind: z.ZodNullable<z.ZodString>;
        plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
        earliestStartAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        preferredResourceId: z.ZodNullable<z.ZodString>;
        schedulingNotes: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
    horizonStartAt: z.ZodString;
    horizonEndAt: z.ZodString;
}, z.core.$strict>;
declare const ScheduleProposalOutputSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    proposedOperations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        resourceId: z.ZodNullable<z.ZodString>;
        workCenterId: z.ZodNullable<z.ZodString>;
        productionOrderId: z.ZodNullable<z.ZodString>;
        operationId: z.ZodNullable<z.ZodString>;
        operationCode: z.ZodString;
        name: z.ZodString;
        status: z.ZodEnum<{
            planned: "planned";
            scheduled: "scheduled";
            completed: "completed";
            cancelled: "cancelled";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        startsAt: z.ZodString;
        endsAt: z.ZodString;
        plannedDurationMinutes: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
type ScheduleProposalInput = z.infer<typeof ScheduleProposalInputSchema>;
type ScheduleProposalOutput = z.infer<typeof ScheduleProposalOutputSchema>;
declare function parseScheduleProposalInput(payload: unknown): ScheduleProposalInput;
declare function parseScheduleProposalOutput(payload: unknown): ScheduleProposalOutput;

declare const CrpScheduleableOperationSchema: z.ZodObject<{
    productionOrderId: z.ZodString;
    operationId: z.ZodString;
    operationCode: z.ZodString;
    requiredResourceKind: z.ZodNullable<z.ZodString>;
    plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
    earliestStartAt: z.ZodNullable<z.ZodString>;
    dueAt: z.ZodNullable<z.ZodString>;
    quantity: z.ZodNumber;
    unit: z.ZodString;
    sourceModule: z.ZodNullable<z.ZodString>;
    sourceRefId: z.ZodNullable<z.ZodString>;
    preferredResourceId: z.ZodNullable<z.ZodString>;
    schedulingNotes: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
declare const MrpHandoffBatchSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    sourceModule: z.ZodLiteral<"mrp">;
    operations: z.ZodArray<z.ZodObject<{
        productionOrderId: z.ZodString;
        operationId: z.ZodString;
        operationCode: z.ZodString;
        requiredResourceKind: z.ZodNullable<z.ZodString>;
        plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
        earliestStartAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        preferredResourceId: z.ZodNullable<z.ZodString>;
        schedulingNotes: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const MrpHandoffBatchResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        workspaceId: z.ZodString;
        sourceModule: z.ZodLiteral<"mrp">;
        operations: z.ZodArray<z.ZodObject<{
            productionOrderId: z.ZodString;
            operationId: z.ZodString;
            operationCode: z.ZodString;
            requiredResourceKind: z.ZodNullable<z.ZodString>;
            plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
            earliestStartAt: z.ZodNullable<z.ZodString>;
            dueAt: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
            sourceModule: z.ZodNullable<z.ZodString>;
            sourceRefId: z.ZodNullable<z.ZodString>;
            preferredResourceId: z.ZodNullable<z.ZodString>;
            schedulingNotes: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
type CrpScheduleableOperation = z.infer<typeof CrpScheduleableOperationSchema>;
type MrpHandoffBatch = z.infer<typeof MrpHandoffBatchSchema>;
type MrpHandoffBatchResponse = z.infer<typeof MrpHandoffBatchResponseSchema>;
declare function parseCrpScheduleableOperation(payload: unknown): CrpScheduleableOperation;
declare function parseMrpHandoffBatch(payload: unknown): MrpHandoffBatch;
declare function parseMrpHandoffBatchResponse(payload: unknown): MrpHandoffBatchResponse;

declare const CrpListResourcesToolInputSchema: z.ZodObject<{
    kind: z.ZodOptional<z.ZodEnum<{
        work_center: "work_center";
        equipment: "equipment";
        labor: "labor";
        external: "external";
        buffer: "buffer";
    }>>;
}, z.core.$strict>;
declare const CrpGetScheduleToolInputSchema: z.ZodObject<{
    scheduleId: z.ZodString;
}, z.core.$strict>;
declare const CrpListSchedulesToolInputSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        proposed: "proposed";
        accepted: "accepted";
        superseded: "superseded";
    }>>;
}, z.core.$strict>;
declare const CrpListWorkCentersToolInputSchema: z.ZodObject<{}, z.core.$strict>;
declare const CrpListScheduledOperationsToolInputSchema: z.ZodObject<{}, z.core.$strict>;
declare const CrpExplainCapacityLoadToolInputSchema: z.ZodObject<{
    resourceId: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
declare const CrpListConflictsToolInputSchema: z.ZodObject<{}, z.core.$strict>;
declare const CrpListResourcesToolOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        kind: z.ZodEnum<{
            work_center: "work_center";
            equipment: "equipment";
            labor: "labor";
            external: "external";
            buffer: "buffer";
        }>;
        status: z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const CrpListSchedulesToolOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        status: z.ZodEnum<{
            proposed: "proposed";
            accepted: "accepted";
            superseded: "superseded";
        }>;
        horizonStartAt: z.ZodString;
        horizonEndAt: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        assignments: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            scheduleId: z.ZodString;
            resourceId: z.ZodString;
            productionOrderId: z.ZodNullable<z.ZodString>;
            operationId: z.ZodNullable<z.ZodString>;
            sourceModule: z.ZodNullable<z.ZodString>;
            sourceRefId: z.ZodNullable<z.ZodString>;
            startsAt: z.ZodString;
            endsAt: z.ZodString;
            plannedDurationMinutes: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const CrpGetScheduleToolOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        status: z.ZodEnum<{
            proposed: "proposed";
            accepted: "accepted";
            superseded: "superseded";
        }>;
        horizonStartAt: z.ZodString;
        horizonEndAt: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        assignments: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            scheduleId: z.ZodString;
            resourceId: z.ZodString;
            productionOrderId: z.ZodNullable<z.ZodString>;
            operationId: z.ZodNullable<z.ZodString>;
            sourceModule: z.ZodNullable<z.ZodString>;
            sourceRefId: z.ZodNullable<z.ZodString>;
            startsAt: z.ZodString;
            endsAt: z.ZodString;
            plannedDurationMinutes: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const CrpListWorkCentersToolOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        resourceId: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const CrpListScheduledOperationsToolOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        resourceId: z.ZodNullable<z.ZodString>;
        workCenterId: z.ZodNullable<z.ZodString>;
        productionOrderId: z.ZodNullable<z.ZodString>;
        operationId: z.ZodNullable<z.ZodString>;
        operationCode: z.ZodString;
        name: z.ZodString;
        status: z.ZodEnum<{
            planned: "planned";
            scheduled: "scheduled";
            completed: "completed";
            cancelled: "cancelled";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        startsAt: z.ZodString;
        endsAt: z.ZodString;
        plannedDurationMinutes: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const CrpExplainCapacityLoadToolOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        workspaceId: z.ZodString;
        buckets: z.ZodArray<z.ZodObject<{
            resourceId: z.ZodString;
            resourceCode: z.ZodString;
            bucketStartAt: z.ZodString;
            bucketEndAt: z.ZodString;
            availableMinutes: z.ZodNumber;
            plannedMinutes: z.ZodNumber;
            overloadMinutes: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const CrpListConflictsToolOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        severity: z.ZodEnum<{
            info: "info";
            warning: "warning";
            critical: "critical";
        }>;
        status: z.ZodEnum<{
            open: "open";
            acknowledged: "acknowledged";
            resolved: "resolved";
        }>;
        message: z.ZodString;
        resourceId: z.ZodNullable<z.ZodString>;
        scheduledOperationId: z.ZodNullable<z.ZodString>;
        startsAt: z.ZodNullable<z.ZodString>;
        endsAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
type CrpListResourcesToolInput = z.infer<typeof CrpListResourcesToolInputSchema>;
type CrpListSchedulesToolInput = z.infer<typeof CrpListSchedulesToolInputSchema>;
type CrpGetScheduleToolInput = z.infer<typeof CrpGetScheduleToolInputSchema>;
type CrpListWorkCentersToolInput = z.infer<typeof CrpListWorkCentersToolInputSchema>;
type CrpListScheduledOperationsToolInput = z.infer<typeof CrpListScheduledOperationsToolInputSchema>;
type CrpExplainCapacityLoadToolInput = z.infer<typeof CrpExplainCapacityLoadToolInputSchema>;
type CrpListConflictsToolInput = z.infer<typeof CrpListConflictsToolInputSchema>;
type CrpListResourcesToolOutput = z.infer<typeof CrpListResourcesToolOutputSchema>;
type CrpListSchedulesToolOutput = z.infer<typeof CrpListSchedulesToolOutputSchema>;
type CrpGetScheduleToolOutput = z.infer<typeof CrpGetScheduleToolOutputSchema>;
type CrpListWorkCentersToolOutput = z.infer<typeof CrpListWorkCentersToolOutputSchema>;
type CrpListScheduledOperationsToolOutput = z.infer<typeof CrpListScheduledOperationsToolOutputSchema>;
type CrpExplainCapacityLoadToolOutput = z.infer<typeof CrpExplainCapacityLoadToolOutputSchema>;
type CrpListConflictsToolOutput = z.infer<typeof CrpListConflictsToolOutputSchema>;

declare const CrpCapacityPlanPdfInputSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    schedule: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        status: z.ZodEnum<{
            proposed: "proposed";
            accepted: "accepted";
            superseded: "superseded";
        }>;
        horizonStartAt: z.ZodString;
        horizonEndAt: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        assignments: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            scheduleId: z.ZodString;
            resourceId: z.ZodString;
            productionOrderId: z.ZodNullable<z.ZodString>;
            operationId: z.ZodNullable<z.ZodString>;
            sourceModule: z.ZodNullable<z.ZodString>;
            sourceRefId: z.ZodNullable<z.ZodString>;
            startsAt: z.ZodString;
            endsAt: z.ZodString;
            plannedDurationMinutes: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    resources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        kind: z.ZodEnum<{
            work_center: "work_center";
            equipment: "equipment";
            labor: "labor";
            external: "external";
            buffer: "buffer";
        }>;
        status: z.ZodEnum<{
            active: "active";
            inactive: "inactive";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    loadBuckets: z.ZodArray<z.ZodObject<{
        resourceId: z.ZodString;
        resourceCode: z.ZodString;
        bucketStartAt: z.ZodString;
        bucketEndAt: z.ZodString;
        availableMinutes: z.ZodNumber;
        plannedMinutes: z.ZodNumber;
        overloadMinutes: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const CrpResourceLoadCsvInputSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    loadBuckets: z.ZodArray<z.ZodObject<{
        resourceId: z.ZodString;
        resourceCode: z.ZodString;
        bucketStartAt: z.ZodString;
        bucketEndAt: z.ZodString;
        availableMinutes: z.ZodNumber;
        plannedMinutes: z.ZodNumber;
        overloadMinutes: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const CrpScheduleExportCsvInputSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    schedule: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        status: z.ZodEnum<{
            proposed: "proposed";
            accepted: "accepted";
            superseded: "superseded";
        }>;
        horizonStartAt: z.ZodString;
        horizonEndAt: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        assignments: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            scheduleId: z.ZodString;
            resourceId: z.ZodString;
            productionOrderId: z.ZodNullable<z.ZodString>;
            operationId: z.ZodNullable<z.ZodString>;
            sourceModule: z.ZodNullable<z.ZodString>;
            sourceRefId: z.ZodNullable<z.ZodString>;
            startsAt: z.ZodString;
            endsAt: z.ZodString;
            plannedDurationMinutes: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
type CrpCapacityPlanPdfInput = z.infer<typeof CrpCapacityPlanPdfInputSchema>;
type CrpResourceLoadCsvInput = z.infer<typeof CrpResourceLoadCsvInputSchema>;
type CrpScheduleExportCsvInput = z.infer<typeof CrpScheduleExportCsvInputSchema>;

export { type AvailabilityWindow, type AvailabilityWindowListResponse, AvailabilityWindowListResponseSchema, AvailabilityWindowSchema, CONTRACT_VERSION, type CapacityBucket, CapacityBucketSchema, type CapacityConflict, type CapacityConflictListResponse, CapacityConflictListResponseSchema, CapacityConflictSchema, type CapacityConflictSeverity, CapacityConflictSeveritySchema, type CapacityConflictStatus, CapacityConflictStatusSchema, type CapacityLoad, type CapacityLoadBucket, CapacityLoadBucketSchema, type CapacityLoadQuery, CapacityLoadQuerySchema, type CapacityLoadResponse, CapacityLoadResponseSchema, CapacityLoadSchema, type CapacityResource, type CapacityResourceGetResponse, CapacityResourceGetResponseSchema, type CapacityResourceListResponse, CapacityResourceListResponseSchema, type CapacityResourceRef, CapacityResourceRefSchema, CapacityResourceSchema, type CapacitySchedule, type CapacityScheduleGetResponse, CapacityScheduleGetResponseSchema, type CapacityScheduleListResponse, CapacityScheduleListResponseSchema, CapacityScheduleSchema, type CapacityWindow, type CapacityWindowListResponse, CapacityWindowListResponseSchema, CapacityWindowSchema, type CrpCapacityPlanPdfInput, CrpCapacityPlanPdfInputSchema, type CrpDeleteResponse, CrpDeleteResponseSchema, type CrpExplainCapacityLoadToolInput, CrpExplainCapacityLoadToolInputSchema, type CrpExplainCapacityLoadToolOutput, CrpExplainCapacityLoadToolOutputSchema, type CrpGetScheduleToolInput, CrpGetScheduleToolInputSchema, type CrpGetScheduleToolOutput, CrpGetScheduleToolOutputSchema, type CrpListConflictsToolInput, CrpListConflictsToolInputSchema, type CrpListConflictsToolOutput, CrpListConflictsToolOutputSchema, type CrpListResourcesToolInput, CrpListResourcesToolInputSchema, type CrpListResourcesToolOutput, CrpListResourcesToolOutputSchema, type CrpListScheduledOperationsToolInput, CrpListScheduledOperationsToolInputSchema, type CrpListScheduledOperationsToolOutput, CrpListScheduledOperationsToolOutputSchema, type CrpListSchedulesToolInput, CrpListSchedulesToolInputSchema, type CrpListSchedulesToolOutput, CrpListSchedulesToolOutputSchema, type CrpListWorkCentersToolInput, CrpListWorkCentersToolInputSchema, type CrpListWorkCentersToolOutput, CrpListWorkCentersToolOutputSchema, type CrpResourceLoadCsvInput, CrpResourceLoadCsvInputSchema, type CrpScheduleExportCsvInput, CrpScheduleExportCsvInputSchema, type CrpScheduleableOperation, CrpScheduleableOperationSchema, IsoDateTimeStringSchema, type MrpHandoffBatch, type MrpHandoffBatchResponse, MrpHandoffBatchResponseSchema, MrpHandoffBatchSchema, NonEmptyStringSchema, QuantitySchema, type Resource, type ResourceCalendar, type ResourceCalendarListResponse, ResourceCalendarListResponseSchema, ResourceCalendarSchema, type ResourceGetResponse, ResourceGetResponseSchema, type ResourceKind, ResourceKindSchema, type ResourceListResponse, ResourceListResponseSchema, type ResourceRef, ResourceRefSchema, ResourceSchema, type ResourceStatus, ResourceStatusSchema, type ScheduleAssignment, ScheduleAssignmentSchema, type ScheduleProposalInput, ScheduleProposalInputSchema, type ScheduleProposalOutput, ScheduleProposalOutputSchema, type ScheduleStatus, ScheduleStatusSchema, type ScheduledOperation, type ScheduledOperationListResponse, ScheduledOperationListResponseSchema, ScheduledOperationSchema, type ScheduledOperationStatus, ScheduledOperationStatusSchema, type SemVer, type VersionMismatchSeverity, type WorkCenter, type WorkCenterGetResponse, WorkCenterGetResponseSchema, type WorkCenterListResponse, WorkCenterListResponseSchema, WorkCenterSchema, type WorkCenterStatus, WorkCenterStatusSchema, classifyContractVersionSkew, parseAvailabilityWindow, parseAvailabilityWindowListResponse, parseCapacityBucket, parseCapacityConflict, parseCapacityConflictListResponse, parseCapacityLoad, parseCapacityLoadBucket, parseCapacityLoadResponse, parseCapacityResource, parseCapacityResourceGetResponse, parseCapacityResourceListResponse, parseCapacitySchedule, parseCapacityScheduleGetResponse, parseCapacityScheduleListResponse, parseCapacityWindow, parseCapacityWindowListResponse, parseCrpDeleteResponse, parseCrpScheduleableOperation, parseMrpHandoffBatch, parseMrpHandoffBatchResponse, parseResource, parseResourceCalendar, parseResourceCalendarListResponse, parseResourceGetResponse, parseResourceListResponse, parseScheduleAssignment, parseScheduleProposalInput, parseScheduleProposalOutput, parseScheduledOperation, parseScheduledOperationListResponse, parseSemVer, parseWorkCenter, parseWorkCenterGetResponse, parseWorkCenterListResponse };
