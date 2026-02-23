import type { InventoryCategory, InventoryUnit } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";

export type CreateInventoryItemInput = {
  category: InventoryCategory;
  ingredientId?: string | null;
  name: string;
  quantity: number;
  unit: InventoryUnit;
};

export type UpdateInventoryItemInput = {
  name?: string;
  quantity?: number;
  unit?: InventoryUnit;
};

function toOptionalNumber(val: unknown, field: string): number | undefined {
  if (val === undefined) return undefined;
  if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) {
    throw new BadRequestError("invalid_number", `Body.${field} must be a number`);
  }
  return val;
}

const VALID_CATEGORIES: InventoryCategory[] = [
  "fermentable",
  "hop",
  "speciality",
  "acid_salt",
  "detergent_sanitizer",
  "kegging",
];

const VALID_UNITS: InventoryUnit[] = ["kg", "g", "ml", "count"];

function assertCategory(v: unknown): InventoryCategory {
  if (typeof v === "string" && VALID_CATEGORIES.includes(v as InventoryCategory)) {
    return v as InventoryCategory;
  }
  throw new BadRequestError("invalid_category", `Body.category must be one of: ${VALID_CATEGORIES.join(", ")}`);
}

function assertUnit(v: unknown): InventoryUnit {
  if (typeof v === "string" && VALID_UNITS.includes(v as InventoryUnit)) {
    return v as InventoryUnit;
  }
  throw new BadRequestError("invalid_unit", `Body.unit must be one of: ${VALID_UNITS.join(", ")}`);
}

export class InventoryService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listItems(userId: string, workspaceId: string, category?: InventoryCategory) {
    await this.workspaces.assertMembership(userId, workspaceId);
    return this.prisma.inventoryItem.findMany({
      where: {
        workspaceId,
        ...(category ? { category } : {}),
      },
      orderBy: [{ category: "asc" }, { name: "asc" }, { id: "asc" }],
    });
  }

  async createItem(userId: string, workspaceId: string, input: CreateInventoryItemInput) {
    await this.workspaces.assertMembership(userId, workspaceId);

    const name = input.name.trim();
    if (!name) throw new BadRequestError("invalid_name", "Body.name is required");

    const quantity = toOptionalNumber(input.quantity, "quantity");
    if (quantity === undefined || quantity < 0) {
      throw new BadRequestError("invalid_quantity", "Body.quantity must be a non-negative number");
    }

    const category = assertCategory(input.category);
    const unit = assertUnit(input.unit);
    const ingredientId =
      input.ingredientId != null && typeof input.ingredientId === "string" && input.ingredientId.trim()
        ? input.ingredientId.trim()
        : null;

    return this.prisma.inventoryItem.create({
      data: {
        workspaceId,
        category,
        ingredientId,
        name,
        quantity,
        unit,
      },
    });
  }

  async updateItem(userId: string, workspaceId: string, id: string, input: UpdateInventoryItemInput) {
    await this.workspaces.assertMembership(userId, workspaceId);

    const existing = await this.prisma.inventoryItem.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) throw new NotFoundError("inventory_item_not_found", "Inventory item not found");

    const name = input.name !== undefined ? input.name.trim() : undefined;
    if (name !== undefined && !name) throw new BadRequestError("invalid_name", "Body.name cannot be empty");

    const quantity = toOptionalNumber(input.quantity, "quantity");
    if (quantity !== undefined && quantity < 0) {
      throw new BadRequestError("invalid_quantity", "Body.quantity must be non-negative");
    }

    const unit = input.unit !== undefined ? assertUnit(input.unit) : undefined;

    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(quantity !== undefined ? { quantity } : {}),
        ...(unit !== undefined ? { unit } : {}),
      },
    });
  }

  async deleteItem(userId: string, workspaceId: string, id: string) {
    await this.workspaces.assertMembership(userId, workspaceId);

    const existing = await this.prisma.inventoryItem.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) throw new NotFoundError("inventory_item_not_found", "Inventory item not found");

    await this.prisma.inventoryItem.delete({ where: { id } });
  }
}
