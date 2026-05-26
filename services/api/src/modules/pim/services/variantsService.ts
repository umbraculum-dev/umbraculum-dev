import type { PimVariant, Prisma, PrismaClient } from "@prisma/client";
import {
  VariantSchema,
  type Variant,
  type VariantCreateRequest,
  type VariantUpdateRequest,
} from "@umbraculum/pim-contracts";

import { NotFoundError } from "../../../errors.js";
import { WorkspacesService } from "../../../services/workspacesService.js";

export class VariantsService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listVariantsForProduct(
    userId: string,
    workspaceId: string,
    productId: string,
  ): Promise<readonly Variant[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    await assertProductInWorkspace(this.prisma, workspaceId, productId);
    const rows = await this.prisma.pimVariant.findMany({
      where: { productId },
      orderBy: [{ sku: "asc" }],
    });
    return rows.map((row) => toVariant(row));
  }

  async getVariantById(
    userId: string,
    workspaceId: string,
    variantId: string,
  ): Promise<Variant> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.pimVariant.findFirst({
      where: { id: variantId, product: { workspaceId } },
    });
    if (!row) {
      throw new NotFoundError("variant_not_found", `No variant with id ${variantId}`);
    }
    return toVariant(row);
  }

  async createVariantForProduct(
    userId: string,
    workspaceId: string,
    productId: string,
    input: VariantCreateRequest,
  ): Promise<Variant> {
    await this.workspaces.assertMembership(userId, workspaceId);
    await assertProductInWorkspace(this.prisma, workspaceId, productId);
    const row = await this.prisma.pimVariant.create({
      data: {
        productId,
        sku: input.sku,
        name: input.name,
        attributeValues: (input.attributeValues ?? {}) as Prisma.InputJsonValue,
      },
    });
    return toVariant(row);
  }

  async updateVariant(
    userId: string,
    workspaceId: string,
    variantId: string,
    input: VariantUpdateRequest,
  ): Promise<Variant> {
    await this.workspaces.assertMembership(userId, workspaceId);

    const data: Prisma.PimVariantUpdateManyMutationInput = {};
    if (input.sku !== undefined) data.sku = input.sku;
    if (input.name !== undefined) data.name = input.name;
    if (input.attributeValues !== undefined) {
      data.attributeValues = input.attributeValues as Prisma.InputJsonValue;
    }

    const result = await this.prisma.pimVariant.updateMany({
      where: { id: variantId, product: { workspaceId } },
      data,
    });
    if (result.count === 0) {
      throw new NotFoundError("variant_not_found", `No variant with id ${variantId}`);
    }

    const row = await this.prisma.pimVariant.findFirstOrThrow({
      where: { id: variantId, product: { workspaceId } },
    });
    return toVariant(row);
  }

  async deleteVariant(userId: string, workspaceId: string, variantId: string): Promise<void> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const result = await this.prisma.pimVariant.deleteMany({
      where: { id: variantId, product: { workspaceId } },
    });
    if (result.count === 0) {
      throw new NotFoundError("variant_not_found", `No variant with id ${variantId}`);
    }
  }
}

async function assertProductInWorkspace(
  prisma: PrismaClient,
  workspaceId: string,
  productId: string,
): Promise<void> {
  const product = await prisma.pimProduct.findFirst({
    where: { id: productId, workspaceId },
    select: { id: true },
  });
  if (!product) {
    throw new NotFoundError("product_not_found", `No product with id ${productId}`);
  }
}

function toVariant(row: PimVariant): Variant {
  const rawValues =
    row.attributeValues && typeof row.attributeValues === "object" && !Array.isArray(row.attributeValues)
      ? (row.attributeValues as Record<string, unknown>)
      : {};
  return VariantSchema.parse({
    id: row.id,
    productId: row.productId,
    sku: row.sku,
    name: row.name,
    attributeValues: rawValues,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}
