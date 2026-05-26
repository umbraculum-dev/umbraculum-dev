import type { PimAttributeSet, Prisma, PrismaClient } from "@prisma/client";
import {
  AttributeSetSchema,
  type AttributeSet,
  type AttributeSetCreateRequest,
  type AttributeSetUpdateRequest,
} from "@umbraculum/pim-contracts";

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

  async createAttributeSet(
    userId: string,
    workspaceId: string,
    input: AttributeSetCreateRequest,
  ): Promise<AttributeSet> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.pimAttributeSet.create({
      data: {
        workspaceId,
        code: input.code,
        label: input.label,
        attributeIds: input.attributeIds ?? [],
      },
    });
    return toAttributeSet(row);
  }

  async updateAttributeSet(
    userId: string,
    workspaceId: string,
    setId: string,
    input: AttributeSetUpdateRequest,
  ): Promise<AttributeSet> {
    await this.workspaces.assertMembership(userId, workspaceId);

    const data: Prisma.PimAttributeSetUpdateManyMutationInput = {};
    if (input.code !== undefined) data.code = input.code;
    if (input.label !== undefined) data.label = input.label;
    if (input.attributeIds !== undefined) data.attributeIds = input.attributeIds;

    const result = await this.prisma.pimAttributeSet.updateMany({
      where: { id: setId, workspaceId },
      data,
    });
    if (result.count === 0) {
      throw new NotFoundError(
        "attribute_set_not_found",
        `No attribute set with id ${setId}`,
      );
    }

    const row = await this.prisma.pimAttributeSet.findUniqueOrThrow({
      where: { id: setId },
    });
    return toAttributeSet(row);
  }

  async deleteAttributeSet(userId: string, workspaceId: string, setId: string): Promise<void> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const result = await this.prisma.pimAttributeSet.deleteMany({
      where: { id: setId, workspaceId },
    });
    if (result.count === 0) {
      throw new NotFoundError(
        "attribute_set_not_found",
        `No attribute set with id ${setId}`,
      );
    }
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
