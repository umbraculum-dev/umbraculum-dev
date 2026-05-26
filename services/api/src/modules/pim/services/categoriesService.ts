import type { PimCategory, Prisma, PrismaClient } from "@prisma/client";
import {
  CategorySchema,
  CategoryTreeNodeSchema,
  type Category,
  type CategoryCreateRequest,
  type CategoryTreeNode,
  type CategoryUpdateRequest,
} from "@umbraculum/pim-contracts";

import { NotFoundError } from "../../../errors.js";
import { WorkspacesService } from "../../../services/workspacesService.js";

export class CategoriesService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listCategories(
    userId: string,
    workspaceId: string,
  ): Promise<{ items: readonly Category[]; tree: readonly CategoryTreeNode[] }> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const rows = await this.prisma.pimCategory.findMany({
      where: { workspaceId },
      orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    });
    const items = rows.map((row) => toCategory(row));
    const tree = buildCategoryTree(items);
    return { items, tree };
  }

  async getCategoryById(
    userId: string,
    workspaceId: string,
    categoryId: string,
  ): Promise<Category> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const row = await this.prisma.pimCategory.findFirst({
      where: { id: categoryId, workspaceId },
    });
    if (!row) {
      throw new NotFoundError("category_not_found", `No category with id ${categoryId}`);
    }
    return toCategory(row);
  }

  async createCategory(
    userId: string,
    workspaceId: string,
    input: CategoryCreateRequest,
  ): Promise<Category> {
    await this.workspaces.assertMembership(userId, workspaceId);
    if (input.parentId) {
      await assertCategoryInWorkspace(this.prisma, workspaceId, input.parentId);
    }
    const row = await this.prisma.pimCategory.create({
      data: {
        workspaceId,
        code: input.code,
        label: input.label,
        parentId: input.parentId ?? null,
        sortOrder: input.sortOrder ?? 0,
      },
    });
    return toCategory(row);
  }

  async updateCategory(
    userId: string,
    workspaceId: string,
    categoryId: string,
    input: CategoryUpdateRequest,
  ): Promise<Category> {
    await this.workspaces.assertMembership(userId, workspaceId);
    if (input.parentId) {
      await assertCategoryInWorkspace(this.prisma, workspaceId, input.parentId);
    }

    const data: Prisma.PimCategoryUncheckedUpdateManyInput = {};
    if (input.code !== undefined) data.code = input.code;
    if (input.label !== undefined) data.label = input.label;
    if (input.parentId !== undefined) data.parentId = input.parentId;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    const result = await this.prisma.pimCategory.updateMany({
      where: { id: categoryId, workspaceId },
      data,
    });
    if (result.count === 0) {
      throw new NotFoundError("category_not_found", `No category with id ${categoryId}`);
    }

    const row = await this.prisma.pimCategory.findUniqueOrThrow({
      where: { id: categoryId },
    });
    return toCategory(row);
  }

  async deleteCategory(userId: string, workspaceId: string, categoryId: string): Promise<void> {
    await this.workspaces.assertMembership(userId, workspaceId);
    const result = await this.prisma.pimCategory.deleteMany({
      where: { id: categoryId, workspaceId },
    });
    if (result.count === 0) {
      throw new NotFoundError("category_not_found", `No category with id ${categoryId}`);
    }
  }
}

async function assertCategoryInWorkspace(
  prisma: PrismaClient,
  workspaceId: string,
  categoryId: string,
): Promise<void> {
  const row = await prisma.pimCategory.findFirst({
    where: { id: categoryId, workspaceId },
    select: { id: true },
  });
  if (!row) {
    throw new NotFoundError("category_not_found", `No category with id ${categoryId}`);
  }
}

function toCategory(row: PimCategory): Category {
  return CategorySchema.parse({
    id: row.id,
    workspaceId: row.workspaceId,
    code: row.code,
    label: row.label,
    parentId: row.parentId,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function buildCategoryTree(items: readonly Category[]): CategoryTreeNode[] {
  type MutableNode = Category & { children: MutableNode[] };
  const byId = new Map<string, MutableNode>();
  for (const item of items) {
    byId.set(item.id, { ...item, children: [] });
  }
  const roots: MutableNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots.map((n) => CategoryTreeNodeSchema.parse(n));
}
