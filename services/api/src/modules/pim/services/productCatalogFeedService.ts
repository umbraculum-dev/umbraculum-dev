import type { PimProduct, PimVariant, PrismaClient } from "@prisma/client";
import { ProductStatusSchema } from "@umbraculum/pim-contracts";

import { WorkspacesService } from "../../../services/workspacesService.js";
import {
  PimProductCatalogFeedDataSchema,
  type PimProductCatalogFeedData,
} from "../documentTemplates.js";

type ProductWithVariants = PimProduct & {
  readonly variants: readonly PimVariant[];
};

export class ProductCatalogFeedService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async buildActiveProductCatalogFeed(
    userId: string,
    workspaceId: string,
    generatedAt: Date,
  ): Promise<PimProductCatalogFeedData> {
    await this.workspaces.assertMembership(userId, workspaceId);

    const products = await this.prisma.pimProduct.findMany({
      where: { workspaceId, status: "active" },
      include: {
        variants: {
          orderBy: [{ sku: "asc" }],
        },
      },
      orderBy: [{ sku: "asc" }],
    });

    return PimProductCatalogFeedDataSchema.parse({
      generatedAt: generatedAt.toISOString(),
      workspaceId,
      products: products.map((product) => toFeedProduct(product)),
    });
  }
}

function toFeedProduct(product: ProductWithVariants): PimProductCatalogFeedData["products"][number] {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    status: ProductStatusSchema.parse(product.status),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      attributeValuesJson: stableJson(variant.attributeValues),
    })),
  };
}

function stableJson(value: unknown): string {
  return JSON.stringify(value ?? {});
}
