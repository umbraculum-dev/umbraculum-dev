import { Prisma, type PimAttribute, type PrismaClient } from "@prisma/client";
import {
  AttributeSchema,
  type Attribute,
  type AttributeCreateRequest,
  type AttributeUpdateRequest,
} from "@umbraculum/pim-contracts";

import { NotFoundError } from "../../../errors.js";
import { WorkspacesService } from "../../../services/workspacesService.js";

export class AttributesService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listAttributes(userId: string, workspaceId: string): Promise<readonly Attribute[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.pimAttribute.findMany({
      where: { workspaceId },
      orderBy: [{ code: "asc" }],
    });
    return rows.map((row) => toAttribute(row));
  }

  async getAttributeById(
    userId: string,
    workspaceId: string,
    attributeId: string,
  ): Promise<Attribute> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.pimAttribute.findFirst({
      where: { id: attributeId, workspaceId },
    });
    if (!row) {
      throw new NotFoundError("attribute_not_found", `No attribute with id ${attributeId}`);
    }
    return toAttribute(row);
  }

  async createAttribute(
    userId: string,
    workspaceId: string,
    input: AttributeCreateRequest,
  ): Promise<Attribute> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.pimAttribute.create({
      data: {
        workspaceId,
        code: input.code,
        type: input.type,
        label: input.label,
        required: input.required ?? false,
        defaultValue:
          input.defaultValue === undefined || input.defaultValue === null
            ? Prisma.JsonNull
            : (input.defaultValue as Prisma.InputJsonValue),
        selectOptions:
          input.selectOptions === undefined || input.selectOptions === null
            ? Prisma.JsonNull
            : input.selectOptions,
      },
    });
    return toAttribute(row);
  }

  async updateAttribute(
    userId: string,
    workspaceId: string,
    attributeId: string,
    input: AttributeUpdateRequest,
  ): Promise<Attribute> {
    await this.workspaces.assertMembership(userId, workspaceId);

    const data: Prisma.PimAttributeUpdateManyMutationInput = {};
    if (input.code !== undefined) data.code = input.code;
    if (input.type !== undefined) data.type = input.type;
    if (input.label !== undefined) data.label = input.label;
    if (input.required !== undefined) data.required = input.required;
    if (input.defaultValue !== undefined) {
      data.defaultValue =
        input.defaultValue === null ? Prisma.JsonNull : (input.defaultValue as Prisma.InputJsonValue);
    }
    if (input.selectOptions !== undefined) {
      data.selectOptions = input.selectOptions === null ? Prisma.JsonNull : input.selectOptions;
    }

    const result = await this.prisma.pimAttribute.updateMany({
      where: { id: attributeId, workspaceId },
      data,
    });
    if (result.count === 0) {
      throw new NotFoundError("attribute_not_found", `No attribute with id ${attributeId}`);
    }

    const row = await this.prisma.pimAttribute.findUniqueOrThrow({
      where: { id: attributeId },
    });
    return toAttribute(row);
  }

  async deleteAttribute(
    userId: string,
    workspaceId: string,
    attributeId: string,
  ): Promise<void> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const result = await this.prisma.pimAttribute.deleteMany({
      where: { id: attributeId, workspaceId },
    });
    if (result.count === 0) {
      throw new NotFoundError("attribute_not_found", `No attribute with id ${attributeId}`);
    }
  }
}

function toAttribute(row: PimAttribute): Attribute {
  return AttributeSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    code: row.code,
    type: row.type,
    label: row.label,
    required: row.required,
    defaultValue: row.defaultValue ?? null,
    selectOptions: Array.isArray(row.selectOptions) ? row.selectOptions : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}
