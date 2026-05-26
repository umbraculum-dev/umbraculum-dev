import type { PrismaClient } from "@prisma/client";
import type { Bom } from "@umbraculum/mrp-contracts";

import { MrpService } from "./mrpService.js";

export class BomsService {
  private readonly service: MrpService;

  constructor(prisma: PrismaClient) {
    this.service = new MrpService(prisma);
  }

  listBoms(userId: string, workspaceId: string): Promise<readonly Bom[]> {
    return this.service.listBoms(userId, workspaceId);
  }

  getBomById(userId: string, workspaceId: string, bomId: string): Promise<Bom> {
    return this.service.getBomById(userId, workspaceId, bomId);
  }
}
