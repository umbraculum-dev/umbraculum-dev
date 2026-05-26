import type { PimMediaAssetRef, Prisma, PrismaClient } from "@prisma/client";
import {
  MediaAssetRefSchema,
  type MediaAssetRef,
  type MediaAssetRefCreateRequest,
  type MediaAssetRefUpdateRequest,
} from "@umbraculum/pim-contracts";

import { NotFoundError } from "../../../errors.js";
import { WorkspacesService } from "../../../services/workspacesService.js";

export class MediaAssetRefsService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listMediaAssetRefsForProduct(
    userId: string,
    workspaceId: string,
    productId: string,
  ): Promise<readonly MediaAssetRef[]> {
    await this.workspaces.assertMembership(userId, workspaceId);
    await assertProductInWorkspace(this.prisma, workspaceId, productId);
    const rows = await this.prisma.pimMediaAssetRef.findMany({
      where: { productId },
      orderBy: [{ sortOrder: "asc" }, { mediaAssetId: "asc" }],
    });
    return rows.map((row) => toMediaAssetRef(row));
  }

  async getMediaAssetRefById(
    userId: string,
    workspaceId: string,
    mediaAssetRefId: string,
  ): Promise<MediaAssetRef> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.pimMediaAssetRef.findFirst({
      where: { id: mediaAssetRefId, product: { workspaceId } },
    });
    if (!row) {
      throw new NotFoundError(
        "media_asset_ref_not_found",
        `No media asset ref with id ${mediaAssetRefId}`,
      );
    }
    return toMediaAssetRef(row);
  }

  async createMediaAssetRefForProduct(
    userId: string,
    workspaceId: string,
    productId: string,
    input: MediaAssetRefCreateRequest,
  ): Promise<MediaAssetRef> {
    await this.workspaces.assertMembership(userId, workspaceId);
    await assertProductInWorkspace(this.prisma, workspaceId, productId);
    const row = await this.prisma.pimMediaAssetRef.create({
      data: {
        productId,
        mediaAssetId: input.mediaAssetId,
        role: input.role,
        sortOrder: input.sortOrder ?? 0,
      },
    });
    return toMediaAssetRef(row);
  }

  async updateMediaAssetRef(
    userId: string,
    workspaceId: string,
    mediaAssetRefId: string,
    input: MediaAssetRefUpdateRequest,
  ): Promise<MediaAssetRef> {
    await this.workspaces.assertMembership(userId, workspaceId);

    const data: Prisma.PimMediaAssetRefUpdateManyMutationInput = {};
    if (input.mediaAssetId !== undefined) data.mediaAssetId = input.mediaAssetId;
    if (input.role !== undefined) data.role = input.role;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    const result = await this.prisma.pimMediaAssetRef.updateMany({
      where: { id: mediaAssetRefId, product: { workspaceId } },
      data,
    });
    if (result.count === 0) {
      throw new NotFoundError(
        "media_asset_ref_not_found",
        `No media asset ref with id ${mediaAssetRefId}`,
      );
    }

    const row = await this.prisma.pimMediaAssetRef.findFirstOrThrow({
      where: { id: mediaAssetRefId, product: { workspaceId } },
    });
    return toMediaAssetRef(row);
  }

  async deleteMediaAssetRef(
    userId: string,
    workspaceId: string,
    mediaAssetRefId: string,
  ): Promise<void> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const result = await this.prisma.pimMediaAssetRef.deleteMany({
      where: { id: mediaAssetRefId, product: { workspaceId } },
    });
    if (result.count === 0) {
      throw new NotFoundError(
        "media_asset_ref_not_found",
        `No media asset ref with id ${mediaAssetRefId}`,
      );
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

function toMediaAssetRef(row: PimMediaAssetRef): MediaAssetRef {
  return MediaAssetRefSchema.parse({
    id: row.id,
    productId: row.productId,
    mediaAssetId: row.mediaAssetId,
    role: row.role,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}
