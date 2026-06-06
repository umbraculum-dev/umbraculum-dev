import type { PrismaClient } from "@prisma/client";
import type { ProductionOrderGetResponse } from "@umbraculum/mrp-contracts";

import { NotFoundError } from "../../../errors.js";
import { createPrismaBreweryScheduleProjection } from "../../../platform/prismaBreweryScheduleProjection.js";
import { WorkspacesService } from "../../../services/workspacesService.js";
import { MrpBreweryProjectionService } from "./breweryProjectionService.js";
import {
  toBom,
  toMaterialRequirement,
  toOperation,
  toProductionOrder,
} from "./mrpServiceMappers.js";

export class MrpService {
  private readonly workspaces: WorkspacesService;
  private readonly breweryProjections: MrpBreweryProjectionService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
    this.breweryProjections = new MrpBreweryProjectionService(createPrismaBreweryScheduleProjection(prisma));
  }

  async listProductionOrders(
    userId: string,
    workspaceId: string,
    status?: string,
  ) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.mrpProductionOrder.findMany({
      where: { workspaceId, ...(status ? { status } : {}) },
      include: { lines: true },
      orderBy: [{ orderNumber: "asc" }],
    });
    const persisted = rows.map((row) => toProductionOrder(row));
    const projected = await this.breweryProjections.listProjectedProductionOrders(workspaceId, status);
    return [...persisted, ...projected].sort((a, b) => a.orderNumber.localeCompare(b.orderNumber));
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
      const projected = await this.breweryProjections.getProjectedProductionOrderById(
        workspaceId,
        productionOrderId,
      );
      if (projected) return projected;
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

  async listBoms(userId: string, workspaceId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.mrpBom.findMany({
      where: { workspaceId },
      include: { lines: true },
      orderBy: [{ code: "asc" }],
    });
    const persisted = rows.map((row) => toBom(row));
    const projected = await this.breweryProjections.listProjectedBoms(workspaceId);
    return [...persisted, ...projected].sort((a, b) => a.code.localeCompare(b.code));
  }

  async getBomById(userId: string, workspaceId: string, bomId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.mrpBom.findFirst({
      where: { id: bomId, workspaceId },
      include: { lines: true },
    });
    if (!row) {
      const projected = await this.breweryProjections.getProjectedBomById(workspaceId, bomId);
      if (projected) return projected;
      throw new NotFoundError("bom_not_found", `No BOM with id ${bomId}`);
    }
    return toBom(row);
  }

  async listMaterialRequirements(
    userId: string,
    workspaceId: string,
    productionOrderId?: string,
  ) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.mrpMaterialRequirement.findMany({
      where: { workspaceId, ...(productionOrderId ? { productionOrderId } : {}) },
      orderBy: [{ description: "asc" }],
    });
    const persisted = rows.map((row) => toMaterialRequirement(row));
    const projected = await this.breweryProjections.listProjectedMaterialRequirements(
      workspaceId,
      productionOrderId,
    );
    return [...persisted, ...projected].sort((a, b) => a.description.localeCompare(b.description));
  }
}
