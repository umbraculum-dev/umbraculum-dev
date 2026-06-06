import type { MrpMaterialRequirement, MrpOperation, Prisma } from "@prisma/client";
import {
  BomSchema,
  MaterialRequirementSchema,
  OperationSchema,
  ProductionOrderSchema,
  type Bom,
  type MaterialRequirement,
  type Operation,
  type ProductionOrder,
} from "@umbraculum/mrp-contracts";

export type ProductionOrderRow = Prisma.MrpProductionOrderGetPayload<{
  include: { lines: true };
}>;

export type ProductionOrderDetailRow = Prisma.MrpProductionOrderGetPayload<{
  include: { lines: true; operations: true; materialRequirements: true };
}>;

export type BomRow = Prisma.MrpBomGetPayload<{
  include: { lines: true };
}>;

export function toProductionOrder(row: ProductionOrderRow | ProductionOrderDetailRow): ProductionOrder {
  return ProductionOrderSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    orderNumber: row.orderNumber,
    status: row.status,
    sourceModule: row.sourceModule,
    sourceRefId: row.sourceRefId,
    outputProductId: row.outputProductId,
    outputVariantId: row.outputVariantId,
    quantity: row.quantity,
    unit: row.unit,
    plannedStartAt: row.plannedStartAt?.toISOString() ?? null,
    dueAt: row.dueAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    lines: row.lines
      .slice()
      .sort((a, b) => a.lineNumber - b.lineNumber)
      .map((line) => ({
        id: line.id,
        productionOrderId: line.productionOrderId,
        lineNumber: line.lineNumber,
        outputProductId: line.outputProductId,
        outputVariantId: line.outputVariantId,
        description: line.description,
        quantity: line.quantity,
        unit: line.unit,
      })),
  });
}

export function toBom(row: BomRow): Bom {
  return BomSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    code: row.code,
    name: row.name,
    ownerModule: row.ownerModule,
    sourceRefId: row.sourceRefId,
    lines: row.lines
      .slice()
      .sort((a, b) => a.lineNumber - b.lineNumber)
      .map((line) => ({
        id: line.id,
        bomId: line.bomId,
        lineNumber: line.lineNumber,
        materialRefModule: line.materialRefModule,
        materialRefId: line.materialRefId,
        description: line.description,
        quantity: line.quantity,
        unit: line.unit,
        lossPercent: line.lossPercent,
      })),
  });
}

export function toOperation(row: MrpOperation): Operation {
  return OperationSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    productionOrderId: row.productionOrderId,
    sequence: row.sequence,
    code: row.code,
    name: row.name,
    requiredResourceKind: row.requiredResourceKind,
    plannedDurationMinutes: row.plannedDurationMinutes,
    earliestStartAt: row.earliestStartAt?.toISOString() ?? null,
    dueAt: row.dueAt?.toISOString() ?? null,
  });
}

export function toMaterialRequirement(
  row: MrpMaterialRequirement,
): MaterialRequirement {
  return MaterialRequirementSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    productionOrderId: row.productionOrderId,
    bomLineId: row.bomLineId,
    materialRefModule: row.materialRefModule,
    materialRefId: row.materialRefId,
    description: row.description,
    requiredQuantity: row.requiredQuantity,
    unit: row.unit,
    availabilityStatus: row.availabilityStatus,
    availabilityNote: row.availabilityNote,
  });
}
