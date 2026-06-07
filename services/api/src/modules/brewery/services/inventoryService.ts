import { Prisma } from "@prisma/client";
import type { InventoryCategory, InventoryUnit } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../../../errors.js";
import { WorkspacesService } from "../../../services/workspacesService.js";

export type CreateInventoryItemInput = {
  category: unknown;
  ingredientId?: unknown;
  name: string;
  quantity: unknown;
  unit: unknown;
  metadata?: unknown;
};

export type UpdateInventoryItemInput = {
  name?: string | undefined;
  quantity?: unknown;
  unit?: unknown;
  metadata?: unknown;
};

function toOptionalNumber(val: unknown, field: string): number | undefined {
  if (val === undefined) return undefined;
  if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) {
    throw new BadRequestError("invalid_number", `Body.${field} must be a number`);
  }
  return val;
}

function toOptionalString(val: unknown): string | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val !== "string") return undefined;
  const s = val.trim();
  return s ? s : undefined;
}

function parseMetadata(category: InventoryCategory, raw: unknown): Record<string, unknown> | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) {
    throw new BadRequestError("invalid_metadata", "Body.metadata must be an object");
  }
  const o = raw as Record<string, unknown>;

  if (category === "fermentable") {
    const producer = toOptionalString(o['producer']);
    const colorLovibond = toOptionalNumber(o['colorLovibond'], "metadata.colorLovibond");
    const yieldPercent = toOptionalNumber(o['yieldPercent'], "metadata.yieldPercent");
    const ppg = toOptionalNumber(o['ppg'], "metadata.ppg");
    const out: Record<string, unknown> = {
      ...(producer ? { producer } : {}),
      ...(colorLovibond !== undefined ? { colorLovibond: Math.max(0, colorLovibond) } : {}),
      ...(yieldPercent !== undefined ? { yieldPercent: Math.max(0, yieldPercent) } : {}),
      ...(ppg !== undefined ? { ppg: Math.max(0, ppg) } : {}),
    };
    return Object.keys(out).length ? out : null;
  }

  if (category === "hop") {
    const alphaMin = toOptionalNumber(o['alphaMin'], "metadata.alphaMin");
    const alphaMax = toOptionalNumber(o['alphaMax'], "metadata.alphaMax");
    const out: Record<string, unknown> = {
      ...(alphaMin !== undefined ? { alphaMin: Math.max(0, alphaMin) } : {}),
      ...(alphaMax !== undefined ? { alphaMax: Math.max(0, alphaMax) } : {}),
    };
    return Object.keys(out).length ? out : null;
  }

  return null;
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

  async listItems(userId: string, workspaceId: string, category?: unknown) {
    await this.workspaces.assertMembership(userId, workspaceId);
    const cat: InventoryCategory | undefined =
      typeof category === "string" && VALID_CATEGORIES.includes(category as InventoryCategory)
        ? (category as InventoryCategory)
        : undefined;
    return this.prisma.inventoryItem.findMany({
      where: {
        workspaceId,
        ...(cat ? { category: cat } : {}),
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
    const metadataJson = parseMetadata(category, input.metadata);

    return this.prisma.inventoryItem.create({
      data: {
        workspaceId,
        category,
        ingredientId,
        name,
        quantity,
        unit,
        ...(metadataJson ? { metadataJson: metadataJson as Prisma.InputJsonValue } : {}),
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
    const metadataJson = input.metadata !== undefined ? parseMetadata(existing.category, input.metadata) : undefined;

    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(quantity !== undefined ? { quantity } : {}),
        ...(unit !== undefined ? { unit } : {}),
        ...(metadataJson !== undefined
          ? {
              metadataJson:
                metadataJson === null ? Prisma.DbNull : (metadataJson as Prisma.InputJsonValue),
            }
          : {}),
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
