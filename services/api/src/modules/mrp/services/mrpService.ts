import type { MrpMaterialRequirement, MrpOperation, Prisma, PrismaClient } from "@prisma/client";
import {
  BomSchema,
  MaterialRequirementSchema,
  OperationSchema,
  ProductionOrderSchema,
  type Bom,
  type MaterialRequirement,
  type Operation,
  type ProductionOrder,
  type ProductionOrderGetResponse,
} from "@umbraculum/mrp-contracts";

import { NotFoundError } from "../../../errors.js";
import { WorkspacesService } from "../../../services/workspacesService.js";

type ProductionOrderRow = Prisma.MrpProductionOrderGetPayload<{
  include: { lines: true };
}>;

type ProductionOrderDetailRow = Prisma.MrpProductionOrderGetPayload<{
  include: { lines: true; operations: true; materialRequirements: true };
}>;

type BomRow = Prisma.MrpBomGetPayload<{
  include: { lines: true };
}>;

export class MrpService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listProductionOrders(
    userId: string,
    workspaceId: string,
    status?: string,
  ): Promise<readonly ProductionOrder[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.mrpProductionOrder.findMany({
      where: { workspaceId, ...(status ? { status } : {}) },
      include: { lines: true },
      orderBy: [{ orderNumber: "asc" }],
    });
    return rows.map((row) => toProductionOrder(row));
  }

  async getProductionOrderById(
    userId: string,
    workspaceId: string,
    productionOrderId: string,
  ): Promise<ProductionOrderGetResponse["item"]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.mrpProductionOrder.findFirst({
      where: { id: productionOrderId, workspaceId },
      include: { lines: true, operations: true, materialRequirements: true },
    });
    if (!row) {
      throw new NotFoundError(
        "production_order_not_found",
        `No production order with id ${productionOrderId}`,
      );
    }
    return {
      ...toProductionOrder(row),
      operations: row.operations
        .slice()
        .sort((a, b) => a.sequence - b.sequence)
        .map((operation) => toOperation(operation)),
      materialRequirements: row.materialRequirements.map((requirement) =>
        toMaterialRequirement(requirement),
      ),
    };
  }

  async listBoms(userId: string, workspaceId: string): Promise<readonly Bom[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.mrpBom.findMany({
      where: { workspaceId },
      include: { lines: true },
      orderBy: [{ code: "asc" }],
    });
    return rows.map((row) => toBom(row));
  }

  async getBomById(userId: string, workspaceId: string, bomId: string): Promise<Bom> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.mrpBom.findFirst({
      where: { id: bomId, workspaceId },
      include: { lines: true },
    });
    if (!row) {
      throw new NotFoundError("bom_not_found", `No BOM with id ${bomId}`);
    }
    return toBom(row);
  }

  async listMaterialRequirements(
    userId: string,
    workspaceId: string,
    productionOrderId?: string,
  ): Promise<readonly MaterialRequirement[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.mrpMaterialRequirement.findMany({
      where: { workspaceId, ...(productionOrderId ? { productionOrderId } : {}) },
      orderBy: [{ description: "asc" }],
    });
    return rows.map((row) => toMaterialRequirement(row));
  }
}

function toProductionOrder(row: ProductionOrderRow | ProductionOrderDetailRow): ProductionOrder {
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

function toBom(row: BomRow): Bom {
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

function toOperation(row: MrpOperation): Operation {
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

function toMaterialRequirement(
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
