import type { PimProduct, Prisma, PrismaClient } from "@prisma/client";
import {
  ProductSchema,
  type Product,
  type ProductCreateRequest,
  type ProductUpdateRequest,
} from "@umbraculum/pim-contracts";

import { NotFoundError } from "../../../errors.js";
import { WorkspacesService } from "../../../services/workspacesService.js";

export class ProductsService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listProducts(userId: string, workspaceId: string): Promise<readonly Product[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.pimProduct.findMany({
      where: { workspaceId },
      orderBy: [{ sku: "asc" }],
    });
    return rows.map((row) => toProduct(row));
  }

  async getProductById(
    userId: string,
    workspaceId: string,
    productId: string,
  ): Promise<Product> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.pimProduct.findFirst({
      where: { id: productId, workspaceId },
    });
    if (!row) {
      throw new NotFoundError("product_not_found", `No product with id ${productId}`);
    }
    return toProduct(row);
  }

  async createProduct(
    userId: string,
    workspaceId: string,
    input: ProductCreateRequest,
  ): Promise<Product> {
    await this.workspaces.assertMembership(userId, workspaceId);
    if (input.primaryAttributeSetId) {
      await assertAttributeSetInWorkspace(this.prisma, workspaceId, input.primaryAttributeSetId);
    }
    const row = await this.prisma.pimProduct.create({
      data: {
        workspaceId,
        sku: input.sku,
        name: input.name,
        description: input.description ?? null,
        primaryAttributeSetId: input.primaryAttributeSetId ?? null,
        status: input.status ?? "draft",
      },
    });
    return toProduct(row);
  }

  async updateProduct(
    userId: string,
    workspaceId: string,
    productId: string,
    input: ProductUpdateRequest,
  ): Promise<Product> {
    await this.workspaces.assertMembership(userId, workspaceId);
    if (input.primaryAttributeSetId) {
      await assertAttributeSetInWorkspace(this.prisma, workspaceId, input.primaryAttributeSetId);
    }

    const data: Prisma.PimProductUncheckedUpdateManyInput = {};
    if (input.sku !== undefined) data.sku = input.sku;
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.primaryAttributeSetId !== undefined) {
      data.primaryAttributeSetId = input.primaryAttributeSetId;
    }
    if (input.status !== undefined) data.status = input.status;

    const result = await this.prisma.pimProduct.updateMany({
      where: { id: productId, workspaceId },
      data,
    });
    if (result.count === 0) {
      throw new NotFoundError("product_not_found", `No product with id ${productId}`);
    }

    const row = await this.prisma.pimProduct.findUniqueOrThrow({
      where: { id: productId },
    });
    return toProduct(row);
  }

  async deleteProduct(userId: string, workspaceId: string, productId: string): Promise<void> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const result = await this.prisma.pimProduct.deleteMany({
      where: { id: productId, workspaceId },
    });
    if (result.count === 0) {
      throw new NotFoundError("product_not_found", `No product with id ${productId}`);
    }
  }
}

async function assertAttributeSetInWorkspace(
  prisma: PrismaClient,
  workspaceId: string,
  attributeSetId: string,
): Promise<void> {
  const row = await prisma.pimAttributeSet.findFirst({
    where: { id: attributeSetId, workspaceId },
    select: { id: true },
  });
  if (!row) {
    throw new NotFoundError(
      "attribute_set_not_found",
      `No attribute set with id ${attributeSetId}`,
    );
  }
}

function toProduct(row: PimProduct): Product {
  return ProductSchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    sku: row.sku,
    name: row.name,
    description: row.description,
    primaryAttributeSetId: row.primaryAttributeSetId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}
