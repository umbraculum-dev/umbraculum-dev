import type { PimAttributeSet, PrismaClient } from "@prisma/client";
import { AttributeSetSchema, type AttributeSet } from "@umbraculum/pim-contracts";

import { NotFoundError } from "../../../errors.js";
import { WorkspacesService } from "../../../services/workspacesService.js";

export class AttributeSetsService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listAttributeSets(
    userId: string,
    workspaceId: string,
  ): Promise<readonly AttributeSet[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.pimAttributeSet.findMany({
      where: { workspaceId },
      orderBy: [{ code: "asc" }],
    });
    return rows.map((row) => toAttributeSet(row));
  }

  async getAttributeSetById(
    userId: string,
    workspaceId: string,
    setId: string,
  ): Promise<AttributeSet> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.pimAttributeSet.findFirst({
      where: { id: setId, workspaceId },
    });
    if (!row) {
      throw new NotFoundError(
        "attribute_set_not_found",
        `No attribute set with id ${setId}`,
      );
    }
    return toAttributeSet(row);
  }
}

function toAttributeSet(row: PimAttributeSet): AttributeSet {
  return AttributeSetSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    code: row.code,
    label: row.label,
    attributeIds: row.attributeIds,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}
