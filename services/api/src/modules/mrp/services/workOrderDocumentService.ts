import type { PrismaClient } from "@prisma/client";
import {
  MrpMaterialRequirementsXlsxInputSchema,
  MrpProductionOrderCsvInputSchema,
  MrpRouteCardPdfInputSchema,
  MrpWorkOrderPdfInputSchema,
  WorkOrderPreviewSchema,
  type MrpMaterialRequirementsXlsxInput,
  type MrpProductionOrderCsvInput,
  type MrpRouteCardPdfInput,
  type MrpWorkOrderPdfInput,
  type WorkOrderPreview,
} from "@umbraculum/mrp-contracts";

import { MaterialRequirementsService } from "./materialRequirementsService.js";
import { ProductionOrdersService } from "./productionOrdersService.js";

export class WorkOrderDocumentService {
  private readonly productionOrders: ProductionOrdersService;
  private readonly materialRequirements: MaterialRequirementsService;

  constructor(prisma: PrismaClient) {
    this.productionOrders = new ProductionOrdersService(prisma);
    this.materialRequirements = new MaterialRequirementsService(prisma);
  }

  async buildWorkOrderPreview(
    userId: string,
    workspaceId: string,
    productionOrderId: string,
  ): Promise<WorkOrderPreview> {
    const item = await this.productionOrders.getProductionOrderById(
      userId,
      workspaceId,
      productionOrderId,
    );
    const requirements = await this.materialRequirements.listMaterialRequirements(
      userId,
      workspaceId,
      productionOrderId,
    );
    return WorkOrderPreviewSchema.parse({
      productionOrder: item,
      operations: item.operations,
      materialRequirements: requirements,
      operatorNotes: [],
    });
  }

  async buildWorkOrderPdfInput(
    userId: string,
    workspaceId: string,
    productionOrderId: string,
  ): Promise<MrpWorkOrderPdfInput> {
    const preview = await this.buildWorkOrderPreview(userId, workspaceId, productionOrderId);
    return MrpWorkOrderPdfInputSchema.parse({
      workspaceId,
      productionOrderId,
      preview,
    });
  }

  async buildRouteCardPdfInput(
    userId: string,
    workspaceId: string,
    productionOrderId: string,
  ): Promise<MrpRouteCardPdfInput> {
    const item = await this.productionOrders.getProductionOrderById(
      userId,
      workspaceId,
      productionOrderId,
    );
    return MrpRouteCardPdfInputSchema.parse({
      workspaceId,
      productionOrder: item,
      operations: item.operations,
    });
  }

  async buildMaterialRequirementsXlsxInput(
    userId: string,
    workspaceId: string,
    productionOrderId: string,
  ): Promise<MrpMaterialRequirementsXlsxInput> {
    const item = await this.productionOrders.getProductionOrderById(
      userId,
      workspaceId,
      productionOrderId,
    );
    const requirements = await this.materialRequirements.listMaterialRequirements(
      userId,
      workspaceId,
      productionOrderId,
    );
    return MrpMaterialRequirementsXlsxInputSchema.parse({
      workspaceId,
      productionOrder: item,
      materialRequirements: requirements,
    });
  }

  async buildProductionOrderCsvInput(
    userId: string,
    workspaceId: string,
    status?: string,
  ): Promise<MrpProductionOrderCsvInput> {
    const productionOrders = await this.productionOrders.listProductionOrders(
      userId,
      workspaceId,
      status,
    );
    return MrpProductionOrderCsvInputSchema.parse({
      workspaceId,
      productionOrders,
    });
  }
}
