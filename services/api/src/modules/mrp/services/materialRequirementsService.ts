import type { PrismaClient } from "@prisma/client";
import type { MaterialRequirement } from "@umbraculum/mrp-contracts";

import { MrpService } from "./mrpService.js";

export class MaterialRequirementsService {
  private readonly service: MrpService;

  constructor(prisma: PrismaClient) {
    this.service = new MrpService(prisma);
  }

  listMaterialRequirements(
    userId: string,
    workspaceId: string,
    productionOrderId?: string,
  ): Promise<readonly MaterialRequirement[]> {
    return this.service.listMaterialRequirements(userId, workspaceId, productionOrderId);
  }
}
