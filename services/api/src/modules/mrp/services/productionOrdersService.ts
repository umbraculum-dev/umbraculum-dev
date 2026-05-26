import type { PrismaClient } from "@prisma/client";
import type { ProductionOrder, ProductionOrderGetResponse } from "@umbraculum/mrp-contracts";

import { MrpService } from "./mrpService.js";

export class ProductionOrdersService {
  private readonly service: MrpService;

  constructor(prisma: PrismaClient) {
    this.service = new MrpService(prisma);
  }

  listProductionOrders(userId: string, workspaceId: string, status?: string): Promise<readonly ProductionOrder[]> {
    return this.service.listProductionOrders(userId, workspaceId, status);
  }

  getProductionOrderById(
    userId: string,
    workspaceId: string,
    productionOrderId: string,
  ): Promise<ProductionOrderGetResponse["item"]> {
    return this.service.getProductionOrderById(userId, workspaceId, productionOrderId);
  }
}
