import type { PimProduct, PrismaClient } from "@prisma/client";
import { ProductSchema, type Product } from "@umbraculum/pim-contracts";

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
