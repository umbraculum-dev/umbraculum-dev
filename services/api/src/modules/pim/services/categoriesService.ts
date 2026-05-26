import type { PimCategory, PrismaClient } from "@prisma/client";
import {
  CategorySchema,
  CategoryTreeNodeSchema,
  type Category,
  type CategoryTreeNode,
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
