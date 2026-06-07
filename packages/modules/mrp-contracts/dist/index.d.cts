import { z } from 'zod';

/**
 * Wire-level contract version of `@umbraculum/mrp-contracts`.
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
declare const UnitCodeSchema: z.ZodString;
declare const MrpDeleteResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
type MrpDeleteResponse = z.infer<typeof MrpDeleteResponseSchema>;
declare function parseMrpDeleteResponse(payload: unknown): MrpDeleteResponse;

declare const BomLineSchema: z.ZodObject<{
    id: z.ZodString;
    bomId: z.ZodString;
    lineNumber: z.ZodNumber;
    materialRefModule: z.ZodNullable<z.ZodString>;
    materialRefId: z.ZodNullable<z.ZodString>;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unit: z.ZodString;
    lossPercent: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
declare const BomSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    ownerModule: z.ZodNullable<z.ZodString>;
    sourceRefId: z.ZodNullable<z.ZodString>;
    lines: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        bomId: z.ZodString;
        lineNumber: z.ZodNumber;
        materialRefModule: z.ZodNullable<z.ZodString>;
        materialRefId: z.ZodNullable<z.ZodString>;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        lossPercent: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const BomRefSchema: z.ZodObject<{
    bomId: z.ZodString;
}, z.core.$strip>;
declare const BomListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        ownerModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        lines: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            bomId: z.ZodString;
            lineNumber: z.ZodNumber;
            materialRefModule: z.ZodNullable<z.ZodString>;
            materialRefId: z.ZodNullable<z.ZodString>;
            description: z.ZodString;
            quantity: z.ZodNumber;
            unit: z.ZodString;
            lossPercent: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const BomGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        code: z.ZodString;
        name: z.ZodString;
        ownerModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        lines: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            bomId: z.ZodString;
            lineNumber: z.ZodNumber;
            materialRefModule: z.ZodNullable<z.ZodString>;
            materialRefId: z.ZodNullable<z.ZodString>;
            description: z.ZodString;
            quantity: z.ZodNumber;
            unit: z.ZodString;
            lossPercent: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
type BomLine = z.infer<typeof BomLineSchema>;
type Bom = z.infer<typeof BomSchema>;
type BomRef = z.infer<typeof BomRefSchema>;
type BomListResponse = z.infer<typeof BomListResponseSchema>;
type BomGetResponse = z.infer<typeof BomGetResponseSchema>;
declare function parseBom(payload: unknown): Bom;
declare function parseBomListResponse(payload: unknown): BomListResponse;
declare function parseBomGetResponse(payload: unknown): BomGetResponse;

declare const MaterialRequirementStatusSchema: z.ZodEnum<{
    planned: "planned";
    available_assumed: "available_assumed";
    shortage_assumed: "shortage_assumed";
    reserved: "reserved";
}>;
declare const MaterialRequirementSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    productionOrderId: z.ZodString;
    bomLineId: z.ZodNullable<z.ZodString>;
    materialRefModule: z.ZodNullable<z.ZodString>;
    materialRefId: z.ZodNullable<z.ZodString>;
    description: z.ZodString;
    requiredQuantity: z.ZodNumber;
    unit: z.ZodString;
    availabilityStatus: z.ZodEnum<{
        planned: "planned";
        available_assumed: "available_assumed";
        shortage_assumed: "shortage_assumed";
        reserved: "reserved";
    }>;
    availabilityNote: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const MaterialRequirementListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        productionOrderId: z.ZodString;
        bomLineId: z.ZodNullable<z.ZodString>;
        materialRefModule: z.ZodNullable<z.ZodString>;
        materialRefId: z.ZodNullable<z.ZodString>;
        description: z.ZodString;
        requiredQuantity: z.ZodNumber;
        unit: z.ZodString;
        availabilityStatus: z.ZodEnum<{
            planned: "planned";
            available_assumed: "available_assumed";
            shortage_assumed: "shortage_assumed";
            reserved: "reserved";
        }>;
        availabilityNote: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type MaterialRequirementStatus = z.infer<typeof MaterialRequirementStatusSchema>;
type MaterialRequirement = z.infer<typeof MaterialRequirementSchema>;
type MaterialRequirementListResponse = z.infer<typeof MaterialRequirementListResponseSchema>;
declare function parseMaterialRequirement(payload: unknown): MaterialRequirement;
declare function parseMaterialRequirementListResponse(payload: unknown): MaterialRequirementListResponse;

declare const OperationTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    requiredResourceKind: z.ZodNullable<z.ZodString>;
    defaultDurationMinutes: z.ZodNullable<z.ZodNumber>;
    sourceModule: z.ZodNullable<z.ZodString>;
    sourceRefId: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const OperationSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    productionOrderId: z.ZodString;
    sequence: z.ZodNumber;
    code: z.ZodString;
    name: z.ZodString;
    requiredResourceKind: z.ZodNullable<z.ZodString>;
    plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
    earliestStartAt: z.ZodNullable<z.ZodString>;
    dueAt: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const ScheduleableOperationSchema: z.ZodObject<{
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
}, z.core.$strip>;
type OperationTemplate = z.infer<typeof OperationTemplateSchema>;
type Operation = z.infer<typeof OperationSchema>;
type ScheduleableOperation = z.infer<typeof ScheduleableOperationSchema>;
declare function parseOperation(payload: unknown): Operation;
declare function parseScheduleableOperation(payload: unknown): ScheduleableOperation;

declare const ProductionOrderStatusSchema: z.ZodEnum<{
    planned: "planned";
    released: "released";
    in_progress: "in_progress";
    completed: "completed";
    cancelled: "cancelled";
}>;
declare const ProductionOrderLineSchema: z.ZodObject<{
    id: z.ZodString;
    productionOrderId: z.ZodString;
    lineNumber: z.ZodNumber;
    outputProductId: z.ZodNullable<z.ZodString>;
    outputVariantId: z.ZodNullable<z.ZodString>;
    description: z.ZodNullable<z.ZodString>;
    quantity: z.ZodNumber;
    unit: z.ZodString;
}, z.core.$strip>;
declare const ProductionOrderSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    orderNumber: z.ZodString;
    status: z.ZodEnum<{
        planned: "planned";
        released: "released";
        in_progress: "in_progress";
        completed: "completed";
        cancelled: "cancelled";
    }>;
    sourceModule: z.ZodNullable<z.ZodString>;
    sourceRefId: z.ZodNullable<z.ZodString>;
    outputProductId: z.ZodNullable<z.ZodString>;
    outputVariantId: z.ZodNullable<z.ZodString>;
    quantity: z.ZodNumber;
    unit: z.ZodString;
    plannedStartAt: z.ZodNullable<z.ZodString>;
    dueAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    lines: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        productionOrderId: z.ZodString;
        lineNumber: z.ZodNumber;
        outputProductId: z.ZodNullable<z.ZodString>;
        outputVariantId: z.ZodNullable<z.ZodString>;
        description: z.ZodNullable<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const ProductionOrderRefSchema: z.ZodObject<{
    productionOrderId: z.ZodString;
}, z.core.$strip>;
declare const ProductionOrderListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        orderNumber: z.ZodString;
        status: z.ZodEnum<{
            planned: "planned";
            released: "released";
            in_progress: "in_progress";
            completed: "completed";
            cancelled: "cancelled";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        outputProductId: z.ZodNullable<z.ZodString>;
        outputVariantId: z.ZodNullable<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        plannedStartAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        lines: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            productionOrderId: z.ZodString;
            lineNumber: z.ZodNumber;
            outputProductId: z.ZodNullable<z.ZodString>;
            outputVariantId: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const ProductionOrderGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        orderNumber: z.ZodString;
        status: z.ZodEnum<{
            planned: "planned";
            released: "released";
            in_progress: "in_progress";
            completed: "completed";
            cancelled: "cancelled";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        outputProductId: z.ZodNullable<z.ZodString>;
        outputVariantId: z.ZodNullable<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        plannedStartAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        lines: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            productionOrderId: z.ZodString;
            lineNumber: z.ZodNumber;
            outputProductId: z.ZodNullable<z.ZodString>;
            outputVariantId: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
        }, z.core.$strip>>;
        operations: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            productionOrderId: z.ZodString;
            sequence: z.ZodNumber;
            code: z.ZodString;
            name: z.ZodString;
            requiredResourceKind: z.ZodNullable<z.ZodString>;
            plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
            earliestStartAt: z.ZodNullable<z.ZodString>;
            dueAt: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        materialRequirements: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            productionOrderId: z.ZodString;
            bomLineId: z.ZodNullable<z.ZodString>;
            materialRefModule: z.ZodNullable<z.ZodString>;
            materialRefId: z.ZodNullable<z.ZodString>;
            description: z.ZodString;
            requiredQuantity: z.ZodNumber;
            unit: z.ZodString;
            availabilityStatus: z.ZodEnum<{
                planned: "planned";
                available_assumed: "available_assumed";
                shortage_assumed: "shortage_assumed";
                reserved: "reserved";
            }>;
            availabilityNote: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
type ProductionOrderStatus = z.infer<typeof ProductionOrderStatusSchema>;
type ProductionOrderLine = z.infer<typeof ProductionOrderLineSchema>;
type ProductionOrder = z.infer<typeof ProductionOrderSchema>;
type ProductionOrderRef = z.infer<typeof ProductionOrderRefSchema>;
type ProductionOrderListResponse = z.infer<typeof ProductionOrderListResponseSchema>;
type ProductionOrderGetResponse = z.infer<typeof ProductionOrderGetResponseSchema>;
declare function parseProductionOrder(payload: unknown): ProductionOrder;
declare function parseProductionOrderListResponse(payload: unknown): ProductionOrderListResponse;
declare function parseProductionOrderGetResponse(payload: unknown): ProductionOrderGetResponse;

declare const WorkOrderPreviewSchema: z.ZodObject<{
    productionOrder: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        orderNumber: z.ZodString;
        status: z.ZodEnum<{
            planned: "planned";
            released: "released";
            in_progress: "in_progress";
            completed: "completed";
            cancelled: "cancelled";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        outputProductId: z.ZodNullable<z.ZodString>;
        outputVariantId: z.ZodNullable<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        plannedStartAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        lines: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            productionOrderId: z.ZodString;
            lineNumber: z.ZodNumber;
            outputProductId: z.ZodNullable<z.ZodString>;
            outputVariantId: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    operations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        productionOrderId: z.ZodString;
        sequence: z.ZodNumber;
        code: z.ZodString;
        name: z.ZodString;
        requiredResourceKind: z.ZodNullable<z.ZodString>;
        plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
        earliestStartAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    materialRequirements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        productionOrderId: z.ZodString;
        bomLineId: z.ZodNullable<z.ZodString>;
        materialRefModule: z.ZodNullable<z.ZodString>;
        materialRefId: z.ZodNullable<z.ZodString>;
        description: z.ZodString;
        requiredQuantity: z.ZodNumber;
        unit: z.ZodString;
        availabilityStatus: z.ZodEnum<{
            planned: "planned";
            available_assumed: "available_assumed";
            shortage_assumed: "shortage_assumed";
            reserved: "reserved";
        }>;
        availabilityNote: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    operatorNotes: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
declare const WorkOrderPreviewResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        productionOrder: z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            orderNumber: z.ZodString;
            status: z.ZodEnum<{
                planned: "planned";
                released: "released";
                in_progress: "in_progress";
                completed: "completed";
                cancelled: "cancelled";
            }>;
            sourceModule: z.ZodNullable<z.ZodString>;
            sourceRefId: z.ZodNullable<z.ZodString>;
            outputProductId: z.ZodNullable<z.ZodString>;
            outputVariantId: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
            plannedStartAt: z.ZodNullable<z.ZodString>;
            dueAt: z.ZodNullable<z.ZodString>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            lines: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                productionOrderId: z.ZodString;
                lineNumber: z.ZodNumber;
                outputProductId: z.ZodNullable<z.ZodString>;
                outputVariantId: z.ZodNullable<z.ZodString>;
                description: z.ZodNullable<z.ZodString>;
                quantity: z.ZodNumber;
                unit: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        operations: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            productionOrderId: z.ZodString;
            sequence: z.ZodNumber;
            code: z.ZodString;
            name: z.ZodString;
            requiredResourceKind: z.ZodNullable<z.ZodString>;
            plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
            earliestStartAt: z.ZodNullable<z.ZodString>;
            dueAt: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        materialRequirements: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            productionOrderId: z.ZodString;
            bomLineId: z.ZodNullable<z.ZodString>;
            materialRefModule: z.ZodNullable<z.ZodString>;
            materialRefId: z.ZodNullable<z.ZodString>;
            description: z.ZodString;
            requiredQuantity: z.ZodNumber;
            unit: z.ZodString;
            availabilityStatus: z.ZodEnum<{
                planned: "planned";
                available_assumed: "available_assumed";
                shortage_assumed: "shortage_assumed";
                reserved: "reserved";
            }>;
            availabilityNote: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        operatorNotes: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const WorkOrderDocumentInputSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    productionOrderId: z.ZodString;
    preview: z.ZodObject<{
        productionOrder: z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            orderNumber: z.ZodString;
            status: z.ZodEnum<{
                planned: "planned";
                released: "released";
                in_progress: "in_progress";
                completed: "completed";
                cancelled: "cancelled";
            }>;
            sourceModule: z.ZodNullable<z.ZodString>;
            sourceRefId: z.ZodNullable<z.ZodString>;
            outputProductId: z.ZodNullable<z.ZodString>;
            outputVariantId: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
            plannedStartAt: z.ZodNullable<z.ZodString>;
            dueAt: z.ZodNullable<z.ZodString>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            lines: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                productionOrderId: z.ZodString;
                lineNumber: z.ZodNumber;
                outputProductId: z.ZodNullable<z.ZodString>;
                outputVariantId: z.ZodNullable<z.ZodString>;
                description: z.ZodNullable<z.ZodString>;
                quantity: z.ZodNumber;
                unit: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        operations: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            productionOrderId: z.ZodString;
            sequence: z.ZodNumber;
            code: z.ZodString;
            name: z.ZodString;
            requiredResourceKind: z.ZodNullable<z.ZodString>;
            plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
            earliestStartAt: z.ZodNullable<z.ZodString>;
            dueAt: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        materialRequirements: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            productionOrderId: z.ZodString;
            bomLineId: z.ZodNullable<z.ZodString>;
            materialRefModule: z.ZodNullable<z.ZodString>;
            materialRefId: z.ZodNullable<z.ZodString>;
            description: z.ZodString;
            requiredQuantity: z.ZodNumber;
            unit: z.ZodString;
            availabilityStatus: z.ZodEnum<{
                planned: "planned";
                available_assumed: "available_assumed";
                shortage_assumed: "shortage_assumed";
                reserved: "reserved";
            }>;
            availabilityNote: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        operatorNotes: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
type WorkOrderPreview = z.infer<typeof WorkOrderPreviewSchema>;
type WorkOrderPreviewResponse = z.infer<typeof WorkOrderPreviewResponseSchema>;
type WorkOrderDocumentInput = z.infer<typeof WorkOrderDocumentInputSchema>;
declare function parseWorkOrderPreview(payload: unknown): WorkOrderPreview;
declare function parseWorkOrderPreviewResponse(payload: unknown): WorkOrderPreviewResponse;
declare function parseWorkOrderDocumentInput(payload: unknown): WorkOrderDocumentInput;

declare const MrpListProductionOrdersToolInputSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        planned: "planned";
        released: "released";
        in_progress: "in_progress";
        completed: "completed";
        cancelled: "cancelled";
    }>>;
}, z.core.$strict>;
declare const MrpGetProductionOrderToolInputSchema: z.ZodObject<{
    productionOrderId: z.ZodString;
}, z.core.$strict>;
declare const MrpExplainMaterialRequirementsToolInputSchema: z.ZodObject<{
    productionOrderId: z.ZodString;
}, z.core.$strict>;
declare const MrpSummarizeWorkOrderToolInputSchema: z.ZodObject<{
    productionOrderId: z.ZodString;
}, z.core.$strict>;
declare const MrpListProductionOrdersToolOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        orderNumber: z.ZodString;
        status: z.ZodEnum<{
            planned: "planned";
            released: "released";
            in_progress: "in_progress";
            completed: "completed";
            cancelled: "cancelled";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        outputProductId: z.ZodNullable<z.ZodString>;
        outputVariantId: z.ZodNullable<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        plannedStartAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        lines: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            productionOrderId: z.ZodString;
            lineNumber: z.ZodNumber;
            outputProductId: z.ZodNullable<z.ZodString>;
            outputVariantId: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const MrpGetProductionOrderToolOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        orderNumber: z.ZodString;
        status: z.ZodEnum<{
            planned: "planned";
            released: "released";
            in_progress: "in_progress";
            completed: "completed";
            cancelled: "cancelled";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        outputProductId: z.ZodNullable<z.ZodString>;
        outputVariantId: z.ZodNullable<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        plannedStartAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        lines: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            productionOrderId: z.ZodString;
            lineNumber: z.ZodNumber;
            outputProductId: z.ZodNullable<z.ZodString>;
            outputVariantId: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
        }, z.core.$strip>>;
        operations: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            productionOrderId: z.ZodString;
            sequence: z.ZodNumber;
            code: z.ZodString;
            name: z.ZodString;
            requiredResourceKind: z.ZodNullable<z.ZodString>;
            plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
            earliestStartAt: z.ZodNullable<z.ZodString>;
            dueAt: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        materialRequirements: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            productionOrderId: z.ZodString;
            bomLineId: z.ZodNullable<z.ZodString>;
            materialRefModule: z.ZodNullable<z.ZodString>;
            materialRefId: z.ZodNullable<z.ZodString>;
            description: z.ZodString;
            requiredQuantity: z.ZodNumber;
            unit: z.ZodString;
            availabilityStatus: z.ZodEnum<{
                planned: "planned";
                available_assumed: "available_assumed";
                shortage_assumed: "shortage_assumed";
                reserved: "reserved";
            }>;
            availabilityNote: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const MrpExplainMaterialRequirementsToolOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        productionOrderId: z.ZodString;
        bomLineId: z.ZodNullable<z.ZodString>;
        materialRefModule: z.ZodNullable<z.ZodString>;
        materialRefId: z.ZodNullable<z.ZodString>;
        description: z.ZodString;
        requiredQuantity: z.ZodNumber;
        unit: z.ZodString;
        availabilityStatus: z.ZodEnum<{
            planned: "planned";
            available_assumed: "available_assumed";
            shortage_assumed: "shortage_assumed";
            reserved: "reserved";
        }>;
        availabilityNote: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const MrpSummarizeWorkOrderToolOutputSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        productionOrder: z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            orderNumber: z.ZodString;
            status: z.ZodEnum<{
                planned: "planned";
                released: "released";
                in_progress: "in_progress";
                completed: "completed";
                cancelled: "cancelled";
            }>;
            sourceModule: z.ZodNullable<z.ZodString>;
            sourceRefId: z.ZodNullable<z.ZodString>;
            outputProductId: z.ZodNullable<z.ZodString>;
            outputVariantId: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
            plannedStartAt: z.ZodNullable<z.ZodString>;
            dueAt: z.ZodNullable<z.ZodString>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            lines: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                productionOrderId: z.ZodString;
                lineNumber: z.ZodNumber;
                outputProductId: z.ZodNullable<z.ZodString>;
                outputVariantId: z.ZodNullable<z.ZodString>;
                description: z.ZodNullable<z.ZodString>;
                quantity: z.ZodNumber;
                unit: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        operations: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            productionOrderId: z.ZodString;
            sequence: z.ZodNumber;
            code: z.ZodString;
            name: z.ZodString;
            requiredResourceKind: z.ZodNullable<z.ZodString>;
            plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
            earliestStartAt: z.ZodNullable<z.ZodString>;
            dueAt: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        materialRequirements: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            productionOrderId: z.ZodString;
            bomLineId: z.ZodNullable<z.ZodString>;
            materialRefModule: z.ZodNullable<z.ZodString>;
            materialRefId: z.ZodNullable<z.ZodString>;
            description: z.ZodString;
            requiredQuantity: z.ZodNumber;
            unit: z.ZodString;
            availabilityStatus: z.ZodEnum<{
                planned: "planned";
                available_assumed: "available_assumed";
                shortage_assumed: "shortage_assumed";
                reserved: "reserved";
            }>;
            availabilityNote: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        operatorNotes: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
type MrpListProductionOrdersToolInput = z.infer<typeof MrpListProductionOrdersToolInputSchema>;
type MrpGetProductionOrderToolInput = z.infer<typeof MrpGetProductionOrderToolInputSchema>;
type MrpExplainMaterialRequirementsToolInput = z.infer<typeof MrpExplainMaterialRequirementsToolInputSchema>;
type MrpSummarizeWorkOrderToolInput = z.infer<typeof MrpSummarizeWorkOrderToolInputSchema>;
type MrpListProductionOrdersToolOutput = z.infer<typeof MrpListProductionOrdersToolOutputSchema>;
type MrpGetProductionOrderToolOutput = z.infer<typeof MrpGetProductionOrderToolOutputSchema>;
type MrpExplainMaterialRequirementsToolOutput = z.infer<typeof MrpExplainMaterialRequirementsToolOutputSchema>;
type MrpSummarizeWorkOrderToolOutput = z.infer<typeof MrpSummarizeWorkOrderToolOutputSchema>;

declare const MRP_WORK_ORDER_PDF_TEMPLATE_REF = "mrp:work-order-pdf@v1";
declare const MRP_ROUTE_CARD_PDF_TEMPLATE_REF = "mrp:route-card-pdf@v1";
declare const MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF = "mrp:material-requirements-xlsx@v1";
declare const MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF = "mrp:production-order-csv@v1";
declare const MrpWorkOrderPdfInputSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    productionOrderId: z.ZodString;
    preview: z.ZodObject<{
        productionOrder: z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            orderNumber: z.ZodString;
            status: z.ZodEnum<{
                planned: "planned";
                released: "released";
                in_progress: "in_progress";
                completed: "completed";
                cancelled: "cancelled";
            }>;
            sourceModule: z.ZodNullable<z.ZodString>;
            sourceRefId: z.ZodNullable<z.ZodString>;
            outputProductId: z.ZodNullable<z.ZodString>;
            outputVariantId: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
            plannedStartAt: z.ZodNullable<z.ZodString>;
            dueAt: z.ZodNullable<z.ZodString>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            lines: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                productionOrderId: z.ZodString;
                lineNumber: z.ZodNumber;
                outputProductId: z.ZodNullable<z.ZodString>;
                outputVariantId: z.ZodNullable<z.ZodString>;
                description: z.ZodNullable<z.ZodString>;
                quantity: z.ZodNumber;
                unit: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        operations: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            productionOrderId: z.ZodString;
            sequence: z.ZodNumber;
            code: z.ZodString;
            name: z.ZodString;
            requiredResourceKind: z.ZodNullable<z.ZodString>;
            plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
            earliestStartAt: z.ZodNullable<z.ZodString>;
            dueAt: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        materialRequirements: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            workspaceId: z.ZodString;
            productionOrderId: z.ZodString;
            bomLineId: z.ZodNullable<z.ZodString>;
            materialRefModule: z.ZodNullable<z.ZodString>;
            materialRefId: z.ZodNullable<z.ZodString>;
            description: z.ZodString;
            requiredQuantity: z.ZodNumber;
            unit: z.ZodString;
            availabilityStatus: z.ZodEnum<{
                planned: "planned";
                available_assumed: "available_assumed";
                shortage_assumed: "shortage_assumed";
                reserved: "reserved";
            }>;
            availabilityNote: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>>;
        operatorNotes: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const MrpRouteCardPdfInputSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    productionOrder: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        orderNumber: z.ZodString;
        status: z.ZodEnum<{
            planned: "planned";
            released: "released";
            in_progress: "in_progress";
            completed: "completed";
            cancelled: "cancelled";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        outputProductId: z.ZodNullable<z.ZodString>;
        outputVariantId: z.ZodNullable<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        plannedStartAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        lines: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            productionOrderId: z.ZodString;
            lineNumber: z.ZodNumber;
            outputProductId: z.ZodNullable<z.ZodString>;
            outputVariantId: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    operations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        productionOrderId: z.ZodString;
        sequence: z.ZodNumber;
        code: z.ZodString;
        name: z.ZodString;
        requiredResourceKind: z.ZodNullable<z.ZodString>;
        plannedDurationMinutes: z.ZodNullable<z.ZodNumber>;
        earliestStartAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const MrpMaterialRequirementsXlsxInputSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    productionOrder: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        orderNumber: z.ZodString;
        status: z.ZodEnum<{
            planned: "planned";
            released: "released";
            in_progress: "in_progress";
            completed: "completed";
            cancelled: "cancelled";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        outputProductId: z.ZodNullable<z.ZodString>;
        outputVariantId: z.ZodNullable<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        plannedStartAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        lines: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            productionOrderId: z.ZodString;
            lineNumber: z.ZodNumber;
            outputProductId: z.ZodNullable<z.ZodString>;
            outputVariantId: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    materialRequirements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        productionOrderId: z.ZodString;
        bomLineId: z.ZodNullable<z.ZodString>;
        materialRefModule: z.ZodNullable<z.ZodString>;
        materialRefId: z.ZodNullable<z.ZodString>;
        description: z.ZodString;
        requiredQuantity: z.ZodNumber;
        unit: z.ZodString;
        availabilityStatus: z.ZodEnum<{
            planned: "planned";
            available_assumed: "available_assumed";
            shortage_assumed: "shortage_assumed";
            reserved: "reserved";
        }>;
        availabilityNote: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const MrpProductionOrderCsvInputSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    productionOrders: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        orderNumber: z.ZodString;
        status: z.ZodEnum<{
            planned: "planned";
            released: "released";
            in_progress: "in_progress";
            completed: "completed";
            cancelled: "cancelled";
        }>;
        sourceModule: z.ZodNullable<z.ZodString>;
        sourceRefId: z.ZodNullable<z.ZodString>;
        outputProductId: z.ZodNullable<z.ZodString>;
        outputVariantId: z.ZodNullable<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        plannedStartAt: z.ZodNullable<z.ZodString>;
        dueAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        lines: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            productionOrderId: z.ZodString;
            lineNumber: z.ZodNumber;
            outputProductId: z.ZodNullable<z.ZodString>;
            outputVariantId: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
            quantity: z.ZodNumber;
            unit: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type MrpWorkOrderPdfInput = z.infer<typeof MrpWorkOrderPdfInputSchema>;
type MrpRouteCardPdfInput = z.infer<typeof MrpRouteCardPdfInputSchema>;
type MrpMaterialRequirementsXlsxInput = z.infer<typeof MrpMaterialRequirementsXlsxInputSchema>;
type MrpProductionOrderCsvInput = z.infer<typeof MrpProductionOrderCsvInputSchema>;

export { type Bom, type BomGetResponse, BomGetResponseSchema, type BomLine, BomLineSchema, type BomListResponse, BomListResponseSchema, type BomRef, BomRefSchema, BomSchema, CONTRACT_VERSION, IsoDateTimeStringSchema, MRP_MATERIAL_REQUIREMENTS_XLSX_TEMPLATE_REF, MRP_PRODUCTION_ORDER_CSV_TEMPLATE_REF, MRP_ROUTE_CARD_PDF_TEMPLATE_REF, MRP_WORK_ORDER_PDF_TEMPLATE_REF, type MaterialRequirement, type MaterialRequirementListResponse, MaterialRequirementListResponseSchema, MaterialRequirementSchema, type MaterialRequirementStatus, MaterialRequirementStatusSchema, type MrpDeleteResponse, MrpDeleteResponseSchema, type MrpExplainMaterialRequirementsToolInput, MrpExplainMaterialRequirementsToolInputSchema, type MrpExplainMaterialRequirementsToolOutput, MrpExplainMaterialRequirementsToolOutputSchema, type MrpGetProductionOrderToolInput, MrpGetProductionOrderToolInputSchema, type MrpGetProductionOrderToolOutput, MrpGetProductionOrderToolOutputSchema, type MrpListProductionOrdersToolInput, MrpListProductionOrdersToolInputSchema, type MrpListProductionOrdersToolOutput, MrpListProductionOrdersToolOutputSchema, type MrpMaterialRequirementsXlsxInput, MrpMaterialRequirementsXlsxInputSchema, type MrpProductionOrderCsvInput, MrpProductionOrderCsvInputSchema, type MrpRouteCardPdfInput, MrpRouteCardPdfInputSchema, type MrpSummarizeWorkOrderToolInput, MrpSummarizeWorkOrderToolInputSchema, type MrpSummarizeWorkOrderToolOutput, MrpSummarizeWorkOrderToolOutputSchema, type MrpWorkOrderPdfInput, MrpWorkOrderPdfInputSchema, NonEmptyStringSchema, type Operation, OperationSchema, type OperationTemplate, OperationTemplateSchema, type ProductionOrder, type ProductionOrderGetResponse, ProductionOrderGetResponseSchema, type ProductionOrderLine, ProductionOrderLineSchema, type ProductionOrderListResponse, ProductionOrderListResponseSchema, type ProductionOrderRef, ProductionOrderRefSchema, ProductionOrderSchema, type ProductionOrderStatus, ProductionOrderStatusSchema, QuantitySchema, type ScheduleableOperation, ScheduleableOperationSchema, type SemVer, UnitCodeSchema, type VersionMismatchSeverity, type WorkOrderDocumentInput, WorkOrderDocumentInputSchema, type WorkOrderPreview, type WorkOrderPreviewResponse, WorkOrderPreviewResponseSchema, WorkOrderPreviewSchema, classifyContractVersionSkew, parseBom, parseBomGetResponse, parseBomListResponse, parseMaterialRequirement, parseMaterialRequirementListResponse, parseMrpDeleteResponse, parseOperation, parseProductionOrder, parseProductionOrderGetResponse, parseProductionOrderListResponse, parseScheduleableOperation, parseSemVer, parseWorkOrderDocumentInput, parseWorkOrderPreview, parseWorkOrderPreviewResponse };
