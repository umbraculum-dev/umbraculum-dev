import type { PimVariant, PrismaClient } from "@prisma/client";
import { VariantSchema, type Variant } from "@umbraculum/pim-contracts";

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
